const Doctor = require('../models/Doctor');

exports.registerDoctor = async (req, res) => {
    try {
        const { name, email, password, specialization, experience, phone, gender } = req.body;

        const doctorExists = await Doctor.findOne({ email });
        if (doctorExists) {
            return res.status(400).json({ error: 'Doctor already exists' });
        }

        const doctor = await Doctor.create({
            name,
            email,
            password,
            specialization,
            experience,
            phone,
            gender
        });

        if (doctor) {
            const doctorObj = doctor.toObject();
            doctorObj.role = 'doctor';
            req.session.user = doctorObj;

            res.status(201).json({
                data: doctorObj
            });
        }
    } catch (error) {
        console.error('Doctor registration error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.loginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body;

        const doctor = await Doctor.findOne({ email }).select('+password');
        if (!doctor) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await doctor.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const doctorObj = doctor.toObject();
        doctorObj.role = 'doctor';
        req.session.user = doctorObj;

        req.session.save(err => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ error: 'Session save failed' });
            }
            res.json({
                data: doctorObj
            });
        });
    } catch (error) {
        console.error('Doctor login error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getDoctorMe = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.user.id).select('-password');
        res.json({ data: doctor });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// @desc    Get doctor dashboard stats
// @route   GET /api/doctor/stats
// @access  Private (Doctor)
exports.getDoctorStats = async (req, res) => {
    try {
        const Appointment = require('../models/Appointment');

        const appointmentCount = await Appointment.countDocuments({ doctor: req.user._id });
        const uniquePatients = await Appointment.distinct('patient', { doctor: req.user._id });

        // Count confirmed appointments as "tasks completed" for demo purposes, or just total appointments
        const tasksCompleted = await Appointment.countDocuments({
            doctor: req.user._id,
            status: { $in: ['completed', 'confirmed'] }
        });

        res.json({
            success: true,
            data: {
                patients: uniquePatients.length,
                appointments: appointmentCount,
                tasks: tasksCompleted
            }
        });
    } catch (error) {
        console.error('Get Doctor Stats Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get patients for logged in doctor
// @route   GET /api/doctor/patients
// @access  Private (Doctor)
exports.getDoctorPatients = async (req, res) => {
    try {
        const Appointment = require('../models/Appointment');
        const patientIds = await Appointment.distinct('patient', { doctor: req.user._id });

        const Patient = require('../models/Patient');
        const patients = await Patient.find({ _id: { $in: patientIds } });

        res.json({
            success: true,
            count: patients.length,
            data: patients
        });
    } catch (error) {
        console.error('Get Doctor Patients Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get all doctors
// @route   GET /api/doctor/all
// @access  Public
exports.getAllDoctors = async (req, res) => {
    try {
        const Doctor = require('../models/Doctor');
        const doctors = await Doctor.find({}).select('-password');
        res.json({
            success: true,
            count: doctors.length,
            data: doctors
        });
    } catch (error) {
        console.error('Get All Doctors Error:', error);
        res.status(500).json({ error: error.message });
    }
};
