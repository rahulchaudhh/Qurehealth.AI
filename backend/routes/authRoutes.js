const express = require('express');
const router = express.Router();
const { register, login, logout, getMe, updateProfile, googleAuth, forgotPassword, resetPassword } = require('../controllers/authController');
const auth = require('../middleware/auth');

const upload = require('../middleware/upload');

router.post('/register', upload.single('profilePicture'), register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me', auth, getMe);
router.put('/profile', auth, upload.single('profilePicture'), updateProfile);

module.exports = router;