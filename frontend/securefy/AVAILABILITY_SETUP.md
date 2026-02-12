# Availability Page - Setup and Usage Guide

## 📋 Overview

The Availability page displays real-time locker status with live updates from Firebase Firestore. It includes:
- Real-time status monitoring
- Search and filter functionality
- Visual status indicators
- Responsive grid layout

## 🚀 Quick Start

### 1. Install Dependencies

Make sure you have all required packages:

```bash
npm install firebase react-router-dom react-icons react-toastify
```

### 2. Firebase Configuration

The `firebase.js` file has been updated to export the Firestore database:

```javascript
import { getFirestore } from "firebase/firestore";
export const db = getFirestore(app);
```

### 3. Seed Sample Data

To populate your Firestore with sample locker data:

```bash
# Make sure you're in the project root
node seedLockers.js
```

This will create 48 lockers with various statuses:
- 16 Available
- 15 Reserved  
- 17 In Use

### 4. Firestore Security Rules

⚠️ **IMPORTANT**: Set up proper security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Lockers: authenticated users can read, only server can write
    match /lockers/{lockerId} {
      allow read: if request.auth != null;
      allow write: if false; // Only cloud functions should update
    }
    
    // Bookings
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
  }
}
```

### 5. Run the Application

```bash
npm run dev
```

Navigate to `http://localhost:5173/availability`

## 📁 File Structure

```
src/
├── pages/
│   ├── Availability.jsx       # Main component
│   └── Availability.css        # Styling
├── firebase.js                 # Firebase config (updated with db export)
└── App.jsx                     # Routing (updated with /availability route)
```

## 🎨 Features

### Real-Time Updates
- Uses Firestore's `onSnapshot` for live data
- Automatic status updates without page refresh
- Green "Live Updates" indicator

### Status Summary Cards
```javascript
- Available: 16 lockers (green)
- In Use: 17 lockers (red)
- Reserved: 15 lockers (yellow/orange)
```

### Search & Filters
- **Search**: Find locker by ID (e.g., "L001")
- **Status Filter**: All Status | Available | Reserved | In Use | Maintenance
- **Size Filter**: All Sizes | Small | Medium | Large

### Locker Grid
- Color-coded by status:
  - 🟢 Green: Available
  - 🔴 Red: In Use
  - 🟡 Yellow: Reserved
  - 🔵 Blue: Maintenance
- Hover effects with elevation
- SVG icons for visual appeal

## 🔧 Customization

### Change Number of Lockers

Edit `seedLockers.js`:

```javascript
for (let i = 1; i <= 100; i++) { // Change 48 to 100
  // ...
}
```

### Adjust Status Distribution

In `seedLockers.js`, modify the logic:

```javascript
if (i <= 30) {
  status = 'available'; // 30 available
} else if (i <= 50) {
  status = 'reserved'; // 20 reserved
}
// ...
```

### Modify Grid Layout

In `Availability.css`:

```css
.lockers-grid {
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  /* Change 120px to adjust tile size */
}
```

## 📊 Data Structure

### Locker Document Schema

```javascript
{
  lockerId: "L001",              // String (unique)
  status: "available",           // "available" | "reserved" | "occupied" | "maintenance"
  size: "medium",                // "small" | "medium" | "large"
  location: "Floor 1",           // String
  lastUpdated: Timestamp,        // Firebase Timestamp
  currentBookingId: "booking_1"  // String | null
}
```

## 🐛 Troubleshooting

### "Loading lockers..." stuck on screen

**Issue**: Firestore connection not working

**Solutions**:
1. Check Firebase credentials in `firebase.js`
2. Verify Firestore is enabled in Firebase Console
3. Check browser console for errors
4. Ensure security rules allow read access

### No lockers showing

**Issue**: Database is empty

**Solution**: Run the seed script:
```bash
node seedLockers.js
```

### "Permission denied" error

**Issue**: Security rules too restrictive

**Solution**: Update Firestore rules to allow authenticated reads:
```javascript
allow read: if request.auth != null;
```

### Filters not working

**Issue**: Data structure mismatch

**Solution**: Ensure locker documents have these fields:
- `lockerId` (string)
- `status` (string)
- `size` (string)

## 🔐 Security Best Practices

### 1. Environment Variables (Recommended)

Create `.env` file:
```
VITE_FIREBASE_API_KEY=your_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_domain_here
# ... other config
```

Update `firebase.js`:
```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // ...
};
```

### 2. Security Rules

Never allow public write access:
```javascript
// ❌ BAD
allow write: if true;

// ✅ GOOD
allow write: if false; // Only server-side
```

### 3. Rate Limiting

Consider implementing App Check to prevent abuse.

## 📱 Responsive Design

The page is fully responsive:
- Desktop: 8 columns grid
- Tablet: 4-6 columns
- Mobile: 3-4 columns

Breakpoints:
- `max-width: 768px` - Tablet
- `max-width: 480px` - Mobile

## ⚡ Performance Tips

### 1. Limit Query Results

If you have many lockers, add pagination:

```javascript
const q = query(
  collection(db, "lockers"), 
  orderBy("lockerId"),
  limit(50) // Only load 50 at a time
);
```

### 2. Index Fields

Create Firestore indexes for:
- `status`
- `size`
- `lockerId`

### 3. Optimize Re-renders

Use `React.memo` for locker items if performance issues occur.

## 🎯 Next Steps

### Integration with Booking

Link lockers to booking system:

```javascript
const handleLockerClick = (locker) => {
  if (locker.status === 'available') {
    navigate(`/book-locker?id=${locker.lockerId}`);
  }
};
```

### Admin Features

Add admin controls:
- Manual status override
- Maintenance mode toggle
- Emergency unlock all

### Analytics

Track popular lockers:
```javascript
await updateDoc(lockerRef, {
  accessCount: increment(1)
});
```

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify Firebase configuration
3. Ensure all dependencies are installed
4. Review Firestore security rules

## 📄 License

Part of the Smart Locker System (Securefy) project.

---

**Last Updated**: February 2026
**Version**: 1.0.0
