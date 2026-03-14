import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import axios from '../api/axios';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [verifying, setVerifying] = useState(true);
    const [status, setStatus] = useState(null); // 'success' | 'failed'

    useEffect(() => {
        const verify = async () => {
            // Check for eSewa data param
            const dataQuery = searchParams.get('data');
            // Check for Stripe payment_intent param (Stripe redirects with this)
            const paymentIntent = searchParams.get('payment_intent');

            if (!dataQuery && !paymentIntent) {
                // Could be a direct Stripe success (handled in BookingWizard)
                setStatus('success');
                setVerifying(false);
                return;
            }

            try {
                if (dataQuery) {
                    // eSewa verification
                    const { data } = await axios.get(`/payment/verify-esewa?data=${dataQuery}`);
                    setStatus(data.success ? 'success' : 'failed');
                } else if (paymentIntent) {
                    // Stripe redirect verification (if using redirect flow)
                    const intentStatus = searchParams.get('redirect_status');
                    setStatus(intentStatus === 'succeeded' ? 'success' : 'failed');
                }
            } catch (error) {
                console.error('Verification failed', error);
                setStatus('failed');
            } finally {
                setVerifying(false);
            }
        };

        verify();
    }, [searchParams]);

    if (verifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 text-blue-600 mx-auto mb-4 animate-spin" />
                    <h2 className="text-lg font-semibold text-gray-700">Verifying Payment…</h2>
                    <p className="text-sm text-gray-400 mt-1">Please wait, do not close this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
                {status === 'success' ? (
                    <>
                        <div className="relative w-20 h-20 mx-auto mb-5">
                            <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-40" />
                            <div className="relative w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-200">
                                <CheckCircle2 size={38} className="text-white" strokeWidth={2} />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                        <p className="text-gray-500 text-sm mb-8">
                            Your appointment has been confirmed. A confirmation email will be sent shortly.
                        </p>
                        <button
                            onClick={() => navigate('/patientdashboard')}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-sm shadow-blue-200"
                        >
                            Go to Dashboard
                        </button>
                    </>
                ) : (
                    <>
                        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
                            <XCircle size={38} className="text-red-500" strokeWidth={2} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
                        <p className="text-gray-500 text-sm mb-8">
                            We couldn't verify your payment. Please contact support if the amount was deducted.
                        </p>
                        <button
                            onClick={() => navigate('/patientdashboard')}
                            className="w-full bg-gray-900 text-white py-3 px-4 rounded-xl font-bold hover:bg-gray-800 transition"
                        >
                            Return to Dashboard
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess;
