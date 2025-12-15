import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLotById, addCommentOrBid } from '../api/lots';
import '../styles/LotDetailPage.css';

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

    const handleComplaint = () => {
        navigate('/complaint', { state: { lotId: id } });
    };

    const renderCommentsStyled = (comments, parentId = null) => {
        const filtered = comments.filter(c => c.parent === parentId);
        if (filtered.length === 0) return null;

        return filtered.map((comment) => (
            <div key={comment.id}>
                <div className={`comment-item ${parentId ? 'reply' : ''}`}>
                    <div className="comment-header">
                        {comment.user_avatar ? (
                            <img src={comment.user_avatar} alt={comment.user_name} className="comment-avatar" />
                        ) : (
                            <div className="comment-avatar-placeholder">👤</div>
                        )}
                        <div className="comment-user-info">
                            <span className="comment-username">{comment.user_name || 'Користувач'}</span>
                            {comment.bid && (
                                <span className="comment-bid">Нова ставка: {comment.bid} грн</span>
                            )}
                        </div>
                    </div>
                    {comment.text && <p className="comment-text">{comment.text}</p>}
                    <div className="comment-footer">
                        <span className="comment-date">
                            {new Date(comment.created_at).toLocaleString('uk-UA')}
                        </span>
                        <button className="reply-btn" onClick={() => handleReply(comment)}>
                            відповісти
                        </button>
                    </div>
                </div>
                {renderCommentsStyled(comments, comment.id)}
            </div>
        ));
    };

    if (loading) return <div className="loading"><main>Завантаження...</main></div>;
    if (error) return <div className="error"><main>{error}</main></div>;
    if (!lot) return <div className="error"><main>Лот не знайдено</main></div>;

    return (
        <div className="lotdetail-page">
            <div className="lotdetail-header">
                <div className="lotdetail-title">
                <span className="lot-number">ЛОТ #{lot.lot_number || lot.id}</span>
                <span style={{ marginLeft: '1rem', fontSize: '1.2rem' }}>
                    - {lot.first_name} {lot.last_name}
                </span>
                </div>
                <button className="complaint-btn" onClick={handleComplaint}>
                    Поскаржитись
                </button>
            </div>

            <div className="lotdetail-content">
                <div className="lotdetail-grid">
                    <div className="lotdetail-photo-section">
                        <div className="lotdetail-photo-container">
                            {lot.photos && lot.photos.length > 0 ? (
                                <>
                                    <img
                                        src={typeof lot.photos[currentPhotoIndex] === 'string'
                                            ? lot.photos[currentPhotoIndex]
                                            : lot.photos[currentPhotoIndex]?.url}
                                        alt={`${lot.first_name} ${lot.last_name}`}
                                    />
                                    {lot.photos.length > 1 && (
                                        <>
                                            <button className="photo-nav prev" onClick={() => handlePhotoNav('prev')}>‹</button>
                                            <button className="photo-nav next" onClick={() => handlePhotoNav('next')}>›</button>
                                            <div className="photo-counter">
                                                {currentPhotoIndex + 1} / {lot.photos.length}
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="lotdetail-no-photo">Фото відсутнє</div>
                            )}
                        </div>
                    </div>

                    <div className="lotdetail-info-section">
                        {lot.soundcloud_url && (
                            <div className="soundcloud-player">
                                <iframe
                                    title="soundcloud-player"
                                    width="100%"
                                    height="166"
                                    scrolling="no"
                                    frameBorder="no"
                                    allow="autoplay"
                                    src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(lot.soundcloud_url)}&color=%23A0EB32&auto_play=false`}
                                />
                            </div>
                        )}

                        <div className="lotdetail-details">
                            <h2>
                                {lot.faculty && `Студент - ${lot.faculty} - `}
                                {lot.major && `${lot.major} - `}
                                {lot.last_bet || 0} грн.
                            </h2>
                            {lot.description && <p className="lotdetail-description">{lot.description}</p>}

                            {(lot.instagram_url || lot.facebook_url) && (
                                <div className="social-links">
                                    {lot.instagram_url && (
                                        <a href={lot.instagram_url} target="_blank" rel="noopener noreferrer" className="social-link">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
                                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                            </svg>
                                        </a>
                                    )}
                                    {lot.facebook_url && (
                                        <a href={lot.facebook_url} target="_blank" rel="noopener noreferrer" className="social-link">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
                                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                            </svg>
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {lot.comments && lot.comments.length > 0 && (
                <div className="comments-section">
                    <span className="comments-title">СТАВКИ</span>
                    {renderCommentsStyled(lot.comments)}
                </div>
            )}

            <div className="bid-form-section" id="comment-form">
                <h3 className="form-title">
                    {replyToId ? 'Відповісти на коментар' : 'Залишити коментар або зробити ставку'}
                </h3>

                {replyToId && (
                    <div className="reply-notice">
                        Відповідь на коментар від <strong>{replyToName}</strong>
                        <button onClick={cancelReply} className="cancel-reply-btn">
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
                            className="bid-input"
                        />
                    )}
                    <textarea
                        placeholder={replyToId ? "Ваша відповідь" : "Ваш коментар (необов'язково якщо є ставка)"}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows="4"
                        className="comment-textarea"
                    />
                    <button type="submit" className="submit-btn">
                        {replyToId ? 'Відповісти' : amount ? 'Зробити ставку' : 'Додати коментар'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LotDetailPage;