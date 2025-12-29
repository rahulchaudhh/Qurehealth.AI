import { createContext, useState, useEffect } from 'react';
import axios from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { data } = await axios.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(data.data);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Register function
  const register = async (userData) => {
    try {
      const { data } = await axios.post('/auth/register', userData);
      localStorage.setItem('token', data.token);
      setUser(data.data);
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
      console.log('Sending login request:', credentials);
      const { data } = await axios.post('/auth/login', credentials);
      console.log('Login response data:', data);
      localStorage.setItem('token', data.token);
      setUser(data.data);
      return { success: true };
    } catch (error) {
      console.error('Login request failed:', error);
      console.error('Response:', error.response);
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    register,
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