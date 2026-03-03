const mongoose = require('mongoose');

const doctorVerificationCriteriaSchema = new mongoose.Schema(
  {
    minExperienceYears: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    requiredSpecializations: {
      type: [String],
      default: []
    },
    requireLicenseVerification: {
      type: Boolean,
      default: false
    },
    requireEducationProof: {
      type: Boolean,
      default: true
    },
    autoApproveIfCriteriaMet: {
      type: Boolean,
      default: false
    },
    maxPendingDoctors: {
      type: Number,
      default: 100,
      min: 1
    },
    lastUpdatedBy: {
      type: String,
      default: 'admin'
    },
    lastUpdatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('DoctorVerificationCriteria', doctorVerificationCriteriaSchema);
