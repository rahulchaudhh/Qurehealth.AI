import { createContext, useState, useEffect } from 'react';
import axios from '../api/axios';

export const AuthContext = createContext();

// Read cached user from localStorage (instant, no network)
const getCachedUser = () => {
  try {
    const raw = localStorage.getItem('cachedUser');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
};

export const AuthProvider = ({ children }) => {
  const cachedUser = getCachedUser();
  const [user, setUser] = useState(cachedUser);
  const [loading, setLoading] = useState(!cachedUser);

  const setUserAndCache = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('cachedUser', JSON.stringify(userData));
    } else {
      localStorage.removeItem('cachedUser');
    }
  };

  // Save JWT token to localStorage (axios interceptor reads it)
  const saveToken = (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  };

  // Verify token with server in background (optional fresh data)
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
        const verifiedUser = data.data;
        // Patient app: only cache patient-role users; redirect others cleanly
        if (verifiedUser && verifiedUser.role !== 'patient') {
          saveToken(null);
          setUserAndCache(null);
          setLoading(false);
          if (verifiedUser.role === 'admin') {
            window.location.replace('http://localhost:5175');
          } else if (verifiedUser.role === 'doctor') {
            window.location.replace('http://localhost:5174/dashboard');
          }
          return;
        }
        setUserAndCache(verifiedUser);
      } catch {
        if (!controller.signal.aborted) {
          // Token expired or invalid
          saveToken(null);
          setUserAndCache(null);
        }
      }
      setLoading(false);
    };
    verify();
    return () => controller.abort();
  }, []);

  // Register function
  const register = async (userData) => {
    try {
      const { data } = await axios.post('/auth/register', userData);
      if (data.token) {
        saveToken(data.token);
        setUserAndCache(data.data);
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
      saveToken(data.token);
      setUserAndCache(data.data);
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
      if (data.token) {
        saveToken(data.token);
      }
      const doctorUser = { ...data.data, role: 'doctor' };
      setUserAndCache(doctorUser);
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
      saveToken(data.token);
      const doctorUser = { ...data.data, role: 'doctor' };
      setUserAndCache(doctorUser);
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