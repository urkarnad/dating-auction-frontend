import React, { createContext, useState, useEffect, useContext } from 'react';
import { getUserProfile, logoutUser as apiLogout } from '../api/user';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const userData = await getUserProfile();
                localStorage.setItem('user_id', userData.id);
                setUser(userData);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Auth check failed:', error);
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user_id');
                setIsAuthenticated(false);
            }
        }
        setLoading(false);
    };

    const login = (tokens, userData) => {
        localStorage.setItem('access_token', tokens.access);
        if (tokens.refresh) {
            localStorage.setItem('refresh_token', tokens.refresh);
        }
        localStorage.setItem('user_id', userData.id);
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = async () => {
        try {
            await apiLogout();
        } catch (error) {
            console.error('Logout error:', error);
        }

        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_id');

        setUser(null);
        setIsAuthenticated(false);

        window.location.href = '/login';
    };

    const updateUser = (userData) => {
        setUser(userData);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated,
                login,
                logout,
                updateUser,
                checkAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};