import { createContext, useState, useEffect } from 'react';
import axios from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: check if we have a valid token for a patient
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }

    let cancelled = false;
    axios.get('/auth/me', { timeout: 5000 })
      .then(res => {
        if (cancelled) return;
        const u = res.data?.data;
        if (u?.role === 'patient') setUser(u);
        // Don't remove token for admin/doctor — they need it after redirect
      })
      .catch((err) => {
        if (cancelled) return;
        // Only clear token on 401 (invalid/expired). Keep it on network/timeout errors.
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Simple login — returns { success, role, error }
  const login = async (email, password) => {
    try {
      const res = await axios.post('/auth/login', { email, password });
      const { token, data } = res.data;
      localStorage.setItem('token', token);
      if (data?.role === 'patient') setUser(data);
      return { success: true, role: data?.role };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Login failed. Check email and password.' };
    }
  };

  // Google login
  const googleLogin = async (credential) => {
    try {
      const res = await axios.post('/auth/google', { credential });
      const { token, data } = res.data;
      localStorage.setItem('token', token);
      if (data?.role === 'patient') setUser(data);
      return { success: true, role: data?.role };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Google sign-in failed' };
    }
  };

  // Register patient
  const register = async (userData) => {
    try {
      const res = await axios.post('/auth/register', userData);
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.data);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Registration failed' };
    }
  };

  // Register doctor (pending approval — no auto-login)
  const doctorRegister = async (userData) => {
    try {
      await axios.post('/doctor/register', userData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Doctor registration failed' };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/';
  };

  // Update profile
  const updateUserProfile = (updatedData, newToken) => {
    if (newToken) localStorage.setItem('token', newToken);
    setUser(updatedData);
  };

  // Set user from a token (used after Google OAuth redirect)
  const setUserFromToken = (token) => {
    localStorage.setItem('token', token);
    axios.get('/auth/me', { timeout: 5000 })
      .then(res => {
        const u = res.data?.data;
        if (u?.role === 'patient') {
          setUser(u);
          window.location.href = '/dashboard';
        }
      })
      .catch(() => {
        window.location.href = '/dashboard';
      });
  };

  return (
    <AuthContext.Provider value={{
      user, loading, login, googleLogin, register, doctorRegister, logout,
      updateUserProfile, setUserFromToken, isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;