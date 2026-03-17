const express = require('express');
const router = express.Router();
const {
    registerDoctor, loginDoctor, getDoctorMe, getDoctorStats,
    getDoctorPatients, getPatientDetail, getPatientProfilePicture, getAllDoctors, getDoctorById,
    getDoctorProfilePicture, getDoctorReviews, getAvailableSlots,
    updateSchedule, deleteDoctor
} = require('../controllers/doctorController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/register', upload.single('profilePicture'), registerDoctor);
router.post('/login', loginDoctor);
router.get('/me', auth, getDoctorMe);
router.get('/stats', auth, getDoctorStats);
router.get('/patients', auth, getDoctorPatients);
router.get('/patient/:id', auth, getPatientDetail);
router.get('/patient/:id/profile-picture', auth, getPatientProfilePicture);
router.put('/schedule', auth, updateSchedule);                // Update schedule & fee
router.get('/all', getAllDoctors);
router.get('/:id/reviews', getDoctorReviews);                 // Get reviews
router.get('/:id/slots', getAvailableSlots);                  // Get available slots for a date
router.get('/:id', getDoctorById);
router.get('/:id/profile-picture', getDoctorProfilePicture);
router.delete('/:id', auth, deleteDoctor);

module.exports = router;
