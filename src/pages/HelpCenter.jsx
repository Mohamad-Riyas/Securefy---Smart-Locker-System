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



      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] bg-blue-500/10 rounded-full blur-[180px] pointer-events-none"></div>
      <div className="absolute inset-0 z-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#60a5fa 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>



      <div className="max-w-7xl mx-auto px-6 relative z-10">



        {/* --- HEADER SECTION --- */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-20"
          initial="hidden" animate="visible" variants={staggerContainer}
        >

          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm font-semibold shadow-sm backdrop-blur-md mb-6">
            <FaQuestionCircle /> Support & Resources
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] drop-shadow-sm mb-6">
            How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">help you?</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-xl text-slate-300 leading-relaxed font-light">
            Find answers to common questions, view our guides, or get in touch with the Securefy support team.
          </motion.p>
        </motion.div>



        {/* --- FAQ / CARDS SECTION --- */}

        {/* Reusing the exact card styles from your "Core Features" section */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">



          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="bg-slate-800/80 border border-slate-700/80 p-10 rounded-3xl shadow-lg hover:border-blue-400/50 hover:bg-slate-800 hover:shadow-[0_10px_30px_rgba(59,130,246,0.2)] transition-all duration-300 group backdrop-blur-sm"
          >

            <div className="w-16 h-16 bg-slate-900 group-hover:bg-blue-600/20 border border-slate-700 group-hover:border-blue-500/50 rounded-2xl flex items-center justify-center text-blue-400 mb-8 transition-colors duration-300">
              <FaBook className="text-3xl drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
            </div>
            <h4 className="text-2xl font-bold text-slate-100 mb-4">User Guides</h4>
            <p className="text-slate-300 text-lg leading-relaxed font-light mb-6">
              Learn how to reserve a locker, generate your dynamic QR access token, and manage your active sessions.
            </p>
            <button className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">Read Guides →</button>
          </motion.div>



          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-slate-800/80 border border-slate-700/80 p-10 rounded-3xl shadow-lg hover:border-indigo-400/50 hover:bg-slate-800 hover:shadow-[0_10px_30px_rgba(99,102,241,0.2)] transition-all duration-300 group backdrop-blur-sm"
          >
            <div className="w-16 h-16 bg-slate-900 group-hover:bg-indigo-600/20 border border-slate-700 group-hover:border-indigo-500/50 rounded-2xl flex items-center justify-center text-indigo-400 mb-8 transition-colors duration-300">
              <FaQuestionCircle className="text-3xl drop-shadow-[0_0_10px_rgba(129,140,248,0.5)]" />
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
