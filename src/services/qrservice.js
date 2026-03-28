import {
  collection, query, where, getDocs, runTransaction, doc, Timestamp
} from "firebase/firestore";
import { db } from "../firebase";

export async function validateQr(qrToken) {
  const q = query(collection(db, "bookings"), where("qrToken", "==", qrToken));
  const snap = await getDocs(q);

  if (snap.empty) throw new Error("Invalid QR");

  const bookingDoc = snap.docs[0];
  const bookingRef = doc(db, "bookings", bookingDoc.id);
  const lockerRef = doc(db, "lockers", bookingDoc.data().lockerId);

  await runTransaction(db, async (tx) => {
    const b = (await tx.get(bookingRef)).data();
    const now = new Date();

    if (b.qrUsed) throw new Error("QR already used");
    if (now > b.qrExpiresAt.toDate()) throw new Error("QR expired");

    tx.update(bookingRef, {
      qrUsed: true,
      qrUsedAt: Timestamp.fromDate(now),
    });

    tx.update(lockerRef, { status: "occupied" });
  });
}
