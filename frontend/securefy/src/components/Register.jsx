import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import "./Auth.css";
import { toast } from "react-toastify";
import logo from "../assets/Seecurefy logo.jpg";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";


export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // 'user' or 'admin'
  const [adminKey, setAdminKey] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    // Simple Admin Key Validation
    if (role === "admin" && adminKey !== "admin123") {
      toast.error("Invalid Admin Key!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update Auth Profile
      await updateProfile(user, { displayName: name });

      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        role: role,
        createdAt: new Date().toISOString()
      });

      toast.success(`Account created as ${role}! Please login.`);
      navigate("/login");
    } catch (err) {
      console.error(err);
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
            <h2>Register</h2>
            <p>Create your {role === 'admin' ? 'Admin' : 'Personal'} account</p>
          </div>

          <form onSubmit={handleRegister} className="auth-form">
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

            <label className="auth-label">Username</label>
            <div className="auth-input">
              <span className="auth-icon">👤</span>
              <input
                type="text"
                placeholder="Enter your username"
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

            {role === 'admin' && (
              <>
                <label className="auth-label" style={{ color: '#ff4444' }}>Admin Secret Key</label>
                <div className="auth-input" style={{ borderColor: '#ff4444' }}>
                  <span className="auth-icon">🔑</span>
                  <input
                    type="password"
                    placeholder="Enter Admin Key"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <button className={`auth-btn ${role === 'admin' ? 'admin-btn' : ''}`} type="submit">
              Create {role === 'admin' ? 'Admin' : ''} Account
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

