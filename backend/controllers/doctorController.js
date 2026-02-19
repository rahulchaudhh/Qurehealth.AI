const Doctor = require('../models/Doctor');
const jwt = require('jsonwebtoken');

const signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

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
            gender,
            profilePicture: req.file
                ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
                : ''
        });

        if (doctor) {
            const doctorObj = doctor.toObject();
            doctorObj.role = 'doctor';
            // req.session.user = doctorObj; // Removed to prevent auto-login for pending doctors

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

        const doctor = await Doctor.findOne({ email }).select('+password').lean();
        if (!doctor) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const bcrypt = require('bcryptjs');
        const isMatch = await bcrypt.compare(password, doctor.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (doctor.status !== 'approved' && !doctor.isApproved) {
            return res.status(403).json({
                error: doctor.status === 'rejected'
                    ? 'Your account has been rejected. Please contact support.'
                    : 'Your account is pending approval. Please wait for admin verification.'
            });
        }

        const doctorObj = { ...doctor, role: 'doctor' };

        const token = signToken({
            _id: doctorObj._id,
            id: doctorObj._id,
            name: doctorObj.name,
            email: doctorObj.email,
            role: 'doctor'
        });

        res.json({ token, data: doctorObj });
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
        // Fetch matching doctors, exclude password AND profilePicture at DB level
        // profilePicture contains huge base64 strings that cause massive slowdown
        const doctors = await Doctor.find({
            $or: [
                { status: 'approved' },
                { isApproved: true }
            ]
        }).select('-password -profilePicture').lean();

        // We can't check profilePicture content since we excluded it,
        // so we just set hasProfilePicture to true for all (the /profile-picture endpoint handles 404s)
        const results = doctors.map(d => ({
            ...d,
            hasProfilePicture: true
        }));

        res.json({
            success: true,
            count: results.length,
            data: results
        });
    } catch (error) {
        console.error('Get All Doctors Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get single doctor with profile picture
// @route   GET /api/doctor/:id
// @access  Public
exports.getDoctorById = async (req, res) => {
    try {
        const Doctor = require('../models/Doctor');
        const doctor = await Doctor.findById(req.params.id).select('-password');
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        const doctorObj = doctor.toObject();
        doctorObj.hasProfilePicture = !!doctor.profilePicture;
        // Don't send the full profile picture data in the main object if it's a large list
        // But for a single doctor it might be okay. However, for consistency with our 
        // new endpoint, we'll exclude it if we want to use the /profile-picture endpoint.
        // Let's keep it simple: if it's a single doctor, we can send it OR use the endpoint.
        // To keep it consistent with the list, we'll use the endpoint.
        delete doctorObj.profilePicture;

        res.json({
            success: true,
            data: doctorObj
        });
    } catch (error) {
        console.error('Get Doctor By Id Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// @desc    Delete doctor
// @route   DELETE /api/doctor/:id
// @access  Private (Admin)
// @desc    Get doctor profile picture
// @route   GET /api/doctor/:id/profile-picture
// @access  Public
exports.getDoctorProfilePicture = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id).select('profilePicture');
        if (!doctor || !doctor.profilePicture) {
            return res.status(404).json({ error: 'Profile picture not found' });
        }

        // Handle data URI format: data:image/jpeg;base64,...
        const matches = doctor.profilePicture.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return res.status(400).json({ error: 'Invalid profile picture format' });
        }

        const contentType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');

        res.set('Content-Type', contentType);
        res.set('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
        res.send(buffer);
    } catch (error) {
        console.error('Get Profile Picture Error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.deleteDoctor = async (req, res) => {
    try {
        const Doctor = require('../models/Doctor');
        const doctor = await Doctor.findById(req.params.id);

        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        await doctor.deleteOne(); // Use deleteOne()

        res.json({
            success: true,
            data: {},
            message: 'Doctor deleted successfully'
        });
    } catch (error) {
        console.error('Delete Doctor Error:', error);
        res.status(500).json({ error: error.message });
    }
};
