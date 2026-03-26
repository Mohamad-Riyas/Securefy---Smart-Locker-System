#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ─────────────────────────────────────────────
//  MULTI LOCKER CONFIG
// ─────────────────────────────────────────────
#define LOCKER_COUNT 3

const char* LOCKER_IDS[LOCKER_COUNT] = {
  "L001",
  "L002",
  "L003"
};

const int SOLENOID_PINS[LOCKER_COUNT] = {
  4,   // L001
  5,   // L002
  6    // L003
};

// ─────────────────────────────────────────────
//  WI-FI SETTINGS
// ─────────────────────────────────────────────
const char* WIFI_SSID     = "Name D";
const char* WIFI_PASSWORD = "1234567D";

// ─────────────────────────────────────────────
//  BACKEND
// ─────────────────────────────────────────────
const char* BACKEND_URL = "https://securefy-smart-locker-system.onrender.com";
const char* DEVICE_KEY  = "securefy-device-key-2024";

// ─────────────────────────────────────────────
//  RELAY LOGIC
// ─────────────────────────────────────────────
const int RELAY_UNLOCK = HIGH;
const int RELAY_LOCK   = LOW;

const int UNLOCK_DURATION_MS = 5000;
const int HTTP_TIMEOUT_MS    = 8000;

// State per locker
bool unlocking[LOCKER_COUNT] = {false, false, false};
unsigned long unlockStart[LOCKER_COUNT] = {0, 0, 0};

// ============================================================
//  VERIFY BACKEND
// ============================================================
int verifyWithBackend(String token) {
  if (WiFi.status() != WL_CONNECTED) return -1;

  HTTPClient http;
  String url = String(BACKEND_URL) + "/verifyQr";

  http.begin(url);
  http.setTimeout(HTTP_TIMEOUT_MS);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-key", DEVICE_KEY);

  JsonDocument reqDoc;
  reqDoc["token"] = token;

  String body;
  serializeJson(reqDoc, body);

  int statusCode = http.POST(body);

  if (statusCode <= 0) {
    Serial.println("[HTTP] Connection failed: " + String(statusCode));
    http.end();
    return -1;
  }

  String response = http.getString();
  http.end();

  Serial.println("[HTTP] " + response);

  JsonDocument resDoc;
  if (deserializeJson(resDoc, response)) return -1;

  if (resDoc["allow"] == true) {
    String lockerId = resDoc["lockerId"].as<String>();
    for (int i = 0; i < LOCKER_COUNT; i++) {
      if (lockerId == LOCKER_IDS[i]) {
        return i;
      }
    }
  }

  return -1;
}

// ============================================================
//  UNLOCK LOCKER
// ============================================================
void unlockLocker(int index) {
  if (unlocking[index]) return;

  Serial.println("[RELAY] UNLOCKED → " + String(LOCKER_IDS[index]));
  digitalWrite(SOLENOID_PINS[index], RELAY_UNLOCK);
  unlocking[index] = true;
  unlockStart[index] = millis();
}

// ============================================================
//  HEARTBEAT
// ============================================================
void sendHeartbeat() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(String(BACKEND_URL) + "/heartbeat");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-key", DEVICE_KEY);

  JsonDocument doc;
  doc["lockerId"] = "multi-locker";

  String body;
  serializeJson(doc, body);

  http.POST(body);
  http.end();
}

// ============================================================
//  SETUP
// ============================================================
void setup() {
  Serial.begin(115200);
  Serial1.begin(9600, SERIAL_8N1, 20, 21);

  delay(1000);
  Serial.println("\n=== SECUREFY MULTI LOCKER ===");

  for (int i = 0; i < LOCKER_COUNT; i++) {
    pinMode(SOLENOID_PINS[i], OUTPUT);
    digitalWrite(SOLENOID_PINS[i], RELAY_LOCK);
  }

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("[WIFI] Connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n[WIFI] Connected!");
  Serial.println(WiFi.localIP());
  Serial.println("[READY] System started");
}

// ============================================================
//  LOOP
// ============================================================
void loop() {

  // Reconnect WiFi if dropped
  if (WiFi.status() != WL_CONNECTED) {
    WiFi.disconnect();
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    return;
  }

  // Read from GM65 scanner
  if (Serial1.available()) {
    String scanned = Serial1.readString();
    scanned.trim();

    if (scanned.length() > 0) {
      Serial.println("[SCAN] " + scanned);
      int index = verifyWithBackend(scanned);
      if (index >= 0) {
        unlockLocker(index);
      }
    }
  }

  // Relock after 5 seconds
  for (int i = 0; i < LOCKER_COUNT; i++) {
    if (unlocking[i] && (millis() - unlockStart[i] > UNLOCK_DURATION_MS)) {
      digitalWrite(SOLENOID_PINS[i], RELAY_LOCK);
      unlocking[i] = false;
      Serial.println("[RELAY] LOCKED → " + String(LOCKER_IDS[i]));
    }
  }

  // Heartbeat every 60 seconds
  static unsigned long lastHeartbeat = 0;
  if (millis() - lastHeartbeat > 60000) {
    sendHeartbeat();
    lastHeartbeat = millis();
  }
}
