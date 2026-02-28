const Doctor = require('../models/Doctor');

exports.getPendingDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find({ status: 'pending' }).select('-password').lean().maxTimeMS(30000);
        const results = doctors.map(d => {
            const { profilePicture, ...rest } = d;
            return { ...rest, hasProfilePicture: !!profilePicture };
        });
        res.json({ data: results });
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
        const doctors = await Doctor.find().select('-password').lean().maxTimeMS(30000);
        const results = doctors.map(d => {
            const { profilePicture, ...rest } = d;
            return { ...rest, hasProfilePicture: !!profilePicture };
        });
        res.json({ data: results });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllPatients = async (req, res) => {
    try {
        const Patient = require('../models/Patient');
        const patients = await Patient.find().select('-password').lean().maxTimeMS(30000);
        const results = patients.map(p => {
            const { profilePicture, ...rest } = p;
            return { ...rest, hasProfilePicture: !!profilePicture };
        });
        res.json({ data: results });
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

        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Run all queries in parallel with maxTimeMS to avoid sequential blocking
        const [
            totalDoctors,
            totalPatients,
            totalAppointments,
            doctorsSevenDaysAgo,
            patientsSevenDaysAgo,
            appointmentStats
        ] = await Promise.all([
            Doctor.countDocuments().maxTimeMS(30000),
            Patient.countDocuments().maxTimeMS(30000),
            Appointment.countDocuments().maxTimeMS(30000),
            Doctor.countDocuments({ createdAt: { $lt: sevenDaysAgo } }).maxTimeMS(30000),
            Patient.countDocuments({ createdAt: { $lt: sevenDaysAgo } }).maxTimeMS(30000),
            Appointment.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]).option({ maxTimeMS: 30000 })
        ]);

        const calculateGrowth = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous) * 100;
        };

        const doctorGrowth = calculateGrowth(totalDoctors, doctorsSevenDaysAgo);
        const patientGrowth = calculateGrowth(totalPatients, patientsSevenDaysAgo);

        const stats = {
            doctors: totalDoctors,
            patients: totalPatients,
            appointments: totalAppointments,
            trends: {
                doctors: `+${doctorGrowth.toFixed(1)}%`,
                patients: `+${patientGrowth.toFixed(1)}%`
            },
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

exports.broadcast = async (req, res) => {
    try {
        const { message, target } = req.body; // target: 'all', 'doctors', 'patients'
        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Message is required' });
        }
        const Notification = require('../models/Notification');
        const Doctor = require('../models/Doctor');
        const Patient = require('../models/Patient');

        // Run recipient queries in parallel for speed
        const [doctors, patients] = await Promise.all([
            (target === 'all' || target === 'doctors') ? Doctor.find().select('_id').lean().maxTimeMS(15000) : Promise.resolve([]),
            (target === 'all' || target === 'patients') ? Patient.find().select('_id').lean().maxTimeMS(15000) : Promise.resolve([]),
        ]);

        const recipients = [
            ...doctors.map(d => ({ id: d._id, model: 'Doctor' })),
            ...patients.map(p => ({ id: p._id, model: 'Patient' })),
        ];

        const batchId = `bc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const notifications = recipients.map(r => ({
            recipient: r.id,
            recipientModel: r.model,
            message,
            type: 'broadcast',
            priority: 'medium',
            batchId
        }));

        await Notification.insertMany(notifications);

        res.json({ success: true, message: `Broadcast sent to ${recipients.length} users` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.triggerAlert = async (req, res) => {
    try {
        const { message, priority = 'high' } = req.body;
        const Notification = require('../models/Notification');
        const Doctor = require('../models/Doctor');
        const Patient = require('../models/Patient');

        const [doctors, patients] = await Promise.all([
            Doctor.find().select('_id').maxTimeMS(30000),
            Patient.find().select('_id').maxTimeMS(30000),
        ]);

        const recipients = [
            ...doctors.map(d => ({ id: d._id, model: 'Doctor' })),
            ...patients.map(p => ({ id: p._id, model: 'Patient' }))
        ];

        const batchId = `al_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const notifications = recipients.map(r => ({
            recipient: r.id,
            recipientModel: r.model,
            message,
            type: 'alert',
            priority,
            batchId
        }));

        await Notification.insertMany(notifications);

        res.json({ success: true, message: `Alert triggered for ${recipients.length} users` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getBroadcastHistory = async (req, res) => {
    try {
        console.log('BACKEND: getBroadcastHistory called');
        const Notification = require('../models/Notification');
        const history = await Notification.aggregate([
            { $match: { batchId: { $exists: true } } },
            {
                $group: {
                    _id: '$batchId',
                    message: { $first: '$message' },
                    type: { $first: '$type' },
                    priority: { $first: '$priority' },
                    createdAt: { $first: '$createdAt' },
                    recipientCount: { $sum: 1 },
                    readCount: { $sum: { $cond: ['$isRead', 1, 0] } }
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        console.log(`BACKEND: Returning ${history.length} pulses`);
        res.json({ success: true, data: history });
    } catch (error) {
        console.error('BACKEND ERROR in getBroadcastHistory:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.stopBroadcast = async (req, res) => {
    try {
        let { batchId } = req.params;
        if (batchId) batchId = batchId.trim();

        const Notification = require('../models/Notification');
        const result = await Notification.deleteMany({ batchId });

        res.json({
            success: true,
            message: `Successfully stopped broadcast and removed ${result.deletedCount} notifications.`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('BACKEND ERROR in stopBroadcast:', error);
        res.status(500).json({ error: error.message });
    }
};
