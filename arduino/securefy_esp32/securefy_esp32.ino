// ============================================================
//  SECUREFY - Smart Locker ESP32 Code  — FIXED VERSION
//
//  FIXES vs ORIGINAL:
//    1. CORS header added to handleScan() so a browser-based
//       QR scanner page can call the ESP32 without being blocked
//    2. HTTP method handlers split: GET/POST both work cleanly
//    3. Minor: serial output improved for easier debugging
// ============================================================

#include <WiFi.h>
#include <WebServer.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ─────────────────────────────────────────────
//  ① CHANGE THESE THREE SETTINGS PER LOCKER
//  L001 → SOLENOID_PIN 4
//  L002 → SOLENOID_PIN 5
//  L003 → SOLENOID_PIN 6
// ─────────────────────────────────────────────
const char* MY_LOCKER_ID  = "L001";
const int   SOLENOID_PIN  = 4;

// ─────────────────────────────────────────────
//  ② WI-FI SETTINGS  (same on all 3 ESPs)
// ─────────────────────────────────────────────
const char* WIFI_SSID     = "Name D";     // ← change this
const char* WIFI_PASSWORD = "1234567D"; // ← change this

// ─────────────────────────────────────────────
//  ③ BACKEND SERVER (PC running server.js)
//  Find your PC's local IP:
//    Windows → cmd → ipconfig → IPv4 Address
//    Mac/Linux → terminal → ifconfig
//  Example: "http://192.168.1.45:5000"
// ─────────────────────────────────────────────
const char* BACKEND_URL = "http://172.20.10.3:5000"; // Updated to current PC IP

// Must EXACTLY match DEVICE_KEY in server.js
const char* DEVICE_KEY = "securefy-device-key-2024";

// ─────────────────────────────────────────────
//  RELAY LOGIC
 Most relay modules: LOW = ON (unlocked), HIGH = OFF (locked)
//  Swap if yours is reversed
// ─────────────────────────────────────────────
const int RELAY_UNLOCK = LOW;
const int RELAY_LOCK   = HIGH;

const int UNLOCK_DURATION_MS = 5000; // 5 seconds open
const int HTTP_TIMEOUT_MS    = 8000; // 8-second backend timeout

// ─────────────────────────────────────────────
//  WEB SERVER  (ESP32 listens on port 80)
// ─────────────────────────────────────────────
WebServer espServer(80);

// Non-blocking unlock state
bool          unlocking   = false;
unsigned long unlockStart = 0;

// ============================================================
//  HELPER — Send CORS headers on every response
//  FIX: Without this, a browser-based QR scanner page is
//       blocked by the browser's same-origin policy.
// ============================================================
void addCorsHeaders() {
  espServer.sendHeader("Access-Control-Allow-Origin",  "*");
  espServer.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  espServer.sendHeader("Access-Control-Allow-Headers", "Content-Type");
}

// ── Root page ──
void handleRoot() {
  addCorsHeaders();
  String html  = "<html><body>";
  html        += "<h2>Securefy Locker: ";
  html        += MY_LOCKER_ID;
  html        += "</h2><p>Status: Online ✅</p>";
  html        += "<p>Send GET /scan?ticket=QR_TOKEN to open.</p>";
  html        += "</body></html>";
  espServer.send(200, "text/html", html);
}

// ── FIX: Handle browser OPTIONS preflight ──
void handleOptions() {
  addCorsHeaders();
  espServer.send(204, "text/plain", "");
}

// ── Main scan handler (GET or POST) ──
void handleScan() {
  addCorsHeaders();

  String scannedToken = "";

  // Try URL param first  (?ticket=QR_xxx)
  if (espServer.hasArg("ticket")) {
    scannedToken = espServer.arg("ticket");
  }
  // Fallback: raw JSON body  { "ticket": "QR_xxx" }
  else if (espServer.hasArg("plain")) {
    String rawBody = espServer.arg("plain");
    JsonDocument bodyDoc;
    DeserializationError e = deserializeJson(bodyDoc, rawBody);
    if (!e && bodyDoc.containsKey("ticket")) {
      scannedToken = bodyDoc["ticket"].as<String>();
    }
  }

  scannedToken.trim();

  if (scannedToken.length() == 0) {
    Serial.println("[ERROR] Empty scan received");
    espServer.send(400, "application/json", "{\"error\":\"Missing ticket parameter\"}");
    return;
  }

  if (!scannedToken.startsWith("QR_")) {
    Serial.println("[DENIED] Token format invalid: " + scannedToken);
    espServer.send(200, "application/json", "{\"result\":\"DENIED\",\"reason\":\"Invalid format\"}");
    return;
  }

  Serial.println("\n[SCAN] Token: " + scannedToken);
  Serial.println("[INFO] Validating with backend...");

  bool allowed = verifyWithBackend(scannedToken);

  if (allowed) {
    Serial.println("[GRANTED] Opening " + String(MY_LOCKER_ID));
    unlockLocker();
    espServer.send(200, "application/json", "{\"result\":\"GRANTED\",\"locker\":\"" + String(MY_LOCKER_ID) + "\"}");
  } else {
    Serial.println("[DENIED] Token rejected by backend");
    espServer.send(200, "application/json", "{\"result\":\"DENIED\",\"reason\":\"Invalid or expired QR\"}");
  }
}

// ── Send token to Express backend for Firebase validation ──
bool verifyWithBackend(String token) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[ERROR] No WiFi — cannot verify QR");
    return false;
  }

  HTTPClient http;
  String url = String(BACKEND_URL) + "/verifyQr";
  http.begin(url);
  http.setTimeout(HTTP_TIMEOUT_MS);
  http.addHeader("Content-Type",  "application/json");
  http.addHeader("x-device-key", DEVICE_KEY);

  JsonDocument reqDoc;
  reqDoc["token"]    = token;
  reqDoc["lockerId"] = MY_LOCKER_ID;
  String body;
  serializeJson(reqDoc, body);

  Serial.println("[HTTP] POST → " + url);
  int statusCode = http.POST(body);

  if (statusCode <= 0) {
    Serial.println("[HTTP ERROR] Code: " + String(statusCode));
    http.end();
    return false;
  }

  String response = http.getString();
  http.end();

  Serial.println("[HTTP] " + String(statusCode) + " → " + response);

  JsonDocument resDoc;
  if (deserializeJson(resDoc, response)) {
    Serial.println("[ERROR] Bad JSON from backend");
    return false;
  }

  if (resDoc.containsKey("reason")) {
    Serial.println("[REASON] " + String(resDoc["reason"].as<const char*>()));
  }

  return resDoc["allow"] == true;
}

// ── Non-blocking unlock ──
void unlockLocker() {
  if (unlocking) return;
  Serial.println("[RELAY] UNLOCKED");
  digitalWrite(SOLENOID_PIN, RELAY_UNLOCK);
  unlocking   = true;
  unlockStart = millis();
}

// ── Heartbeat every 60 s ──
void sendHeartbeat() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(String(BACKEND_URL) + "/heartbeat");
  http.addHeader("Content-Type",  "application/json");
  http.addHeader("x-device-key", DEVICE_KEY);

  JsonDocument doc;
  doc["lockerId"] = MY_LOCKER_ID;
  String body;
  serializeJson(doc, body);

  int code = http.POST(body);
  http.end();
  Serial.println("[HEARTBEAT] code: " + String(code));
}

// ============================================================
//  SETUP
// ============================================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n==============================");
  Serial.println("  SECUREFY — " + String(MY_LOCKER_ID));
  Serial.println("==============================");

  pinMode(SOLENOID_PIN, OUTPUT);
  digitalWrite(SOLENOID_PIN, RELAY_LOCK);
  Serial.println("[INIT] Solenoid locked");

  // Connect to Wi-Fi
  Serial.print("[WIFI] Connecting");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n[WIFI] Connected!");
  Serial.println("[WIFI] IP: " + WiFi.localIP().toString());

  // Register routes
  espServer.on("/",      handleRoot);
  espServer.on("/scan",  handleScan);                    // GET + POST
  espServer.on("/scan",  HTTP_OPTIONS, handleOptions);   // FIX: preflight

  espServer.begin();
  Serial.println("[SERVER] Running on port 80");
  Serial.println("[READY] Waiting for QR scans...");
  Serial.println("[URL]   http://" + WiFi.localIP().toString() + "/scan?ticket=QR_test");
}

// ============================================================
//  LOOP
// ============================================================
void loop() {
  // Wi-Fi auto-reconnect
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WIFI] Disconnected — reconnecting...");
    WiFi.disconnect();
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    unsigned long start = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - start < 10000) {
      delay(500);
      Serial.print(".");
    }
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("\n[WIFI] Reconnected! IP: " + WiFi.localIP().toString());
    } else {
      Serial.println("\n[WIFI] Reconnect failed — retrying next loop");
    }
    return;
  }

  espServer.handleClient();

  // Non-blocking re-lock after UNLOCK_DURATION_MS
  if (unlocking && (millis() - unlockStart >= UNLOCK_DURATION_MS)) {
    digitalWrite(SOLENOID_PIN, RELAY_LOCK);
    unlocking = false;
    Serial.println("[RELAY] LOCKED");
  }

  // Heartbeat every 60 s
  static unsigned long lastHeartbeat = 0;
  if (millis() - lastHeartbeat > 60000) {
    sendHeartbeat();
    lastHeartbeat = millis();
  }
}
