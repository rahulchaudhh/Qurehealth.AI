const express = require('express');
const router = express.Router();
const { registerDoctor, loginDoctor, getDoctorMe, getDoctorStats, getDoctorPatients, getAllDoctors, getDoctorById, deleteDoctor } = require('../controllers/doctorController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/register', upload.single('profilePicture'), registerDoctor);
router.post('/login', loginDoctor);
router.get('/me', auth, getDoctorMe);
router.get('/stats', auth, getDoctorStats);
router.get('/patients', auth, getDoctorPatients);
router.get('/all', auth, getAllDoctors);
router.get('/:id', getDoctorById);  // Get single doctor with profile picture
router.delete('/:id', auth, deleteDoctor);

module.exports = router;
