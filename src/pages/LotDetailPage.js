import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLotById, addCommentOrBid } from '../api/lots';

const LotDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [lot, setLot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [text, setText] = useState('');
    const [amount, setAmount] = useState('');
    const [replyToId, setReplyToId] = useState(null);
    const [replyToName, setReplyToName] = useState('');

    const fetchLot = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getLotById(id);
            setLot(data);

            const userId = localStorage.getItem('user_id');
            setCurrentUser(userId ? parseInt(userId) : null);

            if (userId && data.user === parseInt(userId)) {
                navigate('/mylot');
            }
        } catch (err) {
            setError('Помилка завантаження лоту');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchLot();
    }, [fetchLot]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!text && !amount) {
            alert('Введіть коментар або ставку');
            return;
        }

        if (replyToId && amount) {
            alert('Не можна залишати ставку у відповіді на коментар');
            return;
        }

        try {
            const data = {};

            if (amount && !replyToId) {
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

            if (replyToId) {
                data.parent = replyToId;
            }

            await addCommentOrBid(id, data);

            setText('');
            setAmount('');
            setReplyToId(null);
            setReplyToName('');
            fetchLot();

            const message = replyToId
                ? 'Відповідь успішно додано!'
                : amount
                    ? 'Ставку успішно зроблено!'
                    : 'Коментар успішно додано!';
            alert(message);
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

    const handleReply = (comment) => {
        setReplyToId(comment.id);
        setReplyToName(comment.user_name || 'Користувач');
        setAmount('');
        document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' });
    };

    const cancelReply = () => {
        setReplyToId(null);
        setReplyToName('');
    };

    const renderComments = (comments, parentId = null, level = 0) => {
        const filtered = comments.filter(c => c.parent === parentId);

        if (filtered.length === 0) return null;

        return (
            <div style={{ marginLeft: level > 0 ? '30px' : '0' }}>
                {filtered.map((comment) => (
                    <div
                        key={comment.id}
                        style={{
                            border: '1px solid #ddd',
                            padding: '10px',
                            marginBottom: '10px',
                            borderRadius: '5px',
                            backgroundColor: level > 0 ? '#f9f9f9' : 'white'
                        }}
                    >
                        <div>
                            <strong>{comment.user_name || 'Користувач'}</strong>
                            {comment.bid && (
                                <span style={{
                                    marginLeft: '10px',
                                    color: 'green',
                                    fontWeight: 'bold'
                                }}>
                                    Ставка: {comment.bid} грн
                                </span>
                            )}
                        </div>

                        {comment.text && <p style={{ margin: '10px 0' }}>{comment.text}</p>}

                        <div style={{ fontSize: '12px', color: '#666' }}>
                            {new Date(comment.created_at).toLocaleString('uk-UA')}
                            {' • '}
                            <button
                                onClick={() => handleReply(comment)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#007bff',
                                    cursor: 'pointer',
                                    padding: 0,
                                    textDecoration: 'underline'
                                }}
                            >
                                Відповісти
                            </button>
                        </div>

                        {level === 0 && renderComments(comments, comment.id, 1)}
                    </div>
                ))}
            </div>
        );
    };

    if (loading) return <div><main>Завантаження...</main></div>;
    if (error) return <div><main>{error}</main></div>;
    if (!lot) return <div><main>Лот не знайдено</main></div>;

    return (
        <div>
            <main>
                <h1>Лот #{lot.lot_number || lot.id}</h1>

                {lot.photos && lot.photos.length > 0 ? (
                    <div>
                        <img
                            src={lot.photos[currentPhotoIndex]}
                            alt={`${lot.first_name} ${lot.last_name}`}
                            style={{ maxWidth: '500px', borderRadius: '8px' }}
                        />
                        {lot.photos.length > 1 && (
                            <div style={{ marginTop: '10px' }}>
                                <button onClick={() => handlePhotoNav('prev')}>←</button>
                                <span style={{ margin: '0 15px' }}>
                                    {currentPhotoIndex + 1} / {lot.photos.length}
                                </span>
                                <button onClick={() => handlePhotoNav('next')}>→</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div>Фото відсутнє</div>
                )}

                <div style={{ marginTop: '20px' }}>
                    <h2>{lot.first_name} {lot.last_name}</h2>
                    <p><strong>Факультет:</strong> {lot.faculty}</p>
                    {lot.major && <p><strong>Спеціальність:</strong> {lot.major}</p>}
                    <p><strong>Курс:</strong> {lot.year}</p>
                    <p><strong>Стать:</strong> {lot.gender}</p>
                    <p><strong>Поточна ставка:</strong> {lot.last_bet || 0} грн</p>
                    {lot.role && <p><strong>Роль:</strong> {lot.role}</p>}
                </div>

                {lot.description && (
                    <div style={{ marginTop: '20px' }}>
                        <h3>Опис</h3>
                        <p>{lot.description}</p>
                    </div>
                )}

                {lot.soundcloud_url && (
                    <div style={{ marginTop: '20px' }}>
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

                {lot.facebook_url && (
                    <p><strong>Facebook:</strong> <a href={lot.facebook_url} target="_blank" rel="noopener noreferrer">Профіль</a></p>
                )}

                {lot.instagram_url && (
                    <p><strong>Instagram:</strong> <a href={lot.instagram_url} target="_blank" rel="noopener noreferrer">Профіль</a></p>
                )}


                <div id="comment-form" style={{ marginTop: '30px' }}>
                    <h3>
                        {replyToId
                            ? 'Відповісти на коментар'
                            : 'Залишити коментар або зробити ставку'}
                    </h3>

                    {replyToId && (
                        <div style={{
                            padding: '10px',
                            backgroundColor: '#e7f3ff',
                            marginBottom: '10px',
                            borderRadius: '5px'
                        }}>
                            Відповідь на коментар від <strong>{replyToName}</strong>
                            <button
                                onClick={cancelReply}
                                style={{ marginLeft: '10px' }}
                            >
                                Скасувати
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {!replyToId && (
                            <input
                                type="number"
                                placeholder="Ставка (необов'язково)"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min="0"
                                max="10000"
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    marginBottom: '10px',
                                    borderRadius: '5px',
                                    border: '1px solid #ccc'
                                }}
                            />
                        )}
                        <textarea
                            placeholder={replyToId
                                ? "Ваша відповідь"
                                : "Ваш коментар (необов'язково якщо є ставка)"}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            rows="4"
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '5px',
                                border: '1px solid #ccc'
                            }}
                        />
                        <button
                            type="submit"
                            style={{
                                marginTop: '10px',
                                padding: '10px 20px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer'
                            }}
                        >
                            {replyToId
                                ? 'Відповісти'
                                : amount
                                    ? 'Зробити ставку'
                                    : 'Додати коментар'}
                        </button>
                    </form>
                </div>

                {lot.comments && lot.comments.length > 0 && (
                    <div style={{ marginTop: '30px' }}>
                        <h3>Коментарі та ставки</h3>
                        {renderComments(lot.comments)}
                    </div>
                )}
            </main>
        </div>
    );
};

export default LotDetailPage;