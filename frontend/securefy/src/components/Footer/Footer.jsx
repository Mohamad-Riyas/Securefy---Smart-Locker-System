import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
    return (
        <footer className="footer-v2">
            <div className="footer-grid">
                <div className="footer-brand">
                    <h3>Securefy</h3>
                    <p>Innovating campus security through smart IoT solutions.</p>
                </div>
                <div className="footer-links-v2">
                    <div className="link-col">
                        <h4>Product</h4>
                        <Link to="/book-locker">Book Locker</Link>
                        <Link to="/availability">Availability</Link>
                        <Link to="/about">About Us</Link>
                    </div>
                    <div className="link-col">
                        <h4>Support</h4>
                        <Link to="#">Help Center</Link>
                        <Link to="#">Terms of Service</Link>
                    </div>
                </div>
            </div>
            <div className="footer-bottom-v2">
                © 2024 Securefy Smart Systems. Built for IIT.
            </div>
        </footer>
    );
};

export default Footer;
