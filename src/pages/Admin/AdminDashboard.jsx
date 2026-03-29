import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, writeBatch, doc, onSnapshot } from "firebase/firestore";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { FaBolt, FaExclamationTriangle, FaCheckCircle, FaLockOpen } from "react-icons/fa";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Stars, Float, PerspectiveCamera } from "@react-three/drei";

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalLockers: 0,
        availableLockers: 0,
        bookedLockers: 0,
        maintenanceLockers: 0,
        dailyDiff: "+12%"
    });
    const [lockerGrid, setLockerGrid] = useState([]);
    const [recentLogs, setRecentLogs] = useState([]);
    const [chartData, setChartData] = useState([]);

    const handleEmergencyUnlock = async () => {
        if (window.confirm("⚠️ EMERGENCY OVERRIDE ⚠️\n\nAre you sure you want to UNLOCK ALL LOCKERS?\nThis will clear all current bookings and open all doors.")) {
            try {
                // 1. Log the intent to the backend for ESP32 polling
                const res = await fetch("https://securefy-smart-locker-system.onrender.com/cloudUnlockAll", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" }
                });
                
                if (!res.ok) throw new Error("Could not send command to cloud");

                // 2. Clean up database
                const batch = writeBatch(db);
                const querySnapshot = await getDocs(collection(db, "lockers"));
                querySnapshot.forEach((doc) => {
                    batch.update(doc.ref, { 
                        status: "available",
                        currentBookingId: null 
                    });
                });

                // Cancel all active bookings
                const bookingSnap = await getDocs(collection(db, "bookings"));
                bookingSnap.forEach((doc) => {
                    const data = doc.data();
                    if(data.status === "active") {
                        batch.update(doc.ref, { status: "cancelled" });
                    }
                });

                await batch.commit();
                toast.success("🚨 EMERGENCY UNLOCK SUCCESSFUL: All lockers opened");
                setTimeout(() => window.location.reload(), 2000);
            } catch (error) {
                console.error("Error upgrading lockers:", error);
                toast.error("Emergency unlock failed: " + error.message);
            }
        }
    };

    useEffect(() => {
        const unsubscribeLockers = onSnapshot(collection(db, "lockers"), (lockersSnapshot) => {
            const lockersDocs = lockersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const total = lockersDocs.length;
            const available = lockersDocs.filter(l => l.status === "available" || !l.status).length;
            const booked = lockersDocs.filter(l => l.status === "booked" || l.status === "reserved" || l.status === "occupied").length;
            const maintenance = lockersDocs.filter(l => l.status === "maintenance").length;

            setStats(prev => ({
                ...prev,
                totalLockers: total,
                availableLockers: available,
                bookedLockers: booked,
                maintenanceLockers: maintenance
            }));

            setLockerGrid(lockersDocs);
        });

        const unsubscribeBookings = onSnapshot(collection(db, "bookings"), (bookingsSnapshot) => {
            const groupedHours = [
                { time: "00:00", volume: 0 }, { time: "03:00", volume: 0 }, { time: "06:00", volume: 0 },
                { time: "09:00", volume: 0 }, { time: "12:00", volume: 0 }, { time: "15:00", volume: 0 },
                { time: "18:00", volume: 0 }, { time: "21:00", volume: 0 }
            ];
            
            let allLogs = [];

            bookingsSnapshot.forEach(doc => {
                const data = doc.data();
                
                if (data.startTime && data.startTime.toDate) {
                    const hour = data.startTime.toDate().getHours();
                    const groupIndex = Math.floor(hour / 3);
                    if (groupIndex >= 0 && groupIndex <= 7) {
                        groupedHours[groupIndex].volume += 1;
                    }
                }

                allLogs.push({
                    id: doc.id,
                    message: `${data.userName || data.userEmail || 'A user'} booked Node ${data.lockerId || 'Unknown'}`,
                    time: data.startTime && data.startTime.toDate ? data.startTime.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now',
                    timeMillis: data.startTime && data.startTime.toMillis ? data.startTime.toMillis() : Date.now(),
                    type: 'success'
                });
            });
            
            setChartData(groupedHours);

            // Sort logs by newest first and take top 5
            allLogs.sort((a,b) => b.timeMillis - a.timeMillis);
            setRecentLogs(allLogs.slice(0, 5));
        });

        return () => {
            unsubscribeLockers();
            unsubscribeBookings();
        };
    }, []);



    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
    };

    return (
        <div className="relative min-h-full w-full">
            
            {/* 3D Background Canvas */}
            <div className="absolute inset-0 -z-10 rounded-2xl overflow-hidden pointer-events-none opacity-40">
                <Canvas>
                    <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                    <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
                    <ambientLight intensity={0.5} />
                    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                        <mesh position={[2, 0, -2]}>
                            <octahedronGeometry args={[1, 0]} />
                            <meshStandardMaterial color="#6366f1" wireframe emissive="#6366f1" emissiveIntensity={0.5} />
                        </mesh>
                    </Float>
                    <Float speed={1.5} rotationIntensity={0.8} floatIntensity={2}>
                        <mesh position={[-3, 1, -5]}>
                            <icosahedronGeometry args={[1.5, 0]} />
                            <meshStandardMaterial color="#34d399" wireframe emissive="#10b981" emissiveIntensity={0.2} opacity={0.5} transparent />
                        </mesh>
                    </Float>
                </Canvas>
            </div>

            <div className="flex justify-between items-end mb-8 relative z-10">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">System Matrix</h1>
                    <p className="text-slate-400 mt-1">Real-time telemetry and overview.</p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
                    System Online
                </div>
            </div>

            {/* BENTO GRID */}
            <motion.div 
                variants={containerVariants} 
                initial="hidden" 
                animate="show" 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10"
            >
                {/* 1. PRIMARY: Total Lockers */}
                <motion.div variants={itemVariants} className="col-span-1 lg:col-span-2 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/20 blur-3xl rounded-full group-hover:bg-indigo-500/30 transition-colors"></div>
                    <div>
                        <div className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Total Lockers</div>
                        <div className="text-5xl font-black text-slate-100 mt-2">{stats.totalLockers}</div>
                        <div className="text-emerald-400 font-medium mt-1 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">
                            {stats.availableLockers} Currently Available
                        </div>
                    </div>
                    <div className="mt-6 h-28 -mx-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorVolumeSmall" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="volume" stroke="#818cf8" fillOpacity={1} fill="url(#colorVolumeSmall)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* 2. EMERGENCY CONTROL */}
                <motion.div variants={itemVariants} className="bg-rose-950/30 backdrop-blur-xl border border-rose-900/50 rounded-3xl p-6 shadow-2xl flex flex-col justify-between group overflow-hidden relative">
                    <div className="absolute inset-0 bg-rose-500/5 rotate-45 scale-150 transform transition-transform group-hover:rotate-90 duration-1000"></div>
                    <div className="relative z-10 flex items-center gap-3 text-rose-500">
                        <FaExclamationTriangle className="animate-pulse" />
                        <span className="text-sm font-semibold uppercase tracking-wider">Emergency</span>
                    </div>
                    <div className="relative z-10 flex flex-col items-center mt-4 gap-4">
                        <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(244,63,94,0.4)] group-hover:scale-110 transition-transform">
                            <FaLockOpen />
                        </div>
                        <button
                            className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(225,29,72,0.5)] transition-all active:scale-95"
                            onClick={handleEmergencyUnlock}
                        >
                            UNLOCK ALL
                        </button>
                    </div>
                </motion.div>

                {/* 3. TERTIARY: Live Occupancy */}
                <motion.div variants={itemVariants} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl">
                    <div className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Live Occupancy</div>
                    <div className="text-4xl font-black text-slate-100 mt-4">{stats.bookedLockers} <span className="text-2xl text-slate-500">/ {stats.totalLockers}</span></div>
                    
                    <div className="w-full bg-slate-800 rounded-full h-2.5 mt-6 overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(stats.bookedLockers / (stats.totalLockers || 1)) * 100}%` }}
                            transition={{ duration: 1.5, delay: 0.5, type: 'spring' }}
                            className="bg-indigo-500 h-2.5 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)]"
                        ></motion.div>
                    </div>
                    <div className="text-slate-500 text-sm mt-3 font-medium">
                        {Math.round((stats.bookedLockers / (stats.totalLockers || 1)) * 100) || 0}% Utilization
                    </div>
                </motion.div>

                {/* 4. VISUAL ANALYTICS */}
                <motion.div variants={itemVariants} className="col-span-1 lg:col-span-3 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl min-h-[300px]">
                    <div className="flex justify-between items-center mb-6">
                        <div className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Hourly Pickup Volume</div>
                        <select className="bg-slate-950 border border-slate-700 text-slate-300 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block px-3 py-1.5 outline-none">
                            <option>Today</option>
                            <option>Yesterday</option>
                        </select>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorGradientMain" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <CartesianGrid vertical={false} stroke="#1e293b" strokeDasharray="4 4" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#f8fafc', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                                    itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                                    cursor={{ stroke: '#4f46e5', strokeWidth: 2, strokeDasharray: '4 4' }}
                                />
                                <Area type="monotone" dataKey="volume" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorGradientMain)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* 5. ALERTS SIDEBAR */}
                <motion.div variants={itemVariants} className="col-span-1 lg:col-span-1 row-span-1 lg:row-span-2 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col">
                    <div className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-6">Activity Feed</div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                        {recentLogs.length > 0 ? recentLogs.map((log, i) => (
                            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} key={i} className="flex gap-4 items-start pb-4 border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 p-2 rounded-xl transition-colors">
                                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 animate-pulse ${log.type === 'danger' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' : log.type === 'warning' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'}`}></div>
                                <div>
                                    <div className="text-sm font-medium text-slate-200">{log.message}</div>
                                    <div className="text-xs text-slate-500 mt-1">{log.time}</div>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="text-slate-500 text-sm text-center py-4">No recent activity</div>
                        )}
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-800">
                        <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Maintenance Queue</div>
                        {stats.maintenanceLockers > 0 ? (
                            <div className="bg-amber-900/20 border border-amber-900/50 text-amber-500 py-3 px-4 rounded-xl text-sm flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FaBolt />
                                    <span>Devices Offline</span>
                                </div>
                                <span className="font-bold">{stats.maintenanceLockers}</span>
                            </div>
                        ) : (
                            <div className="bg-emerald-900/10 border border-emerald-900/30 text-emerald-500 py-3 px-4 rounded-xl text-sm flex items-center gap-2">
                                <FaCheckCircle /> All systems optimal
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* 6. LOCKER STATUS GRID */}
                <motion.div variants={itemVariants} className="col-span-1 lg:col-span-3 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl">
                    <div className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-6">Locker Matrix View</div>
                    
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(3rem,1fr))] gap-3">
                        {lockerGrid.map((locker, i) => (
                            <motion.div
                                key={locker.id}
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.02 }}
                                whileHover={{ scale: 1.1, translateY: -2 }}
                                title={`Locker ${locker.lockerId} - ${locker.status}`}
                                className={`
                                    relative aspect-square rounded-xl flex items-center justify-center text-xs font-black cursor-pointer shadow-lg
                                    ${locker.status === 'booked' 
                                        ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] border border-indigo-400' 
                                        : locker.status === 'maintenance' 
                                        ? 'bg-amber-500 bg-opacity-20 text-amber-500 border border-amber-500/50' 
                                        : 'bg-slate-800 text-slate-500 border border-slate-700 hover:bg-slate-700'
                                    }
                                `}
                            >
                                {locker.lockerId}
                                {locker.status === 'booked' && (
                                    <div className="absolute inset-0 bg-white opacity-20 rounded-xl animate-ping" style={{ animationDuration: '3s' }}></div>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    <div className="flex gap-6 mt-6 pt-6 border-t border-slate-800 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-md bg-slate-800 border border-slate-600"></div> 
                            <span>Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-md bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div> 
                            <span>Occupied</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-md bg-amber-500/20 border border-amber-500/50"></div> 
                            <span>Maintenance</span>
                        </div>
                    </div>
                </motion.div>

            </motion.div>
        </div>
    );
};

export default AdminDashboard;
