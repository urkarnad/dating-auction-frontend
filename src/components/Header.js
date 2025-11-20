import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (!isAuthenticated) {
        return (
            <header>
                <nav>
                    <Link to="/rules">Rules</Link>
                </nav>
            </header>
        );
    }

    return (
        <header>
            <nav>
                <Link to="/">Auction</Link>
                <Link to="/mylot">My Lot</Link>
                <Link to="/mybids">My Bids</Link>
                <Link to="/profile">Profile</Link>
                <Link to="/rules">Rules</Link>
                <button onClick={handleLogout}>Logout</button>
            </nav>
        </header>
    );
};

export default Header;