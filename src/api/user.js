import api from './api';

export const getCurrentUser = async () => {
    const res = await api.get('/profile');
    return res.data;
};

export const registerUser = async (data) => {
    const res = await api.post('/auth/register/', data);
    return res.data;
};

export const loginUser = async (data) => {
    const res = await api.post('/auth/login/', data);
    return res.data;
};

export const loginWithMicrosoft = async (code) => {
    const res = await api.post('/auth/', { code });
    return res.data;
};

export const logoutUser = async () => {
    const res = await api.post('/logout/');
    return res.data;
};

export const updateProfile = async (data) => {
    const res = await api.put('/users/me/', data);
    return res.data;
};

export const updateUserProfile = updateProfile;
export const getUserProfile = getCurrentUser;

export const submitComplaint = async (data) => {
    const res = await api.post('/complaints/', data);
    return res.data;
};

export const getMyLot = async () => {
    const res = await api.get('/mylot/');
    return res.data;
};
