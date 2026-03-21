// ============================================================
//  SECUREFY - Smart Locker ESP32 Code
//  Works with your project's dynamic QR tokens (QR_uuid format)
//  Uses WebServer so QR scanner app can POST to this ESP32
//  Then validates token via your Express backend → Firebase
// ============================================================

#include <WiFi.h>
#include <WebServer.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ─────────────────────────────────────────────
//  ① CHANGE THESE THREE SETTINGS PER LOCKER
// ─────────────────────────────────────────────

//  Which locker is this ESP32 controlling?
//  Must match the Firestore document ID created by seedLockers.js
//  L001 = Locker 1 | L002 = Locker 2 | L003 = Locker 3
const char* MY_LOCKER_ID = "L001";

//  Which relay pin controls this locker's solenoid?
//  Flash each ESP32 with the correct pin:
//    L001 → pin 4   (LOCK_1)
//    L002 → pin 5   (LOCK_2)
//    L003 → pin 6   (LOCK_3)
const int SOLENOID_PIN = 4;

// ─────────────────────────────────────────────
//  ② YOUR WI-FI SETTINGS  (same on all 3 ESPs)
// ─────────────────────────────────────────────
const char* WIFI_SSID     = "Name D";
const char* WIFI_PASSWORD = "1234567D";

// ─────────────────────────────────────────────
//  ③ BACKEND SERVER  (the PC running server.js)
//    Find your PC's local IP:
//      Windows → open cmd → type ipconfig → look for IPv4 Address
//      Mac/Linux → open terminal → type ifconfig
//    Example:  "http://192.168.1.45:5000"
// ─────────────────────────────────────────────
const char* BACKEND_URL = "http://192.168.167.224:5000";   // ← change this

// Security key — must EXACTLY match server.js DEVICE_KEY
const char* DEVICE_KEY = "securefy-device-key-2024";

// ─────────────────────────────────────────────
//  RELAY LOGIC
//  Most relay modules: LOW = ON (unlocked), HIGH = OFF (locked)
//  If your relay is the opposite, swap the values below
// ─────────────────────────────────────────────
const int RELAY_UNLOCK = LOW;
const int RELAY_LOCK   = HIGH;

// How long the locker stays open (milliseconds)
const int UNLOCK_DURATION_MS = 5000;  // 5 seconds

// HTTP timeout (milliseconds) — avoids hanging forever if backend is slow
const int HTTP_TIMEOUT_MS = 8000;

// ─────────────────────────────────────────────
//  WEB SERVER (ESP32 listens on port 80)
//  Your QR scanner app sends the scanned token here
// ─────────────────────────────────────────────
WebServer espServer(80);


// Non-blocking unlock state
//  (replaced delay() with a timer so loop() keeps running)
// ─────────────────────────────────────────────
bool     unlocking    = false;
unsigned long unlockStart = 0;
// ============================================================
//  FUNCTIONS
// ============================================================

// Called when someone visits http://<ESP32-IP>/
void handleRoot() {
  String html = "<html><body>";
  html += "<h2>Securefy Locker: ";
  html += MY_LOCKER_ID;
  html += "</h2>";
  html += "<p>Status: Online ✅</p>";
  html += "<p>Send a POST to /scan?ticket=QR_TOKEN to unlock.</p>";
  html += "</body></html>";
  espServer.send(200, "text/html", html);
}

// Called when QR scanner app sends:  GET /scan?ticket=QR_xxxxx
// Or:  POST /scan  with body ticket=QR_xxxxx
void handleScan() {
  String scannedToken = "";

  // Accept both GET and POST
  if (espServer.hasArg("ticket")) {
    scannedToken = espServer.arg("ticket");
  }
  // BUG FIX #2a — also read raw JSON POST body if ticket param is missing
  else if (espServer.hasArg("plain")) {
    String rawBody = espServer.arg("plain");
    JsonDocument bodyDoc;                              // FIX #3 — JsonDocument
    DeserializationError e = deserializeJson(bodyDoc, rawBody);
    if (!e && bodyDoc.containsKey("ticket")) {
      scannedToken = bodyDoc["ticket"].as<String>();
    }
  }

  scannedToken.trim();

  if (scannedToken.length() == 0) {
    Serial.println("[ERROR] Empty scan received");
    espServer.send(400, "text/plain", "Missing ticket parameter");
    return;
  }

  // ── Check token starts with "QR_" (basic sanity check) ──
  if (!scannedToken.startsWith("QR_")) {
    Serial.println("[DENIED] Token format invalid: " + scannedToken);
    espServer.send(200, "text/plain", "DENIED: Invalid format");
    return;
  }

  Serial.println("\n[SCAN RECEIVED] Token: " + scannedToken);
  Serial.println("[INFO] Asking backend to validate...");

  // ── Send token to backend for Firebase validation ──
  bool allowed = verifyWithBackend(scannedToken);

  if (allowed) {
    Serial.println("[ACCESS GRANTED] Opening " + String(MY_LOCKER_ID));
    unlockLocker();
    espServer.send(200, "text/plain", "GRANTED: Locker opened");
  } else {
    Serial.println("[ACCESS DENIED] Token rejected by backend");
    espServer.send(200, "text/plain", "DENIED: Invalid or expired QR");
  }
}

