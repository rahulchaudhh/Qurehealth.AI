const axios = require('axios');

const API_URL = 'http://localhost:5001/api/auth';

const testUser = {
    name: 'Login Test User',
    email: 'logintest@example.com',
    password: 'password123',
    dateOfBirth: '1990-01-01',
    phone: '1234567890',
    gender: 'male',
    address: '123 Test St'
};

const runTest = async () => {
    try {
        // 1. Register (or ensure user exists)
        console.log('Attempting to register user...');
        try {
            await axios.post(`${API_URL}/register`, testUser);
            console.log('User registered successfully.');
        } catch (error) {
            if (error.response && error.response.status === 400 && error.response.data.message === 'User already exists') {
                console.log('User already exists, proceeding to login.');
            } else {
                console.error('Registration failed:', error.message);
                if (error.response) console.error('Response:', error.response.data);
                // Don't return, try login anyway, verification might be the goal
            }
        }

        // 2. Login
        console.log('Attempting to login...');
        const loginResponse = await axios.post(`${API_URL}/login`, {
            email: testUser.email,
            password: testUser.password
        });

        console.log('Login successful!');
        console.log('Token received:', !!loginResponse.data.token);
        console.log('User data:', loginResponse.data);

    } catch (error) {
        console.error('Login flow failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
};

runTest();
