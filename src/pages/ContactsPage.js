import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const ContactsPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

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
            await api.post('/contacts/', formData);
            setSuccess(true);
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: '',
            });

            setTimeout(() => {
                setSuccess(false);
            }, 5000);
        } catch (err) {
            console.error('Помилка відправки повідомлення:', err);
            alert('Помилка відправки. Спробуйте ще раз.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <main>
                <h1>Зворотній зв'язок</h1>

                {success && (
                    <div style={{ padding: '10px', backgroundColor: '#d4edda', marginBottom: '20px' }}>
                        Ваше повідомлення успішно відправлено!
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Ваше ім'я"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                    />

                    <input
                        type="text"
                        name="subject"
                        placeholder="Тема"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                    />

                    <textarea
                        name="message"
                        placeholder="Ваше повідомлення"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows="8"
                        required
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? 'Відправка...' : 'Відправити'}
                    </button>

                    <button type="button" onClick={() => navigate(-1)}>
                        Назад
                    </button>
                </form>

                <section style={{ marginTop: '40px' }}>
                    <h2>Контактна інформація</h2>
                    <p>Email: fido@datingauction.com</p>

                </section>
            </main>
        </div>
    );
};

export default ContactsPage;