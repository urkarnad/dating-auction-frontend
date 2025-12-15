import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { submitComplaint, getComplaintThemes } from '../api/complaints';

const ComplaintsDetailPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { lotId } = location.state || {};

    const [themes, setThemes] = useState([]);
    const [selectedTheme, setSelectedTheme] = useState('');
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingThemes, setLoadingThemes] = useState(true);

    useEffect(() => {
        const fetchThemes = async () => {
            try {
                const data = await getComplaintThemes();
                setThemes(data);
            } catch (err) {
                console.error('Помилка завантаження тем:', err);
                alert('Помилка завантаження тем скарг');
            } finally {
                setLoadingThemes(false);
            }
        };

        fetchThemes();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedTheme) {
            alert('Оберіть тему скарги');
            return;
        }

        setLoading(true);
        try {
            await submitComplaint(selectedTheme, { text });
            alert('Скаргу успішно відправлено. Дякуємо!');
            navigate(-1);
        } catch (err) {
            console.error('Помилка відправки скарги:', err);
            alert(err.response?.data?.detail || 'Помилка відправки скарги. Спробуйте ще раз.');
        } finally {
            setLoading(false);
        }
    };

    if (loadingThemes) {
        return <div><main>Завантаження...</main></div>;
    }

    return (
        <div>
            <main>
                <h1>Подати скаргу</h1>

                {lotId && (
                    <p style={{ color: '#666', marginBottom: '20px' }}>
                        Скарга на лот #{lotId}
                    </p>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                            Тема скарги *
                        </label>
                        <select
                            value={selectedTheme}
                            onChange={(e) => setSelectedTheme(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '5px',
                                border: '1px solid #ccc'
                            }}
                        >
                            <option value="">Оберіть тему</option>
                            {themes.map((theme) => (
                                <option key={theme.id} value={theme.id}>
                                    {theme.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                            Опис (необов'язково)
                        </label>
                        <textarea
                            placeholder="Опишіть проблему детальніше"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            rows="8"
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '5px',
                                border: '1px solid #ccc'
                            }}
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: loading ? '#ccc' : '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                marginRight: '10px'
                            }}
                        >
                            {loading ? 'Відправка...' : 'Відправити скаргу'}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer'
                            }}
                        >
                            Скасувати
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default ComplaintsDetailPage;