const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'recipientModel'
    },
    recipientModel: {
        type: String,
        required: true,
        enum: ['Patient', 'Doctor']
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String, // 'broadcast', 'alert', 'appointment', etc.
        default: 'general'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    batchId: {
        type: String, // Group ID for broadcasts/alerts
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', notificationSchema);
