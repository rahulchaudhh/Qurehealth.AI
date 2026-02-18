/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';

export const AuthContext = createContext();

const CACHE_KEY = 'admin_user_cache';

function getCachedUser() {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const { user, ts } = JSON.parse(raw);
        if (Date.now() - ts > 3600000) {
            localStorage.removeItem(CACHE_KEY);
            return null;
        }
        return user;
    } catch {
        localStorage.removeItem(CACHE_KEY);
        return null;
    }
}

export const AuthProvider = ({ children }) => {
    const cachedUser = getCachedUser();
    const [user, setUser] = useState(cachedUser);
    const [loading, setLoading] = useState(!cachedUser);

    const setUserAndCache = useCallback((u) => {
        setUser(u);
        if (u) {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ user: u, ts: Date.now() }));
        } else {
            localStorage.removeItem(CACHE_KEY);
        }
    }, []);

    const saveToken = useCallback((token) => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }, []);

    // Verify token with server in background
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setUserAndCache(null);
            setLoading(false);
            return;
        }

        const controller = new AbortController();
        const verify = async () => {
            try {
                const { data } = await axios.get('/auth/me', { signal: controller.signal, timeout: 3000 });
                setUserAndCache(data.data);
            } catch {
                if (!controller.signal.aborted) {
                    saveToken(null);
                    setUserAndCache(null);
                }
            }
            setLoading(false);
        };
        verify();
        return () => controller.abort();
    }, [setUserAndCache, saveToken]);

    const login = async (credentials) => {
        try {
            const { data } = await axios.post('/auth/login', credentials);
            saveToken(data.token);
            setUserAndCache(data.data);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Login failed'
            };
        }
    };

    const logout = async () => {
        try {
            await axios.post('/auth/logout');
        } catch (err) {
            console.error('Logout failed', err);
        }
        saveToken(null);
        setUserAndCache(null);
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
