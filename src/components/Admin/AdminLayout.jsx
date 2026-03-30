import React from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaChartLine,
  FaBox,
  FaCalendarCheck,
  FaUsers,
  FaSignOutAlt,
  FaArrowLeft
} from 'react-icons/fa';
import logo from '../../assets/securefy-logo.jpg';
import './AdminStyles.css';

export default function AdminLayout() {
  const { currentUser, userRole, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!currentUser || userRole !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { path: '/admin', icon: <FaChartLine />, label: 'Dashboard', exact: true },
    { path: '/admin/lockers', icon: <FaBox />, label: 'Lockers' },
    { path: '/admin/bookings', icon: <FaCalendarCheck />, label: 'Bookings' },
    { path: '/admin/users', icon: <FaUsers />, label: 'Users' }
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans selection:bg-indigo-500/30">
      
      {/* Dynamic Animated Background Gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[120px] mix-blend-screen animate-pulse duration-1000"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-900/10 blur-[100px] mix-blend-screen"></div>
      </div>

      {/* Sidebar - Glassmorphism */}
      <motion.aside 
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="relative z-10 w-64 flex flex-col bg-slate-900/60 backdrop-blur-xl border-r border-slate-800 shadow-2xl"
      >
        {/* Brand Area */}
        <div className="flex items-center gap-3 p-6 border-b border-slate-800/60">
          <div className="relative">
            <img
              src={logo}
              alt="Securefy Logo"
              className="h-10 w-10 rounded-xl relative z-10"
            />
            <div className="absolute inset-0 bg-indigo-500 rounded-xl blur-md opacity-40 animate-pulse"></div>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tight">
            Securefy Admin
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = item.exact 
              ? location.pathname === item.path 
              : location.pathname.startsWith(item.path);
              
            return (
              <Link key={item.path} to={item.path} className="relative group outline-none">
                {isActive && (
                  <motion.div 
                    layoutId="active-nav-bg"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-indigo-500/5 border-l-2 border-indigo-500 rounded-r-lg"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={`relative z-10 flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'}`}>
                  <span className={`text-lg transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800/60 flex flex-col gap-2">
          <Link to="/" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-lg transition-colors">
            <FaArrowLeft className="text-xs" /> Back to App
          </Link>
          <button 
            onClick={logout} 
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors text-left"
          >
            <FaSignOutAlt className="text-xs" /> Terminate Session
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 h-screen overflow-y-auto overflow-x-hidden custom-scrollbar bg-slate-950/40 backdrop-blur-3xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="p-8 h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
