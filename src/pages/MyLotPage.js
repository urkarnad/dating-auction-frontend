import React, { useState, useEffect } from 'react';
import { getMyLot } from '../api/user';
import { createLot, partialUpdateLot, uploadLotPhoto } from '../api/lots';
import Header from '../components/Header';
import Footer from '../components/Footer';

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
        gender: 'M',
        description: '',
        price: 0,
        soundcloud_url: '',
        role: '',
    });

    const [uploadingPhotos, setUploadingPhotos] = useState(false);

    useEffect(() => {
        fetchMyLot();
    }, []);

    const fetchMyLot = async () => {
        setLoading(true);
        try {
            const data = await getMyLot();
            setLot(data);
            setFormData({
                first_name: data.first_name || '',
                last_name: data.last_name || '',
                faculty: data.faculty || '',
                major: data.major || '',
                year: data.year || '',
                gender: data.gender || 'M',
                description: data.description || '',
                price: data.price || 0,
                soundcloud_url: data.soundcloud_url || '',
                role: data.role || '',
            });
        } catch (err) {
            if (err.response?.status !== 404) {
                console.error('Помилка завантаження лоту:', err);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (lot) {
                await partialUpdateLot(formData);
            } else {
                await createLot(formData);
            }

            await fetchMyLot();
            setIsEditing(false);
            alert('Лот успішно збережено!');
        } catch (err) {
            console.error('Помилка збереження лоту:', err);
            alert(err.response?.data?.detail || 'Помилка збереження. Спробуйте ще раз.');
        }
    };

    const handlePhotoUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        if (!lot) {
            alert('Спочатку створіть лот');
            return;
        }

        setUploadingPhotos(true);
        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append('photo', file);
                await uploadLotPhoto(formData);
            }
            await fetchMyLot();
            alert('Фото успішно завантажено!');
        } catch (err) {
            console.error('Помилка завантаження фото:', err);
            alert('Помилка завантаження фото');
        } finally {
            setUploadingPhotos(false);
        }
    };

    if (loading) {
        return (
            <div>
                <Header />
                <main>Завантаження...</main>
                <Footer />
            </div>
        );
    }

    return (
        <div>
            <Header />
            <main>
                <h1>Мій лот</h1>

                {!lot && !isEditing ? (
                    <div>
                        <p>У вас ще немає лоту</p>
                        <button onClick={() => setIsEditing(true)}>Створити лот</button>
                    </div>
                ) : (
                    <div>
                        {!isEditing ? (
                            <div>
                                <h2>Лот #{lot.lot_number || lot.id}</h2>
                                <p>{lot.first_name} {lot.last_name}</p>
                                <p>Факультет: {lot.faculty}</p>
                                {lot.major && <p>Спеціальність: {lot.major}</p>}
                                <p>Курс: {lot.year}</p>
                                <p>Стать: {lot.gender === 'M' ? 'Чоловік' : lot.gender === 'F' ? 'Жінка' : 'Інше'}</p>
                                <p>Поточна ставка: {lot.last_bet || lot.price} грн</p>
                                {lot.role && <p>Роль: {lot.role}</p>}
                                {lot.description && <p>Опис: {lot.description}</p>}

                                {lot.soundcloud_url && (
                                    <div>
                                        <p>SoundCloud: {lot.soundcloud_url}</p>
                                    </div>
                                )}

                                {/* Фото */}
                                <div>
                                    <h3>Фотографії</h3>
                                    <div>
                                        {lot.photos && lot.photos.length > 0 ? (
                                            lot.photos.map((photo, index) => (
                                                <div key={index}>
                                                    <img src={photo} alt={`Photo ${index + 1}`} style={{ width: '200px' }} />
                                                </div>
                                            ))
                                        ) : (
                                            <p>Фото відсутні</p>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handlePhotoUpload}
                                        disabled={uploadingPhotos}
                                    />
                                    {uploadingPhotos && <p>Завантаження...</p>}
                                </div>

                                <button onClick={() => setIsEditing(true)}>Редагувати</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <input
                                    type="text"
                                    name="first_name"
                                    placeholder="Ім'я"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                    required
                                />

                                <input
                                    type="text"
                                    name="last_name"
                                    placeholder="Прізвище"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                    required
                                />

                                <input
                                    type="text"
                                    name="faculty"
                                    placeholder="Факультет"
                                    value={formData.faculty}
                                    onChange={handleInputChange}
                                    required
                                />

                                <input
                                    type="text"
                                    name="major"
                                    placeholder="Спеціальність"
                                    value={formData.major}
                                    onChange={handleInputChange}
                                />

                                <input
                                    type="number"
                                    name="year"
                                    placeholder="Курс"
                                    value={formData.year}
                                    onChange={handleInputChange}
                                    min="1"
                                    max="5"
                                    required
                                />

                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="M">Чоловік</option>
                                    <option value="F">Жінка</option>
                                    <option value="O">Інше</option>
                                </select>

                                <textarea
                                    name="description"
                                    placeholder="Опис"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="5"
                                />

                                <input
                                    type="number"
                                    name="price"
                                    placeholder="Початкова ціна"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    min="0"
                                />

                                <input
                                    type="text"
                                    name="role"
                                    placeholder="Роль (необов'язково)"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                />

                                <input
                                    type="url"
                                    name="soundcloud_url"
                                    placeholder="SoundCloud URL (необов'язково)"
                                    value={formData.soundcloud_url}
                                    onChange={handleInputChange}
                                />

                                <button type="submit">Зберегти</button>
                                <button type="button" onClick={() => setIsEditing(false)}>
                                    Скасувати
                                </button>
                            </form>
                        )}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default MyLotPage;