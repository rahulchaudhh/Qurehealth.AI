import { createContext, useState, useEffect } from 'react';
import axios from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data } = await axios.get('/auth/me');
                setUser(data.data);
            } catch (error) {
                // console.error('Auth check failed:', error);
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    // Login function
    const login = async (credentials) => {
        try {
            const { data } = await axios.post('/auth/login', credentials);
            setUser(data.data);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Login failed'
            };
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await axios.post('/auth/logout');
        } catch (err) {
            console.error('Logout failed', err);
        }
        setUser(null);
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
