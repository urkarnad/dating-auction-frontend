import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile } from '../api/user';
import { uploadProfilePhoto, deleteProfilePhoto } from '../api/lots';
import { getFaculties, getMajors, getRoles, getYears, getGenders } from '../api/filters';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        faculty: '',
        major: '',
        year: '',
        gender: '',
        role: '',
        facebook: '',
        instagram: '',
        discord_id: '',
        soundcloud: '',
    });

    const [faculties, setFaculties] = useState([]);
    const [majors, setMajors] = useState([]);
    const [roles, setRoles] = useState([]);
    const [years, setYears] = useState([]);
    const [genders, setGenders] = useState([]);
    const [filtersLoading, setFiltersLoading] = useState(true);

    const fetchProfile = async () => {
        try {
            const profileData = await getUserProfile();
            updateUser(profileData);
        } catch (err) {
            console.error('Помилка завантаження профілю:', err);
        }
    };

    useEffect(() => {
        fetchFilterOptions();
    }, []);

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                faculty: user.faculty || '',
                major: user.major || '',
                year: user.year || '',
                gender: user.gender || '',
                role: user.role || '',
                facebook: user.facebook || '',
                instagram: user.instagram || '',
                discord_id: user.discord_id || '',
                soundcloud: user.soundcloud || '',
            });

            if (user.faculty) {
                fetchMajors(user.faculty);
            }
        }
    }, [user]);

    useEffect(() => {
        if (formData.faculty) {
            fetchMajors(formData.faculty);
        } else {
            setMajors([]);
        }
    }, [formData.faculty]);

    const fetchFilterOptions = async () => {
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
            console.error('Помилка завантаження фільтрів:', err);
        } finally {
            setFiltersLoading(false);
        }
    };

    const fetchMajors = async (facultyId) => {
        try {
            const data = await getMajors(facultyId);
            setMajors(data);
        } catch (err) {
            console.error('Помилка завантаження спеціальностей:', err);
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
        setLoading(true);

        try {
            const updatedUser = await updateUserProfile(formData);
            updateUser(updatedUser);
            setIsEditing(false);
            alert('профіль успішно оновлено!');
        } catch (err) {
            console.error('помилка оновлення профілю:', err);
            alert('помилка оновлення профілю');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingAvatar(true);
        try {
            await uploadProfilePhoto(file);
            await fetchProfile();
            alert('Аватарка успішно оновлена!');
            e.target.value = '';
        } catch (err) {
            console.error('Помилка завантаження аватарки:', err);
            alert(err.response?.data?.detail || 'Помилка завантаження');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleAvatarDelete = async () => {
        if (!window.confirm('Видалити аватарку?')) return;

        try {
            await deleteProfilePhoto();
            await fetchProfile();
            alert('Аватарка успішно видалена!');
        } catch (err) {
            console.error('Помилка видалення аватарки:', err);
            alert(err.response?.data?.detail || 'Помилка видалення');
        }
    };

    if (filtersLoading) {
        return (
            <div>
                <main>завантаження...</main>
            </div>
        );
    }

    return (
        <div>
            <main style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
                <h1>Мій профіль</h1>

                <div style={{
                    textAlign: 'center',
                    marginBottom: '30px',
                    padding: '20px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '10px'
                }}>
                    {user?.profile_pic ? (
                        <div>
                            <img
                                src={user.profile_pic}
                                alt="аватарка"
                                style={{
                                    width: '150px',
                                    height: '150px',
                                    objectFit: 'cover',
                                    borderRadius: '50%',
                                    marginBottom: '15px',
                                    border: '3px solid #007bff'
                                }}
                            />
                            <div>
                                <button
                                    onClick={handleAvatarDelete}
                                    style={{
                                        padding: '8px 15px',
                                        backgroundColor: '#dc3545',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    видалити
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            width: '150px',
                            height: '150px',
                            margin: '0 auto 15px',
                            backgroundColor: '#e0e0e0',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '48px'
                        }}>
                        </div>
                    )}

                    <div style={{ marginTop: '15px' }}>
                        <label
                            htmlFor="avatar-upload"
                            style={{
                                padding: '10px 20px',
                                backgroundColor: uploadingAvatar ? '#ccc' : '#007bff',
                                color: 'white',
                                borderRadius: '5px',
                                cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
                                display: 'inline-block'
                            }}
                        >
                            {uploadingAvatar ? 'Завантаження...' : 'Завантажити аватарку'}
                        </label>
                        <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            disabled={uploadingAvatar}
                            style={{ display: 'none' }}
                        />
                    </div>
                </div>

                {!isEditing ? (
                    <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0'
                    }}>
                        <h3>Інформація</h3>
                        <p><strong>email:</strong> {user?.email}</p>
                        <p><strong>ім'я:</strong> {user?.first_name}</p>
                        <p><strong>прізвище:</strong> {user?.last_name}</p>
                        <p><strong>факультет:</strong> {faculties.find(f => f.id === user?.faculty)?.name || 'Не вказано'}</p>
                        <p><strong>спеціальність:</strong> {majors.find(m => m.id === user?.major)?.name || 'Не вказано'}</p>
                        <p><strong>курс:</strong> {years.find(y => y.id === user?.year)?.year || 'Не вказано'}</p>
                        <p><strong>стать:</strong> {genders.find(g => g.id === user?.gender)?.gender || 'Не вказано'}</p>
                        <p><strong>роль:</strong> {roles.find(r => r.id === user?.role)?.name || 'Не вказано'}</p>

                        {(user?.facebook || user?.instagram || user?.discord_id || user?.soundcloud) && (
                            <div style={{ marginTop: '20px' }}>
                                <h4>Соціальні мережі:</h4>
                                {user?.facebook && <p><strong>facebook:</strong> <a href={user.facebook} target="_blank" rel="noopener noreferrer">Профіль</a></p>}
                                {user?.instagram && <p><strong>instagram:</strong> <a href={user.instagram} target="_blank" rel="noopener noreferrer">Профіль</a></p>}
                                {user?.discord_id && <p><strong>discord:</strong> {user.discord_id}</p>}
                                {user?.soundcloud && <p><strong>soundcloud:</strong> <a href={user.soundcloud} target="_blank" rel="noopener noreferrer">Профіль</a></p>}
                            </div>
                        )}

                        <button
                            onClick={() => setIsEditing(true)}
                            style={{
                                marginTop: '20px',
                                padding: '10px 20px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                width: '100%'
                            }}
                        >
                            Редагувати
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0'
                    }}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Ім'я *</label>
                            <input
                                type="text"
                                name="first_name"
                                placeholder="ім'я"
                                value={formData.first_name}
                                onChange={handleInputChange}
                                required
                                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Прізвище *</label>
                            <input
                                type="text"
                                name="last_name"
                                placeholder="прізвище"
                                value={formData.last_name}
                                onChange={handleInputChange}
                                required
                                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Факультет</label>
                            <select
                                name="faculty"
                                value={formData.faculty}
                                onChange={handleInputChange}
                                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                            >
                                <option value="">оберіть факультет</option>
                                {faculties.map((fac) => (
                                    <option key={fac.id} value={fac.id}>
                                        {fac.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Спеціальність</label>
                            <select
                                name="major"
                                value={formData.major}
                                onChange={handleInputChange}
                                disabled={!formData.faculty}
                                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                            >
                                <option value="">оберіть спеціальність</option>
                                {majors.map((maj) => (
                                    <option key={maj.id} value={maj.id}>
                                        {maj.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Курс</label>
                            <select
                                name="year"
                                value={formData.year}
                                onChange={handleInputChange}
                                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                            >
                                <option value="">оберіть курс</option>
                                {years.map((yr) => (
                                    <option key={yr.id} value={yr.id}>
                                        {yr.year}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Стать</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                            >
                                <option value="">оберіть стать</option>
                                {genders.map((gen) => (
                                    <option key={gen.id} value={gen.id}>
                                        {gen.gender}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Роль</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                            >
                                <option value="">оберіть роль</option>
                                {roles.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Facebook URL</label>
                            <input
                                type="url"
                                name="facebook"
                                placeholder="facebook URL"
                                value={formData.facebook}
                                onChange={handleInputChange}
                                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Instagram URL</label>
                            <input
                                type="url"
                                name="instagram"
                                placeholder="instagram URL"
                                value={formData.instagram}
                                onChange={handleInputChange}
                                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Discord ID
                            </label>
                            <p style={{
                                fontSize: '13px',
                                color: '#666',
                                marginBottom: '10px',
                                backgroundColor: '#e7f3ff',
                                padding: '10px',
                                borderRadius: '5px'
                            }}>
                                Щоб отримувати сповіщення про перебиття ставок, приєднайтесь до нашого Discord сервера
                                та отримайте свій Discord ID від бота.
                            </p>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <a
                                href="https://discord.gg/EYxkh9jVHk"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                padding: '10px 20px',
                                backgroundColor: '#5865F2',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '5px',
                                display: 'inline-block',
                                fontWeight: 'bold',
                                textAlign: 'center'
                            }}
                                >
                                Приєднатись до Discord
                            </a>
                        </div>
                        <input
                            type="text"
                            name="discord_id"
                            placeholder="Наприклад: 123456789012345678"
                            value={formData.discord_id}
                            onChange={handleInputChange}
                            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                        />
                    </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>SoundCloud URL</label>
                            <input
                                type="url"
                                name="soundcloud"
                                placeholder="soundcloud URL"
                                value={formData.soundcloud}
                                onChange={handleInputChange}
                                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    flex: 1,
                                    padding: '10px 20px',
                                    backgroundColor: loading ? '#ccc' : '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: loading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {loading ? 'збереження...' : 'зберегти'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                style={{
                                    flex: 1,
                                    padding: '10px 20px',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer'
                                }}
                            >
                                Скасувати
                            </button>
                        </div>
                    </form>
                )}
            </main>
        </div>
    );
};

export default ProfilePage;