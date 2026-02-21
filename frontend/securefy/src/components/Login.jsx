import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch actual role from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const actualRole = userDoc.exists() ? userDoc.data().role : "user";

      toast.success(`Welcome back! Logged in as ${actualRole}`);
      navigate(actualRole === 'admin' ? '/admin' : '/');
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
            <div className="role-toggle-container mb-3" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                className={`btn ${role === 'user' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setRole('user')}
                style={{ flex: 1 }}
              >
                User
              </button>
              <button
                type="button"
                className={`btn ${role === 'admin' ? 'btn-danger' : 'btn-outline-danger'}`}
                onClick={() => setRole('admin')}
                style={{ flex: 1 }}
              >
                Admin
              </button>
            </div>
            <label className="auth-label">Email</label>
            <div className="auth-input">
              <span className="auth-icon">✉</span>
              <input
                type="email"
                placeholder={role === 'admin' ? "admin@securefy.com" : "you@example.com"}
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

            <button className={`auth-btn ${role === 'admin' ? 'admin-btn' : ''}`} type="submit">
              {role === 'admin' ? 'Admin Login' : 'Login'}
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
