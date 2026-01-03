const express = require('express');
const router = express.Router();
const {
    bookAppointment,
    getDoctorAppointments,
    getMyAppointments,
    updateAppointmentStatus
} = require('../controllers/appointmentController');
const auth = require('../middleware/auth');

router.post('/', auth, bookAppointment);
router.get('/doctor', auth, getDoctorAppointments);
router.get('/my-appointments', auth, getMyAppointments);
router.put('/:id/status', auth, updateAppointmentStatus);

module.exports = router;
