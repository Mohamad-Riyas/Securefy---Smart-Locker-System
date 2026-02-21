<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { FaEdit, FaTrash, FaCheck } from "react-icons/fa";

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState("");

    const bookingsCollectionRef = collection(db, "bookings");

    const fetchBookings = async () => {
        try {
            const data = await getDocs(bookingsCollectionRef);
            setBookings(data.docs.map((doc) => {
                const d = doc.data();
                return {
                    ...d,
                    id: doc.id,
                    // Format date for easier filtering and display
                    formattedDate: d.startTime && d.startTime.toDate ? d.startTime.toDate().toLocaleDateString() : 'N/A',
                    isoDate: d.startTime && d.startTime.toDate ? d.startTime.toDate().toISOString().split('T')[0] : ''
                };
            }));
        } catch (error) {
            console.error("Error fetching bookings:", error);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            const bookingDoc = doc(db, "bookings", id);
            await updateDoc(bookingDoc, { status: status });
            toast.success(`Booking marked as ${status}`);
            fetchBookings();
        } catch (error) {
            toast.error("Error updating status: " + error.message);
        }
    };

    const deleteBooking = async (id) => {
        if (window.confirm("Are you sure you want to delete this booking?")) {
            try {
                const bookingDoc = doc(db, "bookings", id);
                await deleteDoc(bookingDoc);
                toast.success("Booking deleted successfully");
                fetchBookings();
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
        <div className="container-fluid p-0">
            <h1 className="section-header">Booking Management</h1>

            <div className="row mb-4">
                <div className="col-md-9">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by User, Locker ID or Status..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            background: "#0f172a",
                            border: "1px solid #334155",
                            color: "#f8fafc",
                            padding: "10px 15px",
                            borderRadius: "8px"
                        }}
                    />
                </div>
                <div className="col-md-3">
                    <input
                        type="date"
                        className="form-control"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        style={{
                            background: "#0f172a",
                            border: "1px solid #334155",
                            color: "#94a3b8", // Placeholder text color often needs check
                            padding: "10px 15px",
                            borderRadius: "8px"
                        }}
                    />
                </div>
            </div>

            <div className="stat-card-aura" style={{ padding: '0', overflow: 'hidden', minHeight: '400px' }}>
                <div className="table-responsive">
                    <table className="table mb-0" style={{ color: '#94a3b8' }}>
                        <thead style={{ background: 'rgba(255,255,255,0.05)', color: '#f8fafc', borderBottom: '1px solid #334155' }}>
                            <tr>
                                <th style={{ padding: '16px 24px', fontWeight: '600', border: 'none' }}>User</th>
                                <th style={{ padding: '16px 24px', fontWeight: '600', border: 'none' }}>Locker ID</th>
                                <th style={{ padding: '16px 24px', fontWeight: '600', border: 'none' }}>Date</th>
                                <th style={{ padding: '16px 24px', fontWeight: '600', border: 'none' }}>Status</th>
                                <th style={{ padding: '16px 24px', fontWeight: '600', border: 'none' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.map((booking) => (
                                <tr key={booking.id} style={{ borderBottom: '1px solid #334155', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '16px 24px', verticalAlign: 'middle', border: 'none', color: '#f8fafc', fontWeight: '500' }}>
                                        {booking.userName || booking.userId}
                                    </td>
                                    <td style={{ padding: '16px 24px', verticalAlign: 'middle', border: 'none' }}>
                                        <div style={{
                                            background: 'rgba(99, 102, 241, 0.1)',
                                            color: '#818cf8',
                                            display: 'inline-block',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.85rem',
                                            fontWeight: '600'
                                        }}>
                                            {booking.lockerId}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px', verticalAlign: 'middle', border: 'none' }}>{booking.formattedDate}</td>
                                    <td style={{ padding: '16px 24px', verticalAlign: 'middle', border: 'none' }}>
                                        <span className="badge" style={{
                                            background: booking.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : booking.status === 'completed' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                                            color: booking.status === 'active' ? '#10b981' : booking.status === 'completed' ? '#818cf8' : '#94a3b8',
                                            border: `1px solid ${booking.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : booking.status === 'completed' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(148, 163, 184, 0.2)'}`,
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            fontWeight: '500'
                                        }}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px', verticalAlign: 'middle', border: 'none' }}>
                                        {booking.status !== 'completed' && (
                                            <button
                                                className="btn btn-sm me-2"
                                                onClick={() => updateStatus(booking.id, 'completed')}
                                                style={{ background: 'transparent', border: '1px solid #10b981', color: '#10b981' }}
                                                title="Mark Complete"
                                            >
                                                <FaCheck />
                                            </button>
                                        )}
                                        <button
                                            className="btn btn-sm"
                                            onClick={() => deleteBooking(booking.id)}
                                            style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444' }}
                                            title="Delete Booking"
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminBookings;
=======
import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { FaEdit, FaTrash, FaCheck } from "react-icons/fa";

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState("");

    const bookingsCollectionRef = collection(db, "bookings");

    const fetchBookings = async () => {
        try {
            const data = await getDocs(bookingsCollectionRef);
            setBookings(data.docs.map((doc) => {
                const d = doc.data();
                return {
                    ...d,
                    id: doc.id,
                    // Format date for easier filtering and display
                    formattedDate: d.startTime && d.startTime.toDate ? d.startTime.toDate().toLocaleDateString() : 'N/A',
                    isoDate: d.startTime && d.startTime.toDate ? d.startTime.toDate().toISOString().split('T')[0] : ''
                };
            }));
        } catch (error) {
            console.error("Error fetching bookings:", error);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            const bookingDoc = doc(db, "bookings", id);
            await updateDoc(bookingDoc, { status: status });
            toast.success(`Booking marked as ${status}`);
            fetchBookings();
        } catch (error) {
            toast.error("Error updating status: " + error.message);
        }
    };

    const deleteBooking = async (id) => {
        if (window.confirm("Are you sure you want to delete this booking?")) {
            try {
                const bookingDoc = doc(db, "bookings", id);
                await deleteDoc(bookingDoc);
                toast.success("Booking deleted successfully");
                fetchBookings();
            } catch (error) {
                toast.error("Error deleting booking: " + error.message);
            }
        }
    };

    const filteredBookings = bookings.filter((booking) => {
        const matchesTerm =
            booking.lockerNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (booking.userId && booking.userId.toLowerCase().includes(searchTerm.toLowerCase())) ||
            booking.status?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDate = dateFilter ? booking.isoDate === dateFilter : true;

        return matchesTerm && matchesDate;
    });

    return (
        <div className="container-fluid p-0">
            <h1 className="section-header">Booking Management</h1>

            <div className="row mb-4">
                <div className="col-md-9">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by User, Locker Number or Status..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            background: "#0f172a",
                            border: "1px solid #334155",
                            color: "#f8fafc",
                            padding: "10px 15px",
                            borderRadius: "8px"
                        }}
                    />
                </div>
                <div className="col-md-3">
                    <input
                        type="date"
                        className="form-control"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        style={{
                            background: "#0f172a",
                            border: "1px solid #334155",
                            color: "#94a3b8", // Placeholder text color often needs check
                            padding: "10px 15px",
                            borderRadius: "8px"
                        }}
                    />
                </div>
            </div>

            <div className="stat-card-aura" style={{ padding: '0', overflow: 'hidden', minHeight: '400px' }}>
                <div className="table-responsive">
                    <table className="table mb-0" style={{ color: '#94a3b8' }}>
                        <thead style={{ background: 'rgba(255,255,255,0.05)', color: '#f8fafc', borderBottom: '1px solid #334155' }}>
                            <tr>
                                <th style={{ padding: '16px 24px', fontWeight: '600', border: 'none' }}>User</th>
                                <th style={{ padding: '16px 24px', fontWeight: '600', border: 'none' }}>Locker #</th>
                                <th style={{ padding: '16px 24px', fontWeight: '600', border: 'none' }}>Date</th>
                                <th style={{ padding: '16px 24px', fontWeight: '600', border: 'none' }}>Status</th>
                                <th style={{ padding: '16px 24px', fontWeight: '600', border: 'none' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.map((booking) => (
                                <tr key={booking.id} style={{ borderBottom: '1px solid #334155', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '16px 24px', verticalAlign: 'middle', border: 'none', color: '#f8fafc', fontWeight: '500' }}>
                                        {booking.userName || booking.userId}
                                    </td>
                                    <td style={{ padding: '16px 24px', verticalAlign: 'middle', border: 'none' }}>
                                        <div style={{
                                            background: 'rgba(99, 102, 241, 0.1)',
                                            color: '#818cf8',
                                            display: 'inline-block',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.85rem',
                                            fontWeight: '600'
                                        }}>
                                            {booking.lockerNumber}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px', verticalAlign: 'middle', border: 'none' }}>{booking.formattedDate}</td>
                                    <td style={{ padding: '16px 24px', verticalAlign: 'middle', border: 'none' }}>
                                        <span className="badge" style={{
                                            background: booking.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : booking.status === 'completed' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                                            color: booking.status === 'active' ? '#10b981' : booking.status === 'completed' ? '#818cf8' : '#94a3b8',
                                            border: `1px solid ${booking.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : booking.status === 'completed' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(148, 163, 184, 0.2)'}`,
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            fontWeight: '500'
                                        }}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px', verticalAlign: 'middle', border: 'none' }}>
                                        {booking.status !== 'completed' && (
                                            <button
                                                className="btn btn-sm me-2"
                                                onClick={() => updateStatus(booking.id, 'completed')}
                                                style={{ background: 'transparent', border: '1px solid #10b981', color: '#10b981' }}
                                                title="Mark Complete"
                                            >
                                                <FaCheck />
                                            </button>
                                        )}
                                        <button
                                            className="btn btn-sm"
                                            onClick={() => deleteBooking(booking.id)}
                                            style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444' }}
                                            title="Delete Booking"
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminBookings;
>>>>>>> origin/main
