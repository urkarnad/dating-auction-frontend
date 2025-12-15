import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../api/user';

const LoginPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, login } = useAuth();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await loginUser(formData);

            login(
                { access: response.access, refresh: response.refresh },
                response.user || { id: 'temp' }
            );

            navigate('/');
        } catch (err) {
            console.error('Login error:', err);
            const errorMsg = err.response?.data?.non_field_errors?.[0]
                || err.response?.data?.detail
                || 'Помилка входу. Перевірте email та пароль.';
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleMicrosoftLogin = () => {
        window.location.href = 'http://localhost:8000/auth/login/azuread-tenant-oauth2/';
    };

    return (
        <div style={{
            maxWidth: '400px',
            margin: '50px auto',
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
                Вхід до Dating Auction
            </h1>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Email *
                    </label>
                    <input
                        type="email"
                        name="email"
                        placeholder="your.email@ukma.edu.ua"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Пароль *
                    </label>
                    <input
                        type="password"
                        name="password"
                        placeholder="Ваш пароль"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: loading ? '#ccc' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        marginBottom: '15px'
                    }}
                >
                    {loading ? 'Вхід...' : 'Увійти'}
                </button>
            </form>

            <div>
                або
            </div>

            <button
                onClick={handleMicrosoftLogin}
            >
                Увійти через Microsoft
            </button>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <p style={{ color: '#666', fontSize: '14px' }}>
                    Немає акаунту?{' '}
                    <Link to="/register" style={{ color: '#007bff', textDecoration: 'none' }}>
                        Зареєструватися
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
