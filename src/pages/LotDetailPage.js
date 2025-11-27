import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getLotById, addCommentOrBid } from '../api/lots';
import Header from '../components/Header';
import Footer from '../components/Footer';

const LotDetailPage = () => {
    const { id } = useParams();
    const [lot, setLot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [text, setText] = useState('');
    const [amount, setAmount] = useState('');

    const fetchLot = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getLotById(id);
            setLot(data);
        } catch (err) {
            setError('Помилка завантаження лоту');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id]);


    useEffect(() => {
        fetchLot();
    }, [fetchLot]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!text && !amount) {
            alert('Введіть коментар або ставку');
            return;
        }

        try {
            const data = {};

            if (amount) {
                const bidAmount = parseFloat(amount);
                const minBid = (lot.last_bet || 0) + 10;

                if (bidAmount < minBid) {
                    alert(`Мінімальна ставка: ${minBid} грн`);
                    return;
                }
                if (bidAmount > 10000) {
                    alert('Максимальна ставка: 10000 грн');
                    return;
                }

                data.amount = bidAmount;
            }

            if (text) {
                data.text = text;
            }

            await addCommentOrBid(id, data);

            setText('');
            setAmount('');
            fetchLot();
            alert(amount ? 'Ставку успішно зроблено!' : 'Коментар успішно додано!');
        } catch (err) {
            console.error('Помилка:', err);
            alert(err.response?.data?.detail || 'Помилка. Спробуйте ще раз.');
        }
    };

    const handlePhotoNav = (direction) => {
        if (!lot?.photos || lot.photos.length === 0) return;

        if (direction === 'next') {
            setCurrentPhotoIndex((prev) =>
                prev === lot.photos.length - 1 ? 0 : prev + 1
            );
        } else {
            setCurrentPhotoIndex((prev) =>
                prev === 0 ? lot.photos.length - 1 : prev - 1
            );
        }
    };

    if (loading) return <div><Header /><main>Завантаження...</main><Footer /></div>;
    if (error) return <div><Header /><main>{error}</main><Footer /></div>;
    if (!lot) return <div><Header /><main>Лот не знайдено</main><Footer /></div>;

    return (
        <div>
            <Header />
            <main>
                <h1>Лот #{lot.lot_number || lot.id}</h1>

                <Link to="/complaints" state={{ lotId: lot.id }}>
                    Поскаржитися
                </Link>

                {lot.photos && lot.photos.length > 0 ? (
                    <div>
                        <img
                            src={lot.photos[currentPhotoIndex]}
                            alt={`${lot.first_name} ${lot.last_name}`}
                        />
                        {lot.photos.length > 1 && (
                            <div>
                                <button onClick={() => handlePhotoNav('prev')}>←</button>
                                <span>{currentPhotoIndex + 1} / {lot.photos.length}</span>
                                <button onClick={() => handlePhotoNav('next')}>→</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div>Фото відсутнє</div>
                )}

                <div>
                    <h2>{lot.first_name} {lot.last_name}</h2>
                    <p>Факультет: {lot.faculty}</p>
                    {lot.major && <p>Спеціальність: {lot.major}</p>}
                    <p>Курс: {lot.year}</p>
                    <p>Стать: {lot.gender === 'M' ? 'Чоловік' : lot.gender === 'F' ? 'Жінка' : 'Інше'}</p>
                    <p>Поточна ставка: {lot.last_bet || lot.price || 0} грн</p>
                    {lot.role && <p>Роль: {lot.role}</p>}
                </div>

                {lot.description && (
                    <div>
                        <h3>Опис</h3>
                        <p>{lot.description}</p>
                    </div>
                )}

                {lot.soundcloud_url && (
                    <div>
                        <h3>Музика</h3>
                        <iframe
                            title="soundcloud-player"
                            width="100%"
                            height="166"
                            scrolling="no"
                            frameBorder="no"
                            allow="autoplay"
                            src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(lot.soundcloud_url)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`}
                        />
                    </div>
                )}

                <div>
                    <h3>Залишити коментар або зробити ставку</h3>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="number"
                            placeholder="Ставка (необов'язково)"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            min="0"
                            max="10000"
                            step="10"
                        />
                        <textarea
                            placeholder="Ваш коментар (необов'язково якщо є ставка)"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                        <button type="submit">
                            {amount ? 'Зробити ставку' : 'Додати коментар'}
                        </button>
                    </form>
                </div>

                {lot.comments && lot.comments.length > 0 && (
                    <div>
                        <h3>Коментарі та ставки</h3>
                        {lot.comments.map((comment) => (
                            <div key={comment.id}>
                                <strong>{comment.user_name || 'Користувач'}</strong>
                                {comment.bid && <span> - Ставка: {comment.bid} грн</span>}
                                <p>{comment.text}</p>
                                <small>{new Date(comment.created_at).toLocaleString('uk-UA')}</small>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default LotDetailPage;
