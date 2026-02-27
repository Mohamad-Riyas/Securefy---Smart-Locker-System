import React from "react";
import { Link } from "react-router-dom";
import { FaLock, FaQrcode, FaMobileAlt } from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="relative z-10 border-t border-slate-800 bg-slate-950 pt-20 pb-10 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>

            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-2 space-y-6">
                        <h3 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
                            <FaLock className="text-indigo-500 text-2xl" /> Securefy
                        </h3>
                        <p className="text-slate-400 max-w-sm leading-relaxed">
                            Innovating campus security through state-of-the-art IoT solutions. Secure storage for the modern student.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-indigo-500/20 hover:text-indigo-400 cursor-pointer transition-colors border border-slate-700">
                                <FaQrcode />
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-indigo-500/20 hover:text-indigo-400 cursor-pointer transition-colors border border-slate-700">
                                <FaMobileAlt />
                            </div>
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
                            <li><Link to="/about-us" className="text-slate-400 hover:text-indigo-400 transition-colors no-underline">About Us</Link></li>
                            <li><Link to="#" className="text-slate-400 hover:text-indigo-400 transition-colors no-underline">Help Center</Link></li>
                            <li><Link to="#" className="text-slate-400 hover:text-indigo-400 transition-colors no-underline">Privacy Policy</Link></li>
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
