const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'ai'],
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    isEmergency: {
        type: Boolean,
        default: false,
    },
    suggestedSpecialty: {
        type: String,
        default: null,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const chatSessionSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true,
        index: true,
    },
    title: {
        type: String,
        default: 'New conversation',
    },
    messages: [chatMessageSchema],
    lang: {
        type: String,
        enum: ['en', 'ne'],
        default: 'en',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Auto-set title from first user message
chatSessionSchema.pre('save', function () {
    this.updatedAt = new Date();
    if (this.title === 'New conversation' && this.messages.length > 0) {
        const firstUserMsg = this.messages.find(m => m.role === 'user');
        if (firstUserMsg) {
            this.title = firstUserMsg.text.substring(0, 60) + (firstUserMsg.text.length > 60 ? '…' : '');
        }
    }
});

// Index for fetching recent sessions efficiently
chatSessionSchema.index({ patientId: 1, updatedAt: -1 });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
