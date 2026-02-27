import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "react-toastify";
import {
  FaClock,
  FaQrcode,
  FaMapMarkerAlt,
  FaDownload,
  FaTimesCircle,
  FaHistory,
  FaCheckCircle,
  FaExclamationTriangle
} from "react-icons/fa";
import "./MyQRCode.css";

export default function MyQRCode() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      toast.error("Please login to view your QR codes");
      navigate("/login");
      return;
    }
    fetchUserBookings();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchUserBookings(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchUserBookings = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const q = query(
        collection(db, "bookings"),
        where("userId", "==", auth.currentUser.uid),
        where("status", "==", "active")
      );

      const snapshot = await getDocs(q);
      const bookingList = await Promise.all(
        snapshot.docs.map(async (bookingDoc) => {
          const bookingData = bookingDoc.data();

          // Fetch locker details
          const lockerDocRef = doc(db, "lockers", bookingData.lockerId);
          const lockerDoc = await getDoc(lockerDocRef);
          const lockerData = lockerDoc.exists() ? lockerDoc.data() : null;

          return {
            id: bookingDoc.id,
            ...bookingData,
            lockerInfo: lockerData
          };
        })
      );

      setBookings(bookingList);
      setLoading(false);
      setRefreshing(false);
    } catch (err) {
      toast.error("Failed to fetch bookings");
      console.error(err);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const downloadQR = (qrToken, lockerNumber) => {
    try {
      const svg = document.getElementById(`qr-${qrToken}`);
      if (!svg) {
        toast.error("QR code not found");
        return;
      }

      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");

        const downloadLink = document.createElement("a");
        downloadLink.download = `${lockerNumber}-QR-${Date.now()}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();

        toast.success("QR code downloaded!");
      };

      img.onerror = () => {
        toast.error("Failed to download QR code");
      };

      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    } catch (err) {
      toast.error("Failed to download QR code");
      console.error(err);
    }
  };

  const cancelBooking = async (bookingId, lockerId) => {
    if (!window.confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) {
      return;
    }

    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        status: "cancelled"
      });

      await updateDoc(doc(db, "lockers", lockerId), {
        status: "available",
        currentBookingId: null
      });

      toast.success("✅ Booking cancelled successfully");
      fetchUserBookings();
    } catch (err) {
      toast.error("Failed to cancel booking");
      console.error(err);
    }
  };

  const getTimeRemaining = (expiresAt) => {
    if (!expiresAt || !expiresAt.toDate) return "Unknown";

    const now = new Date();
    const expiry = expiresAt.toDate();
    const diff = expiry - now;

    if (diff <= 0) return "Expired";

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const isExpiringSoon = (expiresAt) => {
    if (!expiresAt || !expiresAt.toDate) return false;
    const now = new Date();
    const expiry = expiresAt.toDate();
    const diff = expiry - now;
    return diff > 0 && diff < 5 * 60 * 1000; // Less than 5 minutes
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt || !expiresAt.toDate) return false;
    return new Date() > expiresAt.toDate();
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return "Unknown";
    return timestamp.toDate().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your bookings...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="no-bookings">
        <div className="empty-state-icon">
          <FaQrcode size={100} />
        </div>
        <h2>No Active Bookings</h2>
        <p>You don't have any active locker bookings at the moment</p>
        <button onClick={() => navigate("/book-locker")} className="book-now-btn">
          <FaQrcode /> Book Your First Locker
        </button>
      </div>
    );
  }

  return (
    <div className="myqr-container">
      <div className="myqr-header">
        <h1><FaQrcode /> My QR Codes</h1>
        <p>Your active locker bookings and access codes</p>
        <button
          onClick={() => fetchUserBookings(true)}
          className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
          disabled={refreshing}
        >
          <FaHistory /> {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="bookings-count">
        <span className="count-badge">{bookings.length}</span>
        Active Booking{bookings.length !== 1 ? 's' : ''}
      </div>

      <div className="bookings-list">
        {bookings.map((booking) => {
          const expired = isExpired(booking.qrExpiresAt);
          const expiringSoon = isExpiringSoon(booking.qrExpiresAt);

          return (
            <div key={booking.id} className={`booking-card ${expired ? 'expired' : ''}`}>
              <div className="booking-main">
                <div className="booking-info">
                  <div className="locker-header">
                    <h2>{booking.lockerInfo?.lockerId || "Unknown Locker"}</h2>
                    {booking.qrUsed && (
                      <span className="used-indicator">
                        <FaCheckCircle /> Used
                      </span>
                    )}
                  </div>

                  <p className="location-info">
                    <FaMapMarkerAlt /> {booking.lockerInfo?.location || "Unknown Location"}
                  </p>

                  <div className="time-info-grid">
                    <div className="time-item">
                      <label><FaClock /> Start Time</label>
                      <span>{formatDateTime(booking.startTime)}</span>
                    </div>
                    <div className="time-item">
                      <label><FaClock /> End Time</label>
                      <span>{formatDateTime(booking.endTime)}</span>
                    </div>
                  </div>

                  <div className={`expiry-info ${expiringSoon ? 'warning' : ''} ${expired ? 'danger' : ''}`}>
                    <div className="expiry-header">
                      {expired ? (
                        <FaExclamationTriangle />
                      ) : expiringSoon ? (
                        <FaExclamationTriangle />
                      ) : (
                        <FaClock />
                      )}
                      <strong>QR Code Status</strong>
                    </div>

                    {expired ? (
                      <div className="expired-message">
                        <p>⚠️ This QR code has expired</p>
                        <p className="help-text">Please cancel and create a new booking</p>
                      </div>
                    ) : (
                      <>
                        <div className="countdown-display">
                          <div className="countdown-time">{getTimeRemaining(booking.qrExpiresAt)}</div>
                          <div className="countdown-label">remaining</div>
                        </div>
                        {expiringSoon && (
                          <div className="warning-message">
                            ⚠️ Hurry! Scan your QR code soon
                          </div>
                        )}
                      </>
                    )}

                    {booking.qrUsed && (
                      <div className="used-message">
                        ✅ QR code was scanned at: {formatDateTime(booking.qrUsedAt)}
                      </div>
                    )}
                  </div>

                  <div className="action-buttons">
                    <button
                      onClick={() => downloadQR(booking.qrToken, booking.lockerInfo?.lockerId)}
                      className="download-btn"
                      disabled={expired}
                    >
                      <FaDownload /> Download
                    </button>
                    <button
                      onClick={() => cancelBooking(booking.id, booking.lockerId)}
                      className="cancel-btn"
                    >
                      <FaTimesCircle /> Cancel
                    </button>
                  </div>
                </div>

                <div className="qr-display-section">
                  <div className={`qr-wrapper ${expired ? 'expired' : ''}`}>
                    {expired && (
                      <div className="qr-overlay">
                        <FaExclamationTriangle size={40} />
                        <p>Expired</p>
                      </div>
                    )}
                    <QRCodeSVG
                      id={`qr-${booking.qrToken}`}
                      value={booking.qrToken}
                      size={220}
                      level="H"
                      includeMargin={true}
                      className={expired ? 'qr-expired' : ''}
                    />
                    <div className="qr-instructions">
                      <p className="qr-label">📱 Scan at locker</p>
                      <p className="qr-sublabel">Show this code at the locker terminal</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="help-section">
        <h3>📖 How to use your QR code</h3>
        <div className="help-steps">
          <div className="help-step">
            <div className="step-number">1</div>
            <p>Go to your assigned locker within the QR expiry time</p>
          </div>
          <div className="help-step">
            <div className="step-number">2</div>
            <p>Open this page and display your QR code</p>
          </div>
          <div className="help-step">
            <div className="step-number">3</div>
            <p>Scan the QR code at the locker terminal</p>
          </div>
          <div className="help-step">
            <div className="step-number">4</div>
            <p>The locker will unlock automatically</p>
          </div>
        </div>
      </div>
    </div>
  );
}
