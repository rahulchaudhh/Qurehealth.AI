import axios from 'axios';

const instance = axios.create({
    baseURL: '/api',
    timeout: 60000,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true  // Always send httpOnly cookies with every request
});

// On 401 response, let AuthContext handle the redirect
instance.interceptors.response.use(
    (res) => res,
    (err) => {
        return Promise.reject(err);
    }
);

export default instance;
