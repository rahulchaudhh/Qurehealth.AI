/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';
import axios from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Pick up token passed via URL query param from patient portal login redirect
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get('token');
        if (urlToken) {
            localStorage.setItem('token', urlToken);
            // Clean the token from the URL without reloading
            window.history.replaceState({}, '', window.location.pathname);
        }

        const token = localStorage.getItem('token');
        if (!token) { setLoading(false); return; }

        let cancelled = false;
        axios.get('/auth/me', { timeout: 60000 })
            .then(({ data }) => {
                if (cancelled) return;
                const u = data.data;
                if (u?.role === 'admin') setUser(u);
                else localStorage.removeItem('token'); // Wrong role — clear token
            })
            .catch((err) => {
                if (cancelled) return;
                // Only clear token on 401 (invalid/expired). Keep token on network/timeout errors.
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                }
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    const login = async (credentials) => {
        try {
            const { data } = await axios.post('/auth/login', credentials);
            localStorage.setItem('token', data.token);
            setUser(data.data);
            return { success: true };
        } catch (e) {
            return { success: false, error: e.response?.data?.error || 'Login failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        axios.post('/auth/logout').catch(() => {});
        window.location.replace('http://localhost:5173');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
