const express = require('express');
const router = express.Router();
const { registerDoctor, loginDoctor, getDoctorMe, getDoctorStats, getDoctorPatients, getAllDoctors } = require('../controllers/doctorController');
const auth = require('../middleware/auth');

router.post('/register', registerDoctor);
router.post('/login', loginDoctor);
router.get('/me', auth, getDoctorMe);
router.get('/stats', auth, getDoctorStats);
router.get('/patients', auth, getDoctorPatients);
router.get('/all', auth, getAllDoctors);

module.exports = router;
