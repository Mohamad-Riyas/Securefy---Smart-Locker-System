import React, { Suspense, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Float, Html, PresentationControls } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";
import {
  FaArrowRight, FaQrcode, FaShieldAlt, FaClock,
  FaMobileAlt, FaDatabase, FaCheckCircle, FaBolt, FaBoxOpen, FaUserShield
} from "react-icons/fa";

// --- Realistic 3D Locker Bank for Premium Soft Dark Theme ---
function LockerBank() {
  const group = useRef();
  
  useFrame((state) => {
    if (group.current) {
      // Gentle floating
      group.current.position.y = -1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.03;
      
      // Calculate target rotation based on mouse cursor position
      const baseRotY = -Math.PI / 8;
      // Multiplying by a small factor ensures the movement is subtle and elegant
      const targetRotX = (state.pointer.y * Math.PI) / 12; // Look up/down based on mouse Y
      const targetRotY = baseRotY + (state.pointer.x * Math.PI) / 8; // Look left/right based on mouse X
      
      // Smoothly interpolate current rotation towards target rotation
      group.current.rotation.x += (targetRotX - group.current.rotation.x) * 0.05;
      group.current.rotation.y += (targetRotY - group.current.rotation.y) * 0.05;
    }
  });

  const LockerDoor = ({ position, active = false, open = false }) => (
    <group position={position}>
      {/* Box interior/body */}
      <mesh position={[0, 0, -0.4]}>
        <boxGeometry args={[0.95, 0.95, 0.8]} />
        <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.2} />
      </mesh>
      {/* Door */}
      <mesh position={[open ? -0.4 : 0, 0, open ? 0.4 : 0]} rotation={[0, open ? -Math.PI/2.5 : 0, 0]}>
        <boxGeometry args={[0.9, 0.9, 0.05]} />
        <meshStandardMaterial color={active ? "#3b82f6" : "#475569"} roughness={0.3} metalness={0.5} />
        {/* Glow effect for active door */}
        {active && (
          <mesh position={[0, 0, -0.01]}>
            <boxGeometry args={[0.92, 0.92, 0.05]} />
            <meshBasicMaterial color="#60a5fa" transparent opacity={0.3} />
          </mesh>
        )}
        {/* Lock/Handle indicator */}
        <mesh position={[0.3, 0, 0.03]}>
          <boxGeometry args={[0.06, 0.2, 0.02]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
        {/* LED Status */}
        <mesh position={[0.3, 0.2, 0.03]}>
          <circleGeometry args={[0.025, 16]} />
          <meshBasicMaterial color={active ? "#10b981" : "#ef4444"} />
        </mesh>
      </mesh>
    </group>
  );

  return (
    <group ref={group} position={[0, -1, 0]}>
      {/* Left Column */}
      <LockerDoor position={[-1, 2, 0]} />
      <LockerDoor position={[-1, 1, 0]} active={true} open={true} />
      <LockerDoor position={[-1, 0, 0]} />
      
      {/* Middle Column (Terminal & Lockers) */}
      <LockerDoor position={[0, 2, 0]} />
      
      {/* Terminal Screen Subsystem */}
      <group position={[0, 1, 0]}>
        <mesh position={[0, 0, -0.4]}>
          <boxGeometry args={[0.95, 0.95, 0.8]} />
          <meshStandardMaterial color="#334155" roughness={0.7} />
        </mesh>
        {/* Bezel */}
        <mesh position={[0, 0, 0.01]}>
          <boxGeometry args={[0.85, 0.85, 0.05]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        {/* Screen surface */}
        <mesh position={[0, 0, 0.04]}>
          <planeGeometry args={[0.75, 0.75]} />
          <meshBasicMaterial color="#020617" />
        </mesh>
        {/* App UI on terminal */}
        <Html position={[0, 0, 0.05]} transform distanceFactor={1.3}>
          <div className="bg-[#0f172a] p-3 rounded-lg flex flex-col items-center justify-center border border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
             <div className="bg-white p-1 rounded">
               <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=SecurefyDemo2026" alt="QR" className="w-[82px] h-[82px] opacity-90" />
             </div>
             <p className="text-[10px] font-bold text-blue-400 mt-2 uppercase tracking-widest animate-pulse">Scan to Unlatch</p>
          </div>
        </Html>
      </group>
      
      <LockerDoor position={[0, 0, 0]} />

      {/* Right Column */}
      <LockerDoor position={[1, 2, 0]} />
      <LockerDoor position={[1, 1, 0]} />
      <LockerDoor position={[1, 0, 0]} active={true} />

      {/* Base / Plinth */}
      <mesh position={[0, -0.55, -0.4]}>
        <boxGeometry args={[3.2, 0.1, 1.0]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
    </group>
  );
}

// 3D Canvas wrapper
const Hero3DScene = () => {
  return (
    <div className="w-full h-[45vh] sm:h-[50vh] lg:h-full relative lg:absolute lg:inset-y-0 lg:right-0 lg:w-[55%] z-0 mt-8 lg:mt-0 pointer-events-auto">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <fog attach="fog" args={['#0f172a', 5, 15]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 15, 10]} intensity={1.5} color="#ffffff" castShadow />
        <directionalLight position={[-10, 5, -5]} intensity={1.5} color="#60a5fa" />
        <Suspense fallback={null}>
          <LockerBank />
          <Environment preset="city" />
          <ContactShadows position={[0, -1.8, -0.4]} opacity={0.7} scale={10} blur={2.5} far={4} color="#000000" />
        </Suspense>
        {/* We disable OrbitControls rotation so our custom mouse Parallax effect takes over completely */}
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
    </div>
  );
};

// --- Interactive Real-World Locker Scene ---
function RealWorldLocker() {
  const doorRef = useRef();
  const lockLightRef = useRef();
  const [hovered, setHovered] = React.useState(false);
  
  useFrame((state, delta) => {
    // Door opening mechanism: swings to -90 degrees (-Math.PI / 2)
    const targetRot = hovered ? -Math.PI / 2 : 0;
    if (doorRef.current) {
      doorRef.current.rotation.y += (targetRot - doorRef.current.rotation.y) * 8 * delta;
    }
    
    // Status light color transition
    if (lockLightRef.current) {
      const targetColor = hovered ? new THREE.Color("#10b981") : new THREE.Color("#ef4444");
      lockLightRef.current.material.color.lerp(targetColor, 0.1);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
      <group 
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }} 
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
        position={[0, -0.2, 0]}
        scale={1.2}
      >
        {/* Locker Frame/Body */}
        <mesh position={[0, 0, -0.5]} castShadow receiveShadow>
          <boxGeometry args={[2, 2, 1.5]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
        </mesh>
        
        {/* The glowing interior when open */}
        <mesh position={[0, 0, -0.48]}>
          <boxGeometry args={[1.9, 1.9, 1.4]} />
          <meshStandardMaterial color="#020617" roughness={1} />
        </mesh>

        <pointLight position={[0, 0.5, -0.2]} intensity={hovered ? 2 : 0} color="#60a5fa" distance={3} />

        {/* Parcel inside */}
        <group position={[0, -0.5, -0.2]} scale={hovered ? 1.05 : 1}>
          {/* Cardboard Box */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.8, 0.6, 0.8]} />
            <meshStandardMaterial color="#854d0e" roughness={0.9} />
          </mesh>
          {/* Tape */}
          <mesh position={[0, 0.301, 0]}>
            <planeGeometry args={[0.2, 0.8]} />
            <meshStandardMaterial color="#d1d5db" roughness={0.5} rotation={[-Math.PI/2, 0, 0]} />
          </mesh>
          {/* Shipping Label */}
          <mesh position={[0.2, 0.302, 0.1]} rotation={[-Math.PI/2, 0, 0]}>
            <planeGeometry args={[0.3, 0.2]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>

        {/* Dynamic Door with Hinge */}
        <group position={[-0.95, 0, 0.25]}>
          <group ref={doorRef}>
            {/* Shift pivot to hinge */}
            <mesh position={[0.95, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.9, 1.9, 0.1]} />
              <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.2} />
            </mesh>
            
            {/* Handle & Lock Module */}
            <group position={[1.7, 0, 0.06]}>
              {/* Backplate */}
              <mesh castShadow>
                <boxGeometry args={[0.15, 0.6, 0.05]} />
                <meshStandardMaterial color="#020617" metalness={0.9} roughness={0.1} />
              </mesh>
              {/* Handle */}
              <mesh position={[0, -0.1, 0.05]}>
                <boxGeometry args={[0.05, 0.3, 0.1]} />
                <meshStandardMaterial color="#94a3b8" />
              </mesh>
              {/* Status Light */}
              <mesh ref={lockLightRef} position={[0, 0.2, 0.03]}>
                <circleGeometry args={[0.03, 16]} />
                <meshBasicMaterial color="#ef4444" />
              </mesh>
            </group>

            {/* Locker Number */}
            <Html transform position={[0.3, 0.6, 0.06]} distanceFactor={1.5}>
              <div className="text-slate-400 font-bold text-3xl font-mono opacity-60 pointer-events-none">A-42</div>
            </Html>
          </group>
        </group>
        
        {/* Floating Tooltip telling the user to hover */}
        <Html position={[0, -1.8, 0]} center zIndexRange={[100, 0]}>
           <div className={`transition-all duration-500 ${hovered ? 'opacity-0 scale-90' : 'opacity-100 scale-100'} bg-blue-600/80 backdrop-blur-md border border-blue-400 text-white text-xs font-bold px-4 py-2 rounded-full whitespace-nowrap shadow-[0_0_20px_rgba(37,99,235,0.6)] animate-pulse pointer-events-none`}>
             Click and Drag to Rotate | Hover to Unlock
           </div>
        </Html>
      </group>
    </Float>
  );
}

const RealWorldLockerScene = () => {
  return (
    <div className="w-full h-[400px] md:h-[500px] relative z-10 cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} shadows>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} color="#ffffff" castShadow shadow-mapSize={[1024, 1024]} />
        <spotLight position={[-5, 5, 5]} angle={0.5} penumbra={1} intensity={1} color="#60a5fa" castShadow />
        <Suspense fallback={null}>
          <PresentationControls 
            global={false} 
            cursor={true}
            snap={true}
            speed={1.5} 
            zoom={1}
            rotation={[0, -Math.PI / 6, 0]} 
            polar={[-Math.PI / 8, Math.PI / 8]} 
            azimuth={[-Math.PI / 3, Math.PI / 3]}
          >
            <RealWorldLocker />
          </PresentationControls>
          <Environment preset="city" />
          <ContactShadows position={[0, -2.5, 0]} opacity={0.6} scale={15} blur={2.5} far={4} color="#000000" />
        </Suspense>
      </Canvas>
    </div>
  );
};

// --- Animations ---
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function Home() {
  const { userRole, currentUser } = useAuth();
  
  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 font-sans selection:bg-blue-500/40 selection:text-white min-h-screen">
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-24 pb-12 lg:pt-32 lg:pb-28 overflow-hidden min-h-[90vh] flex flex-col lg:flex-row items-center lg:justify-between">
        {/* Lighter Elevated Ambient Glow */}
        <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] bg-blue-500/15 rounded-full blur-[180px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-indigo-500/15 rounded-full blur-[180px] pointer-events-none"></div>

        {/* Subtle background grid pattern */}
        <div className="absolute inset-0 z-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#60a5fa 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        
        {/* Left side Text Content */}
        <div className="max-w-7xl mx-auto px-6 w-full relative z-10 pointer-events-none flex-1 lg:flex-none">
          <motion.div 
            className="w-full lg:w-[50%] flex flex-col items-start gap-6 lg:gap-8 pointer-events-auto pt-8 lg:pt-0"
            initial="hidden" animate="visible" variants={staggerContainer}
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[0.8rem] md:text-sm font-semibold shadow-sm backdrop-blur-md">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-400"></span>
              </span>
              Enterprise Grade Locker System
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] drop-shadow-sm">
              Intelligent Storage for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">Modern Campus.</span>
            </motion.h1>
            
            <motion.p variants={fadeUp} className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-lg font-light">
              Securefy provides fully autonomous, contactless, and highly secure smart locker infrastructure powered by immediate QR tokenization. 
            </motion.p>
            
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-2 lg:mt-4">
              {userRole === 'admin' ? (
                <Link to="/admin" className="px-6 sm:px-8 py-3.5 sm:py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] flex items-center justify-center gap-2 hover:-translate-y-1">
                  Launch Admin Console <FaArrowRight />
                </Link>
              ) : (
                <>
                  <Link to="/book-locker" className="px-6 sm:px-8 py-3.5 sm:py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] flex items-center justify-center gap-2 hover:-translate-y-1 text-center">
                    Reserve a Locker <FaArrowRight />
                  </Link>
                  <Link to="/availability" className="px-6 sm:px-8 py-3.5 sm:py-4 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded-xl font-bold transition-all duration-300 shadow-sm flex items-center justify-center hover:-translate-y-1 backdrop-blur-md text-center">
                    Live Availability
                  </Link>
                </>
              )}
            </motion.div>
            
            <motion.div variants={fadeUp} className="flex flex-wrap lg:flex-nowrap items-center gap-4 lg:gap-6 mt-4 lg:mt-6 text-xs sm:text-sm font-medium text-slate-300">
              <div className="flex items-center gap-2"><FaCheckCircle className="text-emerald-400 text-base lg:text-lg drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" /> Keyless Entry</div>
              <div className="flex items-center gap-2"><FaCheckCircle className="text-emerald-400 text-base lg:text-lg drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" /> 24/7 Access</div>
              <div className="flex items-center gap-2"><FaCheckCircle className="textemerald-400 text-base lg:text-lg drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" /> Cloud Managed</div>
            </motion.div>
          </motion.div>
        </div>

        {/* Right side 3D element */}
        <Hero3DScene />
      </section>

      {/* --- STATS & TRUST STRIP --- */}
      <section className="bg-slate-800/50 border-y border-slate-700/80 py-12 relative z-20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-700/80">
            <div className="text-center px-4">
              <h4 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300 mb-2 drop-shadow-sm">500+</h4>
              <p className="text-slate-300 font-semibold uppercase tracking-widest text-xs">Lockers Deployed</p>
            </div>
            <div className="text-center px-4">
              <h4 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300 mb-2 drop-shadow-sm">99.9%</h4>
              <p className="text-slate-300 font-semibold uppercase tracking-widest text-xs">System Uptime</p>
            </div>
            <div className="text-center px-4">
              <h4 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300 mb-2 drop-shadow-sm">&lt;1s</h4>
              <p className="text-slate-300 font-semibold uppercase tracking-widest text-xs">Unlock Latency</p>
            </div>
            <div className="text-center px-4">
              <h4 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300 mb-2 drop-shadow-sm">AES<span className="text-3xl font-bold">256</span></h4>
              <p className="text-slate-300 font-semibold uppercase tracking-widest text-xs">Data Encryption</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CORE FEATURES --- */}
      <section className="py-32 bg-slate-900 relative overflow-hidden z-20">
        {/* Soft lighting for section details */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <h2 className="text-blue-400 font-bold tracking-[0.2em] uppercase text-xs mb-4">Enterprise Features</h2>
            <h3 className="text-4xl md:text-5xl font-black text-white mb-6">Designed for Reliability and Scale</h3>
            <p className="text-xl text-slate-300 leading-relaxed font-light">
              Whether deployed in universities, corporate offices, or public facilities, Securefy delivers a seamless user experience backed by robust administration tools.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once:true, margin: "-100px" }} transition={{ duration: 0.6 }}
              className="bg-slate-800/80 border border-slate-700/80 p-10 rounded-3xl shadow-lg hover:border-blue-400/50 hover:bg-slate-800 hover:shadow-[0_10px_30px_rgba(59,130,246,0.2)] transition-all duration-300 group backdrop-blur-sm"
            >
              <div className="w-16 h-16 bg-slate-900 group-hover:bg-blue-600/20 border border-slate-700 group-hover:border-blue-500/50 rounded-2xl flex items-center justify-center text-blue-400 mb-8 transition-colors duration-300">
                <FaQrcode className="text-3xl drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
              </div>
              <h4 className="text-2xl font-bold text-slate-100 mb-4">Dynamic QR Access</h4>
              <p className="text-slate-300 text-lg leading-relaxed font-light group-hover:text-slate-200 transition-colors">
                Tokens are generated instantly and rotate synchronously. Your smartphone is the only key you will ever need to securely access your storage.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once:true, margin: "-100px" }} transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-slate-800/80 border border-slate-700/80 p-10 rounded-3xl shadow-lg hover:border-emerald-400/50 hover:bg-slate-800 hover:shadow-[0_10px_30px_rgba(16,185,129,0.2)] transition-all duration-300 group backdrop-blur-sm"
            >
              <div className="w-16 h-16 bg-slate-900 group-hover:bg-emerald-600/20 border border-slate-700 group-hover:border-emerald-500/50 rounded-2xl flex items-center justify-center text-emerald-400 mb-8 transition-colors duration-300">
                <FaUserShield className="text-3xl drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
              </div>
              <h4 className="text-2xl font-bold text-slate-100 mb-4">Granular Access Control</h4>
              <p className="text-slate-300 text-lg leading-relaxed font-light group-hover:text-slate-200 transition-colors">
                Administrators can monitor live statuses, override locks remotely, and manage user permissions through an intuitive central dashboard.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once:true, margin: "-100px" }} transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-slate-800/80 border border-slate-700/80 p-10 rounded-3xl shadow-lg hover:border-indigo-400/50 hover:bg-slate-800 hover:shadow-[0_10px_30px_rgba(99,102,241,0.2)] transition-all duration-300 group backdrop-blur-sm"
            >
              <div className="w-16 h-16 bg-slate-900 group-hover:bg-indigo-600/20 border border-slate-700 group-hover:border-indigo-500/50 rounded-2xl flex items-center justify-center text-indigo-400 mb-8 transition-colors duration-300">
                <FaDatabase className="text-3xl drop-shadow-[0_0_10px_rgba(129,140,248,0.5)]" />
              </div>
              <h4 className="text-2xl font-bold text-slate-100 mb-4">Immutable Audit Logs</h4>
              <p className="text-slate-300 text-lg leading-relaxed font-light group-hover:text-slate-200 transition-colors">
                Every booking, scan, and door opening event is logged in real-time, providing comprehensive security auditing and utilization analytics.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS / IMAGE & TEXT --- */}
      <section className="py-32 bg-slate-800 border-t border-slate-700/60 relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            {/* Real World Interactive Locker Animation */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once:true, margin: "-100px" }} transition={{ duration: 0.7 }}
              className="w-full lg:w-1/2 relative flex items-center justify-center"
            >
              {/* Background Ambient Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>
              
              <RealWorldLockerScene />
            </motion.div>

            {/* Text Content */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once:true, margin: "-100px" }} transition={{ duration: 0.7 }}
              className="w-full lg:w-1/2 flex flex-col items-start"
            >
              <h2 className="text-4xl md:text-5xl font-black text-white mb-8 leading-tight">Frictionless from <br/>Reservation to Retrieval</h2>
              
              <div className="space-y-10 mt-6">
                <div className="flex gap-6">
                  <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-blue-400 font-bold text-2xl shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.15)]">1</div>
                  <div>
                    <h4 className="text-2xl font-bold text-white mb-2">Book Online</h4>
                    <p className="text-slate-300 text-lg font-light leading-relaxed">Select an available locker through the portal and instantly secure your reservation.</p>
                  </div>
                </div>
                
                <div className="flex gap-6">
                  <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-blue-400 font-bold text-2xl shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.15)]">2</div>
                  <div>
                    <h4 className="text-2xl font-bold text-white mb-2">Receive Digital Key</h4>
                    <p className="text-slate-300 text-lg font-light leading-relaxed">A secure, encrypted QR token is generated exclusively for your active session.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-blue-400 font-bold text-2xl shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.15)]">3</div>
                  <div>
                    <h4 className="text-2xl font-bold text-white mb-2">Scan & Store</h4>
                    <p className="text-slate-300 text-lg font-light leading-relaxed">Present the QR code at the terminal. Your assigned locker door unlatches automatically.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- CTA BOTTOM --- */}
      <section className="bg-slate-900 py-32 relative overflow-hidden z-20 border-t border-slate-800">
        {/* Background decorative circles */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[600px] h-[600px] bg-blue-500/15 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-[120px]"></div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 tracking-tight leading-tight">
              Ready to upgrade your storage infrastructure?
            </h2>
            <p className="text-2xl text-slate-300 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
              Implement a reliable, cloud-managed locker system today and give your users the seamless contactless experience they expect.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              {currentUser ? (
                <Link to="/book-locker" className="px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-xl transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_rgba(37,99,235,0.6)] hover:-translate-y-1">
                  Make a Reservation
                </Link>
              ) : (
                <>
                  <Link to="/register" className="px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-xl transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_rgba(37,99,235,0.6)] hover:-translate-y-1">
                    Get Started
                  </Link>
                  <Link to="/login" className="px-12 py-5 bg-slate-800 border border-slate-600 hover:border-slate-500 hover:bg-slate-700 text-white rounded-full font-bold text-xl transition-all shadow-sm">
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
