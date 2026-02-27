#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// WiFi Credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Backend URL
const char* backendUrl = "http://YOUR_SERVER_IP:5000";
const char* deviceKey = "CHANGE_ME_DEVICE_KEY";
const char* lockerId = "L001";

// Pin Configuration
const int SOLENOID_PIN = 14;
const int DOOR_SENSOR_PIN = 27;

void setup() {
  Serial.begin(115200);
  pinMode(SOLENOID_PIN, OUTPUT);
  pinMode(DOOR_SENSOR_PIN, INPUT_PULLUP);
  digitalWrite(SOLENOID_PIN, LOW); // Locked

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
}

void loop() {
  // 1. Heartbeat every 60 seconds
  static unsigned long lastHeartbeat = 0;
  if (millis() - lastHeartbeat > 60000) {
    sendHeartbeat();
    lastHeartbeat = millis();
  }

  // 2. Poll for QR Verification (Example)
  // In a real device, you'd use a QR Scanner here
  // verifyQr("SCANNED_TOKEN_HERE");

  delay(10);
}

void sendHeartbeat() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(String(backendUrl) + "/heartbeat");
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-device-key", deviceKey);

    StaticJsonDocument<100> doc;
    doc["lockerId"] = lockerId;
    String body;
    serializeJson(doc, body);

    int httpResponseCode = http.POST(body);
    Serial.printf("Heartbeat sent, code: %d\n", httpResponseCode);
    http.end();
  }
}

void verifyQr(String token) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(String(backendUrl) + "/verifyQr");
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-device-key", deviceKey);

    StaticJsonDocument<200> doc;
    doc["lockerId"] = lockerId;
    doc["token"] = token;
    String body;
    serializeJson(doc, body);

    int httpResponseCode = http.POST(body);
    if (httpResponseCode > 0) {
      String response = http.getString();
      StaticJsonDocument<200> resDoc;
      deserializeJson(resDoc, response);

      if (resDoc["allow"] == true) {
        unlockLocker();
      }
    }
    http.end();
  }
}

void unlockLocker() {
  digitalWrite(SOLENOID_PIN, HIGH);
  delay(5000); // Keep open for 5 seconds
  digitalWrite(SOLENOID_PIN, LOW);
}
