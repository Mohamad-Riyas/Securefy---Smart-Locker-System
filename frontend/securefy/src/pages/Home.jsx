import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Home.css";
import {
  FaArrowRight,
  FaQrcode,
  FaShieldAlt,
  FaClock,
  FaMobileAlt,
  FaLock,
  FaCheckCircle,
  FaUniversity,
  FaBolt,
  FaLayerGroup
} from "react-icons/fa";

export default function Home() {
  const { userRole, currentUser } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="home-container">
      {/* Dynamic Background */}
      <div className="home-bg-glow">
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
        <div className="glow-orb orb-3"></div>
      </div>

      {/* Hero Section */}
      <section className="hero-v2">
        <div className="hero-grid">
          <div className="hero-text-content">
            <div className="hero-badge-v2">
              <span className="badge-dot"></span>
              Now Live at IIT Library
            </div>
            <h1 className="hero-title-v2">
              The Future of <br />
              <span className="text-gradient">Secure Storage</span>
            </h1>
            <p className="hero-subtitle-v2">
              Experience the next generation of smart lockers. Secure,
              contactless, and powered by instant QR technology.
            </p>

            <div className="hero-cta-group">
              {userRole === 'admin' ? (
                <Link to="/admin" className="btn-primary-v2 admin-btn-pulse">
                  Go to Admin Dashboard <FaArrowRight />
                </Link>
              ) : (
                <>
                  <Link to="/book-locker" className="btn-primary-v2">
                    Book Instantly <FaArrowRight />
                  </Link>
                  <Link to="/availability" className="btn-secondary-v2">
                    View Availability
                  </Link>
                </>
              )}
            </div>

            <div className="hero-trust-badges">
              <div className="trust-item">
                <FaShieldAlt /> 256-bit Encryption
              </div>
              <div className="trust-item">
                <FaBolt /> Instant Access
              </div>
              <div className="trust-item">
                <FaCheckCircle /> 99.9% Reliable
              </div>
            </div>
          </div>

          <div className="hero-visual-v2">
            <div className="visual-stack">
              <div className="visual-card main-card">
                <div className="card-header">
                  <div className="dots"><span></span><span></span><span></span></div>
                  <span className="card-title">Live Status</span>
                </div>
                <div className="locker-preview">
                  <div className="locker-item available">
                    <div className="locker-icon-v2"><FaLock /></div>
                    <div className="locker-meta">
                      <span className="id">L-104</span>
                      <span className="status">Available</span>
                    </div>
                  </div>
                  <div className="locker-item reserved">
                    <div className="locker-icon-v2"><FaLock /></div>
                    <div className="locker-meta">
                      <span className="id">L-202</span>
                      <span className="status">Booked</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="visual-card qr-card">
                <div className="qr-box">
                  <FaQrcode />
                </div>
                <div className="qr-meta">
                  <span>Scan to Unlock</span>
                  <div className="scan-line"></div>
                </div>
              </div>

              <div className="floating-element element-1">
                <FaLayerGroup /> <span>Floor 1</span>
              </div>
              <div className="floating-element element-2">
                <FaUniversity /> <span>IIT Campus</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-v2">
        <div className="container">
          <div className="section-header-v2">
            <span className="sup-title">Core Features</span>
            <h2>Why Choose Securefy?</h2>
            <p>Built with security and user experience at its heart.</p>
          </div>

          <div className="features-grid-v2">
            {[
              {
                icon: <FaShieldAlt />,
                title: "Advanced Security",
                desc: "One-time-use QR codes ensure your locker remains yours and yours alone."
              },
              {
                icon: <FaClock />,
                title: "Real-time Access",
                desc: "Check availability instantly and book from anywhere in the library."
              },
              {
                icon: <FaMobileAlt />,
                title: "Zero Contact",
                desc: "No physical keys or cards. Everything you need is on your smartphone."
              },
              {
                icon: <FaBolt />,
                title: "Maximum Speed",
                desc: "Book, scan, and store in under 30 seconds. Perfect for students on the go."
              }
            ].map((f, i) => (
              <div key={i} className="feature-card-v2">
                <div className="f-icon-v2">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <div className="card-glow"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-v2">
        <div className="stats-container-v2">
          <div className="stat-v2">
            <span className="num">500+</span>
            <span className="label">Smart Lockers</span>
          </div>
          <div className="stat-v2">
            <span className="num">10k+</span>
            <span className="label">Monthly Users</span>
          </div>
          <div className="stat-v2">
            <span className="num">24/7</span>
            <span className="label">Support</span>
          </div>
          <div className="stat-v2">
            <span className="num">0.1s</span>
            <span className="label">Unlock Speed</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-v2">
        <div className="cta-content-v2">
          <h2>Ready for smarter storage?</h2>
          <p>Join the thousands of students already using Securefy at the IIT Library.</p>
          <div className="cta-actions">
            {userRole === 'admin' ? (
              <Link to="/admin" className="btn-cta-primary">Open Admin Panel</Link>
            ) : currentUser ? (
              <Link to="/book-locker" className="btn-cta-primary">Book a Locker</Link>
            ) : (
              <>
                <Link to="/register" className="btn-cta-primary">Get Started Now</Link>
                <Link to="/login" className="btn-cta-secondary">Sign In</Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-v2">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>Securefy</h3>
            <p>Innovating campus security through smart IoT solutions.</p>
          </div>
          <div className="footer-links-v2">
            <div className="link-col">
              <h4>Product</h4>
              <Link to="/book-locker">Book Locker</Link>
              <Link to="/availability">Availability</Link>
            </div>
            <div className="link-col">
              <h4>Support</h4>
              <Link to="#">Help Center</Link>
              <Link to="#">Terms of Service</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom-v2">
          © 2024 Securefy Smart Systems. Built for IIT.
        </div>
      </footer>
    </div>
  );
}
