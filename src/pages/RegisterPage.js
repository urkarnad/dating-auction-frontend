import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../api/user';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, login } = useAuth();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        confirm_password: '',
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

        if (formData.password !== formData.confirm_password) {
            alert('Паролі не збігаються!');
            return;
        }

        if (!formData.email.endsWith('@ukma.edu.ua')) {
            alert('Реєстрація можлива лише через корпоративну пошту НаУКМА (@ukma.edu.ua)');
            return;
        }

        setLoading(true);

        try {
            const response = await registerUser(formData);

            login(
                { access: response.access, refresh: response.refresh },
                response.user
            );

            navigate('/');
            alert('Реєстрація успішна! Ласкаво просимо!');
        } catch (err) {
            console.error('Registration error:', err);
            const errorMsg = err.response?.data?.email?.[0]
                || err.response?.data?.password?.[0]
                || err.response?.data?.non_field_errors?.[0]
                || JSON.stringify(err.response?.data)
                || 'Помилка реєстрації. Спробуйте ще раз.';
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
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
                Реєстрація
            </h1>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Email НаУКМА *
                    </label>
                    <input
                        type="email"
                        name="email"
                        placeholder="your.email@ukma.edu.ua"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                            fontSize: '14px'
                        }}
                    />
                    <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                        Тільки корпоративна пошта @ukma.edu.ua
                    </p>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Ім'я *
                    </label>
                    <input
                        type="text"
                        name="first_name"
                        placeholder="Ваше ім'я"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                            fontSize: '14px'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Прізвище *
                    </label>
                    <input
                        type="text"
                        name="last_name"
                        placeholder="Ваше прізвище"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                            fontSize: '14px'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Пароль *
                    </label>
                    <input
                        type="password"
                        name="password"
                        placeholder="Мінімум 8 символів"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={8}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                            fontSize: '14px'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Підтвердіть пароль *
                    </label>
                    <input
                        type="password"
                        name="confirm_password"
                        placeholder="Повторіть пароль"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        required
                        minLength={8}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                            fontSize: '14px'
                        }}
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
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Реєстрація...' : 'Зареєструватися'}
                </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <p style={{ color: '#666', fontSize: '14px' }}>
                    Вже є акаунт?{' '}
                    <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>
                        Увійти
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;