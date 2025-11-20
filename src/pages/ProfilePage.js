import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile } from '../api/user';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ProfilePage = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        instagram: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                email: user.email || '',
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                phone: user.phone || '',
                instagram: user.instagram || '',
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const updatedUser = await updateUserProfile(formData);
            updateUser(updatedUser);
            setIsEditing(false);
            alert('Профіль успішно оновлено!');
        } catch (err) {
            console.error('Помилка оновлення профілю:', err);
            alert('Помилка оновлення профілю');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Header />
            <main>
                <h1>Мій профіль</h1>

                {!isEditing ? (
                    <div>
                        <p><strong>Email:</strong> {user?.email}</p>
                        <p><strong>Ім'я:</strong> {user?.first_name}</p>
                        <p><strong>Прізвище:</strong> {user?.last_name}</p>
                        <p><strong>Телефон:</strong> {user?.phone || 'Не вказано'}</p>
                        <p><strong>Instagram:</strong> {user?.instagram || 'Не вказано'}</p>
                        <button onClick={() => setIsEditing(true)}>Редагувати</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled
                        />

                        <input
                            type="text"
                            name="first_name"
                            placeholder="Ім'я"
                            value={formData.first_name}
                            onChange={handleInputChange}
                            required
                        />

                        <input
                            type="text"
                            name="last_name"
                            placeholder="Прізвище"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            required
                        />

                        <input
                            type="tel"
                            name="phone"
                            placeholder="Телефон"
                            value={formData.phone}
                            onChange={handleInputChange}
                        />

                        <input
                            type="text"
                            name="instagram"
                            placeholder="Instagram @username"
                            value={formData.instagram}
                            onChange={handleInputChange}
                        />

                        <button type="submit" disabled={loading}>
                            {loading ? 'Збереження...' : 'Зберегти'}
                        </button>
                        <button type="button" onClick={() => setIsEditing(false)}>
                            Скасувати
                        </button>
                    </form>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default ProfilePage;