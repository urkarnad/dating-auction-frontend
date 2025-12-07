import React, { useState, useEffect, useCallback } from 'react';
import { getMyLot, createLot, partialUpdateLot, uploadLotPhoto } from '../api/lots';
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
        // CRITICAL FIX: Ensure facultyId is a number
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
            console.log('📦 Отримані дані лоту:', data);
            setLot(data);

            // CRITICAL FIX: Extract IDs correctly
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

            console.log('📚 Завантажені фільтри:', { facultiesData, rolesData, yearsData, gendersData });

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
            console.log('🔍 Завантаження спеціальностей для факультету:', formData.faculty);
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

        console.log('Збереження лоту з даними:', formData);

        try {
            const dataToSend = { ...formData };

            // Remove empty optional fields
            if (!dataToSend.major) delete dataToSend.major;
            if (!dataToSend.role) delete dataToSend.role;
            if (!dataToSend.soundcloud_url) delete dataToSend.soundcloud_url;
            if (!dataToSend.description) delete dataToSend.description;

            console.log('Відправка даних:', dataToSend);

            let response;
            if (lot) {
                response = await partialUpdateLot(dataToSend);
            } else {
                response = await createLot(dataToSend);
            }

            console.log('Відповідь сервера:', response);

            await fetchMyLot();
            setIsEditing(false);
            alert('лот успішно збережено!');
        } catch (err) {
            console.error('помилка збереження лоту:', err);
            console.error('Деталі помилки:', err.response?.data);

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
                                    <div>
                                        <p><strong>SoundCloud:</strong> <a href={lot.soundcloud_url} target="_blank" rel="noopener noreferrer">{lot.soundcloud_url}</a></p>
                                    </div>
                                )}

                                <div>
                                    <h3>Фотографії</h3>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                        {lot.photos?.length > 0 ? (
                                            lot.photos.map((photo, index) => (
                                                <img
                                                    key={index}
                                                    src={photo}
                                                    alt={`Фото ${index + 1}`}
                                                    style={{ width: '200px', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
                                                />
                                            ))
                                        ) : (
                                            <p>Фото відсутні</p>
                                        )}
                                    </div>

                                    <div style={{ marginTop: '20px' }}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handlePhotoUpload}
                                            disabled={uploadingPhotos}
                                        />
                                        {uploadingPhotos && <p>Завантаження...</p>}
                                    </div>
                                </div>

                                <button onClick={() => setIsEditing(true)} style={{ marginTop: '20px' }}>Редагувати</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div>
                                    <label>Ім'я *</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        placeholder="Ім'я"
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
                                        placeholder="Прізвище"
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
                                        placeholder="Опис (необов'язково)"
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
                                        placeholder="https://soundcloud.com/..."
                                        value={formData.soundcloud_url}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div style={{ marginTop: '20px' }}>
                                    <button type="submit">Зберегти</button>
                                    <button type="button" onClick={() => {
                                        setIsEditing(false);
                                        fetchMyLot(); // Відновити дані
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