import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-container">
      {/* Navbar */}
      <nav className="navbar">
        <h2 className="logo">Securefy</h2>

        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/book-locker">Book Locker</Link></li>
          <li><Link to="/availability">Availability</Link></li>
          <li><Link to="/my-qr">My QR Code</Link></li>
          <li><Link to="/login" className="login-btn">Login</Link></li>
        </ul>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <h1>Smart Locker System</h1>
        <p className="subtitle">
          Secure, convenient storage for IIT library visitors.
        </p>
        <p className="desc">
          Book a locker, receive a one-time QR code, and access your belongings.
        </p>

        <div className="hero-buttons">
          <Link to="/book-locker" className="primary-btn">
            Book a Locker
          </Link>
          <Link to="/availability" className="secondary-btn">
            Check Availability
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="how-it-works">
        <h2>How It Works</h2>

        <div className="steps">
          <div className="card">
            <h3>1. Book Your Locker</h3>
            <p>Select an available locker and choose your time slot.</p>
          </div>

          <div className="card">
            <h3>2. Receive QR Code</h3>
            <p>Get a one-time QR code instantly after booking.</p>
          </div>

          <div className="card">
            <h3>3. Unlock & Store</h3>
            <p>Scan the QR code to unlock the locker.</p>
          </div>

          <div className="card">
            <h3>4. Real-Time Tracking</h3>
            <p>View locker availability in real time.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

