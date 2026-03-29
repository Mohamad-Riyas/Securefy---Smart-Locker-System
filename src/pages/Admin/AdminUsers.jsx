import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, updateDoc, doc, query, where, onSnapshot } from "firebase/firestore";
import { toast } from "react-toastify";
import { FaUserShield, FaBan, FaCheckCircle, FaHistory, FaSearch, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userBookings, setUserBookings] = useState([]);

    const usersCollectionRef = collection(db, "users");

    useEffect(() => {
        const unsubscribe = onSnapshot(usersCollectionRef, (snapshot) => {
            setUsers(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        });
        return () => unsubscribe();
    }, []);

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
        try {
            const userDoc = doc(db, "users", id);
            await updateDoc(userDoc, { status: newStatus });
            toast.success(`User ${newStatus === 'active' ? 'activated' : 'suspended'}`);
        } catch (error) {
            toast.error("Error updating user status: " + error.message);
        }
    };

    const toggleRole = async (id, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        try {
            const userDoc = doc(db, "users", id);
            await updateDoc(userDoc, { role: newRole });
            toast.success(`User role updated to ${newRole}`);
        } catch (error) {
            toast.error("Error updating user role: " + error.message);
        }
    };

    const [historyUnsubscribe, setHistoryUnsubscribe] = useState(null);

    const handleViewHistory = (user) => {
        setSelectedUser(user);
        setUserBookings([]);
        setShowHistoryModal(true);
        
        if (historyUnsubscribe) historyUnsubscribe();

        try {
            const bookingsRef = collection(db, "bookings");
            const q = query(bookingsRef, where("userId", "==", user.uid || user.id)); 
            
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const bookings = querySnapshot.docs.map(doc => {
                    const d = doc.data();
                    return {
                        id: doc.id,
                        ...d,
                        date: d.startTime && d.startTime.toDate ? d.startTime.toDate().toLocaleDateString() : 'N/A',
                        timeMillis: d.startTime && d.startTime.toMillis ? d.startTime.toMillis() : Date.now()
                    };
                });
                bookings.sort((a,b) => b.timeMillis - a.timeMillis);
                setUserBookings(bookings);
            });
            setHistoryUnsubscribe(() => unsubscribe);
        } catch (error) {
            console.error("Error fetching user history realtime:", error);
            toast.error("Error loading live history.");
        }
    };

    const closeHistoryModal = () => {
        setShowHistoryModal(false);
        if (historyUnsubscribe) {
            historyUnsubscribe();
            setHistoryUnsubscribe(null);
        }
    };

    const filteredUsers = users.filter((user) =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="relative min-h-[90vh] w-full flex flex-col pt-4">
            
            <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 relative z-10 w-full gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Identity Access</h1>
                    <p className="text-slate-400 mt-1">Manage network users, privileges, and connection history.</p>
                </div>
                
                <div className="relative w-full md:w-80 group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                        <FaSearch />
                    </div>
                    <input
                        type="text"
                        className="w-full bg-slate-900/60 backdrop-blur-md border border-slate-700 focus:border-indigo-500 text-slate-200 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-lg transition-all"
                        placeholder="Search name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute inset-x-0 h-px top-0 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
                
                <div className="overflow-x-auto w-full">
                    <table className="w-full whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-900/40 text-left text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                                <th className="px-6 py-5 font-semibold">User Identity</th>
                                <th className="px-6 py-5 font-semibold">Email</th>
                                <th className="px-6 py-5 font-semibold">Clearance</th>
                                <th className="px-6 py-5 font-semibold">Node Status</th>
                                <th className="px-6 py-5 font-semibold text-right">Overrides</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50 text-sm">
                            <AnimatePresence>
                                {filteredUsers.map((user, index) => (
                                    <motion.tr 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: index * 0.05 }}
                                        key={user.id} 
                                        className="hover:bg-slate-800/30 transition-colors group"
                                    >
                                        <td className="px-6 py-5 text-slate-200 font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                                                    {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                                                </div>
                                                {user.name || 'Unknown Protocol'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-slate-400">{user.email}</td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                                                user.role === 'admin' 
                                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.2)]' 
                                                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${user.status === 'suspended' ? 'bg-amber-500 shadow-[0_0_5px_#f59e0b]' : 'bg-emerald-500 shadow-[0_0_5px_#10b981]'}`}></div>
                                                <span className={user.status === 'suspended' ? 'text-amber-500' : 'text-emerald-400'}>
                                                    {user.status === 'suspended' ? 'Suspended' : 'Active'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right flex justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} 
                                                className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-colors border border-indigo-500/20 cursor-pointer"
                                                onClick={() => toggleRole(user.id, user.role)}
                                                title={user.role === 'admin' ? 'Revoke Admin' : 'Grant Admin'}
                                            >
                                                <FaUserShield />
                                            </motion.button>
                                            
                                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} 
                                                className={`p-2 rounded-lg transition-colors border cursor-pointer ${
                                                    user.status === 'suspended' 
                                                    ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border-emerald-500/20' 
                                                    : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white border-amber-500/20'
                                                }`}
                                                onClick={() => toggleStatus(user.id, user.status)}
                                                title={user.status === 'suspended' ? 'Reactivate Node' : 'Suspend Node'}
                                            >
                                                {user.status === 'suspended' ? <FaCheckCircle /> : <FaBan />}
                                            </motion.button>

                                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} 
                                                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors border border-slate-700 cursor-pointer"
                                                onClick={() => handleViewHistory(user)}
                                                title="View Access History"
                                            >
                                                <FaHistory />
                                            </motion.button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                    
                    {filteredUsers.length === 0 && (
                        <div className="p-12 text-center text-slate-500">
                            No active identities found matching your query.
                        </div>
                    )}
                </div>
            </div>

            {/* History Modal */}
            <AnimatePresence>
                {showHistoryModal && selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                            onClick={closeHistoryModal}
                        ></motion.div>
                        
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                        >
                            <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                                <div>
                                    <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
                                        <FaHistory className="text-indigo-400" />
                                        Access Log
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">{selectedUser.name || selectedUser.email}</p>
                                </div>
                                <button onClick={closeHistoryModal} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer">
                                    <FaTimes />
                                </button>
                            </div>
                            
                            <div className="overflow-y-auto w-full custom-scrollbar p-0 flex-1">
                                {userBookings.length > 0 ? (
                                    <table className="w-full whitespace-nowrap text-left text-sm">
                                        <thead className="bg-slate-900 sticky top-0 z-10">
                                            <tr className="text-xs uppercase tracking-wider text-slate-500 border-b border-slate-800">
                                                <th className="px-6 py-4 font-semibold">Node Code</th>
                                                <th className="px-6 py-4 font-semibold">Timestamp</th>
                                                <th className="px-6 py-4 font-semibold">Status</th>
                                                <th className="px-6 py-4 font-semibold">Cost</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/50">
                                            {userBookings.map((booking, i) => (
                                                <motion.tr 
                                                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                                    key={booking.id} 
                                                    className="hover:bg-slate-800/30 transition-colors"
                                                >
                                                    <td className="px-6 py-4 text-indigo-400 font-mono font-bold">{booking.lockerId}</td>
                                                    <td className="px-6 py-4 text-slate-300">{booking.date}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                                            booking.status === 'active' 
                                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                                            : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                                        }`}>
                                                            {booking.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-400 font-mono">${booking.price || '0.00'}</td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="text-center py-16 text-slate-500 flex flex-col items-center gap-3">
                                        <FaHistory className="text-4xl text-slate-700" />
                                        <p>No telemetry data found for this identity.</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
                                <button type="button" onClick={closeHistoryModal} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer">
                                    Close Terminal
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminUsers;
