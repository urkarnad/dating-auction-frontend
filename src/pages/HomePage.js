import React, { useState, useEffect } from 'react';
import { getLots } from '../api/lots';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LotCard from '../components/LotCard';

const HomePage = () => {
    const [lots, setLots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Фільтри і пошук
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [faculty, setFaculty] = useState('');
    const [gender, setGender] = useState('');
    const [year, setYear] = useState('');
    const [hasPhoto, setHasPhoto] = useState(false);
    const [role, setRole] = useState('');

    useEffect(() => {
        fetchLots();
    }, [sortBy, faculty, gender, year, hasPhoto, role]);

    const fetchLots = async () => {
        setLoading(true);
        try {
            const params = {};

            if (search) params.search = search;
            if (sortBy) params.sort = sortBy;
            if (faculty) params.faculty = faculty;
            if (gender) params.gender = gender;
            if (year) params.year = year;
            if (hasPhoto) params.has_photo = 'true';
            if (role) params.role = role;

            const data = await getLots(params);
            setLots(data);
        } catch (err) {
            setError('Помилка завантаження лотів');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchLots();
    };

    return (
        <div>
            <Header />
            <main>
                <h1>Auction Lots</h1>

                <form onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="Пошук по імені або прізвищу"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button type="submit">Шукати</button>
                </form>

                <div>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="">Сортування</option>
                        <option value="price_asc">Ціна (за зростанням)</option>
                        <option value="price_desc">Ціна (за спаданням)</option>
                        <option value="created_at_asc">Дата (старі спочатку)</option>
                        <option value="created_at_desc">Дата (нові спочатку)</option>
                    </select>

                    <input
                        type="text"
                        placeholder="Факультет"
                        value={faculty}
                        onChange={(e) => setFaculty(e.target.value)}
                    />

                    <select value={gender} onChange={(e) => setGender(e.target.value)}>
                        <option value="">Всі</option>
                        <option value="M">Чоловіки</option>
                        <option value="F">Жінки</option>
                        <option value="O">Інше</option>
                    </select>

                    <input
                        type="number"
                        placeholder="Курс (1-5)"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        min="1"
                        max="5"
                    />

                    <input
                        type="text"
                        placeholder="Роль"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    />

                    <label>
                        <input
                            type="checkbox"
                            checked={hasPhoto}
                            onChange={(e) => setHasPhoto(e.target.checked)}
                        />
                        Тільки з фото
                    </label>
                </div>

                {loading ? (
                    <p>Завантаження...</p>
                ) : error ? (
                    <p>{error}</p>
                ) : lots.length === 0 ? (
                    <p>Лоти не знайдено</p>
                ) : (
                    <div>
                        {lots.map((lot) => (
                            <LotCard key={lot.id} lot={lot} />
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default HomePage;