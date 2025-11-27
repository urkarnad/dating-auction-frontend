import api from './api';

// Отримати всі лоти (для домашньої сторінки)
export const getLots = async (params = {}) => {
    // На бекенді HomePage, якщо він повертає список лотів
    const response = await api.get('/', { params });
    return response.data;
};

// Отримати лот по ID
export const getLotById = async (id) => {
    const response = await api.get(`/lots/${id}/`);
    return response.data;
};

// Створити лот
export const createLot = async (data) => {
    const response = await api.post('/mylot/', data);
    return response.data;
};

// Повне оновлення лоту
export const updateLot = async (id, data) => {
    const response = await api.put(`/lots/${id}/`, data);
    return response.data;
};

// Часткове оновлення лоту
export const partialUpdateLot = async (id, data) => {
    const response = await api.patch(`/lots/${id}/`, data);
    return response.data;
};

// Видалити лот
export const deleteLot = async (id) => {
    const response = await api.delete(`/lots/${id}/`);
    return response.data;
};

// Додати коментар або ставку
// Якщо бекенд не має /bid/, потрібно буде додати такий метод на Django
export const addCommentOrBid = async (lotId, data) => {
    const response = await api.post(`/lots/${lotId}/`, data);
    return response.data;
};

// Завантажити фото
// Якщо бекенд не має /upload-photo/, треба додати відповідний view
export const uploadLotPhoto = async (lotId, file) => {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await api.post(`/lots/${lotId}/upload-photo/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
};

// Отримати мій лот
export const getMyLot = async () => {
    const response = await api.get('/mylot/');
    return response.data;
};
