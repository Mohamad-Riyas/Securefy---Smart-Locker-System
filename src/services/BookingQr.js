import {
  doc, runTransaction, serverTimestamp, Timestamp, collection
} from "firebase/firestore";
import { db, auth } from "../firebase";

const makeQrToken = () => `QR_${crypto.randomUUID()}`;

export async function bookLocker({ lockerId, startDate, endDate }) {
  const user = auth.currentUser;
  if (!user) throw new Error("Login required");

  const lockerRef = doc(db, "lockers", lockerId);
  const bookingsCol = collection(db, "bookings");

  const now = new Date();
  const qrExpiresAt = new Date(startDate.getTime() + 15 * 60 * 1000);
  
  const startToken = makeQrToken();
  const endToken = makeQrToken();

  return await runTransaction(db, async (tx) => {
    const lockerSnap = await tx.get(lockerRef);
    if (!lockerSnap.exists()) throw new Error("Locker not found");

    if (lockerSnap.data().status !== "available") {
      throw new Error("Locker already booked");
    }

    const bookingRef = doc(bookingsCol);

    tx.set(bookingRef, {
      userId: user.uid,
      lockerId,
      startTime: Timestamp.fromDate(startDate),
      endTime: Timestamp.fromDate(endDate),
      status: "active",
      qrToken: startToken,
      endQrToken: endToken,
      qrExpiresAt: Timestamp.fromDate(qrExpiresAt),
      qrUsed: false,
      endQrUsed: false,
      createdAt: serverTimestamp(),
    });

    tx.update(lockerRef, {
      status: "reserved",
      currentBookingId: bookingRef.id,
      lastUpdated: serverTimestamp(),
    });

    return { bookingId: bookingRef.id, qrToken: startToken, endQrToken: endToken, userEmail: user.email };
  });
}
