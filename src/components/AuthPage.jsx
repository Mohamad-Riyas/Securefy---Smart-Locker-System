import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/securefy-logo.jpg";
import { FaEnvelope, FaLock, FaUser, FaArrowRight, FaUserShield, FaEye, FaEyeSlash, FaHome } from "react-icons/fa";

export default function AuthPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, userRole, loading: authLoading } = useAuth();

    const [mode, setMode] = useState(location.pathname === "/register" ? "register" : "login");
    const [role, setRole] = useState("user");
    const [loading, setLoading] = useState(false);

    // Form fields
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (!authLoading && currentUser) {
            if (userRole === "admin") navigate("/admin");
            else navigate("/");
        }
    }, [currentUser, userRole, authLoading, navigate]);

    useEffect(() => {
        // Sync mode with URL
        const newMode = location.pathname === "/register" ? "register" : "login";
        setMode(newMode);
        if (newMode === "register") {
            setRole("user");
        }
    }, [location.pathname]);

    const handleToggle = () => {
        if (mode === "login") {
            navigate("/register");
        } else {
            navigate("/login");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (mode === "login") {
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                let actualRole = "user";
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) actualRole = userDoc.data().role || "user";
                } catch (err) {
                    console.warn(err);
                }

                if (actualRole !== role) {
                    await signOut(auth);
                    toast.error(`Access denied. Please select the correct login section for your role.`);
                    setLoading(false);
                    return;
                }

                toast.success(`Welcome back!`);
                navigate(actualRole === "admin" ? "/admin" : "/");
            } catch (err) {
                toast.error(err.message);
            }
        } else {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                await updateProfile(user, { displayName: name });
                const finalRole = "user";
                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    name,
                    email,
                    role: finalRole,
                    createdAt: new Date().toISOString(),
                }, { merge: true });
                toast.success(`Account created successfully!`);
                setTimeout(() => navigate("/login"), 1000);
            } catch (err) {
                toast.error(`Registration Failed: ${err.message}`);
            }
        }
        setLoading(false);
    };

    // Determine lightning colors based on mode
    const bgColors = mode === "login"
        ? "rgba(0,180,255,0.18), rgba(60,120,255,0.15), rgba(0,255,200,0.12)" // Blue lightning
        : "rgba(255,0,200,0.18), rgba(160,0,255,0.15), rgba(255,100,0,0.12)"; // Purple/Neon lightning

    const borderGlow = mode === "login"
        ? "linear-gradient(90deg,rgba(0,200,255,0.8),rgba(60,120,255,0.7),rgba(0,255,200,0.7))"
        : "linear-gradient(90deg,rgba(255,0,200,0.8),rgba(160,0,255,0.7),rgba(255,100,0,0.7))";

    const buttonBg = role === "admin"
        ? "linear-gradient(90deg, #ef4444, #dc2626)"
        : (mode === "login"
            ? "linear-gradient(90deg, rgba(0,200,255,1), rgba(60,120,255,1))"
            : "linear-gradient(90deg, rgba(255,0,200,1), rgba(160,0,255,1))");

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#02040c]">

            {/* Back to Home Button */}
            <button
                onClick={() => navigate("/")}
                className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all backdrop-blur-md cursor-pointer group"
            >
                <FaHome className="text-sm group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold tracking-wide">Home</span>
            </button>

            {/* Dynamic Lightning Background Effect */}
            <motion.div
                className="absolute w-full h-full pointer-events-none z-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, filter: `hue-rotate(${mode === "login" ? 0 : 250}deg)` }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                style={{
                    background: `radial-gradient(1200px 600px at 50% 80%, rgba(0,200,255,0.18) 0%, transparent 60%), radial-gradient(700px 400px at 10% 20%, rgba(120,60,255,0.15) 0%, transparent 55%), radial-gradient(700px 400px at 90% 20%, rgba(0,255,200,0.12) 0%, transparent 55%)`
                }}
            />

            {/* Noise overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-overlay z-0"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E")` }}
            />

            <div className="w-full max-w-md relative z-10 perspective-[1000px]">
                {/* Animated Flipping Card */}
                <motion.div
                    animate={{ rotateY: mode === "login" ? 0 : -180 }}
                    transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
                    className="relative rounded-[18px] transform-style-preserve-3d"
                >
                    {/* We use a single card with dynamic content that ignores the 3D flip mirror effect by wrapping its content in another div that counter-rotates if needed, 
              Wait, simpler to just AnimatePresence the internal form contents while the card scales/glows. The user asked for "changing card lightning option" */}
                </motion.div>

                <motion.div
                    layout
                    className="relative rounded-[18px] p-7 backdrop-blur-xl border border-white/[0.14] shadow-[0_20px_60px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.12)] transition-colors duration-700"
                    style={{ background: "linear-gradient(180deg,rgba(255,255,255,0.10) 0%,rgba(255,255,255,0.06) 100%)" }}
                >
                    {/* Neon border glow */}
                    <motion.div
                        layout
                        className="absolute inset-[-1px] rounded-[18px] pointer-events-none opacity-60"
                        animate={{ background: borderGlow }}
                        transition={{ duration: 0.7 }}
                        style={{
                            WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                            WebkitMaskComposite: "xor",
                            mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                            maskComposite: "exclude",
                            padding: "2px",
                        }}
                    />

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mode}
                            initial={{ opacity: 0, scale: 0.9, rotateX: 15 }}
                            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                            exit={{ opacity: 0, scale: 0.9, rotateX: -15 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Header */}
                            <div className="text-center mb-6">
                                <motion.div
                                    className="w-16 h-16 mx-auto mb-4 rounded-2xl grid place-items-center shadow-[0_0_35px_rgba(255,255,255,0.2)] relative overflow-hidden"
                                >
                                    <motion.div
                                        className="absolute inset-0 opacity-80"
                                        animate={{ background: borderGlow }}
                                        transition={{ duration: 0.7 }}
                                    />
                                    <img src={logo} alt="Securefy Logo" className="relative z-10 w-[70%] h-[70%] object-contain drop-shadow-md rounded-lg" />
                                </motion.div>
                                <h2 className="text-[#eaf2ff] text-[26px] font-extrabold tracking-wide m-0">
                                    {mode === "login" ? (role === "admin" ? "Admin Gateway" : "Welcome Back") : (role === "admin" ? "Master Access" : "Join Securefy")}
                                </h2>
                                <p className="mt-1.5 text-[rgba(230,245,255,0.7)] text-[14px]">
                                    {mode === "login" ? "Securely login to your account" : "Initialize your new locker account"}
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                                {/* Role Toggle */}
                                {mode === "login" && (
                                    <div className="flex gap-2.5 mb-2">
                                        <button
                                            type="button"
                                            onClick={() => setRole("user")}
                                            className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all duration-300 ${role === "user"
                                                ? "bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                                                : "bg-transparent text-slate-400 border-slate-700 hover:bg-white/5"
                                                }`}
                                        >
                                            <FaUser className="text-xs" /> User
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRole("admin")}
                                            className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all duration-300 ${role === "admin"
                                                ? "bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                                                : "bg-transparent text-slate-400 border-slate-700 hover:bg-white/5"
                                                }`}
                                        >
                                            <FaUserShield className="text-xs" /> Admin
                                        </button>
                                    </div>
                                )}

                                {/* Optional Username for Register */}
                                {mode === "register" && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                                        <label className="text-[rgba(235,245,255,0.85)] text-xs font-semibold mb-1 block uppercase tracking-wider">Username</label>
                                        <div className="flex items-center gap-2.5 px-3 py-3 rounded-xl border border-white/[0.12] bg-white/[0.05] focus-within:bg-white/[0.08] transition-colors">
                                            <FaUser className="text-[rgba(230,245,255,0.6)] text-sm shrink-0" />
                                            <input
                                                type="text"
                                                placeholder="Choose a username"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                                className="w-full bg-transparent border-none outline-none text-white text-sm placeholder:text-white/30"
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {/* Email */}
                                <div>
                                    <label className="text-[rgba(235,245,255,0.85)] text-xs font-semibold mb-1 block uppercase tracking-wider">Email Area</label>
                                    <div className="flex items-center gap-2.5 px-3 py-3 rounded-xl border border-white/[0.12] bg-white/[0.05] focus-within:bg-white/[0.08] transition-colors">
                                        <FaEnvelope className="text-[rgba(230,245,255,0.6)] text-sm shrink-0" />
                                        <input
                                            type="email"
                                            placeholder={role === "admin" ? "admin@securefy.com" : "you@example.com"}
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full bg-transparent border-none outline-none text-white text-sm placeholder:text-white/30"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="text-[rgba(235,245,255,0.85)] text-xs font-semibold mb-1 block uppercase tracking-wider">Security Key</label>
                                    <div className="flex items-center gap-2.5 px-3 py-3 rounded-xl border border-white/[0.12] bg-white/[0.05] focus-within:bg-white/[0.08] transition-colors relative">
                                        <FaLock className="text-[rgba(230,245,255,0.6)] text-sm shrink-0" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength={mode === "register" ? 6 : 0}
                                            className="w-full bg-transparent border-none outline-none text-white text-sm placeholder:text-white/30 pr-8"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <FaEyeSlash className="text-[16px]" /> : <FaEye className="text-[16px]" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Submit */}
                                <motion.button
                                    type="submit"
                                    disabled={loading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`mt-4 py-4 px-4 rounded-xl border-none cursor-pointer text-white font-extrabold tracking-widest uppercase text-sm shadow-xl flex items-center justify-center gap-2 ${loading ? "opacity-70" : ""}`}
                                    animate={{ background: buttonBg }}
                                    transition={{ duration: 0.5 }}
                                >
                                    {loading ? "Authenticating..." : (mode === "login" ? "Authenticate" : "Initialize")}
                                    {!loading && <FaArrowRight className="text-xs" />}
                                </motion.button>

                                {/* Toggle Mode */}
                                <div className="flex justify-center mt-4">
                                    <button
                                        type="button"
                                        onClick={handleToggle}
                                        className="text-slate-400 text-sm font-medium hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full border border-white/10"
                                    >
                                        {mode === "login" ? "No account? Switch to Register" : "Have an account? Go to Login"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </AnimatePresence>

                    {/* Bottom decorative glowing beam */}
                    <motion.div
                        animate={{ background: borderGlow }}
                        transition={{ duration: 0.7 }}
                        className="absolute left-[15%] right-[15%] -bottom-1 h-1.5 rounded-full opacity-100 blur-[8px]"
                    />
                </motion.div>
            </div>
        </div>
    );
}
