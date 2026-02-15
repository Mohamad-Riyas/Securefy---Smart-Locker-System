import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "../firebase";
import "./Home.css";

export default function Home() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const features = [
        {
            icon: (
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <rect x="12" y="18" width="24" height="20" rx="2" stroke="currentColor" strokeWidth="3" />
                    <circle cx="24" cy="28" r="3" fill="currentColor" />
                </svg>
            ),
            title: "Smart Lockers",
            description: "Secure, IoT-enabled lockers with real-time availability tracking"
        },
        {
            icon: (
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <rect x="8" y="8" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="3" />
                    <rect x="26" y="8" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="3" />
                    <rect x="8" y="26" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="3" />
                    <rect x="26" y="26" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="3" />
                </svg>
            ),
            title: "QR Code Access",
            description: "One-time use QR codes for secure and contactless locker access"
        },
        {
            icon: (
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="3" />
                    <path d="M24 12v12l8 4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
            ),
            title: "Real-time Updates",
            description: "Instant notifications and live locker status with Firebase integration"
        },
        {
            icon: (
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="16" r="8" stroke="currentColor" strokeWidth="3" />
                    <path d="M8 40c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
            ),
            title: "User Profiles",
            description: "Manage bookings, view history, and access active QR codes"
        },
        {
            icon: (
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <rect x="8" y="12" width="32" height="24" rx="2" stroke="currentColor" strokeWidth="3" />
                    <path d="M8 20h32" stroke="currentColor" strokeWidth="3" />
                    <circle cx="16" cy="28" r="2" fill="currentColor" />
                </svg>
            ),
            title: "Easy Booking",
            description: "Simple, intuitive interface for quick locker reservations"
        },
        {
            icon: (
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <path d="M24 4L6 14v14c0 11 7 21 18 26 11-5 18-15 18-26V14L24 4z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M18 24l4 4 8-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            title: "Secure & Safe",
            description: "Firebase authentication and encrypted data storage"
        }
    ];

    const stats = [
        { value: "100+", label: "Smart Lockers" },
        { value: "24/7", label: "Availability" },
        { value: "99.9%", label: "Uptime" },
        { value: "1000+", label: "Happy Users" }
    ];

    return (
        <div className="home-container">
            {/* Animated Background */}
            <div className="home-background">
                <div className="home-orb orb-1"></div>
                <div className="home-orb orb-2"></div>
                <div className="home-orb orb-3"></div>
            </div>

            {/* Navbar */}
            <nav className="home-navbar">
                <div className="home-nav-container">
                    <div className="home-logo">
                        <div className="logo-icon">
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                <rect x="6" y="10" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                                <circle cx="16" cy="18" r="2" fill="currentColor" />
                            </svg>
                        </div>
                        <span>Securefy</span>
                    </div>
                    <div className="home-nav-links">
                        {user ? (
                            <>
                                <Link to="/lockers" className="nav-btn">Dashboard</Link>
                                <Link to="/profile" className="nav-btn">Profile</Link>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="nav-btn">Login</Link>
                                <Link to="/register" className="btn btn-primary">Get Started</Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section fade-in">
                <div className="hero-content">
                    <div className="hero-badge">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M10 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6l2-6z" fill="currentColor" />
                        </svg>
                        <span>Smart Locker Management System</span>
                    </div>

                    <h1 className="hero-title">
                        Secure Your Belongings with
                        <span className="gradient-text"> Securefy</span>
                    </h1>

                    <p className="hero-description">
                        A modern, IoT-enabled locker booking system with real-time availability,
                        QR code access, and seamless Firebase integration. Book, access, and manage
                        your locker reservations effortlessly.
                    </p>

                    <div className="hero-buttons">
                        {user ? (
                            <>
                                <Link to="/lockers" className="btn btn-primary btn-lg">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <rect x="3" y="5" width="14" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" />
                                        <circle cx="10" cy="11" r="1.5" fill="currentColor" />
                                    </svg>
                                    Browse Lockers
                                </Link>
                                <Link to="/profile" className="btn btn-outline btn-lg">
                                    View Profile
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/register" className="btn btn-primary btn-lg">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M10 5v10M5 10h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                    Get Started Free
                                </Link>
                                <Link to="/login" className="btn btn-outline btn-lg">
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="hero-stats">
                        {stats.map((stat, index) => (
                            <div key={index} className="stat-box">
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="visual-card glass-card">
                        <div className="visual-header">
                            <div className="visual-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                            <span className="visual-title">Locker Dashboard</span>
                        </div>
                        <div className="visual-content">
                            <div className="visual-locker available">
                                <div className="locker-icon">
                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                        <rect x="6" y="10" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                                        <circle cx="16" cy="18" r="2" fill="currentColor" />
                                    </svg>
                                </div>
                                <div className="locker-info">
                                    <span className="locker-id">Locker A1</span>
                                    <span className="locker-status available">Available</span>
                                </div>
                            </div>
                            <div className="visual-locker reserved">
                                <div className="locker-icon">
                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                        <rect x="6" y="10" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                                        <circle cx="16" cy="18" r="2" fill="currentColor" />
                                    </svg>
                                </div>
                                <div className="locker-info">
                                    <span className="locker-id">Locker B2</span>
                                    <span className="locker-status reserved">Reserved</span>
                                </div>
                            </div>
                            <div className="visual-qr">
                                <div className="qr-placeholder">
                                    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                                        <rect x="8" y="8" width="24" height="24" rx="2" stroke="currentColor" strokeWidth="3" />
                                        <rect x="48" y="8" width="24" height="24" rx="2" stroke="currentColor" strokeWidth="3" />
                                        <rect x="8" y="48" width="24" height="24" rx="2" stroke="currentColor" strokeWidth="3" />
                                        <rect x="48" y="48" width="24" height="24" rx="2" stroke="currentColor" strokeWidth="3" />
                                    </svg>
                                </div>
                                <span className="qr-label">Your QR Code</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="section-header">
                    <h2>Powerful Features</h2>
                    <p>Everything you need for seamless locker management</p>
                </div>

                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="feature-card glass-card fade-in"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="feature-icon">{feature.icon}</div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section className="how-it-works-section">
                <div className="section-header">
                    <h2>How It Works</h2>
                    <p>Get started in just 4 simple steps</p>
                </div>

                <div className="steps-container">
                    <div className="step-item fade-in">
                        <div className="step-number">1</div>
                        <div className="step-content">
                            <h3>Create Account</h3>
                            <p>Sign up with your email and create a secure account</p>
                        </div>
                    </div>

                    <div className="step-arrow">→</div>

                    <div className="step-item fade-in" style={{ animationDelay: "0.1s" }}>
                        <div className="step-number">2</div>
                        <div className="step-content">
                            <h3>Browse Lockers</h3>
                            <p>View available lockers with real-time status updates</p>
                        </div>
                    </div>

                    <div className="step-arrow">→</div>

                    <div className="step-item fade-in" style={{ animationDelay: "0.2s" }}>
                        <div className="step-number">3</div>
                        <div className="step-content">
                            <h3>Book & Pay</h3>
                            <p>Select your preferred time slot and confirm booking</p>
                        </div>
                    </div>

                    <div className="step-arrow">→</div>

                    <div className="step-item fade-in" style={{ animationDelay: "0.3s" }}>
                        <div className="step-number">4</div>
                        <div className="step-content">
                            <h3>Get QR Code</h3>
                            <p>Receive your one-time QR code for locker access</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-card glass-card">
                    <h2>Ready to Get Started?</h2>
                    <p>Join thousands of users managing their lockers with Securefy</p>
                    <div className="cta-buttons">
                        {user ? (
                            <Link to="/lockers" className="btn btn-primary btn-lg">
                                Go to Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className="btn btn-primary btn-lg">
                                    Create Free Account
                                </Link>
                                <Link to="/login" className="btn btn-secondary btn-lg">
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="home-footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <div className="logo-icon">
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                    <rect x="6" y="10" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                                    <circle cx="16" cy="18" r="2" fill="currentColor" />
                                </svg>
                            </div>
                            <span>Securefy</span>
                        </div>
                        <p>Smart locker management made simple</p>
                    </div>
                    <div className="footer-links">
                        <div className="footer-column">
                            <h4>Product</h4>
                            <Link to="/lockers">Lockers</Link>
                            <Link to="/profile">Profile</Link>
                        </div>
                        <div className="footer-column">
                            <h4>Company</h4>
                            <a href="#about">About</a>
                            <a href="#contact">Contact</a>
                        </div>
                        <div className="footer-column">
                            <h4>Legal</h4>
                            <a href="#privacy">Privacy</a>
                            <a href="#terms">Terms</a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 Securefy. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
