import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css'

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-left">
                    <p className="footer-text">made by FIDo</p>
                </div>
                <div className="footer-right">
                    <Link to="/contacts" className="footer-link">
                        зворотній зв'язок
                    </Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;