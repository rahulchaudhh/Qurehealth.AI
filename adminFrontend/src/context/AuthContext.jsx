/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';
import axios from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // No more URL token or localStorage — cookie is sent automatically
        let cancelled = false;
        axios.get('/auth/me', { timeout: 60000 })
            .then(({ data }) => {
                if (cancelled) return;
                const u = data.data;
                if (u?.role === 'admin') setUser(u);
                // Wrong role — not an admin, ignore
            })
            .catch(() => {
                if (cancelled) return;
                // No valid cookie — user is not logged in
                setUser(null);
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    const login = async (credentials) => {
        try {
            const { data } = await axios.post('/auth/login', credentials);
            // Token is set as httpOnly cookie by the server
            setUser(data.data);
            return { success: true };
        } catch (e) {
            return { success: false, error: e.response?.data?.error || 'Login failed' };
        }
    };

    const logout = async () => {
        try {
            await axios.post('/auth/logout');
        } catch (err) {
            console.error('Logout request failed:', err);
        }
        setUser(null);
        window.location.replace('http://localhost:5173');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
