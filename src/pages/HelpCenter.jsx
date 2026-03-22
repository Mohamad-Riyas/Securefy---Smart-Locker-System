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
            <h4 className="text-2xl font-bold text-slate-100 mb-4">FAQs</h4>
            <p className="text-slate-300 text-lg leading-relaxed font-light mb-6">
              Having trouble? Browse our frequently asked questions about access control, expired tokens, and app issues.
            </p>
            <button className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">View FAQs →</button>
          </motion.div>

        </div>



        {/* --- CONTACT SECTION --- */}

        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="bg-slate-900 border border-slate-700/60 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none"></div>


          <h3 className="text-3xl font-bold text-white mb-6">Still need assistance?</h3>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto font-light">
            Our enterprise support team is available 24/7 to help you resolve any issues with the Securefy platform.
          </p>



          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <a href="mailto:support@securefy.com" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:-translate-y-1 flex items-center gap-3 w-full sm:w-auto justify-center">
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
