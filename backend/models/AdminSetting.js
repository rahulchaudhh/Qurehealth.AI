const mongoose = require('mongoose');

const adminSettingSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        default: 'security-rules'
    },
    securityRules: {
        doctorLicenseVerificationRequired: {
            type: Boolean,
            default: true
        },
        doctorManualApprovalRequired: {
            type: Boolean,
            default: true
        },
        mfaRequiredForAdmins: {
            type: Boolean,
            default: true
        },
        mfaRequiredForDoctors: {
            type: Boolean,
            default: false
        },
        minDoctorExperienceYears: {
            type: Number,
            default: 1,
            min: 0,
            max: 60
        },
        sessionTimeoutMinutes: {
            type: Number,
            default: 30,
            min: 5,
            max: 240
        }
    },
    updatedBy: {
        id: {
            type: String,
            default: null
        },
        email: {
            type: String,
            default: null
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AdminSetting', adminSettingSchema);
