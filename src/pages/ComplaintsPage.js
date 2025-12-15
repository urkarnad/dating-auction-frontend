import React, { useState, useEffect } from 'react';
import { getComplaintsList } from '../api/complaints';

const ComplaintsPage = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                const data = await getComplaintsList();
                setComplaints(data);
            } catch (err) {
                console.error('Помилка завантаження скарг:', err);
                if (err.response?.status === 403) {
                    setError('У вас немає доступу до цієї сторінки');
                } else {
                    setError('Помилка завантаження скарг');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchComplaints();
    }, []);

    if (loading) {
        return <div><main>Завантаження...</main></div>;
    }

    if (error) {
        return <div><main><h1>{error}</h1></main></div>;
    }

    return (
        <div>
            <main>
                <h1>Список скарг</h1>

                {complaints.length === 0 ? (
                    <p>Скарг поки що немає</p>
                ) : (
                    <div>
                        {complaints.map((complaint) => (
                            <div
                                key={complaint.id}
                                style={{
                                    border: '1px solid #ddd',
                                    padding: '15px',
                                    marginBottom: '15px',
                                    borderRadius: '8px',
                                    backgroundColor: '#f9f9f9'
                                }}
                            >
                                <div style={{ marginBottom: '10px' }}>
                                    <strong>ID скарги:</strong> {complaint.id}
                                </div>

                                <div style={{ marginBottom: '10px' }}>
                                    <strong>Користувач:</strong> {complaint.user}
                                </div>

                                <div style={{ marginBottom: '10px' }}>
                                    <strong>Тема:</strong> {complaint.theme}
                                </div>

                                {complaint.text && (
                                    <div style={{ marginBottom: '10px' }}>
                                        <strong>Опис:</strong>
                                        <p style={{
                                            marginTop: '5px',
                                            padding: '10px',
                                            backgroundColor: 'white',
                                            borderRadius: '5px'
                                        }}>
                                            {complaint.text}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default ComplaintsPage;