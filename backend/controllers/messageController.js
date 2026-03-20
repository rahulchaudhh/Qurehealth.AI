const AppointmentMessage = require('../models/AppointmentMessage');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification'); // For alerts

// Check if user is authorized for this appointment
async function checkAccess(req, appointmentId) {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return { error: 'Appointment not found', status: 404 };

    // Validate access
    const isPatient = req.user.role === 'patient' && appointment.patient.toString() === req.user.id;
    const isDoctor = req.user.role === 'doctor' && appointment.doctor.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
        return { error: 'Not authorized for this conversation', status: 403 };
    }

    // Check expiry: chats are readable but read-only 48 hours after completion
    let isExpired = false;
    if (appointment.status === 'completed') {
        const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
        const expiryTime = appointmentDate.getTime() + (48 * 60 * 60 * 1000); // 48 hours
        if (Date.now() > expiryTime) {
            isExpired = true;
        }
    }

    return { appointment, isPatient, isDoctor, isAdmin, isExpired };
}

// @route   GET /api/appointments/:id/messages
// @desc    Get messages for an appointment (supports polling)
exports.getMessages = async (req, res) => {
    try {
        const { id } = req.params;
        const { lastMessageId } = req.query; // For cursor-based polling

        const access = await checkAccess(req, id);
        if (access.error) return res.status(access.status).json({ error: access.error });

        // Query builder
        const query = { appointmentId: id };
        
        // If lastMessageId is provided, only fetch newer messages
        if (lastMessageId) {
            query._id = { $gt: lastMessageId };
        }

        const messages = await AppointmentMessage.find(query).sort({ createdAt: 1 });
        
        res.json({
            success: true,
            data: messages,
            isExpired: access.isExpired
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Server error fetching messages' });
    }
};

// @route   POST /api/appointments/:id/messages
// @desc    Send a new message
exports.sendMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { text, messageType = 'text' } = req.body;

        if (!text || text.trim() === '') {
            return res.status(400).json({ error: 'Message text is required' });
        }

        const access = await checkAccess(req, id);
        if (access.error) return res.status(access.status).json({ error: access.error });
        if (access.isExpired) return res.status(403).json({ error: 'Chat is closed. It has been more than 48 hours since the consultation.' });
        if (access.isAdmin) return res.status(403).json({ error: 'Admins cannot send messages' });

        const senderModel = access.isPatient ? 'Patient' : 'Doctor';

        const newMessage = new AppointmentMessage({
            appointmentId: id,
            sender: req.user.id,
            senderModel,
            text,
            messageType
        });

        await newMessage.save();

        // Optional: Send a notification ticket to the recipient
        const recipientId = access.isPatient ? access.appointment.doctor : access.appointment.patient;
        const recipientModel = access.isPatient ? 'Doctor' : 'Patient';
        
        // We could create a notification here, but be careful not to spam.
        // Usually, relying on the 'isRead' status and polling is better for active chats.
        
        res.status(201).json({ success: true, data: newMessage });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Server error sending message' });
    }
};

// @route   PUT /api/appointments/:id/messages/read
// @desc    Mark messages as read up to a certain point
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const access = await checkAccess(req, id);
        if (access.error) return res.status(access.status).json({ error: access.error });

        // Update all unread messages sent by the OTHER person
        await AppointmentMessage.updateMany({
            appointmentId: id,
            sender: { $ne: req.user.id },
            isRead: false
        }, {
            $set: { isRead: true }
        });

        res.json({ success: true, message: 'Messages marked as read' });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ error: 'Server error marking messages as read' });
    }
};

// @route   GET /api/appointments/messages/unread
// @desc    Get total unread message count for badge indicator
exports.getUnreadCount = async (req, res) => {
    try {
        // Find all appointments involving this user
        let appointmentQuery = {};
        if (req.user.role === 'patient') appointmentQuery.patient = req.user.id;
        else if (req.user.role === 'doctor') appointmentQuery.doctor = req.user.id;
        else return res.json({ unreadCount: 0 }); // Admins don't have unread counts

        const appointments = await Appointment.find(appointmentQuery).select('_id');
        const appointmentIds = appointments.map(a => a._id);

        // Count unread messages in those appointments sent by others
        const unreadCount = await AppointmentMessage.countDocuments({
            appointmentId: { $in: appointmentIds },
            sender: { $ne: req.user.id },
            isRead: false
        });

        res.json({ unreadCount });
    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({ error: 'Server error getting unread count' });
    }
};
