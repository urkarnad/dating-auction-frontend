import api from './api';

export const getLots = async (params = {}) => {
    const response = await api.get('/', { params });
    return response.data;
};

export const getLotById = async (id) => {
    const response = await api.get(`/lots/${id}/`);
    return response.data;
};

export const createLot = async (data) => {
    const response = await api.post('/mylot/', data);
    return response.data;
};

export const updateLot = async (data) => {
    const response = await api.put('/mylot/', data);
    return response.data;
};

export const partialUpdateLot = async (data) => {
    const response = await api.patch('/mylot/', data);
    return response.data;
};

export const addCommentOrBid = async (lotId, data) => {
    const response = await api.post(`/lots/${lotId}/`, data);
    return response.data;
};

export const uploadLotPhoto = async (file) => {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await api.post('/mylot/upload-photo/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
};

export const getMyLot = async () => {
    const response = await api.get('/mylot/');
    return response.data;
};