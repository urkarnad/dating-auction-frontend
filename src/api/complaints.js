import api from './api';

export const getComplaintThemes = async () => {
    const response = await api.get('/complaint-themes/');
    return response.data;
};

export const submitComplaint = async (themeId, data) => {
    const response = await api.post(`/complaints/${themeId}/`, data);
    return response.data;
};

export const getComplaintsList = async () => {
    const response = await api.get('/complaints/');
    return response.data;
};