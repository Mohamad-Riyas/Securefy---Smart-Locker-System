import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs, setDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";
import { FaTrash, FaEdit, FaPlus, FaMapMarkerAlt, FaRulerCombined, FaSearch, FaFilter } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const AdminLockers = () => {
    const [lockers, setLockers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    
    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        lockerId: "",
        size: "medium",
        location: "Main Hall",
        status: "available",
    });
    const [editId, setEditId] = useState(null);

    const lockersCollectionRef = collection(db, "lockers");

    const fetchLockers = async () => {
        try {
            const data = await getDocs(lockersCollectionRef);
            // Sort by ID to keep the grid organized
            const fetched = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            fetched.sort((a, b) => (a.lockerId || "").localeCompare(b.lockerId || ""));
            setLockers(fetched);
        } catch (error) {
            console.error("Error fetching lockers:", error);
        }
    };

    useEffect(() => {
        fetchLockers();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                const lockerDoc = doc(db, "lockers", editId);
                await updateDoc(lockerDoc, formData);
                toast.success("Node configuration updated successfully");
            } else {
                await setDoc(doc(db, "lockers", formData.lockerId), formData);
                toast.success("New node deployed successfully");
            }
            setShowModal(false);
            setFormData({
                lockerId: "",
                size: "medium",
                location: "Main Hall",
                status: "available",
            });
            setEditId(null);
            fetchLockers();
        } catch (error) {
            toast.error("Error saving node: " + error.message);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to permanently delete this node?")) {
            try {
                const lockerDoc = doc(db, "lockers", id);
                await deleteDoc(lockerDoc);
                toast.success("Node deleted successfully");
                fetchLockers();
            } catch (error) {
                toast.error("Error deleting node: " + error.message);
            }
        }
    };

    const handleEdit = (locker, e) => {
        if(e) e.stopPropagation();
        setFormData({
            lockerId: locker.lockerId,
            size: locker.size || "medium",
            location: locker.location || "",
            status: locker.status || "available"
        });
        setEditId(locker.id);
        setShowModal(true);
    };

    // Derived filtering
    const filteredLockers = lockers.filter(locker => {
        const matchesSearch = locker.lockerId?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              locker.location?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || locker.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Stats for header
    const totalLockers = lockers.length;
    const availableLockers = lockers.filter(l => l.status === 'available' || !l.status).length;
    const bookedLockers = lockers.filter(l => l.status === 'booked' || l.status === 'reserved' || l.status === 'occupied').length;
    const maintenanceLockers = lockers.filter(l => l.status === 'maintenance').length;

    return (
        <div className="relative min-h-[90vh] w-full flex flex-col pt-4">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 relative z-10 w-full gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Node Grid</h1>
                    <p className="text-slate-400 mt-1">Manage physical locker inventory, assignments, and statuses.</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-colors w-full md:w-auto justify-center"
                    onClick={() => { setShowModal(true); setEditId(null); setFormData({ lockerId: "", size: "medium", location: "", status: "available" }) }}
                >
                    <FaPlus /> Deploy Node
                </motion.button>
            </div>

            {/* Metrics & Filters Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6 relative z-10">
                
                {/* Metrics Mini-Cards */}
                <div className="lg:col-span-2 flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700 p-3 rounded-xl min-w-[120px] flex-1">
                        <div className="text-xs text-slate-400 font-bold uppercase">Total Nodes</div>
                        <div className="text-2xl font-black text-slate-200">{totalLockers}</div>
                    </div>
                    <div className="bg-emerald-900/20 backdrop-blur-md border border-emerald-900/50 p-3 rounded-xl min-w-[120px] flex-1">
                        <div className="text-xs text-emerald-500/80 font-bold uppercase">Available</div>
                        <div className="text-2xl font-black text-emerald-400">{availableLockers}</div>
                    </div>
                    <div className="bg-indigo-900/20 backdrop-blur-md border border-indigo-900/50 p-3 rounded-xl min-w-[120px] flex-1">
                        <div className="text-xs text-indigo-400/80 font-bold uppercase">Reserved</div>
                        <div className="text-2xl font-black text-indigo-400">{bookedLockers}</div>
                    </div>
                    <div className="bg-amber-900/20 backdrop-blur-md border border-amber-900/50 p-3 rounded-xl min-w-[120px] flex-1">
                        <div className="text-xs text-amber-500/80 font-bold uppercase">Maintenance</div>
                        <div className="text-2xl font-black text-amber-400">{maintenanceLockers}</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="lg:col-span-2 flex flex-col sm:flex-row gap-3">
                    <div className="relative w-full sm:w-2/3 group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                            <FaSearch />
                        </div>
                        <input
                            type="text"
                            className="w-full bg-slate-900/60 backdrop-blur-md border border-slate-700 focus:border-indigo-500 text-slate-200 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-lg transition-all"
                            placeholder="Search by ID or Location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative w-full sm:w-1/3 group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                            <FaFilter />
                        </div>
                        <select
                            className="w-full bg-slate-900/60 backdrop-blur-md border border-slate-700 focus:border-indigo-500 text-slate-200 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-lg transition-all appearance-none"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="available">Available</option>
                            <option value="reserved">Reserved</option>
                            <option value="occupied">Occupied</option>
                            <option value="maintenance">Maintenance</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Grid Layout Container */}
            <div className="flex-1 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl relative z-10 w-full overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 pb-4">
                        <AnimatePresence>
                            {filteredLockers.map((locker, idx) => (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2, layout: { type: "spring", stiffness: 300, damping: 30 } }}
                                    key={locker.id}
                                    onClick={(e) => handleEdit(locker, e)}
                                    className={`
                                        group relative p-5 rounded-2xl border flex flex-col gap-3 transition-all cursor-pointer overflow-hidden
                                        ${(locker.status === 'booked' || locker.status === 'reserved' || locker.status === 'occupied') 
                                            ? 'bg-indigo-900/10 border-indigo-500/30 hover:bg-indigo-900/20 hover:border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.05)] hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]' 
                                            : locker.status === 'maintenance' 
                                            ? 'bg-amber-900/10 border-amber-500/30 hover:bg-amber-900/20 hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.05)]' 
                                            : 'bg-slate-800/40 border-emerald-500/20 hover:bg-slate-800/80 hover:border-emerald-500/50 shadow-sm'
                                        }
                                    `}
                                >
                                    {/* Glowing top accent line */}
                                    <div className={`absolute top-0 inset-x-0 h-1 ${
                                        (locker.status === 'booked' || locker.status === 'reserved' || locker.status === 'occupied') ? 'bg-indigo-500' :
                                        locker.status === 'maintenance' ? 'bg-amber-500' :
                                        'bg-emerald-500/50 group-hover:bg-emerald-500 transition-colors'
                                    }`}></div>

                                    {/* Header: ID and Status Dot */}
                                    <div className="flex justify-between items-start pt-1">
                                        <h3 className="text-2xl font-black text-slate-100 tracking-tight">{locker.lockerId}</h3>
                                        <div className="flex items-center gap-1.5 bg-slate-900/50 px-2 py-1 rounded-md border border-slate-700/50">
                                            <div className={`w-2 h-2 rounded-full ${
                                                (locker.status === 'booked' || locker.status === 'reserved' || locker.status === 'occupied') ? 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]' :
                                                locker.status === 'maintenance' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' :
                                                'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                                            }`}></div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                                                {locker.status || 'Available'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Meta info */}
                                    <div className="flex flex-col gap-2 mt-2 text-xs font-medium text-slate-400">
                                        <div className="flex items-center gap-2 bg-slate-900/30 p-2 rounded-lg">
                                            <FaRulerCombined className="text-slate-500" /> 
                                            <span className="capitalize">{locker.size || 'Medium'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-slate-900/30 p-2 rounded-lg truncate">
                                            <FaMapMarkerAlt className="text-slate-500 shrink-0" /> 
                                            <span className="truncate">{locker.location || 'Unassigned'}</span>
                                        </div>
                                    </div>

                                    {/* Quick Actions (Appear on Hover) */}
                                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                        <button 
                                            onClick={(e) => handleDelete(locker.id, e)} 
                                            className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors border border-rose-500/20 backdrop-blur-md"
                                            title="Delete Node"
                                        >
                                            <FaTrash size={12} />
                                        </button>
                                        <button 
                                            onClick={(e) => handleEdit(locker, e)} 
                                            className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-colors border border-indigo-500/20 backdrop-blur-md"
                                            title="Edit Node"
                                        >
                                            <FaEdit size={12} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {filteredLockers.length === 0 && (
                        <div className="flex flex-col items-center justify-center p-16 text-slate-500 h-full">
                            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700 mb-4">
                                <FaSearch className="text-2xl text-slate-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-300 mb-1">No nodes found</h3>
                            <p>Try adjusting your search query or filters.</p>
                        </div>
                    )}

                </div>
            </div>

            {/* Framer Motion Modal for Config */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm cursor-pointer"
                            onClick={() => setShowModal(false)}
                        ></motion.div>
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="bg-slate-900 border border-slate-700 rounded-3xl p-8 w-full max-w-md relative z-10 shadow-2xl"
                        >
                            <h2 className="text-2xl font-black text-slate-100 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                                {editId ? "Configure Node" : "Deploy New Node"}
                            </h2>
                            
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Node ID Designator</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-950/50 border border-slate-700 text-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                                        name="lockerId"
                                        value={formData.lockerId}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g. A-101"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Capacity Size</label>
                                        <select
                                            className="w-full bg-slate-950/50 border border-slate-700 text-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                                            name="size"
                                            value={formData.size}
                                            onChange={handleInputChange}
                                        >
                                            <option value="small">Small</option>
                                            <option value="medium">Medium</option>
                                            <option value="large">Large</option>
                                            <option value="xl">Extra Large</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</label>
                                        <select
                                            className="w-full bg-slate-950/50 border border-slate-700 text-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                        >
                                            <option value="available">Available</option>
                                            <option value="reserved">Reserved</option>
                                            <option value="occupied">Occupied</option>
                                            <option value="maintenance">Maintenance</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Physical Location</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-950/50 border border-slate-700 text-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g. Primary Hub, Sector 4"
                                    />
                                </div>
                                
                                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all active:scale-95"
                                    >
                                        {editId ? "Update Node" : "Deploy Node"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminLockers;
