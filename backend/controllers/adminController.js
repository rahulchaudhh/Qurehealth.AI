const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const AdminActivityLog = require('../models/AdminActivityLog');
const sendEmail = require('../utils/sendEmail');

const logAdminActivity = async (req, payload) => {
    try {
        await AdminActivityLog.create({
            adminId: req.user?._id?.toString() || req.user?.id || 'admin',
            ipAddress: req.ip || req.connection?.remoteAddress,
            userAgent: req.get('user-agent'),
            status: 'SUCCESS',
            ...payload
        });
    } catch (error) {
        console.error('Failed to write admin activity log:', error.message);
    }
};

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

        // Send approval email to doctor
        if (doctor.email) {
            try {
                await sendEmail({
                    to: doctor.email,
                    subject: 'Your Qurehealth.AI Account Has Been Approved',
                    html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif;background-color:#fafbfc;">
    <div style="width:100%;max-width:600px;margin:32px auto;background:white;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <!-- Premium Brand Bar -->
        <div style="height:4px;background:linear-gradient(90deg,#4F46E5 0%,#6366f1 100%);border-radius:8px 8px 0 0;"></div>
        
        <!-- Logo & Header -->
        <div style="padding:32px 32px 24px;text-align:center;border-bottom:1px solid #f0f0f0;">
            <h1 style="margin:0;font-size:24px;font-weight:700;color:#1a1a1a;letter-spacing:-0.5px;">
                Qurehealth<span style="font-weight:700;color:#1a1a1a;">.AI</span>
            </h1>
        </div>
        
        <!-- Main Content -->
        <div style="padding:32px;">
            <!-- Title -->
            <h2 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#1a1a1a;line-height:1.4;">
                Your Account Has Been Approved
            </h2>
            
            <!-- Body Copy -->
            <p style="margin:0 0 28px;font-size:15px;color:#525252;line-height:1.6;font-weight:400;">
                Your registration has been successfully reviewed and approved by our team. You can now access your dashboard and start connecting with patients.
            </p>
            
            <!-- Account Details Card -->
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin-bottom:32px;">
                <h3 style="margin:0 0 20px;font-size:13px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Account Details</h3>
                
                <table style="width:100%;border-collapse:collapse;">
                    <tr>
                        <td style="padding:12px 0;font-size:14px;color:#6b7280;font-weight:500;border-bottom:1px solid #eff2f5;">Name</td>
                        <td style="padding:12px 0;font-size:14px;color:#1a1a1a;font-weight:600;border-bottom:1px solid #eff2f5;text-align:right;">Dr. ${doctor.name}</td>
                    </tr>
                    <tr>
                        <td style="padding:12px 0;font-size:14px;color:#6b7280;font-weight:500;border-bottom:1px solid #eff2f5;">Email</td>
                        <td style="padding:12px 0;font-size:14px;color:#1a1a1a;font-weight:600;border-bottom:1px solid #eff2f5;text-align:right;word-break:break-all;">${doctor.email}</td>
                    </tr>
                    <tr>
                        <td style="padding:12px 0;font-size:14px;color:#6b7280;font-weight:500;border-bottom:1px solid #eff2f5;">Specialization</td>
                        <td style="padding:12px 0;font-size:14px;color:#1a1a1a;font-weight:600;border-bottom:1px solid #eff2f5;text-align:right;">${doctor.specialization || 'General Medicine'}</td>
                    </tr>
                    <tr>
                        <td style="padding:12px 0;font-size:14px;color:#6b7280;font-weight:500;">Status</td>
                        <td style="padding:12px 0;text-align:right;">
                            <span style="display:inline-block;background:#eff6ff;color:#2563eb;padding:4px 12px;border-radius:6px;font-size:12px;font-weight:600;">Approved</span>
                        </td>
                    </tr>
                </table>
            </div>
            
            <!-- CTA Button -->
            <table style="width:100%;border-collapse:collapse;margin-bottom:32px;">
                <tr>
                    <td style="text-align:center;">
                        <a href="${process.env.DOCTOR_FRONTEND_URL || 'http://localhost:5174'}/login"
                           style="display:inline-block;width:100%;max-width:320px;padding:0 24px;height:48px;line-height:48px;background:#4F46E5;color:white;text-decoration:none;font-size:15px;font-weight:600;border-radius:12px;box-shadow:0 2px 4px rgba(79,70,229,0.2);transition:all 0.2s;">
                            Access Your Dashboard
                        </a>
                    </td>
                </tr>
            </table>
            
            <!-- Supporting Text -->
            <p style="margin:0;font-size:14px;color:#8b8b8b;line-height:1.6;">
                If you have any questions or need assistance, our support team is here to help. Reply to this email or visit our help center.
            </p>
        </div>
        
        <!-- Footer -->
        <div style="padding:24px 32px;border-top:1px solid #f0f0f0;background:#fafbfc;border-radius:0 0 8px 8px;">
            <p style="margin:0 0 12px;font-size:13px;color:#8b8b8b;line-height:1.5;">
                © ${new Date().getFullYear()} Qurehealth.AI. All rights reserved.<br/>
                Trusted Healthcare Platform
            </p>
            <p style="margin:0;font-size:12px;color:#a3a3a3;">
                <a href="${process.env.PATIENT_FRONTEND_URL || 'http://localhost:5173'}" style="color:#4F46E5;text-decoration:none;">Visit Website</a> • 
                <a href="mailto:support@qurehealth.ai" style="color:#4F46E5;text-decoration:none;">Contact Support</a>
            </p>
        </div>
    </div>
</body>
</html>`
                });
            } catch (emailErr) {
                console.error('Approval email failed to send:', emailErr.message);
                // Don't block the approval if email fails
            }
        }

        await logAdminActivity(req, {
            action: 'DOCTOR_APPROVED',
            targetType: 'DOCTOR',
            targetId: doctor._id,
            targetName: doctor.name,
            targetEmail: doctor.email,
            details: {
                specialization: doctor.specialization,
                status: doctor.status
            }
        });

        res.json({ success: true, data: doctor });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllAppointments = async (req, res) => {
    try {
        const { status, search, dateFrom, dateTo } = req.query;

        const query = {};
        if (status && status !== 'all') query.status = status;
        if (dateFrom || dateTo) {
            query.date = {};
            if (dateFrom) query.date.$gte = dateFrom;
            if (dateTo) query.date.$lte = dateTo;
        }

        let appointments = await Appointment.find(query)
            .populate('doctor', 'name specialization email')
            .populate('patient', 'name email phone')
            .sort({ date: -1, createdAt: -1 })
            .lean()
            .maxTimeMS(30000);

        if (search) {
            const q = search.toLowerCase();
            appointments = appointments.filter(a =>
                a.patient?.name?.toLowerCase().includes(q) ||
                a.doctor?.name?.toLowerCase().includes(q) ||
                a.doctor?.specialization?.toLowerCase().includes(q) ||
                a.reason?.toLowerCase().includes(q) ||
                a.patient?.email?.toLowerCase().includes(q)
            );
        }

        res.json({ success: true, data: appointments });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateAdminAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'missed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        const existingAppointment = await Appointment.findById(req.params.id)
            .select('_id status doctor patient')
            .lean();
        if (!existingAppointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        )
            .populate('doctor', 'name specialization email')
            .populate('patient', 'name email phone')
            .lean();

        await logAdminActivity(req, {
            action: 'APPOINTMENT_STATUS_UPDATED',
            targetType: 'SYSTEM',
            targetId: appointment._id,
            targetName: `Appointment ${appointment._id}`,
            details: {
                previousStatus: existingAppointment.status,
                newStatus: status,
                patientId: appointment.patient?._id || existingAppointment.patient,
                doctorId: appointment.doctor?._id || existingAppointment.doctor
            }
        });

        res.json({ success: true, data: appointment });
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

        // Send rejection email to doctor
        if (doctor.email) {
            try {
                await sendEmail({
                    to: doctor.email,
                    subject: 'Update on Your Qurehealth.AI Registration Application',
                    html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif;background-color:#fafbfc;">
    <div style="width:100%;max-width:600px;margin:32px auto;background:white;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <!-- Premium Brand Bar -->
        <div style="height:4px;background:linear-gradient(90deg,#dc2626 0%,#ef4444 100%);border-radius:8px 8px 0 0;"></div>
        
        <!-- Logo & Header -->
        <div style="padding:32px 32px 24px;text-align:center;border-bottom:1px solid #f0f0f0;">
            <h1 style="margin:0;font-size:24px;font-weight:700;color:#1a1a1a;letter-spacing:-0.5px;">
                Qurehealth<span style="font-weight:700;color:#1a1a1a;">.AI</span>
            </h1>
        </div>
        
        <!-- Main Content -->
        <div style="padding:32px;">
            <!-- Title -->
            <h2 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#1a1a1a;line-height:1.4;">
                Application Status Update
            </h2>
            
            <!-- Body Copy -->
            <p style="margin:0 0 28px;font-size:15px;color:#525252;line-height:1.6;font-weight:400;">
                Thank you for your interest in joining <strong>Qurehealth.AI</strong>. After reviewing your application, we are unable to approve your registration at this time.
            </p>
            
            <!-- Account Details Card -->
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin-bottom:32px;">
                <h3 style="margin:0 0 20px;font-size:13px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Application Details</h3>
                
                <table style="width:100%;border-collapse:collapse;">
                    <tr>
                        <td style="padding:12px 0;font-size:14px;color:#6b7280;font-weight:500;border-bottom:1px solid #eff2f5;">Name</td>
                        <td style="padding:12px 0;font-size:14px;color:#1a1a1a;font-weight:600;border-bottom:1px solid #eff2f5;text-align:right;">Dr. ${doctor.name}</td>
                    </tr>
                    <tr>
                        <td style="padding:12px 0;font-size:14px;color:#6b7280;font-weight:500;border-bottom:1px solid #eff2f5;">Email</td>
                        <td style="padding:12px 0;font-size:14px;color:#1a1a1a;font-weight:600;border-bottom:1px solid #eff2f5;text-align:right;word-break:break-all;">${doctor.email}</td>
                    </tr>
                    <tr>
                        <td style="padding:12px 0;font-size:14px;color:#6b7280;font-weight:500;border-bottom:1px solid #eff2f5;">Specialization</td>
                        <td style="padding:12px 0;font-size:14px;color:#1a1a1a;font-weight:600;border-bottom:1px solid #eff2f5;text-align:right;">${doctor.specialization || 'General Medicine'}</td>
                    </tr>
                    <tr>
                        <td style="padding:12px 0;font-size:14px;color:#6b7280;font-weight:500;">Status</td>
                        <td style="padding:12px 0;text-align:right;">
                            <span style="display:inline-block;background:#fee2e2;color:#dc2626;padding:4px 12px;border-radius:6px;font-size:12px;font-weight:600;">Not Approved</span>
                        </td>
                    </tr>
                </table>
            </div>
            
            <!-- Info Box -->
            <div style="background:#fef3c7;border:1px solid #fcd34d;border-left:4px solid #f59e0b;border-radius:8px;padding:16px;margin-bottom:32px;">
                <p style="margin:0;font-size:14px;color:#92400e;line-height:1.6;font-weight:500;">
                    Please ensure your credentials, qualifications, and profile information are complete and accurate before reapplying.
                </p>
            </div>
            
            <!-- CTA Button -->
            <table style="width:100%;border-collapse:collapse;margin-bottom:32px;">
                <tr>
                    <td style="text-align:center;">
                        <a href="${process.env.DOCTOR_FRONTEND_URL || 'http://localhost:5174'}/register"
                           style="display:inline-block;background:#1a1a1a;color:white;padding:12px 32px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;letter-spacing:0.3px;">
                            Reapply Now
                        </a>
                    </td>
                </tr>
            </table>
            
            <!-- Footer Text -->
            <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">
                If you believe this decision was made in error or have questions, please contact our support team at <strong style="color:#1a1a1a;">support@qurehealth.ai</strong>
            </p>
        </div>
        
        <!-- Footer -->
        <div style="padding:24px 32px;text-align:center;border-top:1px solid #f0f0f0;background:#f9fafb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
                © ${new Date().getFullYear()} Qurehealth.AI. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>`
                });
            } catch (emailErr) {
                console.error('Rejection email failed to send:', emailErr.message);
                // Don't block the rejection if email fails
            }
        }

        await logAdminActivity(req, {
            action: 'DOCTOR_REJECTED',
            targetType: 'DOCTOR',
            targetId: doctor._id,
            targetName: doctor.name,
            targetEmail: doctor.email,
            details: {
                specialization: doctor.specialization,
                status: doctor.status
            }
        });

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
        const patient = await Patient.findByIdAndDelete(req.params.id);

        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        await logAdminActivity(req, {
            action: 'PATIENT_DELETED',
            targetType: 'PATIENT',
            targetId: patient._id,
            targetName: patient.name,
            targetEmail: patient.email,
            details: {
                deletedPatientId: patient._id,
                deletedAt: new Date()
            }
        });

        res.json({ success: true, message: 'Patient deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPatientHistory = async (req, res) => {
    try {
        const appointments = await Appointment.find({ patient: req.params.id })
            .populate('doctor', 'name specialization')
            .sort({ date: -1 })
            .lean()
            .maxTimeMS(30000);
        res.json({ data: appointments });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
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

        await logAdminActivity(req, {
            action: 'BROADCAST_SENT',
            targetType: 'SYSTEM',
            details: {
                batchId,
                target: target || 'all',
                recipientCount: recipients.length,
                messageLength: message.length
            }
        });

        res.json({ success: true, message: `Broadcast sent to ${recipients.length} users` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.triggerAlert = async (req, res) => {
    try {
        const { message, priority = 'high' } = req.body;

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

        await logAdminActivity(req, {
            action: 'ALERT_TRIGGERED',
            targetType: 'SYSTEM',
            details: {
                batchId,
                priority,
                recipientCount: recipients.length,
                messageLength: (message || '').length
            }
        });

        res.json({ success: true, message: `Alert triggered for ${recipients.length} users` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getBroadcastHistory = async (req, res) => {
    try {
        console.log('BACKEND: getBroadcastHistory called');
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

        const result = await Notification.deleteMany({ batchId });

        await logAdminActivity(req, {
            action: 'BROADCAST_STOPPED',
            targetType: 'SYSTEM',
            details: {
                batchId,
                deletedCount: result.deletedCount
            }
        });

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
