# Complete Availability Page Implementation

## 📦 All Files Required

### 1. Availability.jsx
**Location**: `src/pages/Availability.jsx`

```jsx
import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import "./Availability.css";
import { FaSearch } from "react-icons/fa";

export default function Availability() {
  const [lockers, setLockers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sizeFilter, setSizeFilter] = useState("all");

  // Real-time listener for lockers
  useEffect(() => {
    const q = query(collection(db, "lockers"), orderBy("lockerId"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lockersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLockers(lockersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching lockers:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Calculate status counts
  const statusCounts = {
    available: lockers.filter(l => l.status === "available").length,
    inUse: lockers.filter(l => l.status === "occupied").length,
    reserved: lockers.filter(l => l.status === "reserved").length,
  };

  // Filter lockers based on search and filters
  const filteredLockers = lockers.filter(locker => {
    const matchesSearch = locker.lockerId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || locker.status === statusFilter;
    const matchesSize = sizeFilter === "all" || locker.size === sizeFilter;
    return matchesSearch && matchesStatus && matchesSize;
  });

  if (loading) {
    return (
      <div className="availability-container">
        <div className="loading-spinner">Loading lockers...</div>
      </div>
    );
  }

  return (
    <div className="availability-container">
      <div className="availability-header">
        <h1>Real-Time Availability</h1>
        <p className="subtitle">Check the current status of all lockers in the library</p>
      </div>

      {/* Status Summary Cards */}
      <div className="status-summary">
        <div className="status-card available-card">
          <div className="status-header">
            <span className="status-label">Available</span>
            <span className="status-dot available-dot"></span>
          </div>
          <div className="status-count">{statusCounts.available} lockers</div>
        </div>

        <div className="status-card in-use-card">
          <div className="status-header">
            <span className="status-label">In Use</span>
            <span className="status-dot in-use-dot"></span>
          </div>
          <div className="status-count">{statusCounts.inUse} lockers</div>
        </div>

        <div className="status-card reserved-card">
          <div className="status-header">
            <span className="status-label">Reserved</span>
            <span className="status-dot reserved-dot"></span>
          </div>
          <div className="status-count">{statusCounts.reserved} lockers</div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Search Locker</label>
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="e.g., L001"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="filter-group">
          <label>Status Filter</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="occupied">In Use</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Size Filter</label>
          <select
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Sizes</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
      </div>

      {/* Lockers Grid */}
      <div className="lockers-section">
        <div className="lockers-header">
          <h2>All Lockers</h2>
          <div className="live-indicator">
            <span className="live-dot"></span>
            <span>Live Updates</span>
          </div>
        </div>

        {filteredLockers.length === 0 ? (
          <div className="no-results">
            <p>No lockers found matching your criteria</p>
          </div>
        ) : (
          <div className="lockers-grid">
            {filteredLockers.map((locker) => (
              <div
                key={locker.id}
                className={`locker-item ${getStatusColor(locker.status)}`}
              >
                <div className="locker-icon">
                  <svg
                    width="40"
                    height="60"
                    viewBox="0 0 40 60"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="2"
                      y="2"
                      width="36"
                      height="56"
                      rx="4"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <rect
                      x="10"
                      y="10"
                      width="20"
                      height="8"
                      rx="2"
                      fill="currentColor"
                      opacity="0.3"
                    />
                    <circle
                      cx="20"
                      cy="30"
                      r="3"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <div className="locker-id">{locker.lockerId}</div>
                {locker.size && (
                  <div className="locker-size">{locker.size}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function moved inside component scope
function getStatusColor(status) {
  switch (status) {
    case "available":
      return "available";
    case "reserved":
      return "reserved";
    case "occupied":
      return "in-use";
    case "maintenance":
      return "maintenance";
    default:
      return "available";
  }
}
```

### 2. Updated firebase.js
**Location**: `src/firebase.js`

```javascript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // ← Added this

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

export const auth = getAuth(app);
export const db = getFirestore(app); // ← Added this export
export default app;
```

### 3. Updated App.jsx
**Location**: `src/App.jsx`

```jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./pages/Home";
import Availability from "./pages/Availability"; // ← Added import
import Navbar from "./components/Navbar/Navbar";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <div className="container">
        <Navbar />
      </div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/availability" element={<Availability />} /> {/* ← Added route */}
        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
      </Routes>

      <ToastContainer />
    </>
  );
}

function AuthLayout({ children }) {
  return (
    <div className="App">
      <div className="auth-wrapper">
        <div className="auth-inner">{children}</div>
      </div>
    </div>
  );
}

export default App;
```

### 4. package.json dependencies

**Make sure these are installed**:

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "react-icons": "^4.12.0",
    "react-toastify": "^9.1.3",
    "firebase": "^10.7.1"
  }
}
```

Install command:
```bash
npm install react-router-dom react-icons react-toastify firebase
```

## 🔥 Firebase Setup Steps

### Step 1: Enable Firestore

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project: `fy-e4378`
3. Click "Firestore Database" in left sidebar
4. Click "Create database"
5. Choose "Start in production mode"
6. Select a location (closest to your users)

### Step 2: Create Firestore Index

For the `orderBy` query to work, create an index:

1. In Firestore console, go to "Indexes" tab
2. Click "Create Index"
3. Collection ID: `lockers`
4. Field: `lockerId`, Order: Ascending
5. Click "Create"

### Step 3: Set Security Rules

1. Go to "Rules" tab in Firestore
2. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Lockers collection
    match /lockers/{lockerId} {
      allow read: if true; // Temporary for testing
      allow write: if false;
    }
    
    // Bookings collection
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
  }
}
```

**⚠️ After testing, change to**:
```javascript
allow read: if request.auth != null; // Only authenticated users
```

### Step 4: Seed Data

Run the seeding script to populate lockers:

```bash
node seedLockers.js
```

## ✅ Testing Checklist

- [ ] Firebase config is correct in `firebase.js`
- [ ] Firestore is enabled in Firebase Console
- [ ] Security rules are set
- [ ] Index is created for `lockerId`
- [ ] Dependencies are installed
- [ ] Seed script has been run
- [ ] Development server is running (`npm run dev`)
- [ ] Navigate to `/availability` route
- [ ] See 48 lockers with different statuses
- [ ] Test search functionality
- [ ] Test status filter
- [ ] Test size filter
- [ ] Verify real-time updates (change a locker status in Firebase Console)

## 🎨 Customization Examples

### Change Grid Columns

```css
/* In Availability.css */
.lockers-grid {
  grid-template-columns: repeat(10, 1fr); /* 10 columns instead of auto */
}
```

### Add Hover Tooltip

```jsx
// In Availability.jsx
<div 
  className={`locker-item ${getStatusColor(locker.status)}`}
  title={`${locker.lockerId} - ${locker.status} - ${locker.size}`}
>
```

### Custom Status Badge

```jsx
<div className="status-badge">
  {locker.status === 'available' ? '✓' : locker.status === 'occupied' ? '●' : '⏱'}
</div>
```

## 🐛 Common Issues & Solutions

### Issue: "db is not defined"
**Solution**: Make sure `firebase.js` exports `db`:
```javascript
export const db = getFirestore(app);
```

### Issue: "Missing or insufficient permissions"
**Solution**: Update Firestore rules to allow read access

### Issue: No lockers appearing
**Solution**: Run seed script:
```bash
node seedLockers.js
```

### Issue: "Collection 'lockers' not found"
**Solution**: Create the collection by running the seed script

## 📊 Performance Optimization

For large datasets (1000+ lockers):

```javascript
// Add pagination
const [lastDoc, setLastDoc] = useState(null);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
  const q = query(
    collection(db, "lockers"),
    orderBy("lockerId"),
    startAfter(lastDoc),
    limit(50)
  );
  // ... fetch logic
};
```

## 🚀 Deployment Notes

Before deploying:

1. **Move Firebase config to environment variables**
2. **Update security rules** (remove public read access)
3. **Enable Firebase App Check**
4. **Set up CORS** if using custom domain
5. **Add rate limiting**

---

**Implementation Complete!** 🎉

You now have a fully functional, real-time locker availability page with search and filtering capabilities.
