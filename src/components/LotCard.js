import React from 'react';

const LotCard = ({ lot }) => {
    if (!lot) return null;

    return (
        <div className="lot-card">
            <div className="lot-photo">
                {lot.main_photo ? (
                    <img
                        src={lot.main_photo}
                        alt={`${lot.first_name} ${lot.last_name}`}
                        style={{
                            width: '100%',
                            height: '250px',
                            objectFit: 'cover',
                            borderRadius: '8px 8px 0 0'
                        }}
                    />
                ) : (
                    <div className="no-photo" style={{
                        width: '100%',
                        height: '250px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f0f0f0',
                        color: '#999',
                        fontSize: '14px',
                        borderRadius: '8px 8px 0 0'
                    }}>
                        немає фото
                    </div>
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
