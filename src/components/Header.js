import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Header.css';

const Header = () => {
    const { isAuthenticated, logout, user } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const handleLogout = async () => {
        await logout();
        window.location.href = '/login';
    };

    return (
        <header className="header">
            <div className="header-container">
                <Link to="/" className="logo">
                    <img
                        src="/heart.png"
                        alt="Logo"
                        className="logo-icon"
                    />
                    <span className="logo-text">АУКЦІОН ПОБАЧЕНЬ</span>
                </Link>

                <nav className="nav">
                    {isAuthenticated ? (
                        <>
                            <Link
                                to="/"
                                className={`nav-link ${isActive('/') ? 'active' : ''}`}
                            >
                                аукціон
                            </Link>
                            <Link
                                to="/mylot"
                                className={`nav-link ${isActive('/mylot') ? 'active' : ''}`}
                            >
                                мій лот
                            </Link>
                            <Link
                                to="/mybids"
                                className={`nav-link ${isActive('/mybids') ? 'active' : ''}`}
                            >
                                мої ставки
                            </Link>
                            <Link
                                to="/profile"
                                className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
                            >
                                профіль
                            </Link>
                            <Link
                                to="/rules"
                                className={`nav-link ${isActive('/rules') ? 'active' : ''}`}
                            >
                                правила
                            </Link>
                            <button onClick={handleLogout} className="nav-link logout-btn">
                                вихід
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/rules"
                                className={`nav-link ${isActive('/rules') ? 'active' : ''}`}
                            >
                                правила
                            </Link>
                            <Link
                                to="/contacts"
                                className={`nav-link ${isActive('/contacts') ? 'active' : ''}`}
                            >
                                зворотній зв'язок
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;