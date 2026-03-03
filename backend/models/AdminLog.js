const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
    actor: {
        id: {
            type: String,
            default: null
        },
        email: {
            type: String,
            default: null
        },
        role: {
            type: String,
            default: 'admin'
        }
    },
    action: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['security', 'doctor', 'patient', 'appointment', 'communication', 'system'],
        default: 'system'
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    ipAddress: {
        type: String,
        default: null
    },
    userAgent: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

adminLogSchema.index({ createdAt: -1 });
adminLogSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model('AdminLog', adminLogSchema);
