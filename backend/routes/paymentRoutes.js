const express = require('express');
const router = express.Router();
const { initiatePayment, verifyPayment } = require('../controllers/paymentController');
const auth = require('../middleware/auth'); // Optional, if we want to protect it

router.post('/initiate-esewa', auth, initiatePayment);
router.get('/verify-esewa', verifyPayment);

module.exports = router;
