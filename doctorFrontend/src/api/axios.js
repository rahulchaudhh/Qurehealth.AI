import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:5001/api', // Correct base URL with /api
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

export default instance;
