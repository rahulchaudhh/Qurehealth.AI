import { createContext, useState, useEffect } from 'react';
import axios from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: check if we have a valid auth cookie (httpOnly — browser sends it automatically)
  useEffect(() => {
    let cancelled = false;
    axios.get('/auth/me', { timeout: 5000 })
      .then(res => {
        if (cancelled) return;
        const u = res.data?.data;
        if (u?.role === 'patient') setUser(u);
      })
      .catch(() => {
        if (cancelled) return;
        // Cookie invalid/expired or no cookie — user is not logged in
        setUser(null);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Simple login — returns { success, role, error }
  const login = async (email, password) => {
    try {
      const res = await axios.post('/auth/login', { email, password });
      const { data } = res.data;
      // Token is set as httpOnly cookie by the server — no localStorage needed
      if (data?.role === 'patient') setUser(data);
      return { success: true, role: data?.role, data };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Login failed. Check email and password.' };
    }
  };

  // Google login
  const googleLogin = async (credential) => {
    try {
      const res = await axios.post('/auth/google', { credential });
      const { data } = res.data;
      // Token is set as httpOnly cookie by the server
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
      // Token is set as httpOnly cookie by the server
      if (res.data.data) {
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

  // Logout — server clears the httpOnly cookie
  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch (err) {
      console.error('Logout request failed:', err);
    }
    setUser(null);
    window.location.href = '/';
  };

  // Update profile — server refreshes the httpOnly cookie
  const updateUserProfile = (updatedData) => {
    setUser(updatedData);
  };

  // After Google OAuth redirect — cookie is already set by server, just load user
  const setUserFromToken = () => {
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