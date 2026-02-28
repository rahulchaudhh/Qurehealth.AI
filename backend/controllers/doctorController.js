const Doctor = require('../models/Doctor');
const jwt = require('jsonwebtoken');
const Appointment = require('../models/Appointment');

const signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ── Helper: compute next available slot for a doctor ──
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function generateSlots(startTime, endTime, duration) {
    const slots = [];
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    let mins = sh * 60 + sm;
    const endMins = eh * 60 + em;
    while (mins + duration <= endMins) {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
        mins += duration;
    }
    return slots;
}

function formatTo12h(time24) {
    const [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

async function getNextAvailableSlot(doctor) {
    const defaultDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const days = (doctor.availability && doctor.availability.days && doctor.availability.days.length > 0)
        ? doctor.availability.days : defaultDays;
    const startTime = (doctor.availability && doctor.availability.startTime) || '09:00';
    const endTime = (doctor.availability && doctor.availability.endTime) || '17:00';
    const slotDuration = (doctor.availability && doctor.availability.slotDuration) || 30;

    const now = new Date();
    const currentTime24 = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Check up to 14 days ahead
    for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
        const checkDate = new Date(now);
        checkDate.setDate(checkDate.getDate() + dayOffset);
        const dayName = DAY_NAMES[checkDate.getDay()];

        if (!days.includes(dayName)) continue;

        const dateStr = checkDate.toISOString().split('T')[0];
        const allSlots = generateSlots(startTime, endTime, slotDuration);

        const bookedAppts = await Appointment.find({
            doctor: doctor._id,
            date: dateStr,
            status: { $in: ['pending', 'confirmed'] }
        }).select('time').lean();
        const bookedTimes = new Set(bookedAppts.map(a => a.time));

        for (const slot of allSlots) {
            if (dayOffset === 0 && slot < currentTime24) continue;
            if (bookedTimes.has(slot) || bookedTimes.has(formatTo12h(slot))) continue;

            const label = dayOffset === 0 ? 'Today' : dayOffset === 1 ? 'Tomorrow' :
                checkDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            return `${label}, ${formatTo12h(slot)}`;
        }
    }
    return null;
}

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
        // Strip profilePicture from login response (huge base64)
        delete doctorObj.password;
        delete doctorObj.profilePicture;
        doctorObj.hasProfilePicture = true;

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
        const doctor = await Doctor.findById(req.user.id).select('-password -profilePicture').maxTimeMS(30000);
        const doctorObj = doctor.toObject();
        doctorObj.hasProfilePicture = true;
        res.json({ data: doctorObj });
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
        const patients = await Patient.find({ _id: { $in: patientIds } }).select('-password -profilePicture').maxTimeMS(30000);

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
        const doctors = await Doctor.find({
            $or: [
                { status: 'approved' },
                { isApproved: true }
            ]
        }).select('-password -profilePicture').lean();

        // Compute next available slot for each doctor in parallel
        const results = await Promise.all(doctors.map(async (d) => {
            const nextSlot = await getNextAvailableSlot(d);
            return {
                ...d,
                hasProfilePicture: true,
                nextAvailableSlot: nextSlot,
                fee: d.fee || 0
            };
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

// @desc    Get reviews for a doctor (from rated completed appointments)
// @route   GET /api/doctor/:id/reviews
// @access  Public
exports.getDoctorReviews = async (req, res) => {
    try {
        const reviews = await Appointment.find({
            doctor: req.params.id,
            'rating.isRated': true
        })
            .populate('patient', 'name gender')
            .select('rating patient createdAt')
            .sort({ 'rating.givenAt': -1 })
            .limit(50)
            .maxTimeMS(15000);

        const formatted = reviews.map(r => ({
            appointmentId: r._id,
            patientId: r.patient?._id?.toString() || null,
            score: r.rating.score,
            feedback: r.rating.feedback,
            givenAt: r.rating.givenAt || r.createdAt,
            patientName: r.patient?.name || 'Anonymous',
            patientGender: r.patient?.gender || 'other'
        }));

        res.json({ success: true, data: formatted });
    } catch (error) {
        console.error('Get Doctor Reviews Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// @desc    Update doctor schedule & fee
// @route   PUT /api/doctor/schedule
// @access  Private (Doctor)
exports.updateSchedule = async (req, res) => {
    try {
        const { fee, days, startTime, endTime, slotDuration } = req.body;

        const update = {};
        if (fee !== undefined) update.fee = Number(fee);
        if (days) update['availability.days'] = days;
        if (startTime) update['availability.startTime'] = startTime;
        if (endTime) update['availability.endTime'] = endTime;
        if (slotDuration) update['availability.slotDuration'] = Number(slotDuration);

        const doctor = await Doctor.findByIdAndUpdate(
            req.user._id,
            { $set: update },
            { new: true, runValidators: true }
        ).select('-password -profilePicture');

        if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

        res.json({ success: true, data: doctor });
    } catch (error) {
        console.error('Update Schedule Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get available slots for a doctor on a given date
// @route   GET /api/doctor/:id/slots?date=YYYY-MM-DD
// @access  Public
exports.getAvailableSlots = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id).select('availability').lean();
        if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

        const date = req.query.date;
        if (!date) return res.status(400).json({ error: 'date query param required (YYYY-MM-DD)' });

        const defaultDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const avail = doctor.availability || {};
        const days = (avail.days && avail.days.length > 0) ? avail.days : defaultDays;
        const startTime = avail.startTime || '09:00';
        const endTime = avail.endTime || '17:00';
        const slotDuration = avail.slotDuration || 30;

        const dayName = DAY_NAMES[new Date(date + 'T00:00:00').getDay()];

        if (!days.includes(dayName)) {
            return res.json({ success: true, data: [], message: `Doctor does not work on ${dayName}` });
        }

        const allSlots = generateSlots(startTime, endTime, slotDuration);

        // Get booked slots
        const bookedAppts = await Appointment.find({
            doctor: req.params.id,
            date,
            status: { $in: ['pending', 'confirmed'] }
        }).select('time').lean();
        const bookedTimes = new Set(bookedAppts.map(a => a.time));

        // Filter: for today, also remove past slots
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const currentTime24 = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        const available = allSlots
            .filter(slot => {
                if (date === todayStr && slot < currentTime24) return false;
                if (bookedTimes.has(slot) || bookedTimes.has(formatTo12h(slot))) return false;
                return true;
            })
            .map(slot => ({ time24: slot, time12: formatTo12h(slot) }));

        res.json({ success: true, data: available });
    } catch (error) {
        console.error('Get Available Slots Error:', error);
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
