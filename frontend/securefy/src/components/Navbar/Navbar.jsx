import React, { useState } from "react";
import './Navbar.css';
import logo from '../../assets/Seecurefy logo.jpg';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { FaBars, FaTimes, FaUserCircle } from "react-icons/fa";

const Navibar = () => {
        const { currentUser, userName } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };
    const toggleMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };
    return (
         <nav className="navbar-container">
            <div className="navbar-logo-group">
                <Link to="/" className="logo-link">
                    <img src={logo} alt="Securefy Logo" className="navbar-logo" />
                    <h1 className="navbar-brand">Securefy</h1>
                </Link>
            </div>


            <img src={logo} alt="Securefy Logo" className="logo" /> 
            
            <h1>Securefy</h1>

            <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/book-locker">Book Locker</Link></li>
                <li><Link to="/availability">Availability</Link></li>
                <li><Link to="/my-qr-code">My QR Code</Link></li>
            </ul>

            <div className="btn-sign_in">
            <button type="sign_in" className="sign_in-btn">
                <Link to="/login">Sign in </Link>
            </button>
            </div>
        </div>
    );
};

=======
import React from "react";
import './Navbar.css';
import logo from '../../assets/Seecurefy logo.jpg';
import { Link, useNavigate } from "react-router-dom";

const Navibar = () => {
    return (
        <div className="navbar">

            <img src={logo} alt="Securefy Logo" className="logo" /> 
            
            <h1>Securefy</h1>

            <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/book-locker">Book Locker</Link></li>
                <li><Link to="/availability">Availability</Link></li>
                <li><Link to="/my-qr-code">My QR Code</Link></li>
            </ul>

            <div className="btn-sign_in">
            <button type="sign_in" className="sign_in-btn">
                <Link to="/login">Sign in </Link>
            </button>
            </div>
        </div>
    );
};

>>>>>>> 27307c9ae8e7fd89759f9433196d1d511b1b3af0
export default Navibar;
