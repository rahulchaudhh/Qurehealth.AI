const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');
require('dotenv').config();

async function checkDoctors() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            tls: true,
            tlsAllowInvalidCertificates: true,
        });
        console.log('MongoDB Connected');

        const allDoctors = await Doctor.find({}).select('-password');
        console.log('\n=== ALL DOCTORS ===');
        console.log(`Total: ${allDoctors.length}`);
        allDoctors.forEach(d => {
            console.log(`- ${d.name} (${d.email}): status=${d.status}, isApproved=${d.isApproved}`);
        });

        const approvedDoctors = await Doctor.find({
            $or: [
                { status: 'approved' },
                { isApproved: true }
            ]
        }).select('-password');
        console.log('\n=== APPROVED DOCTORS ===');
        console.log(`Total: ${approvedDoctors.length}`);
        approvedDoctors.forEach(d => {
            console.log(`- ${d.name} (${d.specialization})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkDoctors();
