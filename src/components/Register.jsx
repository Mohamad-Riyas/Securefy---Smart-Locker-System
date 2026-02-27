import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import { toast } from "react-toastify";
import logo from "../assets/securefy-logo.jpg";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { FaEnvelope, FaLock, FaUser, FaArrowRight, FaUserShield } from "react-icons/fa";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: name });
      const finalRole = role === "admin" ? "admin" : "user";
      console.log("Registering user with role:", finalRole);
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        name,
        email,
        role: finalRole,
        createdAt: new Date().toISOString(),
      }, { merge: true });
      console.log("Firestore document created for UID:", user.uid);
      toast.success(`Success! Account created as ${finalRole.toUpperCase()}.`);
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      console.error("Registration Error:", err);
      toast.error(`Registration Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(1200px 600px at 50% 80%, rgba(0,200,255,0.18) 0%, transparent 60%), radial-gradient(700px 400px at 10% 20%, rgba(120,60,255,0.15) 0%, transparent 55%), radial-gradient(700px 400px at 90% 20%, rgba(0,255,200,0.12) 0%, transparent 55%), linear-gradient(180deg,#050814 0%,#02040c 100%)",
      }}
    >
      {/* Noise overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div
          className="relative rounded-[18px] p-7 backdrop-blur-xl border border-white/[0.14] shadow-[0_20px_60px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.12)]"
          style={{
            background: "linear-gradient(180deg,rgba(255,255,255,0.10) 0%,rgba(255,255,255,0.06) 100%)",
          }}
        >
          {/* Neon border glow */}
          <div
            className="absolute inset-[-1px] rounded-[18px] pointer-events-none opacity-55"
            style={{
              background: "linear-gradient(90deg,rgba(0,220,255,0.8),rgba(120,60,255,0.7),rgba(0,255,200,0.7))",
              WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
              mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              maskComposite: "exclude",
              padding: "1px",
            }}
          />

          {/* Header */}
          <div className="text-center mb-6">
            <div
              className="w-14 h-14 mx-auto mb-3 rounded-2xl grid place-items-center shadow-[0_0_28px_rgba(0,220,255,0.45),inset_0_1px_0_rgba(255,255,255,0.25)]"
              style={{
                background: "radial-gradient(circle at 30% 30%, rgba(0,220,255,0.9), rgba(120,60,255,0.85))",
              }}
            >
              <img
                src={logo}
                alt="Securefy Logo"
                className="w-[70%] h-[70%] object-contain drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]"
              />
            </div>
            <h2 className="text-[#eaf2ff] text-2xl font-bold tracking-wide m-0">
              {role === "admin" ? "Create Admin Account" : "Create Account"}
            </h2>
            <p className="mt-1.5 text-[rgba(230,245,255,0.7)] text-[13px]">
              Create your {role === "admin" ? "Admin" : "Personal"} secure locker account
            </p>
          </div>

          <form onSubmit={handleRegister} className="flex flex-col gap-3">
            {/* Role Toggle */}
            <div className="flex gap-2.5 mb-1">
              <button
                type="button"
                onClick={() => setRole("user")}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all duration-200 cursor-pointer ${role === "user"
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/30"
                    : "bg-transparent text-indigo-400 border-indigo-500/40 hover:bg-indigo-500/10"
                  }`}
              >
                <FaUser className="text-xs" /> User
              </button>
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all duration-200 cursor-pointer ${role === "admin"
                    ? "bg-red-600 text-white border-red-500 shadow-lg shadow-red-500/30"
                    : "bg-transparent text-red-400 border-red-500/40 hover:bg-red-500/10"
                  }`}
              >
                <FaUserShield className="text-xs" /> Admin
              </button>
            </div>

            {/* Username */}
            <div>
              <label className="text-[rgba(235,245,255,0.85)] text-xs font-medium mb-1 block">Username</label>
              <div className="flex items-center gap-2.5 px-3 py-3 rounded-xl border border-white/[0.12] bg-black/[0.22]">
                <FaUser className="text-[rgba(230,245,255,0.6)] text-sm shrink-0" />
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-transparent border-none outline-none text-[#eaf2ff] text-sm placeholder:text-[rgba(230,245,255,0.4)]"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-[rgba(235,245,255,0.85)] text-xs font-medium mb-1 block">Email</label>
              <div className="flex items-center gap-2.5 px-3 py-3 rounded-xl border border-white/[0.12] bg-black/[0.22]">
                <FaEnvelope className="text-[rgba(230,245,255,0.6)] text-sm shrink-0" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-transparent border-none outline-none text-[#eaf2ff] text-sm placeholder:text-[rgba(230,245,255,0.4)]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-[rgba(235,245,255,0.85)] text-xs font-medium mb-1 block">Password</label>
              <div className="flex items-center gap-2.5 px-3 py-3 rounded-xl border border-white/[0.12] bg-black/[0.22]">
                <FaLock className="text-[rgba(230,245,255,0.6)] text-sm shrink-0" />
                <input
                  type="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-transparent border-none outline-none text-[#eaf2ff] text-sm placeholder:text-[rgba(230,245,255,0.4)]"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`relative mt-2 py-3 px-4 rounded-xl border-none cursor-pointer text-slate-900 font-bold tracking-wide overflow-hidden flex items-center justify-center gap-2 transition-opacity ${loading ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"
                }`}
              style={{
                background:
                  role === "admin"
                    ? "linear-gradient(90deg, #ef4444, #dc2626)"
                    : "linear-gradient(90deg, rgba(0,220,255,1), rgba(120,60,255,1))",
              }}
            >
              {loading
                ? "Creating Account..."
                : `Create ${role === "admin" ? "Admin " : ""}Account`}
              {!loading && <FaArrowRight className="text-xs" />}
              <span className="absolute inset-[-60%] bg-[radial-gradient(circle,rgba(255,255,255,0.45),transparent_55%)] -translate-x-[40%] transition-transform duration-500 pointer-events-none hover:translate-x-[40%]" />
            </button>

            <div className="flex justify-center gap-2 mt-3 text-[rgba(230,245,255,0.75)] text-[13px]">
              <span>Already have an account?</span>
              <Link to="/login" className="text-cyan-400 font-bold no-underline hover:underline">
                Login
              </Link>
            </div>
          </form>

          {/* Bottom neon bar */}
          <div
            className="absolute left-[10%] right-[10%] -bottom-2.5 h-2.5 rounded-full opacity-70 blur-[10px]"
            style={{
              background: "radial-gradient(circle, rgba(0,220,255,0.8), transparent 70%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
