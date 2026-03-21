import React, { useEffect } from 'react';
import './PrivacyPolicy.css';
const PrivacyPolicy = () => {
  return (
    <div className="privacy-page">
      {/* Hero Section */}
      <div className="hero-section reveal">
        <h1>Privacy Policy</h1>
        <p className="tagline">Your privacy and security are our top priorities. Learn how Securefy protects your data.</p>
      </div>
      <div className="privacy-container">
        {/* Collection of Information */}
        <div className="content-box reveal">
          <h2>1. Information We Collect</h2>
          <p>
            When you use the Securefy Smart Locker System, we may collect certain information to provide and improve our services.
          </p>
          <ul>
            <li><strong>Personal Information:</strong> Name, email address, and student/employee ID during registration.</li>
            <li><strong>Usage Data:</strong> Information about your locker bookings, access logs, and timestamps.</li>
            <li><strong>Device Information:</strong> Information about the device used to access our web application or scan QR codes.</li>
          </ul>
        </div>
        {/* Use of Information */}
        <div className="content-box reveal">
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect strictly to operate, maintain, and secure our smart locker system:</p>
          <ul>
            <li>To authenticate users and generate secure QR codes for locker access.</li>
            <li>To manage locker availability, reservations, and history.</li>
            <li>To notify you about booking confirmations, expirations, or security alerts.</li>
            <li>To troubleshoot issues, monitor system performance, and prevent unauthorized access.</li>
          </ul>
        </div>
        {/* Data Security */}
        <div className="content-box reveal">
          <h2>3. Data Security</h2>
          <p>
            We implement industry-standard encryption and security protocols to protect your personal data from unauthorized access, alteration, or disclosure.
            Your QR code data is dynamically generated and one-time-use to prevent replication or interception. Access logs are strictly confidential and only accessible by authorized administrators.
          </p>
        </div>
        {/* Sharing of Information */}
        <div className="content-box reveal">
          <h2>4. Sharing of Information</h2>
          <p>
            Securefy does not sell, rent, or trade your personal information. We may only share data under the following circumstances:
          </p>
          <ul>
            <li><strong>With your institution:</strong> University or corporate administrators have access to usage data for security and operational oversight.</li>
            <li><strong>Legal Requirements:</strong> If required by law, regulation, or legal process to protect our rights or the safety of others.</li>
            <li><strong>Service Providers:</strong> Trusted third-party infrastructure providers who are bound by confidentiality agreements.</li>
          </ul>
        </div>
        {/* Contact Us */}
        <div className="content-box reveal">
          <h2>5. Contact Us</h2>
          <p>
            If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact your institution's administrative office or our support team directly.
          </p>
        </div>
      </div>
    </div>
  );
};
export default PrivacyPolicy;
