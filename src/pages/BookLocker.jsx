import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../firebase";
import { bookLocker } from "../services/BookingQr";
import { toast } from "react-toastify";
import { FaLock, FaMapMarkerAlt, FaClock, FaFilter } from "react-icons/fa";
import "./BookLocker.css";

export default function BookLocker() {
  const [lockers, setLockers] = useState([]);
  const [selectedLocker, setSelectedLocker] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterSize, setFilterSize] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      toast.error("Please login to book a locker");
      navigate("/login");
      return;
    }
    fetchAvailableLockers();
  }, [filterSize, filterLocation]);

  const fetchAvailableLockers = async () => {
    try {
      setLoading(true);
      let q = query(
        collection(db, "lockers"),
        where("status", "==", "available")
      );

     
      if (filterSize !== "all") {
        q = query(q, where("size", "==", filterSize));
      }

      const snapshot = await getDocs(q);
      let lockerList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      
      if (filterLocation !== "all") {
        lockerList = lockerList.filter(l => l.location.includes(filterLocation));
      }

      setLockers(lockerList);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to fetch lockers. Please try again.");
      console.error(err);
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedLocker) {
      toast.error("Please select a locker");
      return;
    }
    if (!startDate || !endDate) {
      toast.error("Please select start and end times");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      toast.error("End time must be after start time");
      return;
    }

    try {
      const result = await bookLocker({
        lockerId: selectedLocker.id,
        startDate: start,
        endDate: end
      });

      try {
        await fetch("http://localhost:5000/sendEmail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userEmail: result.userEmail,
            endQrToken: result.endQrToken,
            lockerId: selectedLocker.lockerId
          })
        });
      } catch (emailErr) {
        console.error("Failed to call /sendEmail", emailErr);
      }

      toast.success("🎉 Booking successful! Check My QR Code page");
      setTimeout(() => navigate("/my-qr-code"), 1500);
    } catch (err) {
      toast.error(err.message || "Booking failed. Please try again.");
      console.error(err);
    }
  };

  const getSizeIcon = (size) => {
    switch(size) {
      case "small": return "📦";
      case "medium": return "📦📦";
      case "large": return "📦📦📦";
      default: return "📦";
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading available lockers...</p>
      </div>
    );
  }

  return (
    <div className="book-locker-container">
      <div className="book-header">
        <h1>📍 Book a Locker</h1>
        <p>Select an available locker and choose your time slot</p>
      </div>

      <div className="filters-section">
        <div className="filter-card">
          <FaFilter className="filter-icon" />
          <div className="filter-group">
            <label>Size:</label>
            <select value={filterSize} onChange={(e) => setFilterSize(e.target.value)}>
              <option value="all">All Sizes</option>
              <option value="small">Small 📦</option>
              <option value="medium">Medium 📦📦</option>
              <option value="large">Large 📦📦📦</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Location:</label>
            <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)}>
              <option value="all">All Locations</option>
              <option value="Floor 1">Floor 1</option>
              <option value="Floor 2">Floor 2</option>
              <option value="Floor 3">Floor 3</option>
              <option value="Floor 4">Floor 4</option>
            </select>
          </div>

          <div className="results-count">
            <strong>{lockers.length}</strong> lockers available
          </div>
        </div>
      </div>

      {lockers.length === 0 ? (
        <div className="no-lockers">
          <FaLock size={60} color="#ccc" />
          <h3>No Lockers Available</h3>
          <p>Try changing your filter criteria</p>
        </div>
      ) : (
        <div className="lockers-grid">
          {lockers.map((locker) => (
            <div
              key={locker.id}
              className={`locker-card ${selectedLocker?.id === locker.id ? "selected" : ""}`}
              onClick={() => setSelectedLocker(locker)}
            >
              <div className="locker-badge">
                {selectedLocker?.id === locker.id && <span className="selected-badge">✓ Selected</span>}
              </div>
              
              <div className="locker-icon-display">
                <FaLock size={36} />
              </div>
              
              <h3>{locker.lockerId}</h3>
              
              <div className="locker-details">
                <p className="locker-location">
                  <FaMapMarkerAlt /> {locker.location}
                </p>
                <div className="size-badge-container">
                  <span className="size-emoji">{getSizeIcon(locker.size)}</span>
                  <span className={`size-badge ${locker.size}`}>
                    {locker.size.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedLocker && (
        <div className="booking-form-container">
          <div className="booking-form">
            <h2>📅 Complete Your Booking</h2>
            <p className="selected-locker-name">
              Locker: <strong>{selectedLocker.lockerId}</strong> ({selectedLocker.location})
            </p>
            
            <div className="time-inputs">
              <div className="input-group">
                <label>
                  <FaClock /> Start Time
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => {
                    const newStart = e.target.value;
                    setStartDate(newStart);
                    // Automatically set end time to 1 hour later
                    const date = new Date(newStart);
                    date.setHours(date.getHours() + 1);
                    setEndDate(date.toISOString().slice(0, 16));
                  }}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div className="input-group">
                <label>
                  <FaClock /> End Time
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                />
              </div>
            </div>

            <div className="booking-info-alert">
              <strong>⏰ Important:</strong> QR code expires 15 minutes after booking. 
              Please scan at the locker within this time.
            </div>

            <button className="book-btn" onClick={handleBooking}>
              <FaLock /> Confirm Booking
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
