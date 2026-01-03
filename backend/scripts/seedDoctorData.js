const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('MongoDB Connected');

        // 1. Create Doctor
        const doctorEmail = 'dr.smith@example.com';
        await Doctor.deleteOne({ email: doctorEmail });

        const doctor = await Doctor.create({
            name: 'Dr. John Smith',
            email: doctorEmail,
            password: 'password123',
            specialization: 'Cardiologist',
            experience: 10,
            phone: '1234567890',
            gender: 'male',
            isApproved: true
        });
        console.log(`Doctor created: ${doctor.email} / password123`);

        // 2. Create Patient
        const patientEmail = 'jane.doe@example.com';
        await Patient.deleteOne({ email: patientEmail });

        const patient = await Patient.create({
            name: 'Jane Doe',
            email: patientEmail,
            password: 'password123',
            phone: '0987654321',
            gender: 'female',
            dateOfBirth: new Date('1990-01-01')
        });
        console.log(`Patient created: ${patient.email} / password123`);

        // 3. Create Appointment
        await Appointment.deleteMany({ doctor: doctor._id });

        await Appointment.create({
            doctor: doctor._id,
            patient: patient._id,
            date: '2026-02-15',
            time: '10:00 AM',
            reason: 'Routine Checkup',
            status: 'pending'
        });
        console.log('Appointment created: Jan 15, 10:00 AM');

        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
