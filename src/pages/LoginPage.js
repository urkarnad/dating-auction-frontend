import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginWithMicrosoft } from '../api/user';
import Header from '../components/Header';
import Footer from '../components/Footer';

const LoginPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login, isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
            return;
        }

        const code = searchParams.get('code');
        if (code) {
            handleMicrosoftCallback(code);
        }
    }, [isAuthenticated, searchParams]);

    const handleMicrosoftCallback = async (code) => {
        try {
            const response = await loginWithMicrosoft(code);
            login(
                {
                    access: response.access_token,
                    refresh: response.refresh_token,
                },
                response.user
            );
            navigate('/');
        } catch (error) {
            console.error('Login failed:', error);
            alert('Помилка входу. Спробуйте ще раз.');
        }
    };

    const handleLoginClick = () => {
        const clientId = process.env.REACT_APP_MICROSOFT_CLIENT_ID;
        const redirectUri = encodeURIComponent(window.location.origin + '/login');
        const scope = encodeURIComponent('openid profile email');

        const authUrl = `https://login.microsoftonline.com/${process.env.REACT_APP_TENANT_ID}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scope}`;

        window.location.href = authUrl;
    };

    return (
        <div>
            <Header />
            <main>
                <h1>Вхід до Dating Auction Pro</h1>
                <div>
                    <button onClick={handleLoginClick}>
                        Увійти через Microsoft Office 365
                    </button>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default LoginPage;