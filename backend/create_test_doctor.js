const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Doctor = require('./models/Doctor');
const bcrypt = require('bcryptjs');

dotenv.config();

async function createAndApproveTestDoctor() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'debug.doctor@qurehealth.ai';
        const password = 'password123';

        // Remove existing if any
        await Doctor.deleteOne({ email });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const doctor = await Doctor.create({
            name: 'Debug Doctor',
            email: email,
            password: password, // The model handles hashing in pre-save, but I'll be careful
            specialization: 'General',
            experience: 5,
            isApproved: true,
            status: 'approved'
        });

        console.log('Test doctor created and approved:');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log(`isApproved: ${doctor.isApproved}`);
        console.log(`status: ${doctor.status}`);

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

createAndApproveTestDoctor();
