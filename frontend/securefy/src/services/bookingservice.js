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
  const qrExpiresAt = new Date(now.getTime() + 15 * 60 * 1000);

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
      qrToken: makeQrToken(),
      qrExpiresAt: Timestamp.fromDate(qrExpiresAt),
      qrUsed: false,
      createdAt: serverTimestamp(),
    });

    tx.update(lockerRef, {
      status: "reserved",
      currentBookingId: bookingRef.id,
      lastUpdated: serverTimestamp(),
    });

    return { bookingId: bookingRef.id };
  });
}
