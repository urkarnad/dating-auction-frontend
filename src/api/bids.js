import api from './api';

export const getMyBids = async (status = null) => {
    try {
        const accessToken = localStorage.getItem('access_token');
        const headers = {};

        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const params = {};
        if (status) {
            params.status = status;
        }

        const response = await api.get(`/mybids/`, {
            headers,
            params,
            withCredentials: true,
        });

        return response.data;
    } catch (error) {
        console.error('Помилка отримання ставок:', error);
        throw error;
    }
};
