import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import "./Auth.css";
import { toast } from "react-toastify";
import logo from "../assets/Seecurefy logo.jpg";


export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success("Account created!");
      navigate("/login");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-noise" />

      <div className="auth-wrap">
        <div className="auth-card glow">
          <div className="auth-header">
            <div className="auth-logo">
              <img src={logo} alt="Securefy Logo"></>
            </div>
            <h2>Register</h2>
            <p>Create your Smart Locker account</p>
          </div>

          <form onSubmit={handleRegister} className="auth-form">
            <label className="auth-label">Name</label>
            <div className="auth-input">
              <span className="auth-icon">👤</span>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <label className="auth-label">Email</label>
            <div className="auth-input">
              <span className="auth-icon">✉</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <label className="auth-label">Password</label>
            <div className="auth-input">
              <span className="auth-icon">🔒</span>
              <input
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button className="auth-btn" type="submit">
              Create Account
              <span className="auth-btn-glow" />
            </button>

            <div className="auth-footer">
              <span>Already have an account?</span>
              <Link to="/login" className="auth-link">
                Login
              </Link>
            </div>
          </form>

          <div className="auth-bottom-glow" />
        </div>
      </div>
    </div>
  );
}
