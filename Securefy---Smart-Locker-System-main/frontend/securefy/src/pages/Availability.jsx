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

  // Get status color class
  const getStatusColor = (status) => {
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
  };

  // Get status display text
  const getStatusText = (status) => {
    switch (status) {
      case "available":
        return "Available";
      case "reserved":
        return "Reserved";
      case "occupied":
        return "In Use";
      case "maintenance":
        return "Maintenance";
      default:
        return status;
    }
  };

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
                      cx="30"
                      cy="40"
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
