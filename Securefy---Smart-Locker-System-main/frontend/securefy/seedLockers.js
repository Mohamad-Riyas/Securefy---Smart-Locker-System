// seedLockers.js - Run this script to populate your Firestore with sample locker data
// Usage: node seedLockers.js

import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAZSTq0xY-Ah9BljJwm8kPoh6_5gtScZXg",
  authDomain: "fy-e4378.firebaseapp.com",
  projectId: "fy-e4378",
  storageBucket: "fy-e4378.firebasestorage.app",
  messagingSenderId: "1023769210293",
  appId: "1:1023769210293:web:ac2303cd062e30be0dfdfc",
  measurementId: "G-67NWY9Z3GG"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Generate locker data
const generateLockers = () => {
  const lockers = [];
  const statuses = ['available', 'reserved', 'occupied', 'maintenance'];
  const sizes = ['small', 'medium', 'large'];
  
  // Create 48 lockers (6 rows x 8 columns as shown in the screenshot)
  for (let i = 1; i <= 48; i++) {
    const lockerId = `L${String(i).padStart(3, '0')}`; // L001, L002, etc.
    
    // Distribute statuses to match the screenshot counts approximately
    let status;
    if (i <= 16) {
      status = 'available'; // 16 available
    } else if (i <= 31) {
      status = 'reserved'; // 15 reserved
    } else if (i <= 48) {
      status = 'occupied'; // 17 in use
    } else {
      status = 'maintenance';
    }
    
    lockers.push({
      lockerId,
      status,
      size: sizes[i % 3], // Distribute sizes evenly
      location: `Floor ${Math.ceil(i / 16)}`,
      lastUpdated: new Date(),
      currentBookingId: status !== 'available' ? `booking_${i}` : null
    });
  }
  
  return lockers;
};

// Seed the database
const seedDatabase = async () => {
  try {
    console.log('Starting to seed locker data...');
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
