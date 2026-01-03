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
        localStorage.removeItem('token'); // Cleanup legacy
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Register function
  const register = async (userData) => {
    try {
      const { data } = await axios.post('/auth/register', userData);
      if (data) {
        // Session handles auth
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      const { data } = await axios.post('/auth/login', credentials);
      // localStorage.setItem('token', data.token); // Removed
      setUser(data.data);
      return { success: true, data: data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  };

  // Doctor Register function
  const doctorRegister = async (doctorData) => {
    try {
      const { data } = await axios.post('/doctor/register', doctorData);
      // localStorage.setItem('token', data.token); // Removed
      setUser({ ...data.data, role: 'doctor' });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    }
  };

  // Doctor Login function
  const doctorLogin = async (credentials) => {
    try {
      const { data } = await axios.post('/doctor/login', credentials);
      // localStorage.setItem('token', data.token); // Removed
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
    localStorage.removeItem('token');
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
    doctorRegister,
    doctorLogin,
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