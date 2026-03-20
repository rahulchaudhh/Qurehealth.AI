const mongoose = require('mongoose');

const appointmentMessageSchema = new mongoose.Schema({
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true,
        index: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'senderModel'
    },
    senderModel: {
        type: String,
        required: true,
        enum: ['Patient', 'Doctor']
    },
    text: {
        type: String,
        required: true
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'file'],
        default: 'text'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Compound index for optimized polling (fetch by appointment and latest messages)
appointmentMessageSchema.index({ appointmentId: 1, _id: 1 });

module.exports = mongoose.model('AppointmentMessage', appointmentMessageSchema);
