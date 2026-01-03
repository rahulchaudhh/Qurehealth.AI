const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const bcrypt = require('bcryptjs');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('MongoDB Connected');

        // Test Doctor Login
        const doctorEmail = 'dr.smith@example.com';
        const password = 'password123';

        // Explicitly select password
        const doctor = await Doctor.findOne({ email: doctorEmail }).select('+password');
        if (!doctor) {
            console.log('❌ Doctor not found');
        } else {
            console.log('--- Debug Doctor ---');
            console.log('ID:', doctor._id);
            console.log('Email:', doctor.email);
            console.log('Password (Raw):', doctor.password);
            console.log('Is Approved:', doctor.isApproved);

            if (!doctor.password) {
                console.log('❌ Doctor has no password field!');
            } else {
                const isMatch = await bcrypt.compare(password, doctor.password);
                if (isMatch) {
                    console.log('✅ Doctor Login Successful');
                } else {
                    console.log('❌ Doctor Login Failed: Password Mismatch');
                }
            }
        }

        // Test Patient Login
        const patientEmail = 'jane.doe@example.com';
        const patient = await Patient.findOne({ email: patientEmail }).select('+password');
        if (!patient) {
            console.log('❌ Patient not found');
        } else {
            console.log('--- Debug Patient ---');
            console.log('ID:', patient._id);
            if (!patient.password) {
                console.log('❌ Patient has no password field!');
            } else {
                const isMatch = await bcrypt.compare(password, patient.password);
                if (isMatch) {
                    console.log('✅ Patient Login Successful');
                } else {
                    console.log('❌ Patient Login Failed: Password Mismatch');
                }
            }
        }

        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
