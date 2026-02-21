import React from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaChartLine,
  FaBox,
  FaCalendarCheck,
  FaUsers,
  FaSignOutAlt
} from 'react-icons/fa';
import logo from '../../assets/seecurefy logo.jpg'; // Make sure file name is correct
import './AdminStyles.css';

export default function AdminLayout() {
  const { currentUser, userRole, loading, logout } = useAuth();
  const location = useLocation();

  // Loading screen
  if (loading) {
    return (
      <div className="admin-loading">
        <h3>Loading...</h3>
      </div>
    );
  }

  // Protect admin route
  if (!currentUser || userRole !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <img
            src={logo}
            alt="Securefy Logo"
            className="sidebar-logo"
          />
          <span>Securefy</span>
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/admin"
            className={`sidebar-link ${location.pathname === '/admin' ? 'active' : ''
              }`}
          >
            <FaChartLine /> Dashboard
          </Link>

          <Link
            to="/admin/lockers"
            className={`sidebar-link ${location.pathname.startsWith('/admin/lockers') ? 'active' : ''
              }`}
          >
            <FaBox /> Lockers
          </Link>

          <Link
            to="/admin/bookings"
            className={`sidebar-link ${location.pathname.startsWith('/admin/bookings') ? 'active' : ''
              }`}
          >
            <FaCalendarCheck /> Bookings
          </Link>

          <Link
            to="/admin/users"
            className={`sidebar-link ${location.pathname.startsWith('/admin/users') ? 'active' : ''
              }`}
          >
            <FaUsers /> Users
          </Link>

          {/* Bottom Section */}
          <div className="sidebar-bottom">
            <button onClick={logout} className="sidebar-link logout-btn">
              <FaSignOutAlt /> Logout
            </button>

            <Link to="/" className="sidebar-link">
              Back to Home
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
