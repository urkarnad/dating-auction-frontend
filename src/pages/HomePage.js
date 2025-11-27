import React, { useState, useEffect, useCallback } from 'react';
import { getLots } from '../api/lots';
import { getFaculties, getRoles, getYears, getGenders } from '../api/filters';
import LotCard from '../components/LotCard';

const HomePage = () => {
    const [lots, setLots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [faculty, setFaculty] = useState('');
    const [gender, setGender] = useState('');
    const [year, setYear] = useState('');
    const [hasPhoto, setHasPhoto] = useState(false);
    const [role, setRole] = useState('');

    const [faculties, setFaculties] = useState([]);
    const [roles, setRoles] = useState([]);
    const [years, setYears] = useState([]);
    const [genders, setGenders] = useState([]);
    const [filtersLoading, setFiltersLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

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
            console.error('Помилка завантаження фільтрів:', err);
        } finally {
            setFiltersLoading(false);
        }
    }, []);

    const fetchLots = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
            };

            if (search) params.search = search;
            if (sortBy) params.sort = sortBy;
            if (faculty) params.faculty = faculty;
            if (gender) params.gender = gender;
            if (year) params.year = year;
            if (hasPhoto) params.has_photo = 'true';
            if (role) params.role = role;

            const data = await getLots(params);

            if (data.results) {
                setLots(data.results);
                setTotalCount(data.count);
                setTotalPages(Math.ceil(data.count / (data.page_size || 10)));
            } else {
                setLots(data);
            }
        } catch (err) {
            setError('Помилка завантаження лотів');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, search, sortBy, faculty, gender, year, hasPhoto, role]);

    useEffect(() => {
        fetchFilterOptions();
    }, [fetchFilterOptions]);

    useEffect(() => {
        fetchLots();
    }, [fetchLots]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchLots();
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo(0, 0);
        }
    };

    return (
        <div>
            <main>
                <h1>Auction Lots</h1>

                <form onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="пошук по імені або прізвищу"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button type="submit">шукати</button>
                </form>

                <div>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="">сортування</option>
                        <option value="price_asc">ціна ↑</option>
                        <option value="price_desc">ціна ↓</option>
                        <option value="created_at_asc">старі</option>
                        <option value="created_at_desc">нові</option>
                    </select>

                    <select value={faculty} onChange={(e) => setFaculty(e.target.value)} disabled={filtersLoading}>
                        <option value="">всі факультети</option>
                        {faculties.map((fac) => (
                            <option key={fac.id} value={fac.id}>{fac.name}</option>
                        ))}
                    </select>

                    <select value={gender} onChange={(e) => setGender(e.target.value)} disabled={filtersLoading}>
                        <option value="">всі</option>
                        {genders.map((gen) => (
                            <option key={gen.id} value={gen.id}>{gen.gender}</option>
                        ))}
                    </select>

                    <select value={year} onChange={(e) => setYear(e.target.value)} disabled={filtersLoading}>
                        <option value="">всі курси</option>
                        {years.map((yr) => (
                            <option key={yr.id} value={yr.id}>{yr.year}</option>
                        ))}
                    </select>

                    <select value={role} onChange={(e) => setRole(e.target.value)} disabled={filtersLoading}>
                        <option value="">всі ролі</option>
                        {roles.map((r) => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>

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
                    <p>завантаження...</p>
                ) : error ? (
                    <p>{error}</p>
                ) : lots.length === 0 ? (
                    <p>лоти не знайдено</p>
                ) : (
                    <div>
                        <p>знайдено лотів: {totalCount}</p>
                        <div>
                            {lots.map((lot) => (
                                <LotCard key={lot.id} lot={lot} />
                            ))}
                        </div>
                    </div>
                )}

                {totalPages > 1 && (
                    <div>
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                            попередня
                        </button>
                        <span> сторінка {currentPage} з {totalPages} </span>
                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                            наступна
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default HomePage;
