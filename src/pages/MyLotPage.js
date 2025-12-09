import React, { useState, useEffect, useCallback } from 'react';
import { getMyLot, createLot, partialUpdateLot, uploadLotPhoto, addMyLotComment } from '../api/lots';
import { getFaculties, getMajors, getRoles, getYears, getGenders } from '../api/filters';

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

    // Comment form state
    const [commentText, setCommentText] = useState('');
    const [replyToId, setReplyToId] = useState(null);
    const [replyToName, setReplyToName] = useState(''); // ✅ ДОДАНО: для показу імені
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
            console.log('Отримані дані лоту:', data);
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
            } else {
                await createLot(dataToSend);
            }

            await fetchMyLot();
            setIsEditing(false);
            alert('лот успішно збережено!');
        } catch (err) {
            console.error('помилка збереження лоту:', err);
            const errorMsg = err.response?.data?.detail
                || JSON.stringify(err.response?.data)
                || 'помилка збереження. спробуйте ще раз.';
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

        setUploadingPhotos(true);
        try {
            for (const file of files) {
                await uploadLotPhoto(file);
            }

            await fetchMyLot();
            alert('фото успішно завантажено!');

        } catch (err) {
            console.error('помилка завантаження фото:', err);
            alert('помилка завантаження фото');

        } finally {
            setUploadingPhotos(false);
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
            const data = {
                text: commentText
            };

            if (replyToId) {
                data.parent = replyToId;
            }

            await addMyLotComment(data);

            setCommentText('');
            setReplyToId(null);
            setReplyToName('');
            await fetchMyLot();
            alert('Коментар успішно додано!');
        } catch (err) {
            console.error('Помилка додавання коментаря:', err);
            alert(err.response?.data?.detail || 'Помилка. Спробуйте ще раз.');
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

    const findLabelById = (array, id, labelKey = 'name') => {
        const item = array.find(i => i.id === id);
        return item ? item[labelKey] : id;
    };

    if (loading || filtersLoading) {
        return <div><main>завантаження...</main></div>;
    }

    return (
        <div>
            <main>
                <h1>мій лот</h1>

                {!lot && !isEditing ? (
                    <div>
                        <p>у вас ще немає лоту</p>
                        <button onClick={() => setIsEditing(true)}>створити лот</button>
                    </div>
                ) : (
                    <div>
                        {!isEditing ? (
                            <div>
                                <h2>лот #{lot.lot_number || lot.id}</h2>

                                {/* Photos */}
                                {lot.photos && lot.photos.length > 0 && (
                                    <div style={{ marginBottom: '20px' }}>
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
                                )}

                                <p><strong>Ім'я:</strong> {lot.first_name} {lot.last_name}</p>

                                <p><strong>Факультет:</strong> {
                                    typeof lot.faculty === 'object'
                                        ? lot.faculty?.name
                                        : findLabelById(faculties, lot.faculty)
                                }</p>

                                {lot.major && (
                                    <p><strong>Спеціальність:</strong> {
                                        typeof lot.major === 'object'
                                            ? lot.major?.name
                                            : findLabelById(majors, lot.major)
                                    }</p>
                                )}

                                <p><strong>Курс:</strong> {
                                    typeof lot.year === 'object'
                                        ? lot.year?.year
                                        : findLabelById(years, lot.year, 'year')
                                }</p>

                                <p><strong>Стать:</strong> {
                                    typeof lot.gender === 'object'
                                        ? lot.gender?.gender
                                        : findLabelById(genders, lot.gender, 'gender')
                                }</p>

                                <p><strong>Поточна ставка:</strong> {lot.last_bet} грн</p>

                                {lot.role && (
                                    <p><strong>Роль:</strong> {
                                        typeof lot.role === 'object'
                                            ? lot.role?.name
                                            : findLabelById(roles, lot.role)
                                    }</p>
                                )}

                                {lot.description && (
                                    <p><strong>Опис:</strong> {lot.description}</p>
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
                                    <p><strong>Facebook:</strong> <a href={lot.facebook_url} target="_blank" rel="noopener noreferrer">{lot.facebook_url}</a></p>
                                )}

                                {lot.instagram_url && (
                                    <p><strong>Instagram:</strong> <a href={lot.instagram_url} target="_blank" rel="noopener noreferrer">{lot.instagram_url}</a></p>
                                )}

                                <div style={{ marginTop: '20px' }}>
                                    <h3>Завантажити фото</h3>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handlePhotoUpload}
                                        disabled={uploadingPhotos}
                                    />
                                    {uploadingPhotos && <p>Завантаження...</p>}
                                </div>

                                {/* Comments */}
                                {lot.comments && lot.comments.length > 0 && (
                                    <div style={{ marginTop: '30px' }}>
                                        <h3>Коментарі та ставки</h3>
                                        {renderComments(lot.comments)}
                                    </div>
                                )}

                                <div id="comment-form" style={{ marginTop: '30px' }}>
                                    <h3>
                                        {replyToId
                                            ? 'Відповісти на коментар'
                                            : 'Залишити коментар'}
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

                                    <form onSubmit={handleCommentSubmit}>
                                        <textarea
                                            placeholder={replyToId
                                                ? "Ваша відповідь"
                                                : "Ваш коментар"}
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            rows="4"
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius: '5px',
                                                border: '1px solid #ccc'
                                            }}
                                            required
                                        />
                                        <button
                                            type="submit"
                                            disabled={submittingComment}
                                            style={{
                                                marginTop: '10px',
                                                padding: '10px 20px',
                                                backgroundColor: submittingComment ? '#ccc' : '#007bff',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '5px',
                                                cursor: submittingComment ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            {submittingComment
                                                ? 'Додавання...'
                                                : replyToId
                                                    ? 'Відповісти'
                                                    : 'Додати коментар'}
                                        </button>
                                    </form>
                                </div>

                                <button onClick={() => setIsEditing(true)} style={{ marginTop: '20px' }}>
                                    Редагувати інформацію
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div>
                                    <label>Ім'я *</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div>
                                    <label>Прізвище *</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div>
                                    <label>Факультет *</label>
                                    <select name="faculty" value={formData.faculty} onChange={handleInputChange} required>
                                        <option value="">Оберіть факультет</option>
                                        {faculties.map((fac) => (
                                            <option key={fac.id} value={fac.id}>{fac.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label>Спеціальність</label>
                                    <select
                                        name="major"
                                        value={formData.major}
                                        onChange={handleInputChange}
                                        disabled={!formData.faculty}
                                    >
                                        <option value="">Оберіть спеціальність (необов'язково)</option>
                                        {majors.map((maj) => (
                                            <option key={maj.id} value={maj.id}>{maj.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label>Курс *</label>
                                    <select name="year" value={formData.year} onChange={handleInputChange} required>
                                        <option value="">Оберіть курс</option>
                                        {years.map((yr) => (
                                            <option key={yr.id} value={yr.id}>{yr.year}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label>Стать *</label>
                                    <select name="gender" value={formData.gender} onChange={handleInputChange} required>
                                        <option value="">Оберіть стать</option>
                                        {genders.map((gen) => (
                                            <option key={gen.id} value={gen.id}>{gen.gender}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label>Опис</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="5"
                                    />
                                </div>

                                <div>
                                    <label>Роль</label>
                                    <select name="role" value={formData.role} onChange={handleInputChange}>
                                        <option value="">Оберіть роль (необов'язково)</option>
                                        {roles.map((r) => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label>SoundCloud URL</label>
                                    <input
                                        type="url"
                                        name="soundcloud_url"
                                        value={formData.soundcloud_url}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div>
                                    <label>Facebook URL</label>
                                    <input
                                        type="url"
                                        name="facebook_url"
                                        placeholder="https://facebook.com/..."
                                        value={formData.facebook_url}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div>
                                    <label>Instagram URL</label>
                                    <input
                                        type="url"
                                        name="instagram_url"
                                        placeholder="https://instagram.com/..."
                                        value={formData.instagram_url}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div style={{ marginTop: '20px' }}>
                                    <button type="submit">Зберегти</button>
                                    <button type="button" onClick={() => {
                                        setIsEditing(false);
                                        fetchMyLot();
                                    }}>Скасувати</button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyLotPage;