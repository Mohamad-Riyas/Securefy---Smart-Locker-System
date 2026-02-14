import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./pages/Home";
import BookLocker from "./pages/BookLocker";       // ADDED
import Availability from "./pages/Availability";   // ADDED
import MyQRCode from "./pages/MyQRCode";          // ADDED
import Navbar from "./components/Navbar/Navbar";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
    <div className="container">
      <Navbar />
    </div>
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
