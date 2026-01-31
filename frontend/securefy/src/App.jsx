import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./pages/Home";
import Navbar from "./components/Navbar/Navbar";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<Home />} />

        {/* Auth Pages */}
        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
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
