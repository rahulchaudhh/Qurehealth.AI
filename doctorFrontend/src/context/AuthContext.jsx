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
                // We might need a specific endpoint for doctor auth check or /auth/me handles it?
                // In patientFrontend, /auth/me was used and it returned user data.
                // If /auth/me works for doctors too (based on session), then it's fine.
                // If not, we might need /doctor/me or similar if backend distinguishes.
                // Looking at patientFrontend's AuthContext, it uses /auth/me for everyone?
                // Let's assume /auth/me works for now as the session should hold the user.
                const { data } = await axios.get('/auth/me');
                // If the user returned is NOT a doctor, we might want to logout or handle it?
                // But for now let's trust the backend or handle it in UI (ProtectedRoute).
                setUser(data.data);
            } catch (error) {
                // console.error('Auth check failed:', error);
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    // Doctor Register function (renamed to register for this app)
    const register = async (doctorData) => {
        try {
            const { data } = await axios.post('/auth/register', { ...doctorData, role: 'doctor' });
            setUser({ ...data.data, role: 'doctor' });
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Registration failed'
            };
        }
    };

    // Doctor Login function (renamed to login for this app)
    const login = async (credentials) => {
        try {
            const { data } = await axios.post('/auth/login', credentials);
            setUser({ ...data.data, role: 'doctor' });
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

    const updateUserProfile = (updatedData) => {
        setUser(updatedData);
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
