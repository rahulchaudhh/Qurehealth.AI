const express = require('express');
const router = express.Router();
const { register, login, logout, getMe, updateProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');

const upload = require('../middleware/upload');

router.post('/register', upload.single('profilePicture'), register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', auth, getMe);
router.put('/profile', auth, upload.single('profilePicture'), updateProfile);

module.exports = router;