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
            className={`fixed top-0 left-0 right-0 z-[5000] h-[70px] bg-slate-950/90 backdrop-blur-xl border-b border-white/[0.08] transition-all duration-300 flex justify-center px-6 ${isMobileMenuOpen ? 'bg-slate-950' : ''
                }`}
        >
            <div className="w-full max-w-[1440px] grid grid-cols-[1fr_auto_1fr] lg:grid-cols-[1fr_auto_1fr] items-center lg:flex-row">

                {/* Logo */}
                <div className="flex justify-start">
                    <Link to="/" className="flex items-center gap-3 no-underline" onClick={closeMenu}>
                        <div className="relative w-10 h-10">
                            <img
                                src={logo}
                                alt="Securefy Logo"
                                className="w-full h-full object-cover rounded-[10px] border border-white/20 relative z-[2]"
                            />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-400 blur-[15px] opacity-30 z-[1]" />
                        </div>
                        <span className="text-[1.4rem] font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            Securefy
                        </span>
                    </Link>
                </div>

                {/* Center Nav Links (Desktop) */}
                <ul className="hidden lg:flex list-none gap-1 m-0 p-0 justify-center">
                    <li><Link to="/" className={navLinkClass('/')}>Home</Link></li>
                    <li><Link to="/book-locker" className={navLinkClass('/book-locker')}>Book Locker</Link></li>
                    <li><Link to="/availability" className={navLinkClass('/availability')}>Availability</Link></li>
                    <li><Link to="/about-us" className={navLinkClass('/about-us')}>About Us</Link></li>
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
                            <div className="flex items-center gap-3 bg-white/[0.03] px-[14px] py-[6px] pr-[6px] rounded-xl border border-white/[0.08]">
                                <FaUserCircle className="text-xl text-indigo-400" />
                                <span className="text-[0.9rem] font-semibold text-slate-100 whitespace-nowrap">
                                    {userName || 'User'}
                                </span>
                                <span className="text-[0.65rem] text-indigo-400 bg-indigo-400/10 px-2 py-[2px] rounded uppercase tracking-wide border border-indigo-400/20 whitespace-nowrap">
                                    {userRole || 'Member'}
                                </span>
                                <button
                                    onClick={handleSignOut}
                                    title="Logout"
                                    className="w-9 h-9 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center transition-all duration-200 hover:bg-red-500 hover:text-white border-none cursor-pointer"
                                >
                                    <FaSignOutAlt />
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="bg-indigo-500 text-white px-6 py-[10px] rounded-xl font-bold text-[0.9rem] no-underline transition-all duration-300 shadow-[0_4px_12px_rgba(99,102,241,0.2)] hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(99,102,241,0.3)] hover:bg-indigo-600"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* Hamburger (Mobile) */}
                    <button
                        className="lg:hidden bg-transparent border-none p-[10px] cursor-pointer flex flex-col justify-between w-6 h-[18px]"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle Menu"
                    >
                        <span className={`block w-full h-[2px] bg-slate-100 rounded-sm transition-all duration-300 ${isMobileMenuOpen ? 'translate-y-2 rotate-45' : ''}`} />
                        <span className={`block w-full h-[2px] bg-slate-100 rounded-sm transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                        <span className={`block w-full h-[2px] bg-slate-100 rounded-sm transition-all duration-300 ${isMobileMenuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Mobile Drawer */}
            <div
                className={`fixed top-[70px] left-0 right-0 bottom-0 bg-slate-950 z-[4000] flex flex-col px-6 py-10 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isMobileMenuOpen ? 'translate-y-0 opacity-100 visible' : '-translate-y-full opacity-0 invisible'
                    }`}
            >
                <ul className="list-none p-0 m-0 mb-10 flex flex-col gap-3">
                    {[
                        { to: '/', label: 'Home' },
                        { to: '/book-locker', label: 'Book Locker' },
                        { to: '/availability', label: 'Availability' },
                        { to: '/about-us', label: 'About Us' },
                    ].map(({ to, label }) => (
                        <li key={to}>
                            <Link
                                to={to}
                                onClick={closeMenu}
                                className="block py-4 px-4 text-slate-100 no-underline text-[1.25rem] font-bold text-center bg-white/[0.03] rounded-xl transition-all duration-200 active:bg-indigo-500 hover:bg-white/[0.07]"
                            >
                                {label}
                            </Link>
                        </li>
                    ))}
                    {currentUser && (
                        <li>
                            <Link to="/my-qr-code" onClick={closeMenu} className="block py-4 px-4 text-slate-100 no-underline text-[1.25rem] font-bold text-center bg-white/[0.03] rounded-xl transition-all duration-200 hover:bg-white/[0.07]">
                                My QR Code
                            </Link>
                        </li>
                    )}
                    {userRole === 'admin' && (
                        <li>
                            <Link to="/admin" onClick={closeMenu} className="block py-4 px-4 text-red-300 no-underline text-[1.25rem] font-bold text-center bg-white/[0.03] rounded-xl transition-all duration-200 hover:bg-red-400/15">
                                Admin Panel
                            </Link>
                        </li>
                    )}
                </ul>

                <div className="mt-auto pb-10">
                    {currentUser ? (
                        <div className="flex flex-col gap-5">
                            <div className="flex items-center gap-3 bg-white/[0.03] px-[14px] py-[6px] rounded-xl border border-white/[0.08]">
                                <FaUserCircle className="text-xl text-indigo-400" />
                                <span className="text-[0.9rem] font-semibold text-slate-100">{userName}</span>
                                <span className="text-[0.65rem] text-indigo-400 bg-indigo-400/10 px-2 py-[2px] rounded uppercase tracking-wide border border-indigo-400/20">{userRole}</span>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="w-full py-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-all hover:bg-red-500/20"
                            >
                                <FaSignOutAlt /> Logout
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            onClick={closeMenu}
                            className="block text-center bg-indigo-500 text-white px-6 py-4 rounded-xl font-bold no-underline hover:bg-indigo-600 transition-colors"
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
