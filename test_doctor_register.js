const axios = require('axios');

async function testDoctorRegistration() {
  try {
    console.log('Testing doctor registration...');
    
    const response = await axios.post('http://localhost:5001/api/auth/register', {
      name: 'Dr. Test Doctor',
      email: `test-doctor-${Date.now()}@example.com`,
      password: 'password123',
      role: 'doctor',
      specialization: 'Cardiology',
      experience: 5,
      phone: '1234567890',
      qualifications: 'MD'
    });

    console.log('Registration successful:', response.data);
  } catch (error) {
    console.error('Registration failed:', error.response?.data || error.message);
  }
}

testDoctorRegistration();
