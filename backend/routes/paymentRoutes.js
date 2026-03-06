const express = require('express');
const router = express.Router();
const {
    initiatePayment,
    verifyPayment,
    createStripePaymentIntent,
    confirmStripePayment,
} = require('../controllers/paymentController');
const auth = require('../middleware/auth');

// eSewa routes
router.post('/initiate-esewa', auth, initiatePayment);
router.get('/verify-esewa', verifyPayment);

// Stripe routes
router.post('/stripe/create-intent', auth, createStripePaymentIntent);
router.post('/stripe/confirm', auth, confirmStripePayment);

module.exports = router;
