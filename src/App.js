import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import LotDetailPage from './pages/LotDetailPage';
import MyLotPage from './pages/MyLotPage';
import ProfilePage from './pages/ProfilePage';
import MyBidsPage from './pages/MyBidsPage';
import ComplaintsPage from './pages/ComplaintsPage';
import RulesPage from './pages/RulesPage';
import ContactsPage from './pages/ContactsPage';
import Header from "./components/Header";
import Footer from "./components/Footer";
import AuthCallbackPage from "./pages/AuthCallbackPage";

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Завантаження...</div>;
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Завантаження...</div>;
    }

    return !isAuthenticated ? children : <Navigate to="/" />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Header />
                <Routes>
                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <LoginPage />
                            </PublicRoute>
                        }
                    />
                    <Route path="/rules" element={<RulesPage />} />
                    <Route path="/contacts" element={<ContactsPage />} />

                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <HomePage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/lots/:id"
                        element={
                            <PrivateRoute>
                                <LotDetailPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/mylot"
                        element={
                            <PrivateRoute>
                                <MyLotPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <PrivateRoute>
                                <ProfilePage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/mybids"
                        element={
                            <PrivateRoute>
                                <MyBidsPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/complaints"
                        element={
                            <PrivateRoute>
                                <ComplaintsPage />
                            </PrivateRoute>
                        }
                    />

                    <Route path="/auth/callback" element={<AuthCallbackPage />} />

                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
                <Footer />
            </Router>
        </AuthProvider>
    );
}

export default App;