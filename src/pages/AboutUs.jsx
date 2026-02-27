import React from 'react';
import './AboutUs.css';
import { FaQrcode, FaClock, FaSmile, FaShieldAlt, FaBuilding, FaCogs } from 'react-icons/fa';

const AboutUs = () => {
  return (
    <div className="about-page">
      {/* 1. Hero Section */}
      <div className="hero-section">
        <h1>About Our Smart Locker System</h1>
        <p className="tagline">Providing secure, automated, and convenient locker solutions for modern businesses and institutions.</p>
      </div>

      <div className="about-container">

        {/* 2. About Us Section */}
        <div className="content-box">
          <h2>Who We Are</h2>
          <p>
            Securefy is a team of tech enthusiasts dedicated to transforming the way people store and access their belongings.
            We specialize in QR-based smart locker systems that prioritize security, efficiency, and user experience.
            Our mission is to replace outdated manual storage with seamless digital automation.
          </p>
        </div>

        {/* 3. The Problem Section */}
        <div className="content-box problem-section">
          <div className="problem-image">
            <div className="placeholder-text">
              [Illustrative Image: Challenges of traditional lockers like lost keys and manual tracking]
            </div>
          </div>
          <div className="problem-content">
            <h2>The Challenges We Solve</h2>
            <p>Traditional locker management systems are often inefficient and frustrating for both users and administrators.</p>
            <ul>
              <li><strong>Lost Keys:</strong> Eliminates the stress and cost of replacing physical keys.</li>
              <li><strong>Manual Management:</strong> Replaces tedious paperwork with automated digital tracking.</li>
              <li><strong>Security Gaps:</strong> Provides trackable, authenticated access to prevent theft.</li>
              <li><strong>Lack of Flexibility:</strong> Offers real-time booking from anywhere, anytime.</li>
            </ul>
          </div>
        </div>

        {/* 4. Our Aim */}
        <div className="content-box">
          <h2>Our Aim</h2>
          <p>
            To provide a fully automated, keyless locker system that simplifies storage management for universities, offices, and gyms.
            We aim to empower institutions with tools that improve operational efficiency and provide users with a hassle-free experience.
          </p>
        </div>

        {/* 5. Our Mission */}
        <div className="content-box">
          <h2>Our Mission</h2>
          <p>
            Our mission is to deliver a reliable QR-based locker booking system that enhances security and convenience.
            We strive to set new standards in smart storage technology through continuous innovation and user-centric design.
          </p>
        </div>

        {/* 6. Our Vision */}
        <div className="content-box">
          <h2>Our Vision</h2>
          <p>
            To become the global leader in smart storage solutions, turning every traditional locker into an intelligent, connected digital asset
            that simplifies the lives of millions of users worldwide.
          </p>
        </div>

        {/* 7. Our Strengths */}
        <div className="strengths-section">
          <h2 style={{ textAlign: 'center', marginBottom: '40px', color: 'var(--primary-purple)' }}>Our Strengths</h2>
          <div className="strengths-grid">

            <div className="strength-card">
              <div className="icon-wrapper"><FaQrcode /></div>
              <h3>QR Authentication</h3>
              <p>Secure, one-time QR codes for instant, keyless unlocking.</p>
            </div>

            <div className="strength-card">
              <div className="icon-wrapper"><FaClock /></div>
              <h3>Real-Time Booking</h3>
              <p>Web-based reservation system for instant locker access.</p>
            </div>

            <div className="strength-card">
              <div className="icon-wrapper"><FaSmile /></div>
              <h3>User-Friendly UI</h3>
              <p>Minimalist and intuitive design for a seamless user journey.</p>
            </div>

            <div className="strength-card">
              <div className="icon-wrapper"><FaShieldAlt /></div>
              <h3>Secure Access</h3>
              <p>Encrypted data and trackable entry for maximum safety.</p>
            </div>

            <div className="strength-card">
              <div className="icon-wrapper"><FaBuilding /></div>
              <h3>Business Scalable</h3>
              <p>Optimized for universities, corporate offices, and large facilities.</p>
            </div>

            <div className="strength-card">
              <div className="icon-wrapper"><FaCogs /></div>
              <h3>Fully Automated</h3>
              <p>Reduces manual administration and human error in locker logs.</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutUs;
