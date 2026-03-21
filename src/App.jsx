import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";

import AuthPage from "./components/AuthPage";
import Home from "./pages/Home";
import BookLocker from "./pages/BookLocker";
import Availability from "./pages/Availability";
import MyQRCode from "./pages/MyQRCode";
import AboutUs from "./pages/AboutUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AdminLayout from "./components/Admin/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminLockers from "./pages/Admin/AdminLockers";
import AdminBookings from "./pages/Admin/AdminBookings";
import AdminUsers from "./pages/Admin/AdminUsers";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminPage && !isAuthPage && (
        <div className="container">
          <Navbar />
        </div>
      )}
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<Home />} />

        {/* Auth Pages — self-contained, no layout wrapper needed */}
        {/* Unified Auth Page for seamless animated toggle */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />

        {/* Locker Pages */}
        <Route path="/book-locker" element={<BookLocker />} />
        <Route path="/availability" element={<Availability />} />
        <Route path="/my-qr-code" element={<MyQRCode />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="lockers" element={<AdminLockers />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
      </Routes>

      {!isAdminPage && !isAuthPage && <Footer />}

      <ToastContainer />
    </>
  );
}

export default App;
