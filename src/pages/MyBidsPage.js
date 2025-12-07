import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyBids } from '../api/bids';

const MyBidsPage = () => {
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchMyBids();
    }, [statusFilter]);

    const fetchMyBids = async () => {
        setLoading(true);
        try {
            const data = await getMyBids(statusFilter || null);
            console.log('отримані ставки:', data);
            setBids(data);
        } catch (err) {
            setError('помилка завантаження ставок');
            console.error('помилка:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('uk-UA');
    };

    if (loading) {
        return (
            <div>
                <main>завантаження...</main>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <main>{error}</main>
            </div>
        );
    }

    return (
        <div>
            <main>
                <h1>мої ставки</h1>

                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="status-filter">фільтр: </label>
                    <select
                        id="status-filter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">всі ставки</option>
                        <option value="active">активні</option>
                        <option value="overbid">перебиті</option>
                    </select>
                </div>

                {bids.length === 0 ? (
                    <p>ви ще не зробили жодної ставки</p>
                ) : (
                    <div>
                        {bids.map((bid) => (
                            <div
                                key={bid.id}
                                style={{
                                    border: '1px solid #ddd',
                                    padding: '15px',
                                    marginBottom: '15px',
                                    borderRadius: '8px',
                                    backgroundColor: bid.is_overbid ? '#fff5f5' : '#f0fff0'
                                }}
                            >
                                <h3>
                                    <Link to={`/lots/${bid.lot}`}>
                                        Лот #{bid.lot_info?.lot_number || bid.lot}
                                    </Link>
                                </h3>

                                {bid.lot_info && (
                                    <p>
                                        <strong>{bid.lot_info.first_name} {bid.lot_info.last_name}</strong>
                                    </p>
                                )}

                                <div>
                                    <p><strong>ваша ставка:</strong> {bid.amount} грн</p>

                                    {bid.lot_info && (
                                        <p><strong>поточна ставка:</strong> {bid.lot_info.current_bet} грн</p>
                                    )}

                                    <p><strong>дата:</strong> {formatDate(bid.created_at)}</p>

                                    {bid.is_overbid ? (
                                        <span style={{
                                            color: 'white',
                                            backgroundColor: '#dc3545',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}>
                                            перебито
                                        </span>
                                    ) : (
                                        <span style={{
                                            color: 'white',
                                            backgroundColor: '#28a745',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}>
                                            активна ставка
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyBidsPage;