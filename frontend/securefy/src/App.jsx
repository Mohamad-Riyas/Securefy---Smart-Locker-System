import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";

import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./pages/Home";
import BookLocker from "./pages/BookLocker";       // ADDED
import Availability from "./pages/Availability";   // ADDED
import MyQRCode from "./pages/MyQRCode";          // ADDED
import AdminLayout from "./components/Admin/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminLockers from "./pages/Admin/AdminLockers";
import AdminBookings from "./pages/Admin/AdminBookings";
import AdminUsers from "./pages/Admin/AdminUsers";
import Navbar from "./components/Navbar/Navbar";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
    const location = useLocation();
  return (
    <>
{!location.pathname.startsWith('/admin') && (
        <div className="container">
          <Navbar />
        </div>
      )}    
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<Home />} />

        {/* Auth Pages */}
        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />

        {/* Locker Pages - ADDED THESE THREE ROUTES */}
        <Route path="/book-locker" element={<BookLocker />} />
        <Route path="/availability" element={<Availability />} />
        <Route path="/my-qr-code" element={<MyQRCode />} />
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="lockers" element={<AdminLockers />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
        
      </Routes>

      <ToastContainer />
    </>
  );
}

/* Auth Layout */
function AuthLayout({ children }) {
  return (
    <div className="App">
      <div className="auth-wrapper">
        <div className="auth-inner">{children}</div>
      </div>
    </div>
  );
}

export default App;
