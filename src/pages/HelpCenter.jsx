import React, { useRef, useEffect } from 'react';
import './HelpCenter.css';
import { FaEnvelope, FaPhoneAlt, FaQuestionCircle, FaBook } from 'react-icons/fa';

const HelpCenter = () => {
  const guidesRef = useRef(null);

  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          } else {
            entry.target.classList.remove('active');
          }
        });
      },
      { 
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
      }
    );
    revealElements.forEach((el) => {
      observer.observe(el);
    });
    return () => {
      revealElements.forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  const scrollToGuides = () => {
    guidesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <div className="help-page">
      {/* 1. Hero Section */}
      <div className="help-hero-section reveal">
        <div className="badge">
          <FaQuestionCircle /> Support & Resources
        </div>
        <h1>
          How can we <span>help you?</span>
        </h1>
        <p className="tagline">
          Find answers to common questions, view our guides, or get in touch with the Securefy support team.
        </p>
      </div>

      <div className="help-container">
        {/* 2. FAQ / Cards Section */}
        <div className="help-grid">
          <div className="help-card reveal">
            <div className="help-icon-wrapper" style={{ color: '#60a5fa' }}>
              <FaBook />
            </div>
            <h4>User Guides</h4>
            <p>
              Learn how to reserve a locker, generate your dynamic QR access token, and manage your active sessions.
            </p>
            <button className="btn-primary-text" style={{ color: '#60a5fa' }} onClick={scrollToGuides}>Read Guides →</button>
          </div>

          <div className="help-card reveal">
            <div className="help-icon-wrapper" style={{ color: '#818cf8' }}>
              <FaQuestionCircle />
            </div>
            <h4>FAQs</h4>
            <p>
              Having trouble? Browse our frequently asked questions about access control, expired tokens, and app issues.
            </p>
            <button className="btn-primary-text" style={{ color: '#818cf8' }}>View FAQs →</button>
          </div>
        </div>

        {/* 3. Guides Section */}
        <div className="guides-section reveal" ref={guidesRef}>
          <h3>Step-by-Step Guides</h3>
          <div className="guide-steps">
            <div className="guide-step reveal">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Reserve a Locker</h4>
                <p>Log in to the dashboard, browse available lockers, and select your preferred locker type and time slot.</p>
              </div>
            </div>

            <div className="guide-step reveal">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Generate Access Token</h4>
                <p>Once reserved, the system will automatically generate a dynamic QR code for secure authentication.</p>
              </div>
            </div>

            <div className="guide-step reveal">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Scan to Unlock</h4>
                <p>Approach the smart locker console, scan your QR code, and your assigned locker door will open automatically.</p>
              </div>
            </div>

            <div className="guide-step reveal">
              <div className="step-number">4</div>
              <div className="step-content">
                <h4>Manage Active Sessions</h4>
                <p>You can view your active bookings, extend the time, or report any issues directly from your dashboard's active orders section.</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Contact Section */}
        <div className="contact-box reveal">
          <h3>Still need assistance?</h3>
          <p>
            Our enterprise support team is available 24/7 to help you resolve any issues with the Securefy platform.
          </p>
          <div className="contact-actions">
            <a href="mailto:support@securefy.com" className="contact-btn primary">
              <FaEnvelope /> securefy@gmail.com
            </a>
            <a href="tel:+94763188347" className="contact-btn secondary">
              <FaPhoneAlt /> +94763188347
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
