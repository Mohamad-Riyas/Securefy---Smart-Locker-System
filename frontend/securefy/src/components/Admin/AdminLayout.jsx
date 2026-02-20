import React from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaChartLine, FaBox, FaCalendarCheck, FaUsers, FaSignOutAlt } from 'react-icons/fa';
import logo from '../../assets/Seecurefy logo.jpg';
import './AdminStyles.css';

export default function AdminLayout() {
    const { currentUser, userRole, loading } = useAuth();
    const location = useLocation();

    if (loading) return <div className="d-flex justify-content-center align-items-center vh-100">Loading...</div>;

    if (!currentUser || userRole !== 'admin') {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="admin-container">
            <div className="admin-sidebar">
                <div className="sidebar-brand">
                    <img src={logo} alt="Securefy" style={{ height: '40px', width: 'auto', borderRadius: '8px' }} /> Securefy
                </div>
                <nav className="sidebar-nav">
                    <Link to="/admin" className={`sidebar-link ${location.pathname === '/admin' ? 'active' : ''}`}>
                        <FaChartLine /> Dashboard
                    </Link>
                    <Link to="/admin/lockers" className={`sidebar-link ${location.pathname.startsWith('/admin/lockers') ? 'active' : ''}`}>
                        <FaBox /> Lockers
                    </Link>
                    <Link to="/admin/bookings" className={`sidebar-link ${location.pathname.startsWith('/admin/bookings') ? 'active' : ''}`}>
                        <FaCalendarCheck /> Bookings
                    </Link>
                    <Link to="/admin/users" className={`sidebar-link ${location.pathname.startsWith('/admin/users') ? 'active' : ''}`}>
                        <FaUsers /> Users
                    </Link>

                    <div style={{ marginTop: 'auto', borderTop: '1px solid #334155', paddingTop: '10px' }}>
                        <Link to="/" className="sidebar-link">
                            <FaSignOutAlt /> Back to Home
                        </Link>
                    </div>
                </nav>
            </div>
            <div className="admin-content">
                <Outlet />
            </div>
        </div>
    );
}
