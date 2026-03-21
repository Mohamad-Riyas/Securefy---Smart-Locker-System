import React, { useState, useEffect } from "react";
import logo from '../../assets/securefy-logo.jpg';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { FaBars, FaTimes, FaUserCircle, FaSignOutAlt, FaTachometerAlt, FaLock } from "react-icons/fa";

const Navibar = () => {
    const { currentUser, userName, userRole } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
    }, [isMobileMenuOpen]);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            setIsMobileMenuOpen(false);
            navigate('/login');
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    const closeMenu = () => {
        setIsMobileMenuOpen(false);
        document.body.style.overflow = 'unset';
    };

    const isActive = (path) => location.pathname === path;

    const navLinkClass = (path) =>
        `text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 h-10 ${isActive(path)
            ? 'text-slate-100 bg-indigo-500/10'
            : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
        }`;

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-[5000] h-[70px] bg-slate-950/80 backdrop-blur-xl border-b border-white/[0.08] transition-all duration-300 flex justify-center px-4 md:px-8 ${isMobileMenuOpen ? 'bg-slate-950' : ''
                }`}
        >
            <div className="w-full max-w-[1440px] flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center">
                    <Link to="/" className="flex items-center gap-3 no-underline" onClick={closeMenu}>
                        <div className="relative w-10 h-10 flex-shrink-0">
                            <img
                                src={logo}
                                alt="Securefy Logo"
                                className="w-full h-full object-cover rounded-[10px] border border-white/20 relative z-[2]"
                            />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-400 blur-[15px] opacity-30 z-[1]" />
                        </div>
                        <span className="text-xl md:text-[1.4rem] font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            Securefy
                        </span>
                    </Link>
                </div>

                {/* Center Nav Links (Desktop & Large Tablet) */}
                <ul className="hidden lg:flex list-none gap-2 m-0 p-0 justify-center flex-1">
                    <li><Link to="/" className={navLinkClass('/')}>Home</Link></li>
                    <li><Link to="/book-locker" className={navLinkClass('/book-locker')}>Book Locker</Link></li>
                    <li><Link to="/availability" className={navLinkClass('/availability')}>Availability</Link></li>
                    <li><Link to="/about-us" className={navLinkClass('/about-us')} onClick={() => window.scrollTo(0, 0)}>About Us</Link></li>
                    <li><Link to="/privacy-policy" className={navLinkClass('/privacy-policy')} onClick={() => window.scrollTo(0, 0)}>Privacy Policy</Link></li>
                    {currentUser && (
                        <li><Link to="/my-qr-code" className={navLinkClass('/my-qr-code')}>My QR Code</Link></li>
                    )}
                    {userRole === 'admin' && (
                        <li>
                            <Link
                                to="/admin"
                                className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 h-10 border ml-2 text-red-300 border-red-300/20 bg-red-400/5 hover:bg-red-400/15 hover:border-red-300/40 ${isActive('/admin') ? 'bg-red-400/15 border-red-300/60' : ''
                                    }`}
                            >
                                <FaTachometerAlt /> Admin Panel
                            </Link>
                        </li>
                    )}
                </ul>

                {/* Right Section */}
                <div className="flex justify-end items-center gap-4">
                    {/* Desktop Auth */}
                    <div className="hidden lg:flex items-center gap-3">
                        {currentUser ? (
                            <div className="flex items-center gap-3 bg-white/[0.03] px-3 py-1.5 pr-1.5 rounded-xl border border-white/[0.08] shadow-sm">
                                <FaUserCircle className="text-xl text-indigo-400" />
                                <span className="text-[0.9rem] font-semibold text-slate-100 whitespace-nowrap">
                                    {userName || 'User'}
                                </span>
                                <span className="text-[0.65rem] text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded uppercase tracking-wide border border-indigo-400/20 whitespace-nowrap">
                                    {userRole || 'Member'}
                                </span>
                                <button
                                    onClick={handleSignOut}
                                    title="Logout"
                                    className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center transition-all duration-200 hover:bg-red-500 hover:text-white border-none cursor-pointer"
                                >
                                    <FaSignOutAlt />
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="bg-indigo-500 text-white px-6 py-2 rounded-xl font-bold text-[0.9rem] no-underline transition-all duration-300 shadow-[0_4px_12px_rgba(99,102,241,0.2)] hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(99,102,241,0.3)] hover:bg-indigo-600"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* Hamburger (Mobile & Tablet) */}
                    <button
                        className="lg:hidden text-[1.6rem] text-slate-200 hover:text-indigo-400 focus:outline-none transition-colors p-2 z-[5010]"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle Menu"
                    >
                        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu Overlay */}
            <div 
                className={`fixed inset-0 top-[70px] bg-slate-950/70 backdrop-blur-sm z-[4000] lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                onClick={closeMenu}
            />

            {/* Mobile Dropdown Menu Panel (Classic Dropdown) */}
            <div
                className={`fixed top-[70px] left-0 right-0 bg-slate-900 border-b border-indigo-500/20 z-[4001] flex flex-col px-6 py-6 transition-all duration-300 ease-in-out lg:hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] transform origin-top ${isMobileMenuOpen ? 'translate-y-0 opacity-100 visible' : '-translate-y-4 opacity-0 invisible pointer-events-none'}`}
            >
                <ul className="list-none p-0 m-0 mb-6 flex flex-col gap-2">
                    {[
                        { to: '/', label: 'Home' },
                        { to: '/book-locker', label: 'Book Locker' },
                        { to: '/availability', label: 'Availability' },
                        { to: '/about-us', label: 'About Us' },
                        { to: '/privacy-policy', label: 'Privacy Policy' },
                    ].map(({ to, label }) => (
                        <li key={to}>
                            <Link
                                to={to}
                                onClick={() => {
                                    closeMenu();
                                    if (to === '/about-us' || to === '/privacy-policy') {
                                        window.scrollTo(0, 0);
                                    }
                                }}
                                className={`block py-3 px-4 rounded-lg transition-all duration-200 font-semibold text-[1.1rem] ${isActive(to) ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
                            >
                                {label}
                            </Link>
                        </li>
                    ))}
                    {currentUser && (
                        <li>
                            <Link 
                                to="/my-qr-code" 
                                onClick={closeMenu} 
                                className={`block py-3 px-4 rounded-lg transition-all duration-200 font-semibold text-[1.1rem] ${isActive('/my-qr-code') ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
                            >
                                My QR Code
                            </Link>
                        </li>
                    )}
                    {userRole === 'admin' && (
                        <li>
                            <Link 
                                to="/admin" 
                                onClick={closeMenu} 
                                className="block mt-2 py-3 px-4 border border-red-500/20 text-red-400 rounded-lg transition-all duration-200 font-semibold text-[1.1rem] bg-red-500/5 hover:bg-red-500/10"
                            >
                                Admin Panel
                            </Link>
                        </li>
                    )}
                </ul>

                <div className="pt-5 border-t border-slate-700/80">
                    {currentUser ? (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
                                <FaUserCircle className="text-3xl text-indigo-400" />
                                <div className="flex flex-col">
                                    <span className="text-[1rem] font-bold text-white">{userName || 'User'}</span>
                                    <span className="text-[0.75rem] text-slate-400 uppercase tracking-wider">{userRole || 'Member'}</span>
                                </div>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="w-full py-3.5 bg-red-500/10 text-red-400 hover:text-white hover:bg-red-500 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 border border-red-500/20 shadow-sm"
                            >
                                <FaSignOutAlt /> Sign Out
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            onClick={closeMenu}
                            className="flex justify-center items-center w-full bg-indigo-500 text-white px-6 py-4 rounded-xl font-bold text-[1.1rem] no-underline hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20"
                        >
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navibar;
