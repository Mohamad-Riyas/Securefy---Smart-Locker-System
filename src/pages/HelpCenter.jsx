import React from 'react';
import './HelpCenter.css';
import { FaEnvelope, FaPhoneAlt, FaQuestionCircle, FaBook } from 'react-icons/fa';



const HelpCenter = () => {
  return (

    <div className="help-page">
      {/* 1. Hero Section */}
      <div className="help-hero-section">
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
          <div className="help-card">
            <div className="help-icon-wrapper" style={{ color: '#60a5fa' }}>
              <FaBook />

            </div>
            <h4>User Guides</h4>
            <p>
              Learn how to reserve a locker, generate your dynamic QR access token, and manage your active sessions.
            </p>
            <button className="btn-primary-text" style={{ color: '#60a5fa' }}>Read Guides →</button>
          </div>



          <div className="help-card">
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



        {/* 3. Contact Section */}
        <div className="contact-box">
          <h3>Still need assistance?</h3>
          <p>
            Our enterprise support team is available 24/7 to help you resolve any issues with the Securefy platform.
          </p>



          <div className="contact-actions">
            <a href="mailto:support@securefy.com" className="contact-btn primary">
              <FaEnvelope /> Email Support
            </a>
            <a href="tel:+1234567890" className="px-8 py-4 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded-xl font-bold transition-all duration-300 shadow-sm flex items-center gap-3 hover:-translate-y-1 w-full sm:w-auto justify-center">
              <FaPhoneAlt /> +94763188347
            </a>
          </div>
        </motion.div>



      </div>
    </div>

  );

}
