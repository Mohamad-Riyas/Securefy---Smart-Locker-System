import React from "react";
import { Link } from "react-router-dom";
import { FaLock, FaInstagram, FaFacebookF, FaLinkedinIn, FaYoutube } from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="relative z-10 border-t border-slate-800 bg-slate-950 pt-32 pb-10 overflow-hidden group">
            {/* --- Professional Electric Sine Wave Background --- */}

            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 flex items-end justify-center opacity-70">
                {/* Glow & Gradient Definitions */}
                <svg width="0" height="0">
                    <defs>
                        <linearGradient id="wave-grad-1" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0" />
                            <stop offset="50%" stopColor="#818cf8" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                        </linearGradient>
                        <filter id="wave-glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="8" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>
                </svg>

                {/* Layer 1: Foreground Fast Wave */}
                <svg className="absolute bottom-[-100px] w-[200%] h-[400px] min-w-[2000px] animate-wave-slide opacity-80" viewBox="0 0 2000 400" preserveAspectRatio="none">
                    <path
                        d="M 0 200 Q 250 100 500 200 T 1000 200 Q 1250 100 1500 200 T 2000 200"
                        fill="none"
                        stroke="url(#wave-grad-1)"
                        strokeWidth="4"
                        filter="url(#wave-glow)"
                    />
                </svg>

                {/* Layer 2: Background Slow Reversed Wave */}
                <svg className="absolute bottom-[-50px] w-[200%] h-[500px] min-w-[2000px] animate-wave-slide-slow opacity-50" viewBox="0 0 2000 500" preserveAspectRatio="none">
                    <path
                        d="M 0 250 Q 250 400 500 250 T 1000 250 Q 1250 400 1500 250 T 2000 250"
                        fill="none"
                        stroke="url(#wave-grad-1)"
                        strokeWidth="6"
                        filter="url(#wave-glow)"
                    />
                </svg>
            </div>

            {/* Static Ambient Base Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent z-0"></div>

            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-2 space-y-6">
                        <h3 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
                            <FaLock className="text-indigo-500 text-2xl" /> Securefy
                        </h3>
                        <p className="text-slate-400 max-w-sm leading-relaxed">
                            Innovating campus security through state-of-the-art IoT solutions. Secure storage for the modern student.
                        </p>
                        <div className="flex gap-4 pt-4">
                            {[
                                { Icon: FaFacebookF, href: "https://web.facebook.com/profile.php?id=61579525304865&sk=about_details", color: "hover:bg-blue-600/20 hover:text-blue-500 hover:border-blue-500/50" },
                                { Icon: FaInstagram, href: "https://www.instagram.com/securefy.official?igsh=NXczYTRhOXNjdDUy", color: "hover:bg-pink-600/20 hover:text-pink-500 hover:border-pink-500/50" },
                                { Icon: FaLinkedinIn, href: "https://www.linkedin.com/company/112375079/admin/dashboard/", color: "hover:bg-blue-700/20 hover:text-blue-400 hover:border-blue-400/50" },
                                { Icon: FaYoutube, href: "https://youtube.com/@securefy_smart-locker-system?si=OMWShbW-Q7Ay-hX4", color: "hover:bg-red-600/20 hover:text-red-500 hover:border-red-500/50" }
                            ].map((social, idx) => (
                                <a
                                    key={idx}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`w-11 h-11 rounded-xl bg-slate-900/50 backdrop-blur-sm flex items-center justify-center text-slate-400 border border-slate-800 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(79,70,229,0.3)] ${social.color}`}
                                    aria-label="Social Link"
                                >
                                    <social.Icon className="text-xl" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 text-lg tracking-wide uppercase">Product</h4>
                        <ul className="space-y-4 list-none p-0">
                            <li><Link to="/book-locker" className="text-slate-400 hover:text-indigo-400 transition-colors no-underline">Book a Locker</Link></li>
                            <li><Link to="/availability" className="text-slate-400 hover:text-indigo-400 transition-colors no-underline">Live Availability</Link></li>
                            <li><Link to="/my-qr-code" className="text-slate-400 hover:text-indigo-400 transition-colors no-underline">My QR Code</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 text-lg tracking-wide uppercase">Company</h4>
                        <ul className="space-y-4 list-none p-0">
                            <li><Link to="/about-us" onClick={() => window.scrollTo(0, 0)} className="text-slate-400 hover:text-indigo-400 transition-colors no-underline">About Us</Link></li>
                            <li><Link to="/help-center" className="text-slate-400 hover:text-indigo-400 transition-colors no-underline">Help Center</Link></li>
                            <li><Link to="/privacy-policy" onClick={() => window.scrollTo(0, 0)} className="text-slate-400 hover:text-indigo-400 transition-colors no-underline">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-sm">© 2026 Securefy Smart Systems. All rights reserved.</p>
                    <p className="text-slate-500 text-sm flex items-center gap-2">Built with <span className="text-indigo-500 block w-2 h-2 rounded-full animate-pulse"></span> for IIT</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
