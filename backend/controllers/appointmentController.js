const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

// @desc    Book an appointment
// @route   POST /api/appointments
// @access  Private (Patient)
exports.bookAppointment = async (req, res) => {
    try {
        const { doctorId, date, time, reason } = req.body;

        if (!doctorId || !date || !time || !reason) {
            return res.status(400).json({ error: 'doctorId, date, time, and reason are all required.' });
        }

        // Run doctor lookup and duplicate check in parallel
        const [doctor, existingAppointment] = await Promise.all([
            Doctor.findById(doctorId).select('_id name availability fee').maxTimeMS(30000),
            Appointment.findOne({
                doctor: doctorId,
                date,
                time,
                status: { $in: ['pending', 'confirmed'] }
            }).select('_id').maxTimeMS(30000)
        ]);

        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        if (existingAppointment) {
            return res.status(400).json({ error: 'Time slot already booked. Please choose another time.' });
        }

        // Validate against doctor's schedule if set
        if (doctor.availability && doctor.availability.days && doctor.availability.days.length > 0) {
            const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const bookingDay = DAY_NAMES[new Date(date + 'T00:00:00').getDay()];
            if (!doctor.availability.days.includes(bookingDay)) {
                return res.status(400).json({ error: `Doctor is not available on ${bookingDay}. Please choose another date.` });
            }
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
        const appointments = await Appointment.find({
            doctor: req.user._id,
            isVisibleToDoctor: { $ne: false } // Only fetch visible appointments
        })
            .populate('patient', 'name email phone gender dateOfBirth')
            .sort({ date: 1, time: 1 })
            .maxTimeMS(30000);

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

// ...

// @desc    Soft delete appointment for doctor
// @route   DELETE /api/appointments/doctor/:id
// @access  Private (Doctor)
exports.deleteDoctorAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        // Ensure authorized doctor
        if (appointment.doctor.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: 'Not authorized' });
        }

        appointment.isVisibleToDoctor = false;
        await appointment.save();

        res.json({ success: true, data: {} });
    } catch (error) {
        console.error('Delete Doctor Appointment Error:', error);
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
            .sort({ date: 1, time: 1 })
            .maxTimeMS(30000);

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

        let appointment = await Appointment.findById(req.params.id).maxTimeMS(30000);

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
                recipient: appointment.patient,
                recipientModel: 'Patient',
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

// @desc    Rate a completed appointment
// @route   PUT /api/appointments/:id/rate
// @access  Private (Patient)
exports.rateAppointment = async (req, res) => {
    try {
        const { score, feedback } = req.body;

        // Validate score
        if (!score || score < 1 || score > 5) {
            return res.status(400).json({ error: 'Rating score must be between 1 and 5.' });
        }

        const appointment = await Appointment.findById(req.params.id).maxTimeMS(30000);

        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        // Only the patient who booked can rate
        if (appointment.patient.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: 'Not authorized to rate this appointment' });
        }

        // Only completed appointments can be rated
        if (appointment.status !== 'completed') {
            return res.status(400).json({ error: 'Only completed appointments can be rated.' });
        }

        // Prevent double rating
        if (appointment.rating && appointment.rating.isRated) {
            return res.status(400).json({ error: 'You have already rated this appointment.' });
        }

        // Save rating on appointment
        appointment.rating = {
            score: Math.round(score),
            feedback: feedback || '',
            isRated: true,
            givenAt: new Date()
        };
        await appointment.save();

        // Recalculate doctor's average rating from ALL rated appointments
        const ratedAppointments = await Appointment.find({
            doctor: appointment.doctor,
            'rating.isRated': true
        }).select('rating.score').maxTimeMS(30000);

        const totalReviews = ratedAppointments.length;
        const avgRating = totalReviews > 0
            ? ratedAppointments.reduce((sum, a) => sum + a.rating.score, 0) / totalReviews
            : 0;

        await Doctor.findByIdAndUpdate(appointment.doctor, {
            'rating.average': Math.round(avgRating * 10) / 10, // Round to 1 decimal
            'rating.totalReviews': totalReviews
        });

        res.json({
            success: true,
            data: appointment,
            doctorRating: {
                average: Math.round(avgRating * 10) / 10,
                totalReviews
            }
        });
    } catch (error) {
        console.error('Rate Appointment Error:', error);
        res.status(500).json({ error: error.message });
    }
};
