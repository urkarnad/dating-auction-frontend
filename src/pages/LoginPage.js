import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const handleLoginClick = () => {
        // redirect on Microsoft
        window.location.href = 'http://localhost:8000/auth/login/azuread-tenant-oauth2/';
    };

    return (
        <div>
            <main>
                <h1>Вхід до Dating Auction Pro</h1>
                <div>
                    <button onClick={handleLoginClick}>
                        Увійти через Microsoft Office 365
                    </button>
                </div>
            </main>
        </div>
    );
};

export default LoginPage;