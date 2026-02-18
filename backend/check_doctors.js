const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Doctor = require('./models/Doctor');

dotenv.config({ path: './.env' });

const checkDoctors = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            tls: true,
            tlsAllowInvalidCertificates: true,
        });
        console.log('MongoDB Connected');

        const doctors = await Doctor.find({}, 'name email status isApproved');
        console.log('Doctors found:', doctors.length);
        doctors.forEach(doc => {
            console.log(`- ${doc.name} (${doc.email}): Status=${doc.status}, isApproved=${doc.isApproved}`);
        });

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

checkDoctors();
