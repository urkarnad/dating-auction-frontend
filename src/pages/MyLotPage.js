import React, { useState, useEffect, useCallback } from 'react';
import { getMyLot } from '../api/user';
import { createLot, partialUpdateLot, uploadLotPhoto } from '../api/lots';
import { getFaculties, getMajors, getRoles, getYears, getGenders } from '../api/filters';
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
        gender: '',
        description: '',
        price: 0,
        soundcloud_url: '',
        role: '',
    });

    const [faculties, setFaculties] = useState([]);
    const [majors, setMajors] = useState([]);
    const [roles, setRoles] = useState([]);
    const [years, setYears] = useState([]);
    const [genders, setGenders] = useState([]);
    const [filtersLoading, setFiltersLoading] = useState(true);

    const [uploadingPhotos, setUploadingPhotos] = useState(false);

    const fetchMajors = useCallback(async (facultyId) => {
        try {
            const data = await getMajors(facultyId);
            setMajors(data);
        } catch (err) {
            console.error('помилка завантаження спеціальностей:', err);
        }
    }, []);

    const fetchMyLot = useCallback(async () => {
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
                gender: data.gender || '',
                description: data.description || '',
                price: data.price || 0,
                soundcloud_url: data.soundcloud_url || '',
                role: data.role || '',
            });

            if (data.faculty) {
                fetchMajors(data.faculty);
            }
        } catch (err) {
            if (err.response?.status !== 404) {
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
        if (formData.faculty) {
            fetchMajors(formData.faculty);
        } else {
            setMajors([]);
        }
    }, [formData.faculty, fetchMajors]);

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
            alert('лот успішно збережено!');
        } catch (err) {
            console.error('помилка збереження лоту:', err);
            alert(err.response?.data?.detail || 'помилка збереження. спробуйте ще раз.');
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
                const formData = new FormData();
                formData.append('photo', file);
                await uploadLotPhoto(formData);
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

    if (loading || filtersLoading) {
        return (
            <div>
                <main>завантаження...</main>
            </div>
        );
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
                                <p>{lot.first_name} {lot.last_name}</p>
                                <p>факультет: {faculties.find(f => f.id === lot.faculty)?.name}</p>
                                {lot.major && <p>Спеціальність: {majors.find(m => m.id === lot.major)?.name}</p>}
                                <p>курс: {years.find(y => y.id === lot.year)?.year}</p>
                                <p>стать: {genders.find(g => g.id === lot.gender)?.gender}</p>
                                <p>поточна ставка: {lot.last_bet || lot.price} грн</p>
                                {lot.role && <p>роль: {roles.find(r => r.id === lot.role)?.name}</p>}
                                {lot.description && <p>опис: {lot.description}</p>}

                                {lot.soundcloud_url && (
                                    <div>
                                        <p>SoundCloud: {lot.soundcloud_url}</p>
                                    </div>
                                )}

                                <div>
                                    <h3>Фотографії</h3>
                                    <div>
                                        {lot.photos && lot.photos.length > 0 ? (
                                            lot.photos.map((photo, index) => (
                                                <div key={index}>
                                                    <img
                                                        src={photo}
                                                        alt={`Зображення ${index + 1}`}
                                                        style={{ width: '200px' }}
                                                    />
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

                                <select name="faculty" value={formData.faculty} onChange={handleInputChange} required>
                                    <option value="">Оберіть факультет</option>
                                    {faculties.map((fac) => (
                                        <option key={fac.id} value={fac.id}>{fac.name}</option>
                                    ))}
                                </select>

                                <select name="major" value={formData.major} onChange={handleInputChange} disabled={!formData.faculty}>
                                    <option value="">Оберіть спеціальність</option>
                                    {majors.map((maj) => (
                                        <option key={maj.id} value={maj.id}>{maj.name}</option>
                                    ))}
                                </select>

                                <select name="year" value={formData.year} onChange={handleInputChange} required>
                                    <option value="">Оберіть курс</option>
                                    {years.map((yr) => (
                                        <option key={yr.id} value={yr.id}>{yr.year}</option>
                                    ))}
                                </select>

                                <select name="gender" value={formData.gender} onChange={handleInputChange} required>
                                    <option value="">Оберіть стать</option>
                                    {genders.map((gen) => (
                                        <option key={gen.id} value={gen.id}>{gen.gender}</option>
                                    ))}
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

                                <select name="role" value={formData.role} onChange={handleInputChange}>
                                    <option value="">Оберіть роль (необов'язково)</option>
                                    {roles.map((r) => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>

                                <input
                                    type="url"
                                    name="soundcloud_url"
                                    placeholder="SoundCloud URL"
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
        </div>
    );
};

export default MyLotPage;
