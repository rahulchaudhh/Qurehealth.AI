const express = require('express');
const router = express.Router();
const {
    getPendingDoctors, approveDoctor, rejectDoctor, getAllDoctors,
    getAllPatients, deletePatient, getPatientHistory, getDashboardStats,
    broadcast, triggerAlert, getBroadcastHistory, stopBroadcast,
    getAllAppointments, updateAdminAppointmentStatus
} = require('../controllers/adminController');
const {
    getVerificationCriteria,
    updateVerificationCriteria,
    getActivityLogs,
    clearOldLogs,
    getSystemStats
} = require('../controllers/adminSettingsController');
const auth = require('../middleware/auth');

// Middleware to check if user is admin - simple check for now
const adminCheck = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Admin access required' });
    }
};

router.get('/doctors', auth, adminCheck, getAllDoctors);
router.get('/patients', auth, adminCheck, getAllPatients);
router.get('/patients/:id/history', auth, adminCheck, getPatientHistory);
router.get('/dashboard-stats', auth, adminCheck, getDashboardStats);
router.delete('/delete-patient/:id', auth, adminCheck, deletePatient);
router.get('/pending-doctors', auth, adminCheck, getPendingDoctors);
router.put('/approve-doctor/:id', auth, adminCheck, approveDoctor);
router.put('/reject-doctor/:id', auth, adminCheck, rejectDoctor);
router.post('/broadcast', auth, adminCheck, broadcast);
router.post('/trigger-alert', auth, adminCheck, triggerAlert);
router.get('/broadcast-history', auth, adminCheck, getBroadcastHistory);
router.delete('/broadcast/:batchId', auth, adminCheck, stopBroadcast);
router.get('/appointments', auth, adminCheck, getAllAppointments);
router.put('/appointments/:id/status', auth, adminCheck, updateAdminAppointmentStatus);

// ── Admin Settings Routes ──
router.get('/settings/verification-criteria', auth, adminCheck, getVerificationCriteria);
router.put('/settings/verification-criteria', auth, adminCheck, updateVerificationCriteria);
router.get('/logs/activity', auth, adminCheck, getActivityLogs);
router.delete('/logs/clear-old', auth, adminCheck, clearOldLogs);
router.get('/stats/system', auth, adminCheck, getSystemStats);

module.exports = router;
