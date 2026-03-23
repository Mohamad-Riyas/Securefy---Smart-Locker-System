import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import "./Availability.css";
import { 
  FaSearch, 
  FaFilter, 
  FaThLarge, 
  FaList, 
  FaMapMarkerAlt,
  FaClock,
  FaLock,
  FaUnlock,
  FaTools,
  FaCheckCircle
} from "react-icons/fa";

export default function AvailabilityUnique() {
  const [lockers, setLockers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [floorFilter, setFloorFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLocker, setSelectedLocker] = useState(null);
  const navigate = useNavigate();
  const handleBookLocker = () => {
    navigate('/book-locker', {
      state: {
        selectedLockerId: selectedLocker?.lockerId,
        size: selectedLocker?.size,
        location: selectedLocker?.location
      }
    });
  };

  // Real-time listener
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

  
  const filteredLockers = lockers.filter(locker => {
    const matchesSearch = locker.lockerId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || locker.status === statusFilter;
    const matchesSize = sizeFilter === "all" || locker.size === sizeFilter;
    const matchesFloor = floorFilter === "all" || locker.location === floorFilter;
    return matchesSearch && matchesStatus && matchesSize && matchesFloor;
  });

  
  const stats = {
    total: lockers.length,
    available: lockers.filter(l => l.status === "available").length,
    occupied: lockers.filter(l => l.status === "occupied").length,
    reserved: lockers.filter(l => l.status === "reserved").length,
    maintenance: lockers.filter(l => l.status === "maintenance").length,
  };

  const availabilityRate = ((stats.available / stats.total) * 100).toFixed(1);

  const getStatusIcon = (status) => {
    switch (status) {
      case "available":
        return <FaUnlock />;
      case "occupied":
        return <FaLock />;
      case "reserved":
        return <FaClock />;
      case "maintenance":
        return <FaTools />;
      default:
        return <FaLock />;
    }
  };

  // Get floor list
  const floors = [...new Set(lockers.map(l => l.location))].filter(Boolean);

  if (loading) {
    return (
      <div className="unique-availability">
        <div className="loading-state">
          <div className="loading-spinner-unique"></div>
          <p>Loading lockers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="unique-availability">
      {/* Header with Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="gradient-text">Locker</span> Availability
          </h1>
          <p className="hero-subtitle">
            Real-time monitoring • Smart filtering • Instant booking
          </p>
          
          {/* Live Stats Banner */}
          <div className="stats-banner">
            <div className="stat-item">
              <div className="stat-number">{stats.available}</div>
              <div className="stat-label">Available Now</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">{availabilityRate}%</div>
              <div className="stat-label">Availability Rate</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Lockers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="control-panel">
        <div className="search-section">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by locker ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="clear-btn"
                onClick={() => setSearchTerm("")}
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="control-actions">
          <button 
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter /> Filters
          </button>
          
          <div className="view-switcher">
            <button 
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
            >
              <FaThLarge />
            </button>
            <button 
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
            >
              <FaList />
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filter-item">
            <label>Status</label>
            <div className="filter-chips">
              {['all', 'available', 'reserved', 'occupied', 'maintenance'].map(status => (
                <button
                  key={status}
                  className={`chip ${statusFilter === status ? 'active' : ''}`}
                  onClick={() => setStatusFilter(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-item">
            <label>Size</label>
            <div className="filter-chips">
              {['all', 'small', 'medium', 'large'].map(size => (
                <button
                  key={size}
                  className={`chip ${sizeFilter === size ? 'active' : ''}`}
                  onClick={() => setSizeFilter(size)}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-item">
            <label>Floor</label>
            <div className="filter-chips">
              <button
                className={`chip ${floorFilter === 'all' ? 'active' : ''}`}
                onClick={() => setFloorFilter('all')}
              >
                All Floors
              </button>
              {floors.map(floor => (
                <button
                  key={floor}
                  className={`chip ${floorFilter === floor ? 'active' : ''}`}
                  onClick={() => setFloorFilter(floor)}
                >
                  {floor}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Status Legend */}
      <div className="status-legend">
        <div className="legend-item available">
          <FaUnlock /> Available
        </div>
        <div className="legend-item reserved">
          <FaClock /> Reserved
        </div>
        <div className="legend-item occupied">
          <FaLock /> In Use
        </div>
        <div className="legend-item maintenance">
          <FaTools /> Maintenance
        </div>
        <div className="live-badge">
          <span className="pulse-dot"></span>
          Live
        </div>
      </div>

      {/* Results Header */}
      <div className="results-header">
        <h3>
          {filteredLockers.length} {filteredLockers.length === 1 ? 'Locker' : 'Lockers'} Found
        </h3>
        <p className="results-subtitle">
          {searchTerm && `Searching for "${searchTerm}"`}
          {statusFilter !== 'all' && ` • ${statusFilter}`}
          {sizeFilter !== 'all' && ` • ${sizeFilter} size`}
        </p>
      </div>

      {/* Lockers Display */}
      {filteredLockers.length === 0 ? (
        <div className="no-results-state">
          <div className="no-results-icon">🔍</div>
          <h3>No Lockers Found</h3>
          <p>Try adjusting your filters or search terms</p>
          <button 
            className="reset-btn"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setSizeFilter("all");
              setFloorFilter("all");
            }}
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="lockers-grid-unique">
          {filteredLockers.map((locker) => (
            <div
              key={locker.id}
              className={`locker-card ${locker.status}`}
              onClick={() => setSelectedLocker(locker)}
            >
              <div className="locker-card-header">
                <span className="locker-id">{locker.lockerId}</span>
                <span className={`status-badge ${locker.status}`}>
                  {getStatusIcon(locker.status)}
                </span>
              </div>
              
              <div className="locker-card-body">
                <div className="locker-visual">
                  <div className={`locker-door ${locker.status}`}>
                    <div className="locker-handle"></div>
                  </div>
                </div>
              </div>

              <div className="locker-card-footer">
                <div className="locker-info">
                  <span className="info-item">
                    📏 {locker.size || 'Medium'}
                  </span>
                  <span className="info-item">
                    <FaMapMarkerAlt /> {locker.location || 'Floor 1'}
                  </span>
                </div>
                {locker.status === 'available' && (
                  <button className="quick-book-btn">
                    Quick Book
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="lockers-list-unique">
          {filteredLockers.map((locker) => (
            <div
              key={locker.id}
              className={`locker-list-item ${locker.status}`}
              onClick={() => setSelectedLocker(locker)}
            >
              <div className="list-item-left">
                <div className={`status-indicator ${locker.status}`}>
                  {getStatusIcon(locker.status)}
                </div>
                <div className="list-item-info">
                  <h4>{locker.lockerId}</h4>
                  <p>
                    {locker.size} • {locker.location} • 
                    <span className={`status-text ${locker.status}`}>
                      {' '}{locker.status}
                    </span>
                  </p>
                </div>
              </div>
              <div className="list-item-right">
                {locker.status === 'available' ? (
                  <button className="book-btn-list">Book Now</button>
                ) : (
                  <span className="unavailable-text">Not Available</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Locker Details Modal */}
      {selectedLocker && (
        <div className="modal-overlay" onClick={() => setSelectedLocker(null)}>
          <div className="modal-content" style={{ backgroundColor: '#ffffff' }} onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setSelectedLocker(null)}
            >
              ×
            </button>
            
            <div className="modal-header">
              <h2>{selectedLocker.lockerId}</h2>
              <span className={`status-badge-large ${selectedLocker.status}`}>
                {getStatusIcon(selectedLocker.status)}
                {selectedLocker.status}
              </span>
            </div>

            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Size:</span>
                <span className="detail-value">{selectedLocker.size || 'Medium'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Location:</span>
                <span className="detail-value">{selectedLocker.location || 'Floor 1'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className="detail-value">{selectedLocker.status}</span>
              </div>
              {selectedLocker.currentBookingId && (
                <div className="detail-row">
                  <span className="detail-label">Booking ID:</span>
                  <span className="detail-value">{selectedLocker.currentBookingId}</span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              {selectedLocker.status === 'available' ? (
                <button className="primary-btn-modal" onClick={handleBookLocker}>
                  <FaCheckCircle /> Book This Locker
                </button>
              ) : (
                <button className="disabled-btn-modal" disabled>
                  Currently Unavailable
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
