const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient', // Assuming currently only patients get notifications, but could be User
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String, // 'appointment_status', 'general', etc.
        default: 'general'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', notificationSchema);
