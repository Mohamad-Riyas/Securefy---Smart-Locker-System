import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { FaBatteryFull, FaBolt, FaThermometerHalf, FaWifi, FaExclamationTriangle } from "react-icons/fa";
import { toast } from "react-toastify";

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalLockers: 0,
        availableLockers: 0,
        bookedLockers: 0,
        maintenanceLockers: 0,
        dailyDiff: "+12%" // Mock data
    });
    const [lockerGrid, setLockerGrid] = useState([]);
    const [recentLogs, setRecentLogs] = useState([]);

    const handleEmergencyUnlock = async () => {
        if (window.confirm("⚠️ EMERGENCY OVERRIDE ⚠️\n\nAre you sure you want to UNLOCK ALL LOCKERS?\nThis will clear all current bookings and open all doors.")) {
            try {
                const batch = writeBatch(db);
                const querySnapshot = await getDocs(collection(db, "lockers"));

                querySnapshot.forEach((doc) => {
                    batch.update(doc.ref, { status: "available" });
                });

                await batch.commit();
                toast.success("🚨 EMERGENCY UNLOCK SUCCESSFUL: All lockers opened");
                // Refresh to show updates
                setTimeout(() => window.location.reload(), 1500);
            } catch (error) {
                console.error("Error upgrading lockers:", error);
                toast.error("Emergency unlock failed: " + error.message);
            }
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const lockersSnapshot = await getDocs(collection(db, "lockers"));
                const lockersDocs = lockersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                const total = lockersDocs.length;
                const available = lockersDocs.filter(l => l.status === "available").length;
                const booked = lockersDocs.filter(l => l.status === "booked").length;
                const maintenance = lockersDocs.filter(l => l.status === "maintenance").length;

                // Fetch Recent Bookings for Logs
                const bookingsSnapshot = await getDocs(collection(db, "bookings"));
                let logs = [];
                bookingsSnapshot.forEach(doc => {
                    const data = doc.data();
                    // Add booking to logs
                    if (logs.length < 5) {
                        logs.push({
                            id: doc.id,
                            message: `Locker ${data.lockerId || 'Unknown'} booked`,
                            time: data.startTime && data.startTime.toDate ? data.startTime.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now',
                            type: 'success'
                        });
                    }
                });

                if (maintenance > 0) {
                    logs.unshift({
                        id: 'maintenance-alert',
                        message: `${maintenance} lockers require service`,
                        time: 'Urgent',
                        type: 'danger'
                    });
                }

                setStats({
                    totalLockers: total,
                    availableLockers: available,
                    bookedLockers: booked,
                    maintenanceLockers: maintenance,
                    dailyDiff: "+8.5%"
                });

                setLockerGrid(lockersDocs); // Store for grid visualization
                setRecentLogs(logs);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
        };

        fetchData();
    }, []);

    // Mock Data for "Hourly Pickup Volume" Chart
    const chartData = [
        { time: "06:00", volume: 12 },
        { time: "09:00", volume: 45 },
        { time: "12:00", volume: 89 },
        { time: "15:00", volume: 64 },
        { time: "18:00", volume: 112 },
        { time: "21:00", volume: 34 },
    ];

    return (
        <div className="container-fluid p-0">
            <h1 className="section-header">Dashboard</h1>

            {/* BENTO GRID LAYOUT */}
            <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>

                {/* 1. PRIMARY STAT: Total Lockers (Large) */}
                <div className="stat-card-aura" style={{ gridColumn: 'span 2' }}>
                    <div>
                        <div className="stat-label">Total Lockers</div>
                        <div className="stat-value" style={{ color: '#f8fafc' }}>{stats.totalLockers}</div>
                        <div className="stat-subtext" style={{ color: '#10B981' }}>
                            {stats.availableLockers} Currently Available
                        </div>
                    </div>
                    <div style={{ marginTop: '20px', height: '120px' }}>
                        {/* Mini Sparkline Area Chart */}
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="volume" stroke="#6366f1" fillOpacity={1} fill="url(#colorVolume)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. EMERGENCY CONTROL: Unlock All (Square) */}
                <div className="stat-card-aura" style={{ background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                    <div className="stat-label" style={{ color: '#ef4444' }}>Emergency Control</div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: 'rgba(239, 68, 68, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ef4444',
                            fontSize: '1.5rem',
                            animation: 'pulse 2s infinite'
                        }}>
                            <FaExclamationTriangle />
                        </div>
                        <button
                            className="btn btn-danger w-100 fw-bold"
                            style={{ background: '#ef4444', border: 'none', boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)' }}
                            onClick={handleEmergencyUnlock}
                        >
                            UNLOCK ALL LOCKERS
                        </button>
                        <div className="small text-center" style={{ color: '#fca5a5', fontSize: '0.7rem' }}>
                            *Forces all doors open immediately
                        </div>
                    </div>
                </div>

                {/* 3. TERTIARY STAT: Live Occupancy (Square) */}
                <div className="stat-card-aura">
                    <div className="stat-label">Live Occupancy</div>
                    <div className="stat-value" style={{ color: '#f8fafc' }}>{stats.bookedLockers} / {stats.totalLockers}</div>
                    <div className="progress mt-3" style={{ height: '6px', backgroundColor: '#334155' }}>
                        <div
                            className="progress-bar"
                            role="progressbar"
                            style={{
                                width: `${(stats.bookedLockers / stats.totalLockers) * 100}%`,
                                backgroundColor: '#6366f1',
                                boxShadow: '0 0 10px rgba(99, 102, 241, 0.5)'
                            }}
                        />
                    </div>
                    <div className="stat-subtext mt-2" style={{ color: '#94a3b8' }}>
                        {Math.round((stats.bookedLockers / stats.totalLockers) * 100) || 0}% Utilization
                    </div>
                </div>

                {/* 4. VISUAL ANALYTICS: Hourly Pickup Volume (Wide) */}
                <div className="stat-card-aura" style={{ gridColumn: 'span 3', minHeight: '300px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div className="stat-label">Hourly Pickup Volume</div>
                        <select className="form-select form-select-sm" style={{ width: 'auto', border: '1px solid #334155', background: '#0f172a', color: '#94a3b8' }}>
                            <option>Today</option>
                            <option>Yesterday</option>
                        </select>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <CartesianGrid vertical={false} stroke="#334155" strokeDasharray="3 3" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
                                itemStyle={{ color: '#f8fafc' }}
                                cursor={{ stroke: '#6366f1', strokeWidth: 1 }}
                            />
                            <Area type="monotone" dataKey="volume" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorGradient)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* 5. ALERTS SIDEBAR (Tall) */}
                <div className="stat-card-aura" style={{ gridRow: 'span 2' }}>
                    <div className="stat-label">Activity Feed</div>
                    <div className="mt-3">
                        {recentLogs.length > 0 ? recentLogs.map((log, i) => (
                            <div key={i} className="feed-item d-flex gap-3 align-items-start mb-3" style={{ borderBottomColor: '#334155' }}>
                                <div className={`status-dot dot-${log.type === 'danger' ? 'red' : log.type === 'warning' ? 'amber' : 'green'} mt-1`}></div>
                                <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#e2e8f0' }}>{log.message}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{log.time}</div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-muted small">No recent activity</div>
                        )}

                        <div className="mt-4 pt-3 border-top" style={{ borderColor: '#334155' }}>
                            <div className="stat-label mb-2">Maintenance Queue</div>
                            {stats.maintenanceLockers > 0 ? (
                                <div className="alert alert-warning py-2 px-3 small border-0" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                    <FaBolt className="me-2" />
                                    {stats.maintenanceLockers} devices offline
                                </div>
                            ) : (
                                <div className="d-flex align-items-center text-success small">
                                    <FaCheckCircle className="me-2" /> All systems normal
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 6. LOCKER STATUS GRID (Wide) */}
                <div className="stat-card-aura" style={{ gridColumn: 'span 3' }}>
                    <div className="stat-label mb-3">Locker Matrix Status</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', gap: '8px' }}>
                        {lockerGrid.map(locker => (
                            <div
                                key={locker.id}
                                title={`Locker ${locker.lockerId} - ${locker.status}`}
                                style={{
                                    aspectRatio: '1',
                                    backgroundColor: locker.status === 'booked' ? '#6366f1' : locker.status === 'maintenance' ? '#F59E0B' : 'rgba(255,255,255,0.05)',
                                    borderRadius: '6px',
                                    border: locker.status === 'available' ? '1px solid #334155' : 'none',
                                    boxShadow: locker.status === 'booked' ? '0 0 10px rgba(99, 102, 241, 0.4)' : 'none',
                                    display: 'grid',
                                    placeItems: 'center',
                                    color: locker.status === 'booked' ? 'white' : '#94a3b8',
                                    fontSize: '0.65rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s'
                                }}
                                className="locker-cell"
                            >
                                {locker.lockerId}
                            </div>
                        ))}
                    </div>

                    <div className="d-flex gap-4 mt-3 small" style={{ color: '#94a3b8' }}>
                        <div className="d-flex align-items-center"><span className="status-dot me-2" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #334155', width: '12px', height: '12px' }}></span> Available</div>
                        <div className="d-flex align-items-center"><span className="status-dot me-2" style={{ background: '#6366f1', boxShadow: '0 0 5px #6366f1', width: '12px', height: '12px' }}></span> Occupied</div>
                        <div className="d-flex align-items-center"><span className="status-dot me-2" style={{ background: '#F59E0B', width: '12px', height: '12px' }}></span> Maintenance</div>
                    </div>
                </div>

            </div>
        </div>
    );
};

/* Helper Icon */
const FaCheckCircle = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
)

export default AdminDashboard;
