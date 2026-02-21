import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";
import { FaTrash, FaEdit, FaPlus, FaBox, FaMapMarkerAlt, FaRulerCombined } from "react-icons/fa";

const AdminLockers = () => {
    const [lockers, setLockers] = useState([]);
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
            setLockers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
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
                toast.success("Locker updated successfully");
            } else {
                await addDoc(lockersCollectionRef, formData);
                toast.success("Locker added successfully");
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
            toast.error("Error saving locker: " + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this locker?")) {
            try {
                const lockerDoc = doc(db, "lockers", id);
                await deleteDoc(lockerDoc);
                toast.success("Locker deleted successfully");
                fetchLockers();
            } catch (error) {
                toast.error("Error deleting locker: " + error.message);
            }
        }
    };

    const handleEdit = (locker) => {
        setFormData({
            lockerId: locker.lockerId,
            size: locker.size,
            location: locker.location,
            status: locker.status
        });
        setEditId(locker.id);
        setShowModal(true);
    }

    return (
        <div className="container-fluid p-0">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="section-header">Locker Management</h1>
                <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={() => { setShowModal(true); setEditId(null); setFormData({ lockerId: "", size: "medium", location: "", status: "available" }) }}
                    style={{ background: '#6366f1', border: 'none', padding: '10px 20px', borderRadius: '8px' }}
                >
                    <FaPlus /> Add New Locker
                </button>
            </div>

            {/* Visual Locker Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' }}>
                {lockers.map((locker) => (
                    <div
                        key={locker.id}
                        className="stat-card-aura"
                        style={{
                            padding: '24px',
                            border: locker.status === 'booked' ? '1px solid #6366f1' : '1px solid #334155',
                            backgroundColor: locker.status === 'booked' ? 'rgba(99, 102, 241, 0.1)' : locker.status === 'maintenance' ? 'rgba(245, 158, 11, 0.1)' : '#1e293b',
                            boxShadow: locker.status === 'booked' ? '0 0 15px rgba(99, 102, 241, 0.2)' : 'none',
                            position: 'relative',
                            minHeight: '200px'
                        }}
                    >
                        {/* Status Indicator */}
                        <div style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: locker.status === 'booked' ? '#6366f1' : locker.status === 'maintenance' ? '#f59e0b' : '#10b981',
                            boxShadow: `0 0 8px ${locker.status === 'booked' ? '#6366f1' : locker.status === 'maintenance' ? '#f59e0b' : '#10b981'}`
                        }}></div>

                        {/* Locker Number */}
                        <div className="text-center mb-4">
                            <div style={{ fontSize: '3rem', fontWeight: '800', lineHeight: 1, color: '#f8fafc' }}>
                                {locker.lockerId}
                            </div>
                            <div className="small text-uppercase tracking-wider mt-1" style={{ color: locker.status === 'booked' ? '#818cf8' : '#cbd5e1', fontSize: '0.7rem', letterSpacing: '0.1em' }}>
                                {locker.status}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="d-flex justify-content-between mb-2 small" style={{ color: '#cbd5e1' }}>
                            <div className="d-flex align-items-center gap-2">
                                <FaRulerCombined size={12} /> {locker.size}
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <FaMapMarkerAlt size={12} /> {locker.location}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-auto pt-3 border-top" style={{ borderColor: 'rgba(255,255,255,0.1)', display: 'flex', gap: '8px' }}>
                            <button className="btn btn-sm w-100" style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }} onClick={() => handleEdit(locker)}>
                                <FaEdit /> Edit
                            </button>
                            <button className="btn btn-sm w-100" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }} onClick={() => handleDelete(locker.id)}>
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal - Dark Theme */}
            {showModal && (
                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: 'blur(5px)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content" style={{ backgroundColor: "#1e293b", color: "#f8fafc", border: "1px solid #334155" }}>
                            <div className="modal-header" style={{ borderBottom: "1px solid #334155" }}>
                                <h5 className="modal-title">{editId ? "Edit Locker" : "Add New Locker"}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label small text-uppercase" style={{ color: '#cbd5e1' }}>Locker ID</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{ background: "#0f172a", border: "1px solid #334155", color: "#f8fafc" }}
                                            name="lockerId"
                                            value={formData.lockerId}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label small text-uppercase" style={{ color: '#cbd5e1' }}>Size</label>
                                            <select
                                                className="form-select"
                                                style={{ background: "#0f172a", border: "1px solid #334155", color: "#f8fafc" }}
                                                name="size"
                                                value={formData.size}
                                                onChange={handleInputChange}
                                            >
                                                <option value="small">Small</option>
                                                <option value="medium">Medium</option>
                                                <option value="large">Large</option>
                                                <option value="xl">XL</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label small text-uppercase" style={{ color: '#cbd5e1' }}>Status</label>
                                            <select
                                                className="form-select"
                                                style={{ background: "#0f172a", border: "1px solid #334155", color: "#f8fafc" }}
                                                name="status"
                                                value={formData.status}
                                                onChange={handleInputChange}
                                            >
                                                <option value="available">Available</option>
                                                <option value="booked">Booked</option>
                                                <option value="maintenance">Maintenance</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small text-uppercase" style={{ color: '#cbd5e1' }}>Location</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{ background: "#0f172a", border: "1px solid #334155", color: "#f8fafc" }}
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer" style={{ borderTop: "1px solid #334155" }}>
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Close</button>
                                    <button type="submit" className="btn btn-primary" style={{ background: '#6366f1', border: 'none' }}>{editId ? "Update Locker" : "Add Locker"}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLockers;
