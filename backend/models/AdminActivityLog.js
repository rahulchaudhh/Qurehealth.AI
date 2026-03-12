const mongoose = require('mongoose');

const adminActivityLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: String,
      default: 'admin',
      required: true
    },
    action: {
      type: String,
      enum: [
        'DOCTOR_APPROVED',
        'DOCTOR_REJECTED',
        'DOCTOR_DELETED',
        'DOCTOR_REGISTERED',
        'PATIENT_DELETED',
        'APPOINTMENT_STATUS_UPDATED',
        'BROADCAST_SENT',
        'ALERT_TRIGGERED',
        'BROADCAST_STOPPED',
        'SETTINGS_CHANGED',
        'LOGIN'
      ],
      required: true
    },
    targetType: {
      type: String,
      enum: ['DOCTOR', 'PATIENT', 'SYSTEM'],
      required: true
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    targetName: String,
    targetEmail: String,
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    ipAddress: String,
    userAgent: String,
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILURE'],
      default: 'SUCCESS'
    },
    errorMessage: String,
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  { timestamps: true }
);

// Index for efficient querying
adminActivityLogSchema.index({ timestamp: -1 });
adminActivityLogSchema.index({ action: 1, timestamp: -1 });
adminActivityLogSchema.index({ targetId: 1 });

module.exports = mongoose.model('AdminActivityLog', adminActivityLogSchema);
