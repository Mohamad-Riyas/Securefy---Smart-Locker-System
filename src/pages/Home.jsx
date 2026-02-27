import React, { Suspense, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Float, ContactShadows, Text } from "@react-three/drei";
import { motion } from "framer-motion";
import {
  FaArrowRight, FaQrcode, FaShieldAlt, FaClock,
  FaMobileAlt, FaLock, FaCheckCircle, FaBolt
} from "react-icons/fa";

// 3D Element representing a secure node or locker
function SecureNode() {
  const groupRef = useRef();

  useFrame((state) => {
    groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
  });

  return (
    <Float speed={2.5} rotationIntensity={1.5} floatIntensity={1.5}>
      <group ref={groupRef}>
        {/* Outer glowing frame */}
        <mesh>
          <boxGeometry args={[2.8, 2.8, 2.8]} />
          <meshPhysicalMaterial
            color="#3b82f6"
            metalness={0.9}
            roughness={0.1}
            wireframe={true}
            transparent
            opacity={0.3}
          />
        </mesh>

        {/* Inner solid tech block representing a locker */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2, 2, 2]} />
          <meshPhysicalMaterial
            color="#0f172a"
            metalness={0.8}
            roughness={0.2}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>

        {/* Floating tech sphere inside */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.6, 64, 64]} />
          <meshPhysicalMaterial
            color="#60a5fa"
            emissive="#3b82f6"
            emissiveIntensity={2}
            toneMapped={false}
          />
        </mesh>
      </group>
    </Float>
  );
}

// Background 3D Scene
const Home3DScene = () => {
  return (
    <div className="absolute inset-x-0 top-0 h-[800px] w-full z-0 pointer-events-none opacity-80 md:opacity-100">
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, 10, -5]} intensity={0.5} color="#3b82f6" />
        <Suspense fallback={null}>
          <group position={[3, 0, 0]}> {/* Shift it to the right on desktop */}
            <SecureNode />
          </group>
          <Environment preset="city" />
          <ContactShadows position={[0, -2.5, 0]} opacity={0.6} scale={15} blur={2.5} far={4} color="#000000" />
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
};

// Animation Variants
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

