import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyBids } from '../api/bids';
import Header from '../components/Header';
import Footer from '../components/Footer';

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
            setBids(data);
        } catch (err) {
            setError('Помилка завантаження ставок');
            console.error(err);
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
                <main>Завантаження...</main>
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

                <div>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
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
                            <div key={bid.id}>
                                <h3>
                                    <Link to={`/lots/${bid.lot}`}>
                                        Лот #{bid.lot}
                                    </Link>
                                </h3>

                                <div>
                                    <p><strong>{bid.amount} грн</strong></p>
                                    <p>Дата: {formatDate(bid.created_at)}</p>
                                    {bid.is_overbid ? (
                                        <span style={{ color: 'red' }}>перебито</span>
                                    ) : (
                                        <span style={{ color: 'green' }}>активна ставка</span>
                                    )}
                                </div>
                                <hr />
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyBidsPage;