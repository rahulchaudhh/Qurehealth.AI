const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

// @desc    Book an appointment
// @route   POST /api/appointments
// @access  Private (Patient)
exports.bookAppointment = async (req, res) => {
    try {
        const { doctorId, date, time, reason } = req.body;

        // Verify doctor exists
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        // Check for existing appointment
        const existingAppointment = await Appointment.findOne({
            doctor: doctorId,
            date,
            time,
            status: { $ne: 'cancelled' }
        });

        if (existingAppointment) {
            return res.status(400).json({ error: 'Time slot already booked. Please choose another time.' });
        }

        const appointment = await Appointment.create({
            doctor: doctorId,
            patient: req.user._id,
            date,
            time,
            reason
        });

        res.status(201).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        console.error('Book Appointment Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get appointments for logged in doctor
// @route   GET /api/appointments/doctor
// @access  Private (Doctor)
exports.getDoctorAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ doctor: req.user._id })
            .populate('patient', 'name email phone gender dateOfBirth profilePicture')
            .sort({ date: 1, time: 1 });

        res.json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        console.error('Get Doctor Appointments Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get appointments for logged in patient
// @route   GET /api/appointments/my-appointments
// @access  Private (Patient)
exports.getMyAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({
            patient: req.user._id,
            isVisibleToPatient: { $ne: false }
        })
            .populate('doctor', 'name specialization hospital phone profilePicture')
            .sort({ date: 1, time: 1 });

        res.json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        console.error('Get Patient Appointments Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private (Doctor)
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { status, diagnosis, prescription, doctorNotes } = req.body; // 'confirmed', 'completed', 'cancelled'

        let appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        // Ensure authorized doctor
        if (appointment.doctor.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: 'Not authorized to update this appointment' });
        }

        appointment.status = status;
        if (diagnosis) appointment.diagnosis = diagnosis;
        if (prescription) appointment.prescription = prescription;
        if (doctorNotes) appointment.doctorNotes = doctorNotes;

        await appointment.save();

        // Notification Logic
        if (status === 'confirmed' || status === 'cancelled' || status === 'completed') {
            const Notification = require('../models/Notification');
            let message = '';
            if (status === 'confirmed') message = `Your appointment with Dr. ${req.user.name} on ${new Date(appointment.date).toLocaleDateString()} has been accepted and confirmed.`;
            else if (status === 'cancelled') message = `Your appointment with Dr. ${req.user.name} has been cancelled.`;
            else if (status === 'completed') message = `Your appointment with Dr. ${req.user.name} has been marked as completed.`;

            await Notification.create({
                recipient: appointment.patient._id, // Ensure patient is populated or accessed via appointment.patient if it's an ID
                message: message,
                type: 'appointment_status'
            });
        }

        res.json({ success: true, data: appointment });
    } catch (error) {
        console.error('Update Appointment Status Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// @desc    Cancel appointment (Patient)
// @route   PUT /api/appointments/:id/cancel
// @access  Private (Patient)
exports.cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        // Ensure authorized patient
        if (appointment.patient.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: 'Not authorized to cancel this appointment' });
        }

        appointment.status = 'cancelled';
        await appointment.save();

        res.json({ success: true, data: appointment });
    } catch (error) {
        console.error('Cancel Appointment Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// @desc    Soft delete appointment (Patient history)
// @route   DELETE /api/appointments/:id
// @access  Private (Patient)
exports.deleteMyAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        // Ensure authorized patient
        if (appointment.patient.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: 'Not authorized' });
        }

        appointment.isVisibleToPatient = false;
        await appointment.save();

        res.json({ success: true, data: {} });
    } catch (error) {
        console.error('Delete Appointment Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get single appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('doctor', 'name specialization hospital phone email')
            .populate('patient', 'name email phone gender dateOfBirth');

        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        // Access control: only allow the patient or the doctor involved
        if (
            appointment.patient._id.toString() !== req.user._id.toString() &&
            appointment.doctor._id.toString() !== req.user._id.toString()
        ) {
            return res.status(401).json({ error: 'Not authorized to view this appointment' });
        }

        res.json({
            success: true,
            data: appointment
        });
    } catch (error) {
        console.error('Get Appointment Error:', error);
        res.status(500).json({ error: error.message });
    }
};
