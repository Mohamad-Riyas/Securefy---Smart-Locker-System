import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs, updateDoc, doc, deleteDoc, onSnapshot } from "firebase/firestore";
import { toast } from "react-toastify";
import { FaTrash, FaCheck, FaSearch, FaRegClock, FaCalendarAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState("");

    const bookingsCollectionRef = collection(db, "bookings");

    useEffect(() => {
        const unsubscribe = onSnapshot(bookingsCollectionRef, (snapshot) => {
            const bookingsList = snapshot.docs.map((doc) => {
                const d = doc.data();
                return {
                    ...d,
                    id: doc.id,
                    formattedDate: d.startTime && d.startTime.toDate ? d.startTime.toDate().toLocaleDateString() : 'N/A',
                    isoDate: d.startTime && d.startTime.toDate ? d.startTime.toDate().toISOString().split('T')[0] : '',
                    timeMillis: d.startTime && d.startTime.toMillis ? d.startTime.toMillis() : Date.now()
                };
            });
            // Sort by most recent first
            bookingsList.sort((a, b) => b.timeMillis - a.timeMillis);
            setBookings(bookingsList);
        }, (error) => {
            console.error("Error fetching operations logs:", error);
            toast.error("Failed to connect to real-time telemetry");
        });

        return () => unsubscribe();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            const bookingDoc = doc(db, "bookings", id);
            await updateDoc(bookingDoc, { status: status });
            toast.success(`Booking marked as ${status}`);
        } catch (error) {
            toast.error("Error updating status: " + error.message);
        }
    };

    const deleteBooking = async (id) => {
        if (window.confirm("Are you sure you want to completely erase this record?")) {
            try {
                const bookingDoc = doc(db, "bookings", id);
                await deleteDoc(bookingDoc);
                toast.success("Booking deleted successfully");
            } catch (error) {
                toast.error("Error deleting booking: " + error.message);
            }
        }
    };

    const filteredBookings = bookings.filter((booking) => {
        const matchesTerm =
            booking.lockerId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (booking.userId && booking.userId.toLowerCase().includes(searchTerm.toLowerCase())) ||
            booking.status?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDate = dateFilter ? booking.isoDate === dateFilter : true;

        return matchesTerm && matchesDate;
    });

    return (
        <div className="relative min-h-[90vh] w-full flex flex-col pt-4">
            
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end mb-8 relative z-10 w-full gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Operation Logs</h1>
                    <p className="text-slate-400 mt-1">Monitor distributed network allocations and reservation history.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    <div className="relative w-full sm:w-64 group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                            <FaSearch />
                        </div>
                        <input
                            type="text"
                            className="w-full bg-slate-900/60 backdrop-blur-md border border-slate-700 focus:border-indigo-500 text-slate-200 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-lg transition-all"
                            placeholder="Search User, Node ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="relative w-full sm:w-48 group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                            <FaCalendarAlt />
                        </div>
                        <input
                            type="date"
                            className="w-full bg-slate-900/60 backdrop-blur-md border border-slate-700 focus:border-indigo-500 text-slate-200 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-lg transition-all appearance-none custom-date-input"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute inset-x-0 h-px top-0 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
                
                <div className="overflow-x-auto w-full">
                    <table className="w-full whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-900/40 text-left text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                                <th className="px-6 py-5 font-semibold">User Identity</th>
                                <th className="px-6 py-5 font-semibold">Node ID</th>
                                <th className="px-6 py-5 font-semibold">Timestamp</th>
                                <th className="px-6 py-5 font-semibold">Status</th>
                                <th className="px-6 py-5 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50 text-sm">
                            <AnimatePresence>
                                {filteredBookings.map((booking, index) => (
                                    <motion.tr 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: index * 0.05 }}
                                        key={booking.id} 
                                        className="hover:bg-slate-800/30 transition-colors group"
                                    >
                                        <td className="px-6 py-5 text-slate-200 font-medium">
                                            {booking.userName || booking.userId}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="inline-flex items-center gap-2 font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-md">
                                                {booking.lockerId}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-slate-400">
                                            <span className="flex items-center gap-2">
                                                <FaRegClock className="text-slate-500" />
                                                {booking.formattedDate}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                                booking.status === 'active' 
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                                                : booking.status === 'completed'
                                                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                                : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                            }`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right flex justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                                            {booking.status !== 'completed' && (
                                                <motion.button 
                                                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} 
                                                    className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors border border-emerald-500/20 cursor-pointer"
                                                    onClick={() => updateStatus(booking.id, 'completed')}
                                                    title="Mark Complete"
                                                >
                                                    <FaCheck />
                                                </motion.button>
                                            )}
                                            
                                            <motion.button 
                                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} 
                                                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/50 transition-colors border border-slate-700 cursor-pointer"
                                                onClick={() => deleteBooking(booking.id)}
                                                title="Delete Record"
                                            >
                                                <FaTrash />
                                            </motion.button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                    
                    {filteredBookings.length === 0 && (
                        <div className="p-16 text-center text-slate-500 flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700">
                                <FaSearch className="text-2xl text-slate-600" />
                            </div>
                            <p className="text-lg">No telemetry data matching your query criteria.</p>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Custom CSS for hiding default dark mode calendar icon on some browsers if needed */}
            <style jsx>{`
                .custom-date-input::-webkit-calendar-picker-indicator {
                    filter: invert(1);
                    opacity: 0.5;
                    cursor: pointer;
                }
                .custom-date-input::-webkit-calendar-picker-indicator:hover {
                    opacity: 1;
                }
            `}</style>
        </div>
    );
};

export default AdminBookings;
