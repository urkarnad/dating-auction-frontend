import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../api/user';

const AuthCallbackPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login } = useAuth();

    useEffect(() => {
        const handleCallback = async () => {
            const accessToken = searchParams.get('access_token');
            const refreshToken = searchParams.get('refresh_token');
            const error = searchParams.get('error');

            console.log('access token:', accessToken ? 'Отримано' : 'Відсутній');
            console.log('refresh token:', refreshToken ? 'Отримано' : 'Відсутній');

            if (error) {
                console.error('помилка авторизації:', error);
                alert('Помилка авторизації: ' + error);
                navigate('/login');
                return;
            }

            if (!accessToken) {
                console.error('токен не отримано');
                alert('токен не отримано. спробуйте ще раз.');
                navigate('/login');
                return;
            }

            try {
                localStorage.setItem('access_token', accessToken);
                if (refreshToken) {
                    localStorage.setItem('refresh_token', refreshToken);
                }

                console.log('токени збережені, завантажуємо профіль...');

                const userData = await getUserProfile();
                console.log('профіль завантажено:', userData);

                localStorage.setItem('user_id', userData.id);

                login(
                    {
                        access: accessToken,
                        refresh: refreshToken,
                    },
                    userData
                );

                console.log('перенаправлення на головну...');
                navigate('/');
            } catch (error) {
                console.error('помилка отримання профілю:', error);
                console.error('Response:', error.response?.data);
                alert('Не вдалося завантажити профіль користувача. Перевірте консоль.');

                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');

                navigate('/login');
            }
        };

        handleCallback();
    }, [searchParams, login, navigate]);

    return (
        <div>
            <h2>авторизація...</h2>
            <p>будь ласка, зачекайте</p>
        </div>
    );
};

export default AuthCallbackPage;