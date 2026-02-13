const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();

exports.initiatePayment = async (req, res) => {
    try {
        const { amount, appointmentId } = req.body;

        if (!amount || !appointmentId) {
            return res.status(400).json({ error: 'Amount and Appointment ID are required' });
        }

        const transaction_uuid = `${appointmentId}-${Date.now()}`;
        const product_code = 'EPAYTEST';
        const secret_key = '8gBm/:&EnhH.1/q';

        // Message to sign: total_amount,transaction_uuid,product_code
        // Note: Amount should be formatted to 2 decimal places usually, but eSewa might accept direct string.
        // Let's ensure it's a string.
        const total_amount = amount.toString();
        const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;

        const signature = crypto.createHmac('sha256', secret_key)
            .update(message)
            .digest('base64');

        const paymentData = {
            amount: total_amount,
            tax_amount: "0",
            total_amount: total_amount,
            transaction_uuid: transaction_uuid,
            product_code: product_code,
            product_service_charge: "0",
            product_delivery_charge: "0",
            success_url: "http://localhost:5173/payment/success",
            failure_url: "http://localhost:5173/payment/failure",
            signed_field_names: "total_amount,transaction_uuid,product_code",
            signature: signature,
        };

        res.json({ success: true, paymentData });

    } catch (error) {
        console.error("Payment Initiation Error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { data } = req.query;
        // Decode base64
        const decodedData = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));

        if (decodedData.status !== 'COMPLETE') {
            return res.status(400).json({ error: 'Payment not completed' });
        }

        // Logic to update appointment status can go here
        // For now, we'll just return success and let the frontend call an update endpoint or we do it here.
        // Ideally we update the DB here.

        // Let's parse transaction_uuid to get appointmentId if we need it
        // const appointmentId = decodedData.transaction_uuid.split('-')[0];

        res.json({ success: true, data: decodedData });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
