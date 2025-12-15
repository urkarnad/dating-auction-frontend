import React from 'react';
import '../styles/LotCard.css';

const LotCard = ({ lot }) => {
    if (!lot) return null;

    return (
        <div className="lot-card">
            <div className="lot-photo">
                {lot.main_photo ? (
                    <img
                        src={lot.main_photo}
                        alt={`${lot.first_name} ${lot.last_name}`}
                    />
                ) : (
                    <div className="no-photo">
                        немає фото
                    </div>
                )}
            </div>

            <div className="lot-content">
                <h3 className="lot-name">
                    {lot.first_name} {lot.last_name}
                </h3>

                {lot.description && (
                    <p className="lot-description">
                        {lot.description.length > 80
                            ? `${lot.description.substring(0, 80)}...`
                            : lot.description}
                    </p>
                )}

                <div className="lot-footer">
                    <div className="lot-price">
                        Ставка: {lot.last_bet || 0} грн
                    </div>
                    <button
                        className="bid-btn"
                        onClick={() => window.location.href = `/lots/${lot.id}`}
                    >
                        Зробити ставку
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LotCard;