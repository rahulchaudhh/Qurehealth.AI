import axios from 'axios';

const instance = axios.create({
  baseURL: '/api',
  timeout: 60000, // 60s — MongoDB Atlas can be slow on first query
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 response, clear token
instance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(err);
  }
);

export default instance;