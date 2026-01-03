import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5001/api', // Correct base URL with /api
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Add token to requests automatically
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;