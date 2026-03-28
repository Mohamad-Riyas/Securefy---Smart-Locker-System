// ============================================================
//  SECUREFY - Backend Server  (server.js)
//  Place this file in your project ROOT folder
//  (same level as package.json)
//
//  This is the bridge between your ESP32 and Firebase Firestore.
//  ESP32 cannot talk directly to Firebase — it talks to this server,
//  and this server talks to Firebase with admin privileges.
//
//  Run with:  node server.js
// ============================================================

import express       from "express";
import { readFile }  from "fs/promises";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

// ─────────────────────────────────────────────
//  CONFIGURATION — change these two values
// ─────────────────────────────────────────────

//  Secret key — ESP32 sends this in every request header.
//  Must EXACTLY match DEVICE_KEY in your .ino file.
const DEVICE_KEY = "securefy-device-key-2024";

//  Port this server listens on
const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────────────
//  FIREBASE ADMIN SETUP
//  You need serviceAccountKey.json from Firebase Console:
//    1. Go to Firebase Console → your project
//    2. Click ⚙ Settings → Service Accounts
//    3. Click "Generate new private key"
//    4. Save the downloaded file as serviceAccountKey.json
//       in the SAME folder as this server.js file
//    5. Add serviceAccountKey.json to your .gitignore  ← IMPORTANT!
// ─────────────────────────────────────────────

let serviceAccount;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } else {
    serviceAccount = JSON.parse(
      await readFile(new URL("./serviceAccountKey.json", import.meta.url))
    );
  }
} catch (err) {
  console.error("[FATAL] Could not load serviceAccountKey.json or FIREBASE_SERVICE_ACCOUNT_JSON env variable.");
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// ─────────────────────────────────────────────
//  EXPRESS APP SETUP
// ─────────────────────────────────────────────
const app = express();
app.use(express.json());

// Allow requests from your React app (CORS)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, x-device-key");
  next();
});

// ── Security Middleware ──
// Every request from the ESP32 must include the correct device key
// (This is the same secret in your .ino file — DEVICE_KEY)
function requireDeviceKey(req, res, next) {
  const key = req.headers["x-device-key"];
  if (!key || key !== DEVICE_KEY) {
    console.log(`[AUTH FAILED] Bad device key from ${req.ip}`);
    return res.status(403).json({ error: "Unauthorized device" });
  }
  next();
}

// ============================================================
//  ROUTE 1:  POST /verifyQr
//  Called by ESP32 after it reads a QR code from the scanner
//
//  Request body (JSON):
//    { "token": "QR_3f2a91bc-...", "lockerId": "L001" }
//
//  Response (JSON):
//    { "allow": true }                         ← locker should open
//    { "allow": false, "reason": "Expired" }  ← locker stays locked
// ============================================================
app.post("/verifyQr", requireDeviceKey, async (req, res) => {
  const { token, lockerId } = req.body;

  console.log(`\n[VERIFY QR] Token: ${token} | Request Locker: ${lockerId || "ANY"}`);

  if (!token) {
    return res.json({ allow: false, reason: "Missing token" });
  }

  if (!token.startsWith("QR_")) {
    return res.json({ allow: false, reason: "Invalid token format" });
  }

  try {
    let query = db.collection("bookings")
                  .where("qrToken", "==", token)
                  .where("status", "==", "active");

    // If a specific lockerId was sent, enforce it. Otherwise, find ANY active booking for this token.
    if (lockerId && lockerId !== "ALL") {
      query = query.where("lockerId", "==", lockerId);
    }

    const bookingSnap = await query.get();

    if (bookingSnap.empty) {
      console.log(`[DENIED] No active booking found for token: ${token}`);
      return res.json({ allow: false, reason: "Invalid QR or no matching booking" });
    }

    const bookingDoc  = bookingSnap.docs[0];
    const bookingData = bookingDoc.data();
    const targetLockerId = bookingData.lockerId;

    // ── Check if already used ──
    if (bookingData.qrUsed === true) {
      console.log(`[DENIED] QR already used at: ${bookingData.qrUsedAt?.toDate()}`);
      return res.json({ allow: false, reason: "QR already used" });
    }

    // ── Check if booking hasn't started yet ──
    const now = new Date();
    const startTime = bookingData.startTime.toDate();
    const fiveMinsBefore = new Date(startTime.getTime() - 5 * 60 * 1000);
    if (now < fiveMinsBefore) {
       console.log(`[DENIED] Booking hasn't started. Starts at: ${startTime}`);
       return res.json({ allow: false, reason: "Booking hasn't started yet" });
    }

    // ── All checks passed — mark as used and update locker status ──
    const batch = db.batch();

    batch.update(bookingDoc.ref, {
      qrUsed:   true,
      qrUsedAt: Timestamp.fromDate(now),
    });

    const lockerRef = db.collection("lockers").doc(targetLockerId);
    batch.update(lockerRef, {
      status:      "occupied",
      lastUpdated: Timestamp.fromDate(now),
    });

    await batch.commit();

    console.log(`[GRANTED] Locker ${targetLockerId} opened for booking ${bookingDoc.id}`);
    return res.json({ allow: true, lockerId: targetLockerId });

  } catch (err) {
    console.error("[SERVER ERROR]", err);
    return res.status(500).json({ allow: false, reason: "Server error" });
  }
});

// ============================================================
//  ROUTE 2:  POST /heartbeat
//  ESP32 sends this every 60 seconds so you know it's alive
//
//  Request body: { "lockerId": "L001" }
// ============================================================
app.post("/heartbeat", requireDeviceKey, (req, res) => {
  const { lockerId } = req.body;
  const time = new Date().toLocaleTimeString();
  console.log(`[HEARTBEAT] ${lockerId} is online — ${time}`);
  res.json({ ok: true, time });
});

// ============================================================
//  ROUTE 3:  GET /status/:lockerId
//  Optional — lets you check a locker's status from browser
//  Example:  http://localhost:5000/status/L001
// ============================================================
app.get("/status/:lockerId", async (req, res) => {
  try {
    const lockerDoc = await db.collection("lockers").doc(req.params.lockerId).get();
    if (!lockerDoc.exists) {
      return res.status(404).json({ error: "Locker not found" });
    }
    res.json(lockerDoc.data());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
//  START SERVER
// ============================================================
app.listen(PORT, () => {
  console.log("================================================");
  console.log(`  SECUREFY Backend Server running on port ${PORT}`);
  console.log("================================================");
  console.log(`  QR Verify:  POST http://localhost:${PORT}/verifyQr`);
  console.log(`  Heartbeat:  POST http://localhost:${PORT}/heartbeat`);
  console.log(`  Status:     GET  http://localhost:${PORT}/status/L001`);
  console.log("  Waiting for ESP32 connections...");
  console.log("================================================\n");
});
