import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile } from '../api/user';
import { getFaculties, getMajors, getRoles, getYears, getGenders } from '../api/filters';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

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

    if (filtersLoading) {
        return (
            <div>
                <main>завантаження...</main>
            </div>
        );
    }

    return (
        <div>
            <main>
                <h1>Мій профіль</h1>

                {!isEditing ? (
                    <div>
                        <p><strong>email:</strong> {user?.email}</p>
                        <p><strong>ім'я:</strong> {user?.first_name}</p>
                        <p><strong>прізвище:</strong> {user?.last_name}</p>
                        <p><strong>факультет:</strong> {faculties.find(f => f.id === user?.faculty)?.name || 'Не вказано'}</p>
                        <p><strong>спеціальність:</strong> {majors.find(m => m.id === user?.major)?.name || 'Не вказано'}</p>
                        <p><strong>курс:</strong> {years.find(y => y.id === user?.year)?.year || 'Не вказано'}</p>
                        <p><strong>стать:</strong> {genders.find(g => g.id === user?.gender)?.gender || 'Не вказано'}</p>
                        <p><strong>роль:</strong> {roles.find(r => r.id === user?.role)?.name || 'Не вказано'}</p>
                        <p><strong>facebook:</strong> {user?.facebook || 'Не вказано'}</p>
                        <p><strong>instagram:</strong> {user?.instagram || 'Не вказано'}</p>
                        <p><strong>discord:</strong> {user?.discord_id || 'Не вказано'}</p>
                        <p><strong>soundcloud:</strong> {user?.soundcloud || 'Не вказано'}</p>
                        <button onClick={() => setIsEditing(true)}>Редагувати</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="first_name"
                            placeholder="ім'я"
                            value={formData.first_name}
                            onChange={handleInputChange}
                            required
                        />

                        <input
                            type="text"
                            name="last_name"
                            placeholder="прізвище"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            required
                        />

                        <select
                            name="faculty"
                            value={formData.faculty}
                            onChange={handleInputChange}
                        >
                            <option value="">оберіть факультет</option>
                            {faculties.map((fac) => (
                                <option key={fac.id} value={fac.id}>
                                    {fac.name}
                                </option>
                            ))}
                        </select>

                        <select
                            name="major"
                            value={formData.major}
                            onChange={handleInputChange}
                            disabled={!formData.faculty}
                        >
                            <option value="">оберіть спеціальність</option>
                            {majors.map((maj) => (
                                <option key={maj.id} value={maj.id}>
                                    {maj.name}
                                </option>
                            ))}
                        </select>

                        <select
                            name="year"
                            value={formData.year}
                            onChange={handleInputChange}
                        >
                            <option value="">оберіть курс</option>
                            {years.map((yr) => (
                                <option key={yr.id} value={yr.id}>
                                    {yr.year}
                                </option>
                            ))}
                        </select>

                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                        >
                            <option value="">оберіть стать</option>
                            {genders.map((gen) => (
                                <option key={gen.id} value={gen.id}>
                                    {gen.gender}
                                </option>
                            ))}
                        </select>

                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                        >
                            <option value="">оберіть роль</option>
                            {roles.map((r) => (
                                <option key={r.id} value={r.id}>
                                    {r.name}
                                </option>
                            ))}
                        </select>

                        <input
                            type="url"
                            name="facebook"
                            placeholder="afcebook URL"
                            value={formData.facebook}
                            onChange={handleInputChange}
                        />

                        <input
                            type="url"
                            name="instagram"
                            placeholder="instagram URL"
                            value={formData.instagram}
                            onChange={handleInputChange}
                        />

                        <input
                            type="text"
                            name="discord_id"
                            placeholder="discord ID"
                            value={formData.discord_id}
                            onChange={handleInputChange}
                        />

                        <input
                            type="url"
                            name="soundcloud"
                            placeholder="soundcloud URL"
                            value={formData.soundcloud}
                            onChange={handleInputChange}
                        />

                        <button type="submit" disabled={loading}>
                            {loading ? 'збереження...' : 'зберегти'}
                        </button>
                        <button type="button" onClick={() => setIsEditing(false)}>
                            Скасувати
                        </button>
                    </form>
                )}
            </main>
        </div>
    );
};

export default ProfilePage;