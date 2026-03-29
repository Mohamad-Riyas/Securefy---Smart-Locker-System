// seedLockers.js - Run this script to populate your Firestore with sample locker data
// Usage: node seedLockers.js

import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Generate locker data
const generateLockers = () => {
  const lockers = [];
  const statuses = ['available', 'reserved', 'occupied', 'maintenance'];
  const sizes = ['small', 'medium', 'large'];

  // Create only 3 lockers
  for (let i = 1; i <= 3; i++) {
    const lockerId = `L${String(i).padStart(3, '0')}`; // L001, L002, L003

    lockers.push({
      lockerId,
      status: 'available',
      size: 'medium',
      location: 'Floor 1',
      lastUpdated: new Date(),
      currentBookingId: null
    });
  }

  return lockers;
};

// Seed the database
const seedDatabase = async () => {
  try {
    console.log('Starting to seed locker data...');

    // Clear existing lockers
    const { getDocs, deleteDoc } = await import("firebase/firestore");
    const snapshot = await getDocs(collection(db, 'lockers'));
    console.log(`Clearing ${snapshot.size} existing lockers...`);
    for (const doc of snapshot.docs) {
      await deleteDoc(doc.ref);
    }

    const lockers = generateLockers();

    for (const locker of lockers) {
      await setDoc(doc(db, 'lockers', locker.lockerId), locker);
      console.log(`Created locker: ${locker.lockerId} - ${locker.status}`);
    }

    console.log('✅ Successfully seeded all lockers!');
    console.log(`Total lockers created: ${lockers.length}`);
    console.log('Status breakdown:');
    console.log(`  - Available: ${lockers.filter(l => l.status === 'available').length}`);
    console.log(`  - Reserved: ${lockers.filter(l => l.status === 'reserved').length}`);
    console.log(`  - In Use: ${lockers.filter(l => l.status === 'occupied').length}`);
    console.log(`  - Maintenance: ${lockers.filter(l => l.status === 'maintenance').length}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
