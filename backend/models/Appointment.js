const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    date: {
        type: String, // Storing as string YYYY-MM-DD for simplicity in demo or Date
        required: true
    },
    time: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled', 'missed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    diagnosis: {
        type: String,
        default: ''
    },
    prescription: {
        type: String, // Could be detailed structure later, string for now
        default: ''
    },
    doctorNotes: {
        type: String,
        default: ''
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    transactionId: {
        type: String
    },
    paymentMethod: {
        type: String,
        default: 'esewa'
    },
    isVisibleToPatient: {
        type: Boolean,
        default: true
    },
    isVisibleToDoctor: {
        type: Boolean,
        default: true
    },
    rating: {
        score: {
            type: Number,
            min: 1,
            max: 5
        },
        feedback: {
            type: String,
            default: ''
        },
        isRated: {
            type: Boolean,
            default: false
        },
        givenAt: {
            type: Date
        }
    }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
