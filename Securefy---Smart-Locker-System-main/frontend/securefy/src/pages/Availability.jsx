import React, { useState, useEffect } from "react";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { FaLock, FaLockOpen, FaCircle, FaSync, FaChartBar } from "react-icons/fa";
import "./Availability.css";

export default function Availability() {
  const [lockers, setLockers] = useState([]);
  const [stats, setStats] = useState({
    available: 0,
    reserved: 0,
    occupied: 0,
    total: 0
  });
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterSize, setFilterSize] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    // Real-time listener for lockers
    const unsubscribe = onSnapshot(
      collection(db, "lockers"),
      (snapshot) => {
        const lockerList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setLockers(lockerList);
        calculateStats(lockerList);
        setLastUpdate(new Date());
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching lockers:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const calculateStats = (lockerList) => {
    const stats = {
      available: lockerList.filter(l => l.status === "available").length,
      reserved: lockerList.filter(l => l.status === "reserved").length,
      occupied: lockerList.filter(l => l.status === "occupied").length,
      total: lockerList.length
    };
    setStats(stats);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available": return "#28a745";
      case "reserved": return "#ffc107";
      case "occupied": return "#dc3545";
      default: return "#6c757d";
    }
  };

  const getStatusIcon = (status) => {
    return status === "available" ? <FaLockOpen /> : <FaLock />;
  };

  const getStatusEmoji = (status) => {
    switch (status) {
      case "available": return "✅";
      case "reserved": return "⏳";
      case "occupied": return "🔒";
      default: return "❓";
    }
  };

  // Apply all filters
  const filteredLockers = lockers.filter(locker => {
    const locationMatch = filterLocation === "all" || locker.location.includes(filterLocation);
    const sizeMatch = filterSize === "all" || locker.size === filterSize;
    const statusMatch = filterStatus === "all" || locker.status === filterStatus;
    
    return locationMatch && sizeMatch && statusMatch;
  });

  const getCapacityPercentage = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.available / stats.total) * 100);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading locker availability...</p>
      </div>
    );
  }

  return (
    <div className="availability-container">
      <div className="availability-header">
        <h1>🔍 Locker Availability</h1>
        <p>Real-time status of all lockers</p>
        <div className="last-update">
          <FaSync className="sync-icon" />
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="stats-dashboard">
        <div className="stat-card available">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.available}</h3>
            <p>Available</p>
          </div>
          <div className="stat-percentage">
            {Math.round((stats.available / stats.total) * 100)}%
          </div>
        </div>

        <div className="stat-card reserved">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.reserved}</h3>
            <p>Reserved</p>
          </div>
          <div className="stat-percentage">
            {Math.round((stats.reserved / stats.total) * 100)}%
          </div>
        </div>

        <div className="stat-card occupied">
          <div className="stat-icon">🔒</div>
          <div className="stat-content">
            <h3>{stats.occupied}</h3>
            <p>Occupied</p>
          </div>
          <div className="stat-percentage">
            {Math.round((stats.occupied / stats.total) * 100)}%
          </div>
        </div>

        <div className="stat-card total">
          <div className="stat-icon"><FaChartBar /></div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Lockers</p>
          </div>
          <div className="capacity-bar">
            <div 
              className="capacity-fill" 
              style={{ 
                width: `${getCapacityPercentage()}%`,
                background: getCapacityPercentage() > 50 ? '#28a745' : 
                            getCapacityPercentage() > 25 ? '#ffc107' : '#dc3545'
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-bar">
        <div className="filter-group">
          <label>📍 Location:</label>
          <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)}>
            <option value="all">All Locations</option>
            <option value="Floor 1">Floor 1</option>
            <option value="Floor 2">Floor 2</option>
            <option value="Floor 3">Floor 3</option>
          </select>
        </div>

        <div className="filter-group">
          <label>📦 Size:</label>
          <select value={filterSize} onChange={(e) => setFilterSize(e.target.value)}>
            <option value="all">All Sizes</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <div className="filter-group">
          <label>🔐 Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="occupied">Occupied</option>
          </select>
        </div>

        <div className="filter-results">
          Showing <strong>{filteredLockers.length}</strong> of {stats.total} lockers
        </div>
      </div>

      {/* Legend */}
      <div className="legend">
        <div className="legend-item">
          <FaCircle color="#28a745" /> <span>Available - Ready to book</span>
        </div>
        <div className="legend-item">
          <FaCircle color="#ffc107" /> <span>Reserved - Booking in progress</span>
        </div>
        <div className="legend-item">
          <FaCircle color="#dc3545" /> <span>Occupied - Currently in use</span>
        </div>
      </div>

      {/* Lockers Grid */}
      {filteredLockers.length === 0 ? (
        <div className="no-results">
          <h3>No Lockers Found</h3>
          <p>Try changing your filter criteria</p>
        </div>
      ) : (
        <div className="lockers-availability-grid">
          {filteredLockers.map((locker) => (
            <div
              key={locker.id}
              className={`availability-card ${locker.status}`}
              style={{ borderColor: getStatusColor(locker.status) }}
            >
              <div className="card-header">
                <span className="status-emoji">{getStatusEmoji(locker.status)}</span>
                <div className="card-icon" style={{ color: getStatusColor(locker.status) }}>
                  {getStatusIcon(locker.status)}
                </div>
              </div>
              
              <h3>{locker.lockerNumber}</h3>
              
              <div className="card-details">
                <p className="location">{locker.location}</p>
                <p className="size-info">
                  <span className={`size-badge ${locker.size}`}>
                    {locker.size.toUpperCase()}
                  </span>
                </p>
              </div>
              
              <div className="status-footer">
                <span className={`status-badge ${locker.status}`}>
                  {locker.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats Summary */}
      <div className="summary-section">
        <h3>📊 Capacity Overview</h3>
        <div className="capacity-overview">
          <div className="capacity-item">
            <div className="capacity-label">Current Capacity</div>
            <div className="capacity-value">{getCapacityPercentage()}% Available</div>
            <div className="capacity-bar-large">
              <div 
                className="capacity-bar-fill"
                style={{ 
                  width: `${getCapacityPercentage()}%`,
                  background: getCapacityPercentage() > 50 ? 
                    'linear-gradient(90deg, #28a745, #20c997)' : 
                    getCapacityPercentage() > 25 ? 
                    'linear-gradient(90deg, #ffc107, #ff9800)' : 
                    'linear-gradient(90deg, #dc3545, #c82333)'
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
