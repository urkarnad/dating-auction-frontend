import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { submitComplaint } from '../api/user';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ComplaintsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Отримуємо lotId з state (якщо переходимо зі сторінки лоту)
    const { lotId } = location.state || {};

    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!text.trim()) {
            alert('Опишіть проблему');
            return;
        }

        if (!lotId) {
            alert('Не вказано лот для скарги');
            return;
        }

        setLoading(true);
        try {
            await submitComplaint(lotId, { text });
            alert('Скаргу успішно відправлено. Дякуємо!');
            navigate(-1);
        } catch (err) {
            console.error('Помилка відправки скарги:', err);
            alert('Помилка відправки скарги. Спробуйте ще раз.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Header />
            <main>
                <h1>Подати скаргу</h1>

                <form onSubmit={handleSubmit}>
                    {lotId && (
                        <p>Скарга на лот #{lotId}</p>
                    )}

                    <textarea
                        name="text"
                        placeholder="Опишіть проблему"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows="8"
                        required
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? 'Відправка...' : 'Відправити скаргу'}
                    </button>

                    <button type="button" onClick={() => navigate(-1)}>
                        Скасувати
                    </button>
                </form>
            </main>
            <Footer />
        </div>
    );
};

export default ComplaintsPage;