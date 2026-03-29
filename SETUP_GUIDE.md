# Securefy — ESP32 ↔ Firebase Connection Guide

## How QR Auto-Generation Works in Your Project

```
BookLocker.jsx  →  BookingQr.js  →  Firebase Firestore  →  MyQRCode.jsx
  (student          (creates          (saves token)         (shows QR
   books)           QR_uuid...)                              to student)
```

1. Student clicks **Confirm Booking** in `BookLocker.jsx`
2. `BookingQr.js` calls `makeQrToken()` which runs:
   `"QR_" + crypto.randomUUID()` → generates something like `QR_3f2a91bc-4c11-4e2a-...`
3. That token is saved into the **Firestore `bookings` collection** with:
   - `qrToken: "QR_3f2a91bc-..."` — the actual token
   - `lockerId: "L001"` — which locker it belongs to
   - `qrUsed: false` — not scanned yet
   - `qrExpiresAt:` — 15 minutes from now
4. `MyQRCode.jsx` reads this from Firestore and renders `<QRCodeSVG value={booking.qrToken} />`
5. Student shows their phone screen at the locker

---

## Full System Flow (After Student Books)

```
Student phone          ESP32 (at locker)          server.js (your PC)     Firebase
     │                       │                           │                    │
     │ Show QR on screen     │                           │                    │
     │ ──────────────────►   │                           │                    │
     │                       │ QR Scanner reads token    │                    │
     │                  reads "QR_3f2a91bc-..."          │                    │
     │                       │                           │                    │
     │                       │  POST /verifyQr           │                    │
     │                       │  { token, lockerId }      │                    │
     │                       │ ─────────────────────────►│                    │
     │                       │                           │ query Firestore     │
     │                       │                           │ ──────────────────►│
     │                       │                           │                    │ check:
     │                       │                           │                    │ valid?
     │                       │                           │                    │ used?
     │                       │                           │                    │ expired?
     │                       │                           │◄──────────────────│
     │                       │                           │ mark qrUsed: true  │
     │                       │                           │ status: occupied   │
     │                       │   { "allow": true }       │                    │
     │                       │◄─────────────────────────│                    │
     │                       │                           │                    │
     │                  pin HIGH (5 sec)                 │                    │
     │                  solenoid OPENS                   │                    │
```

---

## Step-by-Step Setup

### Step 1 — Get Firebase Service Account Key

1. Open [Firebase Console](https://console.firebase.google.com) → your project
2. Click ⚙ **Project Settings** → **Service Accounts** tab
3. Click **"Generate new private key"**
4. A JSON file downloads — rename it to `serviceAccountKey.json`
5. Place it in your project root (same folder as `package.json`)
6. Open `.gitignore` and add this line:
   ```
   serviceAccountKey.json
   ```

### Step 2 — Install backend dependencies

Open a terminal in your project root:

```bash
npm install express firebase-admin
```

### Step 3 — Place server.js in your project root

Copy `server.js` (provided) to the same folder as `package.json`.

### Step 4 — Run the backend server

```bash
node server.js
```

You should see:
```
================================================
  SECUREFY Backend Server running on port 5000
================================================
  QR Verify:  POST http://localhost:5000/verifyQr
  Heartbeat:  POST http://localhost:5000/heartbeat
  Status:     GET  http://localhost:5000/status/L001
  Waiting for ESP32 connections...
================================================
```

**Keep this terminal open while testing.**

### Step 5 — Find your PC's local IP address

The ESP32 needs your PC's IP to reach the server.

**Windows:**
```
Press Win+R → type cmd → ipconfig
Look for: IPv4 Address . . . . . : 192.168.1.XX
```

**Mac/Linux:**
```bash
ifconfig | grep "inet "
```

### Step 6 — Flash the ESP32 code

Open `securefy_esp32.ino` in Arduino IDE.

Change **line 1** — `MY_LOCKER_ID` and `SOLENOID_PIN` for each device:

| Device | MY_LOCKER_ID | SOLENOID_PIN |
|--------|-------------|--------------|
| ESP32 #1 | `"L001"` | `4` |
| ESP32 #2 | `"L002"` | `5` |
| ESP32 #3 | `"L003"` | `6` |

Change `BACKEND_URL` to your PC's IP from Step 5:
```cpp
const char* BACKEND_URL = "http://192.168.1.45:5000";   // your PC's IP
```

Make sure `DEVICE_KEY` matches in both files:
```cpp
// In .ino file:
const char* DEVICE_KEY = "securefy-device-key-2024";
```
```js
// In server.js:
const DEVICE_KEY = "securefy-device-key-2024";
```

Flash to each ESP32 separately (changing MY_LOCKER_ID + SOLENOID_PIN each time).

### Step 7 — Test the connection

Open **Arduino IDE Serial Monitor** at 115200 baud. You'll see:
```
[WIFI] Connected!
[WIFI] ESP32 IP Address: 192.168.1.87
[SERVER] ESP32 web server running on port 80
[READY] Waiting for QR scans...
```

Open a browser and visit: `http://192.168.1.87` (the ESP32's IP) — you should see the Securefy status page.

### Step 8 — Test a QR scan manually

In your browser or Postman, send:
```
GET http://192.168.1.87/scan?ticket=QR_SOME_REAL_TOKEN_FROM_FIRESTORE
```

To get a real token: book a locker in your web app → go to My QR Code page → open Firestore Console → bookings collection → copy the `qrToken` value.

Serial Monitor should print:
```
[SCAN RECEIVED] Token: QR_3f2a91bc-...
[INFO] Asking backend to validate...
[HTTP] POST → http://192.168.1.45:5000/verifyQr
[ACCESS GRANTED] Opening L001
[RELAY] Energising solenoid — UNLOCKED
[RELAY] Solenoid off — LOCKED
```

---

## Files Summary

| File | Where to put it | What it does |
|------|----------------|--------------|
| `server.js` | Project root (next to package.json) | Bridge between ESP32 and Firebase |
| `serviceAccountKey.json` | Project root | Firebase admin credentials (keep secret!) |
| `securefy_esp32.ino` | Arduino IDE | Runs on each ESP32 |

## Common Errors

| Error | Fix |
|-------|-----|
| `[HTTP ERROR] Could not reach backend` | Check BACKEND_URL is correct IP, server.js is running |
| `[AUTH FAILED] Bad device key` | DEVICE_KEY must be identical in .ino and server.js |
| `[DENIED] No booking found` | Locker ID in ESP32 must match Firestore document ID (L001/L002/L003) |
| `[DENIED] QR expired` | QR token is only valid for 15 minutes after booking |
| `[DENIED] QR already used` | This is correct security behaviour — book again for a new QR |
| Solenoid not moving | Check relay logic — swap RELAY_UNLOCK/RELAY_LOCK values |
