const axios = require('axios');

const login = async (email, password) => {
    try {
        const response = await axios.post('http://localhost:5001/api/auth/login', {
            email,
            password
        });
        console.log(`Login successful for ${email}:`, response.data);
    } catch (error) {
        console.error(`Login failed for ${email}:`, error.response?.data || error.message);
    }
};

const runTests = async () => {
    // Try one of the approved doctors (if you know the password)
    // Since I don't know the hashed passwords, I can't easily test with existing ones 
    // UNLESS there is a default password used in seeding.
    // Let's try a newly registered one or check seeding scripts.
    console.log('Testing doctor login...');
    // We'll try admin login first as we know the credentials
    await login('admin@qurehealth.ai', 'admin123');

    // Try a known doctor if possible, or register a new one and then login
};

runTests();
