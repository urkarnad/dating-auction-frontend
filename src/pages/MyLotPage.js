import React, { useState, useEffect, useCallback } from 'react';
import {getMyLot, createLot, partialUpdateLot, uploadLotPhoto, addMyLotComment, deleteLotPhoto} from '../api/lots';
import { getFaculties, getMajors, getRoles, getYears, getGenders } from '../api/filters';
import '../styles/MyLotPage.css';

const MyLotPage = () => {
    const [lot, setLot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        faculty: '',
        major: '',
        year: '',
        gender: '',
        description: '',
        soundcloud_url: '',
        facebook_url: '',
        instagram_url: '',
        role: '',
    });

    const [faculties, setFaculties] = useState([]);
    const [majors, setMajors] = useState([]);
    const [roles, setRoles] = useState([]);
    const [years, setYears] = useState([]);
    const [genders, setGenders] = useState([]);
    const [filtersLoading, setFiltersLoading] = useState(true);

    const [uploadingPhotos, setUploadingPhotos] = useState(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [selectedPhotos, setSelectedPhotos] = useState([]);

    const [commentText, setCommentText] = useState('');
    const [replyToId, setReplyToId] = useState(null);
    const [replyToName, setReplyToName] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    const fetchMajors = useCallback(async (facultyId) => {
        if (!facultyId || isNaN(facultyId)) {
            setMajors([]);
            return;
        }
        try {
            const data = await getMajors(facultyId);
            setMajors(data);
        } catch (err) {
            console.error('помилка завантаження спеціальностей:', err);
            setMajors([]);
        }
    }, []);

    const fetchMyLot = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getMyLot();
            setLot(data);

            const facultyId = typeof data.faculty === 'object' ? data.faculty?.id : data.faculty;
            const majorId = typeof data.major === 'object' ? data.major?.id : data.major;
            const yearId = typeof data.year === 'object' ? data.year?.id : data.year;
            const genderId = typeof data.gender === 'object' ? data.gender?.id : data.gender;
            const roleId = typeof data.role === 'object' ? data.role?.id : data.role;

            setFormData({
                first_name: data.first_name || '',
                last_name: data.last_name || '',
                faculty: facultyId || '',
                major: majorId || '',
                year: yearId || '',
                gender: genderId || '',
                description: data.description || '',
                soundcloud_url: data.soundcloud_url || '',
                facebook_url: data.facebook_url || '',
                instagram_url: data.instagram_url || '',
                role: roleId || '',
            });

            if (facultyId) fetchMajors(facultyId);

        } catch (err) {
            if (err.response?.status === 404) {
                console.log('Лот не знайдено - користувач може створити новий');
            } else {
                console.error('помилка завантаження лоту:', err);
            }
        } finally {
            setLoading(false);
        }
    }, [fetchMajors]);

    const fetchFilterOptions = useCallback(async () => {
        setFiltersLoading(true);
        try {
            const [facultiesData, rolesData, yearsData, gendersData] = await Promise.all([
                getFaculties(),
                getRoles(),
                getYears(),
                getGenders()
            ]);
            setFaculties(facultiesData);
            setRoles(rolesData);
            setYears(yearsData);
            setGenders(gendersData);
        } catch (err) {
            console.error('помилка завантаження фільтрів:', err);
        } finally {
            setFiltersLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFilterOptions();
        fetchMyLot();
    }, [fetchFilterOptions, fetchMyLot]);

    useEffect(() => {
        if (formData.faculty && !isNaN(formData.faculty)) {
            fetchMajors(formData.faculty);
        } else {
            setMajors([]);
        }
    }, [formData.faculty, fetchMajors]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: ['faculty', 'major', 'year', 'gender', 'role'].includes(name)
                ? (value === '' ? '' : Number(value))
                : value
        }));
    };

    const handlePhotoSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 5) {
            alert('Максимум 5 фото');
            return;
        }
        setSelectedPhotos(files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = { ...formData };
            if (!dataToSend.major) delete dataToSend.major;
            if (!dataToSend.role) delete dataToSend.role;
            if (!dataToSend.soundcloud_url) delete dataToSend.soundcloud_url;
            if (!dataToSend.facebook_url) delete dataToSend.facebook_url;
            if (!dataToSend.instagram_url) delete dataToSend.instagram_url;
            if (!dataToSend.description) delete dataToSend.description;

            if (lot) {
                await partialUpdateLot(dataToSend);
                await fetchMyLot();
                setIsEditing(false);
                alert('лот успішно оновлено!');
            } else {
                await createLot(dataToSend);
                if (selectedPhotos.length > 0) {
                    setUploadingPhotos(true);
                    try {
                        await uploadLotPhoto(selectedPhotos);
                    } catch (photoErr) {
                        console.error('Помилка завантаження фото:', photoErr);
                        alert('Лот створено, але виникла помилка завантаження фото.');
                    } finally {
                        setUploadingPhotos(false);
                        setSelectedPhotos([]);
                    }
                }
                await fetchMyLot();
                setIsEditing(false);
                alert('лот успішно створено!');
            }
        } catch (err) {
            console.error('помилка збереження лоту:', err);
            const errorMsg = err.response?.data?.detail || 'помилка збереження.';
            alert(errorMsg);
        }
    };

    const handlePhotoUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        if (!lot) {
            alert('спочатку створіть лот');
            return;
        }
        const currentCount = lot.photos?.length || 0;
        if (currentCount >= 5) {
            alert('Максимум 5 фото.');
            return;
        }
        const remainingSlots = 5 - currentCount;
        if (files.length > remainingSlots) {
            alert(`Можна завантажити ще ${remainingSlots} фото.`);
            return;
        }
        setUploadingPhotos(true);
        try {
            await uploadLotPhoto(files);
            await fetchMyLot();
            alert(`Успішно завантажено ${files.length} фото!`);
            e.target.value = '';
        } catch (err) {
            console.error('помилка завантаження фото:', err);
            alert(err.response?.data?.detail || 'помилка завантаження фото');
        } finally {
            setUploadingPhotos(false);
        }
    };

    const handlePhotoDelete = async (photoId) => {
        if (!window.confirm('Видалити це фото?')) return;
        try {
            await deleteLotPhoto(photoId);
            await fetchMyLot();
            if (currentPhotoIndex > 0) {
                setCurrentPhotoIndex(prev => prev - 1);
            }
            alert('Фото успішно видалено!');
        } catch (err) {
            console.error('помилка видалення фото:', err);
            alert(err.response?.data?.detail || 'помилка видалення фото');
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

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) {
            alert('Введіть текст коментаря');
            return;
        }
        setSubmittingComment(true);
        try {
            const data = { text: commentText };
            if (replyToId) data.parent = replyToId;
            await addMyLotComment(data);
            setCommentText('');
            setReplyToId(null);
            setReplyToName('');
            await fetchMyLot();
            alert('Коментар успішно додано!');
        } catch (err) {
            console.error('Помилка додавання коментаря:', err);
            alert(err.response?.data?.detail || 'Помилка.');
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleReply = (comment) => {
        setReplyToId(comment.id);
        setReplyToName(comment.user_name || 'Користувач');
        document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' });
    };

    const cancelReply = () => {
        setReplyToId(null);
        setReplyToName('');
        setCommentText('');
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

    const findLabelById = (array, id, labelKey = 'name') => {
        const item = array.find(i => i.id === id);
        return item ? item[labelKey] : id;
    };

    if (loading || filtersLoading) {
        return <div className="loading"><main>завантаження...</main></div>;
    }

    return (
        <div className="mylot-page">
            {!lot && !isEditing ? (
                <div className="no-lot-message">
                    <p>у вас ще немає лоту</p>
                    <button className="create-lot-btn" onClick={() => setIsEditing(true)}>
                        створити лот
                    </button>
                </div>
            ) : !isEditing ? (
                <>
                    <div className="mylot-header">
                        <span className="lot-number">ЛОТ #{lot.lot_number || lot.id}</span>
                        <span style={{ marginLeft: '1rem', fontSize: '1.2rem' }}>
                            - {lot.first_name} {lot.last_name}
                        </span>
                    </div>

                    <div className="mylot-content">
                        <div className="mylot-grid">
                            <div className="mylot-photo-section">
                                <div className="mylot-photo-container">
                                    {lot.photos && lot.photos.length > 0 ? (
                                        <>
                                            <img
                                                src={lot.photos[currentPhotoIndex].url}
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
                                            <button
                                                className="delete-photo-btn"
                                                onClick={() => handlePhotoDelete(lot.photos[currentPhotoIndex].id)}
                                            >
                                                видалити фото
                                            </button>
                                        </>
                                    ) : (
                                        <div className="mylot-no-photo">немає фото</div>
                                    )}
                                </div>
                            </div>

                            <div className="mylot-info-section">
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

                                <div className="mylot-details">
                                    <h2>
                                        Студент - {typeof lot.faculty === 'object' ? lot.faculty?.name : findLabelById(faculties, lot.faculty)} - {
                                        lot.major ? (typeof lot.major === 'object' ? lot.major?.name : findLabelById(majors, lot.major)) : 'Без спеціальності'
                                    } - {lot.last_bet} грн.
                                    </h2>
                                    {lot.description && <p className="mylot-description">{lot.description}</p>}

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

                    <div className="photo-upload-section">
                        <h3>Завантажити фото</h3>
                        <p className="photo-count">
                            Завантажено: <strong>{lot.photos_count || 0} / 5</strong>
                            {lot.can_upload_more === false && (
                                <span className="photo-limit-warning">(досягнуто ліміт)</span>
                            )}
                        </p>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handlePhotoUpload}
                            disabled={uploadingPhotos || lot.can_upload_more === false}
                        />
                        {uploadingPhotos && <p>Завантаження...</p>}
                    </div>

                    {lot.comments && lot.comments.length > 0 && (
                        <div className="comments-section">
                            <span className="comments-title">СТАВКИ</span>
                            {renderCommentsStyled(lot.comments)}
                        </div>
                    )}

                    <div className="bid-form-section" id="comment-form">
                        <h3 className="form-title">
                            {replyToId ? 'Відповісти на коментар' : 'Залишити коментар'}
                        </h3>

                        {replyToId && (
                            <div className="reply-notice">
                                Відповідь на коментар від <strong>{replyToName}</strong>
                                <button onClick={cancelReply} className="cancel-reply-btn">
                                    Скасувати
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleCommentSubmit}>
        <textarea
            placeholder={replyToId ? "Ваша відповідь" : "Ваш коментар"}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows="4"
            className="comment-textarea"
            required
        />
                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={submittingComment}
                            >
                                {submittingComment
                                    ? 'Додавання...'
                                    : replyToId
                                        ? 'Відповісти'
                                        : 'Додати коментар'}
                            </button>
                        </form>
                    </div>


                    <button className="edit-btn" onClick={() => setIsEditing(true)}>
                        Редагувати інформацію
                    </button>
                </>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div><label>Ім'я *</label><input type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} required /></div>
                    <div><label>Прізвище *</label><input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} required /></div>
                    <div><label>Факультет *</label><select name="faculty" value={formData.faculty} onChange={handleInputChange} required><option value="">Оберіть факультет</option>{faculties.map((fac) => (<option key={fac.id} value={fac.id}>{fac.name}</option>))}</select></div>
                    <div><label>Спеціальність</label><select name="major" value={formData.major} onChange={handleInputChange} disabled={!formData.faculty}><option value="">Оберіть спеціальність</option>{majors.map((maj) => (<option key={maj.id} value={maj.id}>{maj.name}</option>))}</select></div>
                    <div><label>Курс *</label><select name="year" value={formData.year} onChange={handleInputChange} required><option value="">Оберіть курс</option>{years.map((yr) => (<option key={yr.id} value={yr.id}>{yr.year}</option>))}</select></div>
                    <div><label>Стать *</label><select name="gender" value={formData.gender} onChange={handleInputChange} required><option value="">Оберіть стать</option>{genders.map((gen) => (<option key={gen.id} value={gen.id}>{gen.gender}</option>))}</select></div>
                    <div><label>Опис</label><textarea name="description" value={formData.description} onChange={handleInputChange} rows="5" /></div>
                    <div><label>Роль</label><select name="role" value={formData.role} onChange={handleInputChange}><option value="">Оберіть роль</option>{roles.map((r) => (<option key={r.id} value={r.id}>{r.name}</option>))}</select></div>
                    <div><label>SoundCloud URL</label><input type="url" name="soundcloud_url" value={formData.soundcloud_url} onChange={handleInputChange} /></div>
                    <div><label>Facebook URL</label><input type="url" name="facebook_url" value={formData.facebook_url} onChange={handleInputChange} /></div>
                    <div><label>Instagram URL</label><input type="url" name="instagram_url" value={formData.instagram_url} onChange={handleInputChange} /></div>
                    {!lot && (
                        <div style={{ marginTop: '20px' }}>
                            <label>Фото (до 5 шт.)</label>
                            <input type="file" accept="image/*" multiple onChange={handlePhotoSelect} />
                            {selectedPhotos.length > 0 && <p>Вибрано: {selectedPhotos.length} / 5</p>}
                        </div>
                    )}
                    <div style={{ marginTop: '20px' }}>
                        <button type="submit">Зберегти</button>
                        <button type="button" onClick={() => { setIsEditing(false); fetchMyLot(); }}>Скасувати</button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default MyLotPage;