<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs, updateDoc, doc, query, where } from "firebase/firestore";
import { toast } from "react-toastify";
import { FaUserShield, FaBan, FaCheckCircle, FaHistory } from "react-icons/fa";

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userBookings, setUserBookings] = useState([]);

    const usersCollectionRef = collection(db, "users");

    const fetchUsers = async () => {
        try {
            const data = await getDocs(usersCollectionRef);
            setUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
        try {
            const userDoc = doc(db, "users", id);
            await updateDoc(userDoc, { status: newStatus });
            toast.success(`User ${newStatus === 'active' ? 'activated' : 'suspended'}`);
            fetchUsers();
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
            fetchUsers();
        } catch (error) {
            toast.error("Error updating user role: " + error.message);
        }
    };

    const handleViewHistory = async (user) => {
        setSelectedUser(user);
        setUserBookings([]);
        setShowHistoryModal(true);
        try {
            const bookingsRef = collection(db, "bookings");
            const q = query(bookingsRef, where("userId", "==", user.uid || user.id)); // Fallback to id if uid not in data
            const querySnapshot = await getDocs(q);
            const bookings = querySnapshot.docs.map(doc => {
                const d = doc.data();
                return {
                    id: doc.id,
                    ...d,
                    date: d.startTime && d.startTime.toDate ? d.startTime.toDate().toLocaleDateString() : 'N/A'
                };
            });
            setUserBookings(bookings);
        } catch (error) {
            console.error("Error fetching user history:", error);
            toast.error("Error loading user history.");
        }
    };

    const filteredUsers = users.filter((user) =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container-fluid p-0">
            <h1 className="section-header">User Management</h1>
            <div className="mb-4">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search by Name or Email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        background: "#0f172a",
                        border: "1px solid #334155",
                        color: "#f8fafc",
                        padding: "10px 15px",
                        borderRadius: "8px",
                        maxWidth: "400px" // specific to this page design
                    }}
                />
            </div>

            <div className="stat-card-aura" style={{ padding: '0', overflow: 'hidden', minHeight: '400px' }}>
                <div className="table-responsive">
                    <table className="table mb-0" style={{ color: '#94a3b8' }}>
                        <thead style={{ background: 'rgba(255,255,255,0.05)', color: '#f8fafc', borderBottom: '1px solid #334155' }}>
                            <tr>
                                <th style={{ padding: '16px 24px', fontWeight: '600', border: 'none' }}>Name</th>
                                <th style={{ padding: '16px 24px', fontWeight: '600', border: 'none' }}>Email</th>
                                <th style={{ padding: '16px 24px', fontWeight: '600', border: 'none' }}>Role</th>
                                <th style={{ padding: '16px 24px', fontWeight: '600', border: 'none' }}>Status</th>
                                <th style={{ padding: '16px 24px', fontWeight: '600', border: 'none' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id} style={{ borderBottom: '1px solid #334155', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '16px 24px', verticalAlign: 'middle', border: 'none', color: '#f8fafc', fontWeight: '500' }}>
                                        {user.name}
                                    </td>
                                    <td style={{ padding: '16px 24px', verticalAlign: 'middle', border: 'none' }}>{user.email}</td>
                                    <td style={{ padding: '16px 24px', verticalAlign: 'middle', border: 'none' }}>
                                        <span className="badge" style={{
                                            background: user.role === 'admin' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                            color: user.role === 'admin' ? '#ef4444' : '#818cf8',
                                            border: `1px solid ${user.role === 'admin' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`,
                                            padding: '4px 10px',
                                            borderRadius: '6px'
                                        }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px', verticalAlign: 'middle', border: 'none' }}>
                                        <span className="badge" style={{
                                            background: user.status === 'suspended' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                            color: user.status === 'suspended' ? '#f59e0b' : '#10b981',
                                            border: `1px solid ${user.status === 'suspended' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
                                            padding: '4px 10px',
                                            borderRadius: '6px'
                                        }}>
                                            {user.status || 'active'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px', verticalAlign: 'middle', border: 'none' }}>
                                        <button
                                            className="btn btn-sm me-2"
                                            onClick={() => toggleRole(user.id, user.role)}
                                            style={{ background: 'transparent', border: '1px solid #6366f1', color: '#6366f1' }}
                                            title={user.role === 'admin' ? 'Demote' : 'Promote'}
                                        >
                                            <FaUserShield />
                                        </button>
                                        <button
                                            className="btn btn-sm me-2"
                                            onClick={() => toggleStatus(user.id, user.status)}
                                            style={{
                                                background: 'transparent',
                                                border: user.status === 'suspended' ? '1px solid #10b981' : '1px solid #f59e0b',
                                                color: user.status === 'suspended' ? '#10b981' : '#f59e0b'
                                            }}
                                            title={user.status === 'suspended' ? 'Activate' : 'Suspend'}
                                        >
                                            {user.status === 'suspended' ? <FaCheckCircle /> : <FaBan />}
                                        </button>
                                        <button
                                            className="btn btn-sm"
                                            onClick={() => handleViewHistory(user)}
                                            style={{ background: 'transparent', border: '1px solid #94a3b8', color: '#94a3b8' }}
                                            title="View History"
                                        >
                                            <FaHistory />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showHistoryModal && selectedUser && (
                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: 'blur(5px)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content" style={{ backgroundColor: "#1e293b", color: "#f8fafc", border: "1px solid #334155" }}>
                            <div className="modal-header" style={{ borderBottom: "1px solid #334155" }}>
                                <h5 className="modal-title">Booking History: {selectedUser.name}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowHistoryModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                {userBookings.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-sm mb-0" style={{ color: '#94a3b8' }}>
                                            <thead style={{ borderBottom: '1px solid #334155', color: '#f8fafc' }}>
                                                <tr>
                                                    <th style={{ border: 'none' }}>Locker ID</th>
                                                    <th style={{ border: 'none' }}>Date</th>
                                                    <th style={{ border: 'none' }}>Status</th>
                                                    <th style={{ border: 'none' }}>Price</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {userBookings.map(booking => (
                                                    <tr key={booking.id} style={{ borderBottom: '1px solid #334155' }}>
                                                        <td style={{ border: 'none' }}>{booking.lockerId}</td>
                                                        <td style={{ border: 'none' }}>{booking.date}</td>
                                                        <td style={{ border: 'none' }}>
                                                            <span className="badge" style={{
                                                                background: booking.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                                                color: booking.status === 'active' ? '#10b981' : '#818cf8',
                                                                border: booking.status === 'active' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(99, 102, 241, 0.2)'
                                                            }}>
                                                                {booking.status}
                                                            </span>
                                                        </td>
                                                        <td style={{ border: 'none' }}>${booking.price || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-muted">
                                        <p>No booking history found for this user.</p>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer" style={{ borderTop: "1px solid #334155" }}>
                                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowHistoryModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
=======
import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs, updateDoc, doc, query, where } from "firebase/firestore";
import { toast } from "react-toastify";
import { FaUserShield, FaBan, FaCheckCircle, FaHistory } from "react-icons/fa";

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userBookings, setUserBookings] = useState([]);

    const usersCollectionRef = collection(db, "users");

    const fetchUsers = async () => {
        try {
            const data = await getDocs(usersCollectionRef);
            setUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
        try {
            const userDoc = doc(db, "users", id);
            await updateDoc(userDoc, { status: newStatus });
            toast.success(`User ${newStatus === 'active' ? 'activated' : 'suspended'}`);
            fetchUsers();
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
            fetchUsers();
        } catch (error) {
            toast.error("Error updating user role: " + error.message);
        }
    };

    const handleViewHistory = async (user) => {
        setSelectedUser(user);
        setUserBookings([]);
        setShowHistoryModal(true);
        try {
            const bookingsRef = collection(db, "bookings");
            const q = query(bookingsRef, where("userId", "==", user.uid || user.id)); // Fallback to id if uid not in data
            const querySnapshot = await getDocs(q);
            const bookings = querySnapshot.docs.map(doc => {
                const d = doc.data();
                return {
                    id: doc.id,
                    ...d,
                    date: d.startTime && d.startTime.toDate ? d.startTime.toDate().toLocaleDateString() : 'N/A'
                };
            });
            setUserBookings(bookings);
        } catch (error) {
            console.error("Error fetching user history:", error);
            toast.error("Error loading user history.");
        }
    };

    const filteredUsers = users.filter((user) =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container-fluid p-0">
            <h1 className="section-header">User Management</h1>
            <div className="mb-4">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search by Name or Email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        background: "#0f172a",
                        border: "1px solid #334155",
                        color: "#f8fafc",
                        padding: "10px 15px",
                        borderRadius: "8px",
                        maxWidth: "400px" // specific to this page design
                    }}
                />
            </div>

            <div className="stat-card-aura" style={{ padding: '0', overflow: 'hidden', minHeight: '400px' }}>
                <div className="table-responsive">
                    <table className="table mb-0" style={{ color: '#94a3b8' }}>
                        <thead style={{ background: 'rgba(255,255,255,0.05)', color: '#f8fafc', borderBottom: '1px solid #334155' }}>
                            <tr>
                                <th style={{ padding: '16px 24px', fontWeight: '600', border: 'none' }}>Name</th>
                                <th style={{ padding: '16px 24px', fontWeight: '600', border: 'none' }}>Email</th>
                                <th style={{ padding: '16px 24px', fontWeight: '600', border: 'none' }}>Role</th>
                                <th style={{ padding: '16px 24px', fontWeight: '600', border: 'none' }}>Status</th>
                                <th style={{ padding: '16px 24px', fontWeight: '600', border: 'none' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id} style={{ borderBottom: '1px solid #334155', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '16px 24px', verticalAlign: 'middle', border: 'none', color: '#f8fafc', fontWeight: '500' }}>
                                        {user.name}
                                    </td>
                                    <td style={{ padding: '16px 24px', verticalAlign: 'middle', border: 'none' }}>{user.email}</td>
                                    <td style={{ padding: '16px 24px', verticalAlign: 'middle', border: 'none' }}>
                                        <span className="badge" style={{
                                            background: user.role === 'admin' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                            color: user.role === 'admin' ? '#ef4444' : '#818cf8',
                                            border: `1px solid ${user.role === 'admin' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`,
                                            padding: '4px 10px',
                                            borderRadius: '6px'
                                        }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px', verticalAlign: 'middle', border: 'none' }}>
                                        <span className="badge" style={{
                                            background: user.status === 'suspended' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                            color: user.status === 'suspended' ? '#f59e0b' : '#10b981',
                                            border: `1px solid ${user.status === 'suspended' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
                                            padding: '4px 10px',
                                            borderRadius: '6px'
                                        }}>
                                            {user.status || 'active'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px', verticalAlign: 'middle', border: 'none' }}>
                                        <button
                                            className="btn btn-sm me-2"
                                            onClick={() => toggleRole(user.id, user.role)}
                                            style={{ background: 'transparent', border: '1px solid #6366f1', color: '#6366f1' }}
                                            title={user.role === 'admin' ? 'Demote' : 'Promote'}
                                        >
                                            <FaUserShield />
                                        </button>
                                        <button
                                            className="btn btn-sm me-2"
                                            onClick={() => toggleStatus(user.id, user.status)}
                                            style={{
                                                background: 'transparent',
                                                border: user.status === 'suspended' ? '1px solid #10b981' : '1px solid #f59e0b',
                                                color: user.status === 'suspended' ? '#10b981' : '#f59e0b'
                                            }}
                                            title={user.status === 'suspended' ? 'Activate' : 'Suspend'}
                                        >
                                            {user.status === 'suspended' ? <FaCheckCircle /> : <FaBan />}
                                        </button>
                                        <button
                                            className="btn btn-sm"
                                            onClick={() => handleViewHistory(user)}
                                            style={{ background: 'transparent', border: '1px solid #94a3b8', color: '#94a3b8' }}
                                            title="View History"
                                        >
                                            <FaHistory />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showHistoryModal && selectedUser && (
                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: 'blur(5px)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content" style={{ backgroundColor: "#1e293b", color: "#f8fafc", border: "1px solid #334155" }}>
                            <div className="modal-header" style={{ borderBottom: "1px solid #334155" }}>
                                <h5 className="modal-title">Booking History: {selectedUser.name}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowHistoryModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                {userBookings.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-sm mb-0" style={{ color: '#94a3b8' }}>
                                            <thead style={{ borderBottom: '1px solid #334155', color: '#f8fafc' }}>
                                                <tr>
                                                    <th style={{ border: 'none' }}>Locker #</th>
                                                    <th style={{ border: 'none' }}>Date</th>
                                                    <th style={{ border: 'none' }}>Status</th>
                                                    <th style={{ border: 'none' }}>Price</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {userBookings.map(booking => (
                                                    <tr key={booking.id} style={{ borderBottom: '1px solid #334155' }}>
                                                        <td style={{ border: 'none' }}>{booking.lockerNumber}</td>
                                                        <td style={{ border: 'none' }}>{booking.date}</td>
                                                        <td style={{ border: 'none' }}>
                                                            <span className="badge" style={{
                                                                background: booking.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                                                color: booking.status === 'active' ? '#10b981' : '#818cf8',
                                                                border: booking.status === 'active' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(99, 102, 241, 0.2)'
                                                            }}>
                                                                {booking.status}
                                                            </span>
                                                        </td>
                                                        <td style={{ border: 'none' }}>${booking.price || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-muted">
                                        <p>No booking history found for this user.</p>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer" style={{ borderTop: "1px solid #334155" }}>
                                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowHistoryModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
>>>>>>> origin/main