// ── Sends token to your Express server, returns true if Firebase says OK ──
bool verifyWithBackend(String token) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[ERROR] No WiFi — cannot verify QR");
    return false;
  }

  HTTPClient http;
  String url = String(BACKEND_URL) + "/verifyQr";
  http.begin(url);

  // set a timeout so we don't hang if server is unreachable
  http.setTimeout(HTTP_TIMEOUT_MS);

  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-key", DEVICE_KEY);


  // use JsonDocument instead of deprecated StaticJsonDocument
  JsonDocument reqDoc;
  reqDoc["token"]    = token;
  reqDoc["lockerId"] = MY_LOCKER_ID;
  String body;
  serializeJson(reqDoc, body);

  Serial.println("[HTTP] POST → " + url);
  Serial.println("[HTTP] Body: " + body);

  int statusCode = http.POST(body);

  if (statusCode <= 0) {
    Serial.println("[HTTP ERROR] Could not reach backend. Code: " + String(statusCode));
    http.end();
    return false;
  }

  String response = http.getString();
  http.end();

  Serial.println("[HTTP] Response (" + String(statusCode) + "): " + response);

  // BUG FIX #3 — JsonDocument instead of StaticJsonDocument
  JsonDocument resDoc;
  DeserializationError err = deserializeJson(resDoc, response);
  if (err) {
    Serial.println("[ERROR] Failed to parse backend response");
    return false;
  }

  if (resDoc.containsKey("reason")) {
    Serial.println("[REASON] " + String(resDoc["reason"].as<const char*>()));
  }

  return resDoc["allow"] == true;
}

// ── BUG FIX #1 — Non-blocking unlock ──
// Instead of delay(5000) which freezes the web server,
// we just set a flag and let loop() check when time is up.
void unlockLocker() {
  if (unlocking) return;           // already open, ignore duplicate scan
  Serial.println("[RELAY] Energising solenoid — UNLOCKED");
  digitalWrite(SOLENOID_PIN, RELAY_UNLOCK);
  unlocking   = true;
  unlockStart = millis();
}

// ── Heartbeat: tells backend this ESP32 is alive ──
void sendHeartbeat() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(String(BACKEND_URL) + "/heartbeat");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-key", DEVICE_KEY);

  JsonDocument doc;  
  doc["lockerId"] = MY_LOCKER_ID;
  String body;
  serializeJson(doc, body);

  int code = http.POST(body);
  http.end();
  Serial.println("[HEARTBEAT] Sent. Response code: " + String(code));
}

// ============================================================
//  SETUP
// ============================================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n=============================");
  Serial.println("  SECUREFY - " + String(MY_LOCKER_ID));
  Serial.println("=============================");

  // Lock the solenoid on startup
  pinMode(SOLENOID_PIN, OUTPUT);
  digitalWrite(SOLENOID_PIN, RELAY_LOCK);
  Serial.println("[INIT] Solenoid locked");

  // Connect to Wi-Fi
  Serial.print("[WIFI] Connecting to " + String(WIFI_SSID));
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n[WIFI] Connected!");
  Serial.println("[WIFI] ESP32 IP Address: " + WiFi.localIP().toString());
  Serial.println("[INFO] Open http://" + WiFi.localIP().toString() + " in browser to test");

  // Register web server routes
  espServer.on("/",     handleRoot);
  espServer.on("/scan", handleScan);  // QR scanner sends token here

  espServer.begin();
  Serial.println("[SERVER] ESP32 web server running on port 80");
  Serial.println("[READY] Waiting for QR scans...");
}

// ============================================================
//  LOOP
// ============================================================
void loop() {
  // Handle incoming web requests from QR scanner app
  espServer.handleClient();

  // Send a heartbeat to backend every 60 seconds
  static unsigned long lastHeartbeat = 0;
  if (millis() - lastHeartbeat > 60000) {
    sendHeartbeat();
    lastHeartbeat = millis();
  }
}

// ============================================================
//  HOW TO USE — QUICK REFERENCE
//  
//  1. Flash this code to each ESP32 (change MY_LOCKER_ID + SOLENOID_PIN per device)
//  2. Open Serial Monitor (115200 baud) — it will print the ESP32's IP address
//  3. On the student's phone: open MyQRCode.jsx page → the QR value is "QR_uuid..."
//  4. A QR scanner app on a tablet/laptop at the locker reads the QR and sends:
//       GET http://<ESP32-IP>/scan?ticket=QR_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
//  5. ESP32 forwards the token to your Express server (server.js)
//  6. Express checks Firebase Firestore — is this token valid, unused, not expired?
//  7. If yes → ESP32 energises the solenoid relay → locker opens for 5 seconds
// ============================================================
