import { createContext, useState, useEffect } from 'react';
import axios from '../api/axios';

export const AuthContext = createContext();

const CACHE_KEY = 'doctor_user_cache';

const getCachedUser = () => {
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
};

export const AuthProvider = ({ children }) => {
    const cachedUser = getCachedUser();
    const [user, setUser] = useState(cachedUser);
    const [loading, setLoading] = useState(!cachedUser);

    const setUserAndCache = (userData) => {
        setUser(userData);
        if (userData) {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ user: userData, ts: Date.now() }));
        } else {
            localStorage.removeItem(CACHE_KEY);
        }
    };

    const saveToken = (token) => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    };

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
                const { data } = await axios.get('/auth/me', { signal: controller.signal });
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
    }, []);

    // Doctor Register function (renamed to register for this app)
    const register = async (doctorData) => {
        try {
            const { data } = await axios.post('/doctor/register', { ...doctorData });
            if (data.token) {
                saveToken(data.token);
            }
            setUserAndCache({ ...data.data, role: 'doctor' });
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Registration failed'
            };
        }
    };

    const login = async (credentials) => {
        try {
            const { data } = await axios.post('/doctor/login', credentials);
            saveToken(data.token);
            setUserAndCache({ ...data.data, role: 'doctor' });
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

    const updateUserProfile = (updatedData, newToken) => {
        if (newToken) saveToken(newToken);
        setUserAndCache(updatedData);
    };

    const value = {
        user,
        loading,
        register,
        login,
        updateUserProfile,
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
