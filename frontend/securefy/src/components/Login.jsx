import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import "./Auth.css";
import { toast } from "react-toastify";
import logo from "../assets/Seecurefy logo.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
           // We could add a check here against the Firestore user role if we wanted to enforce it strictly
      // But for now, we just rely on the redirect logic in the protected routes or dashboard
      toast.success(`Logged in as ${role}!`);
      navigate(role === 'admin' ? '/admin' : '/');
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
              <img src={logo} alt="Securefy Logo" />
            </div>
           <h2>{role === 'admin' ? 'Admin Login' : 'Login'}</h2>
            <p>Access your {role === 'admin' ? 'Management Dashboard' : 'Smart Locker dashboard'}</p>
          </div>

          <form onSubmit={handleLogin} className="auth-form">
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button className="auth-btn" type="submit">
              Login
              <span className="auth-btn-glow" />
            </button>

            <div className="auth-footer">
              <span>Don’t have an account?</span>
              <Link to="/register" className="auth-link">
                Register
              </Link>
            </div>
          </form>

          <div className="auth-bottom-glow" />
        </div>
      </div>
    </div>
  );
}
