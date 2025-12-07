import React from 'react';

const LotCard = ({ lot }) => {
    if (!lot) return null;

    return (
        <div className="lot-card">
            {/* Фото */}
            <div className="lot-photo">
                {lot.photo ? (
                    <img src={lot.photo} alt="lot" />
                ) : (
                    <div className="no-photo">немає фото</div>
                )}
            </div>

            {/* Інформація */}
            <div className="lot-info">
                <h3 className="lot-title">
                    {lot.first_name} {lot.last_name}
                </h3>

                {lot.faculty_name && (
                    <p className="lot-faculty">Факультет: {lot.faculty_name}</p>
                )}

                {lot.role_name && (
                    <p className="lot-role">Роль: {lot.role_name}</p>
                )}

                {lot.year && (
                    <p className="lot-year">Курс: {lot.year}</p>
                )}

                {lot.gender && (
                    <p className="lot-gender">Стать: {lot.gender}</p>
                )}

                {/* Ціна */}
                {lot.price && (
                    <div className="lot-price">
                        💰 {lot.price} грн
                    </div>
                )}

                {/* Кнопка */}
                <button
                    className="details-btn"
                    onClick={() => window.location.href = `/lots/${lot.id}`}
                >
                    переглянути →
                </button>
            </div>
        </div>
    );
};

export default LotCard;
