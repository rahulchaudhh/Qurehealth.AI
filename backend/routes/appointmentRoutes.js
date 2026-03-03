const express = require('express');
const router = express.Router();
const {
    bookAppointment,
    getDoctorAppointments,
    getMyAppointments,
    updateAppointmentStatus,
    cancelAppointment,
    deleteMyAppointment,
    deleteDoctorAppointment, // Imported new function
    getAppointmentById,
    rateAppointment,
    deleteRating
} = require('../controllers/appointmentController');
const auth = require('../middleware/auth');

router.post('/', auth, bookAppointment);
router.get('/doctor', auth, getDoctorAppointments);
router.get('/my-appointments', auth, getMyAppointments);
router.get('/:id', auth, getAppointmentById);
router.put('/:id/status', auth, updateAppointmentStatus);
router.put('/:id/rate', auth, rateAppointment);
router.delete('/:id/rate', auth, deleteRating);
router.put('/:id/cancel', auth, cancelAppointment);
router.delete('/:id', auth, deleteMyAppointment);
router.delete('/doctor/:id', auth, deleteDoctorAppointment); // Added doctor delete route

module.exports = router;
