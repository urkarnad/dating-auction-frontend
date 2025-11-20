// src/components/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer>
            <div>
                <Link to="/contacts">Feedback</Link>
                <p>&copy; {new Date().getFullYear()} Dating Auction Pro</p>
            </div>
        </footer>
    );
};

export default Footer;