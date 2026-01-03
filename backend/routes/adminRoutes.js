const express = require('express');
const router = express.Router();
const { getPendingDoctors, approveDoctor, rejectDoctor } = require('../controllers/adminController');
const auth = require('../middleware/auth');

// Middleware to check if user is admin - simple check for now
const adminCheck = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Admin access required' });
    }
};

router.get('/pending-doctors', auth, adminCheck, getPendingDoctors);
router.put('/approve-doctor/:id', auth, adminCheck, approveDoctor);
router.put('/reject-doctor/:id', auth, adminCheck, rejectDoctor);

module.exports = router;
