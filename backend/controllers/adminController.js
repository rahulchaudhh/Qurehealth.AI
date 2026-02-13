const Doctor = require('../models/Doctor');

exports.getPendingDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find({ status: 'pending' }).select('-password');
        res.json({ data: doctors });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.approveDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            { status: 'approved', isApproved: true },
            { new: true, runValidators: true }
        );

        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        res.json({ success: true, data: doctor });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.rejectDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected', isApproved: false },
            { new: true, runValidators: true }
        );

        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        res.json({ success: true, data: doctor });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find().select('-password');
        res.json({ data: doctors });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllPatients = async (req, res) => {
    try {
        const Patient = require('../models/Patient');
        const patients = await Patient.find().select('-password');
        res.json({ data: patients });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deletePatient = async (req, res) => {
    try {
        const Patient = require('../models/Patient');
        const patient = await Patient.findByIdAndDelete(req.params.id);

        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        res.json({ success: true, message: 'Patient deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const Doctor = require('../models/Doctor');
        const Patient = require('../models/Patient');
        const Appointment = require('../models/Appointment');

        const totalDoctors = await Doctor.countDocuments();
        const totalPatients = await Patient.countDocuments();
        const totalAppointments = await Appointment.countDocuments();

        const appointmentStats = await Appointment.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const stats = {
            doctors: totalDoctors,
            patients: totalPatients,
            appointments: totalAppointments,
            appointmentBreakdown: appointmentStats.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {})
        };

        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
