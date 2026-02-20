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

export default Navibar;