export default function Home() {
  const { userRole, currentUser } = useAuth();

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-50 overflow-hidden font-sans">

      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />
      </div>

      {/* 3D Canvas Background */}
      <Home3DScene />

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Content */}
          <motion.div
            className="flex flex-col items-start space-y-8"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-sm font-medium text-blue-300 tracking-wide">Now Live at IIT Library</span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
              The Future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                Secure Storage
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg lg:text-xl text-slate-400 max-w-lg leading-relaxed">
              Experience the next generation of smart lockers. Fully secure, completely contactless, and powered by instant QR technology.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              {userRole === 'admin' ? (
                <Link to="/admin" className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] flex items-center justify-center gap-3 overflow-hidden">
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                  <span className="relative z-10 flex items-center gap-2">Go to Dashboard <FaArrowRight className="group-hover:translate-x-1 transition-transform" /></span>
                </Link>
              ) : (
                <>
                  <Link to="/book-locker" className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 overflow-hidden">
                    <span className="relative z-10 flex items-center gap-2">Book Instantly <FaArrowRight className="group-hover:translate-x-1 transition-transform" /></span>
                  </Link>
                  <Link to="/availability" className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-white rounded-xl font-semibold transition-all duration-300 backdrop-blur-sm flex items-center justify-center">
                    View Availability
                  </Link>
                </>
              )}
            </motion.div>

            {/* Trust Badges */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-6 pt-6 border-t border-slate-800/50 w-full">
              <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                <FaShieldAlt className="text-blue-500" /> 256-bit Encryption
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                <FaBolt className="text-indigo-400" /> Instant Access
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                <FaCheckCircle className="text-emerald-400" /> 99.9% Reliable
              </div>
            </motion.div>
          </motion.div>

          {/* Right Spacer for 3D Model on Desktop */}
          <div className="hidden lg:block h-full"></div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-24 bg-slate-900/50 border-t border-slate-800/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
            className="text-center mb-16 space-y-4"
          >
            <h2 className="text-blue-400 font-semibold tracking-wider uppercase text-sm">Core Features</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-white">Why Choose Securefy?</h3>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Built from the ground up with top-tier security and an unmatched user experience at its heart.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <FaShieldAlt className="text-3xl" />,
                title: "Advanced Security",
                desc: "One-time-use dynamic QR codes ensure your locker remains yours and yours alone.",
                color: "from-blue-500/20 to-blue-500/0",
                iconColor: "text-blue-400"
              },
              {
                icon: <FaClock className="text-3xl" />,
                title: "Real-time Access",
                desc: "Check accurate availability instantly and secure your spot from anywhere on campus.",
                color: "from-indigo-500/20 to-indigo-500/0",
                iconColor: "text-indigo-400"
              },
              {
                icon: <FaMobileAlt className="text-3xl" />,
                title: "Zero Contact",
                desc: "No physical keys or swipe cards. Everything you need is right there on your smartphone.",
                color: "from-purple-500/20 to-purple-500/0",
                iconColor: "text-purple-400"
              },
              {
                icon: <FaBolt className="text-3xl" />,
                title: "Maximum Speed",
                desc: "Book, scan, and securely store your belongings in under 30 seconds flat.",
                color: "from-emerald-500/20 to-emerald-500/0",
                iconColor: "text-emerald-400"
              }
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative p-8 rounded-3xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/80 transition-all duration-500 overflow-hidden"
              >
                <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                <div className="relative z-10 flex flex-col space-y-4">
                  <div className={`w-14 h-14 rounded-2xl bg-slate-900/50 flex items-center justify-center border border-slate-700/50 ${f.iconColor}`}>
                    {f.icon}
                  </div>
                  <h4 className="text-xl font-bold text-white group-hover:text-blue-100 transition-colors">{f.title}</h4>
                  <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section with Glassmorphism */}
      <section className="relative z-10 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 p-10 rounded-3xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            {/* Inner aesthetic glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 blur-[100px] pointer-events-none"></div>

            <div className="text-center relative z-10">
              <h4 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">500+</h4>
              <p className="text-slate-400 font-medium mt-2">Smart Lockers</p>
            </div>
            <div className="text-center relative z-10">
              <h4 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">10k+</h4>
              <p className="text-slate-400 font-medium mt-2">Monthly Users</p>
            </div>
            <div className="text-center relative z-10">
              <h4 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">24/7</h4>
              <p className="text-slate-400 font-medium mt-2">Active Support</p>
            </div>
            <div className="text-center relative z-10">
              <h4 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">0.1s</h4>
              <p className="text-slate-400 font-medium mt-2">Unlock Speed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Modern CTA Section */}
      <section className="relative z-10 py-28 overflow-hidden">
        {/* Abstract background shapes for CTA */}
        <div className="absolute top-0 right-[-10%] w-[50%] h-[100%] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-[-10%] w-[30%] h-[80%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-4">
              <FaLock className="text-3xl text-blue-400" />
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-white px-4 leading-tight">
              Ready to Upgrade <br /> Your Storage?
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Join the thousands of students already using Securefy at the IIT Library. Fast, reliable, and secure.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
              {userRole === 'admin' ? (
                <Link to="/admin" className="px-10 py-4 bg-white text-slate-900 hover:bg-slate-100 rounded-full font-bold transition-all shadow-xl hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] min-w-[200px]">
                  Open Admin Panel
                </Link>
              ) : currentUser ? (
                <Link to="/book-locker" className="flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white rounded-full font-bold transition-all shadow-xl hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] min-w-[200px] justify-center text-lg">
                  Book a Locker <FaArrowRight />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold transition-all shadow-lg hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] min-w-[200px]">
                    Get Started Now
                  </Link>
                  <Link to="/login" className="px-10 py-4 bg-transparent hover:bg-slate-800 border-2 border-slate-700 hover:border-slate-600 text-white rounded-full font-bold transition-all min-w-[200px]">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
