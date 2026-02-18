const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');
require('dotenv').config();

async function approveDoctors() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            tls: true,
            tlsAllowInvalidCertificates: true,
        });
        console.log('MongoDB Connected');

        // Update ALL doctors to be approved
        const result = await Doctor.updateMany(
            {},
            { $set: { status: 'approved', isApproved: true } }
        );

        console.log(`Updated ${result.modifiedCount} doctors to approved status`);

        const approvedCount = await Doctor.countDocuments({
            $or: [{ status: 'approved' }, { isApproved: true }]
        });
        console.log(`Total approved doctors: ${approvedCount}`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

approveDoctors();
