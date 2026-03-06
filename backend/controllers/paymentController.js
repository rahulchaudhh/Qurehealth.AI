const Stripe = require('stripe');
const crypto = require('crypto');
const Appointment = require('../models/Appointment');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// ─── Stripe: Create Payment Intent ────────────────────────────────────────────
exports.createStripePaymentIntent = async (req, res) => {
    try {
        const { amount, appointmentId } = req.body;

        if (!amount || !appointmentId) {
            return res.status(400).json({ error: 'Amount and Appointment ID are required' });
        }

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        // Stripe uses smallest currency unit (cents). Treat NPR value as USD cents for demo.
        const amountInCents = Math.round(parseFloat(amount) * 100);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'usd',
            metadata: {
                appointmentId: appointmentId.toString(),
                patientId: req.user?.id?.toString() || '',
            },
            description: 'Qurehealth AI - Consultation Appointment',
        });

        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        });

    } catch (error) {
        console.error('Stripe Payment Intent Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// ─── Stripe: Confirm Payment & Update Appointment ─────────────────────────────
exports.confirmStripePayment = async (req, res) => {
    try {
        const { paymentIntentId, appointmentId } = req.body;

        if (!paymentIntentId || !appointmentId) {
            return res.status(400).json({ error: 'paymentIntentId and appointmentId are required' });
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ error: 'Payment not completed', status: paymentIntent.status });
        }

        await Appointment.findByIdAndUpdate(appointmentId, {
            paymentStatus: 'paid',
            transactionId: paymentIntentId,
            paymentMethod: 'stripe',
        });

        res.json({ success: true, message: 'Payment confirmed', transactionId: paymentIntentId });

    } catch (error) {
        console.error('Stripe Confirm Payment Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// ─── eSewa: Initiate Payment ───────────────────────────────────────────────────
exports.initiatePayment = async (req, res) => {
    try {
        const { amount, appointmentId } = req.body;

        if (!amount || !appointmentId) {
            return res.status(400).json({ error: 'Amount and Appointment ID are required' });
        }

        const transaction_uuid = `${appointmentId}-${Date.now()}`;
        const product_code = process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST';
        const secret_key = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';
        const total_amount = amount.toString();
        const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;

        const signature = crypto.createHmac('sha256', secret_key)
            .update(message)
            .digest('base64');

        const baseUrl = process.env.PATIENT_FRONTEND_URL || 'http://localhost:5173';

        const paymentData = {
            amount: total_amount,
            tax_amount: '0',
            total_amount: total_amount,
            transaction_uuid,
            product_code,
            product_service_charge: '0',
            product_delivery_charge: '0',
            success_url: `${baseUrl}/payment/success`,
            failure_url: `${baseUrl}/payment/failure`,
            signed_field_names: 'total_amount,transaction_uuid,product_code',
            signature,
        };

        res.json({ success: true, paymentData });

    } catch (error) {
        console.error('eSewa Payment Initiation Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// ─── eSewa: Verify Payment ────────────────────────────────────────────────────
exports.verifyPayment = async (req, res) => {
    try {
        const { data } = req.query;
        if (!data) return res.status(400).json({ error: 'No payment data provided' });

        const decodedData = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));

        if (decodedData.status !== 'COMPLETE') {
            return res.status(400).json({ error: 'Payment not completed' });
        }

        // Extract appointmentId from transaction_uuid (format: appointmentId-timestamp)
        const appointmentId = decodedData.transaction_uuid?.split('-')[0];
        if (appointmentId) {
            await Appointment.findByIdAndUpdate(appointmentId, {
                paymentStatus: 'paid',
                transactionId: decodedData.transaction_uuid,
                paymentMethod: 'esewa',
            });
        }

        res.json({ success: true, data: decodedData });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
