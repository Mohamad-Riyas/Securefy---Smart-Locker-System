import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import { FaArrowRight, FaQrcode, FaShieldAlt, FaClock, FaMobileAlt, FaCalendarAlt, FaLock, FaEye } from "react-icons/fa";

export default function Home() {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <div className="badge">Next-Gen Storage Solution</div>
            <h1>
              <span className="gradient-text">Smart Locker</span> System
            </h1>
            <p className="subtitle">
              Secure, intelligent storage for IIT library visitors. 
              <span className="highlight"> Powered by QR technology.</span>
            </p>
            <p className="desc">
              Book lockers instantly, receive secure one-time QR codes, 
              and access your belongings anytime. Seamless, contactless, secure.
            </p>

            <div className="hero-buttons">
              <Link to="/book-locker" className="primary-btn">
                Book a Locker <FaArrowRight className="btn-icon" />
              </Link>
              <Link to="/availability" className="secondary-btn">
                Check Availability
              </Link>
            </div>

            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">99.9%</span>
                <span className="stat-label">Uptime</span>
              </div>
              <div className="stat">
                <span className="stat-number">500+</span>
                <span className="stat-label">Lockers</span>
              </div>
              <div className="stat">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Access</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="qr-visual">
              <div className="qr-animation">
                <FaQrcode className="qr-icon" />
              </div>
              <div className="locker-3d"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="section-header">
          <h2>Why Choose Our Smart Lockers</h2>
          <p>Experience the future of personal storage</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <FaShieldAlt />
            </div>
            <h3>Military-Grade Security</h3>
            <p>One-time QR codes with encryption ensure your belongings remain safe and private.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FaClock />
            </div>
            <h3>Real-Time Availability</h3>
            <p>Check locker availability in real-time and book instantly from any device.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FaMobileAlt />
            </div>
            <h3>Contactless Access</h3>
            <p>No keys, no cards. Just scan and go with our mobile-first approach.</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Simple, fast, and secure in four easy steps</p>
        </div>

        <div className="steps">
          <div className="step-card">
            <div className="step-number">01</div>
            <div className="step-icon">
              <FaCalendarAlt />
            </div>
            <h3>Book Your Locker</h3>
            <p>Select from available lockers and choose your preferred time slot.</p>
            <div className="step-line"></div>
          </div>

          <div className="step-card">
            <div className="step-number">02</div>
            <div className="step-icon">
              <FaQrcode />
            </div>
            <h3>Receive QR Code</h3>
            <p>Get a secure, one-time QR code instantly on your mobile device.</p>
            <div className="step-line"></div>
          </div>

          <div className="step-card">
            <div className="step-number">03</div>
            <div className="step-icon">
              <FaLock />
            </div>
            <h3>Scan & Store</h3>
            <p>Scan the QR at the locker to unlock and store your belongings securely.</p>
            <div className="step-line"></div>
          </div>

          <div className="step-card">
            <div className="step-number">04</div>
            <div className="step-icon">
              <FaEye />
            </div>
            <h3>Track & Manage</h3>
            <p>Monitor your booking and extend time through our dashboard.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Experience Smart Storage?</h2>
          <p>Join thousands of IIT students using our secure locker system</p>
          <div className="cta-buttons">
            <Link to="/book-locker" className="cta-btn-primary">
              Get Started Now <FaArrowRight />
            </Link>
            <Link to="/about" className="cta-btn-secondary">
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

