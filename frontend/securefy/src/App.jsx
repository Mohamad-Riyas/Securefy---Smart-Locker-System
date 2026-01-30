import React from "react";
import { Routes, Route } from "react-router-dom";
import { Link } from "react-router-dom";
import "./App.css";

import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <div className="App">
      <div className="auth-wrapper">
        <div className="auth-inner">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
          <ToastContainer />
        </div>
      </div>
    </div>
  );
}

export default App; 
