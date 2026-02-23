import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";

import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./pages/Home";
<<<<<<< HEAD
import BookLocker from "./pages/BookLocker";      
import Availability from "./pages/Availability";  
import MyQRCode from "./pages/MyQRCode";          
=======
import BookLocker from "./pages/BookLocker";
import Availability from "./pages/Availability";
import MyQRCode from "./pages/MyQRCode";
>>>>>>> 2e58f09 (feat: link about us page to navbar and footer)
import AdminLayout from "./components/Admin/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminLockers from "./pages/Admin/AdminLockers";
import AdminBookings from "./pages/Admin/AdminBookings";
import AdminUsers from "./pages/Admin/AdminUsers";
import Navbar from "./components/Navbar/Navbar";
<<<<<<< HEAD
=======
import AboutUs from "./pages/AboutUs";
import Footer from "./components/Footer/Footer";
>>>>>>> 2e58f09 (feat: link about us page to navbar and footer)

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
<<<<<<< HEAD
    const location = useLocation();
  return (
    <>
{!location.pathname.startsWith('/admin') && (
        <div className="container">
          <Navbar />
        </div>
      )}    
=======
  const location = useLocation();
  return (
    <>
      {!location.pathname.startsWith('/admin') && (
        <div className="container">
          <Navbar />
        </div>
      )}
>>>>>>> 2e58f09 (feat: link about us page to navbar and footer)
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
<<<<<<< HEAD
=======

        {/* About Us Page */}
        <Route path="/about" element={<AboutUs />} />

>>>>>>> 2e58f09 (feat: link about us page to navbar and footer)
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="lockers" element={<AdminLockers />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
<<<<<<< HEAD
        
      </Routes>

=======

      </Routes>

      {!location.pathname.startsWith('/admin') && <Footer />}

>>>>>>> 2e58f09 (feat: link about us page to navbar and footer)
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
