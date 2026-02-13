import React, { useState } from 'react';
import axios from '../api/axios';

const PaymentButton = ({ amount, appointmentId, onPaymentInitiated, onError }) => {
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        setLoading(true);
        try {
            const { data } = await axios.post('/payment/initiate-esewa', {
                amount,
                appointmentId
            });

            if (data.success && data.paymentData) {
                // Submit form to eSewa
                submitEsewaForm(data.paymentData);
                if (onPaymentInitiated) onPaymentInitiated();
            }
        } catch (error) {
            console.error("Payment initiation failed:", error);
            if (onError) onError("Failed to initiate payment");
            else alert("Failed to initiate payment");
        } finally {
            setLoading(false);
        }
    };

    const submitEsewaForm = (paymentData) => {
        const form = document.createElement("form");
        form.setAttribute("method", "POST");
        form.setAttribute("action", "https://rc-epay.esewa.com.np/api/epay/main/v2/form");
        form.setAttribute("target", "_blank"); // Open in new tab or same? Standard is usually same or popup. Let's do same. 
        // Actually, redirecting away might lose state. But usually secure payment happens on their page.
        // Let's use _self to redirect.
        form.setAttribute("target", "_self");

        for (const key in paymentData) {
            const hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", paymentData[key]);
            form.appendChild(hiddenField);
        }

        document.body.appendChild(form);
        form.submit();
    };

    return (
        <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition flex justify-center items-center gap-2"
        >
            {loading ? (
                <>Processing...</>
            ) : (
                <>
                    Pay NPR {amount} with eSewa
                </>
            )}
        </button>
    );
};

export default PaymentButton;
