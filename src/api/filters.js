import api from './api';

export const getFaculties = async () => {
    const response = await api.get('/faculties/');
    return response.data;
};

export const getMajors = async (facultyId = null) => {
    const params = facultyId ? { faculty: facultyId } : {};
    const response = await api.get('/majors/', { params });
    return response.data;
};

export const getRoles = async () => {
    const response = await api.get('/roles/');
    return response.data;
};

export const getYears = async () => {
    const response = await api.get('/years/');
    return response.data;
};

export const getGenders = async () => {
    const response = await api.get('/genders/');
    return response.data;
};