#include <WiFi.h>
#include <WebServer.h>
#include <WiFiManager.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// --- SETTINGS ---
const char* BACKEND_URL = "https://securefy-smart-locker-system.onrender.com";
const char* DEVICE_KEY  = "securefy-device-key-2024";

const char* LOCKER_IDS[3] = {"L001", "L002", "L003"};
const int SOLENOID_PINS[3] = {4, 5, 6};

const int UNLOCK_RELAY = LOW;
const int LOCK_RELAY   = HIGH;

WebServer server(80);
unsigned long lastCloudPoll = 0;

// --- WEBPAGE ---
String getHTML() {
  String html = "<!DOCTYPE html><html><head>";
  html += "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">";
  html += "<style>body{text-align:center;background-color:#222;color:white;margin-top:100px;}";
  html += "#scanBox{padding:20px;font-size:24px;width:80%;max-width:400px;text-align:center;border-radius:10px;border:3px solid #4CAF50;color:white;background:#333;}";
  html += "</style></head><body>";
  html += "<h2>Securefy Locker System</h2>";
  html += "<input type=\"text\" id=\"scanBox\" placeholder=\"Waiting for scan...\" onchange=\"processScan()\" onblur=\"setTimeout(() => this.focus(), 10)\"><br>";
  html += "<p id=\"status\">Ready</p>";
  html += "<script>";
  html += "window.onload = function() { document.getElementById('scanBox').focus(); };";
  html += "document.addEventListener('click', function() { document.getElementById('scanBox').focus(); });";
  html += "function processScan() {";
  html += "  var box = document.getElementById('scanBox');";
  html += "  var code = box.value;";
  html += "  if(code.length < 3) return;";
  html += "  document.getElementById('status').innerText = 'Verifying...';";
  html += "  fetch('/scan?ticket=' + encodeURIComponent(code)).then(r => r.text()).then(t => { document.getElementById('status').innerText = t; });";
  html += "  box.value = ''; box.focus();";
  html += "}";
  html += "</script></body></html>";
  return html;
}

void triggerRelay(String lockerId) {
  for (int i = 0; i < 3; i++) {
    if (lockerId == LOCKER_IDS[i]) {
      Serial.println("[RELAY] UNLOCKED → " + lockerId);
      digitalWrite(SOLENOID_PINS[i], UNLOCK_RELAY);
      delay(5000);
      digitalWrite(SOLENOID_PINS[i], LOCK_RELAY);
      Serial.println("[RELAY] LOCKED → " + lockerId);
      return;
    }
  }
}

void checkCloudUnlockRequests() {
  if (millis() - lastCloudPoll < 2000) return; // Only check every 2 seconds
  lastCloudPoll = millis();

  HTTPClient http;
  http.begin(String(BACKEND_URL) + "/getUnlockRequests");
  http.addHeader("x-device-key", DEVICE_KEY);

  int httpCode = http.GET();
  if (httpCode == 200) {
    String response = http.getString();
    JsonDocument doc;
    deserializeJson(doc, response);
    JsonArray requests = doc["requests"].as<JsonArray>();
    for (JsonObject r : requests) {
      triggerRelay(r["lockerId"].as<String>());
    }
  }
  http.end();
}

void handleRoot() { server.send(200, "text/html", getHTML()); }

void handleScan() {
  if (server.hasArg("ticket")) {
    String token = server.arg("ticket");
    token.trim();
    HTTPClient http;
    http.begin(String(BACKEND_URL) + "/verifyQr");
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-device-key", DEVICE_KEY);
    String body = "{\"token\":\"" + token + "\",\"lockerId\":\"ALL\"}";
    int httpCode = http.POST(body);
    if (httpCode == 200) {
      String response = http.getString();
      JsonDocument doc;
      deserializeJson(doc, response);
      if (doc["allow"] == true) {
        String lockerId = doc["lockerId"].as<String>();
        triggerRelay(lockerId);
        server.send(200, "text/plain", "✅ Locker " + lockerId + " Opened!");
      } else {
        server.send(200, "text/plain", "❌ Failed: " + doc["reason"].as<String>());
      }
    } else {
      server.send(200, "text/plain", "❌ Server connection error");
    }
    http.end();
  }
}

void setup() {
  Serial.begin(115200);
  for (int i = 0; i < 3; i++) {
    pinMode(SOLENOID_PINS[i], OUTPUT);
    digitalWrite(SOLENOID_PINS[i], LOCK_RELAY);
  }
  WiFiManager wm;
  wm.autoConnect("SmartLocker_Setup");
  server.on("/", handleRoot);
  server.on("/scan", handleScan);
  server.begin();
}

void loop() {
  server.handleClient();
  checkCloudUnlockRequests();
}
