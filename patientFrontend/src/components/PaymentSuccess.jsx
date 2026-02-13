import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from '../api/axios';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [verifying, setVerifying] = useState(true);
    const [status, setStatus] = useState(null); // 'success', 'failed'

    useEffect(() => {
        const verify = async () => {
            const dataQuery = searchParams.get('data');
            if (!dataQuery) {
                setStatus('failed');
                setVerifying(false);
                return;
            }

            try {
                // Call backend to verify signature and status
                const { data } = await axios.get(`/payment/verify-esewa?data=${dataQuery}`);
                if (data.success) {
                    setStatus('success');
                } else {
                    setStatus('failed');
                }
            } catch (error) {
                console.error("Verification failed", error);
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-700">Verifying Payment...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
                {status === 'success' ? (
                    <>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                        <p className="text-gray-600 mb-8">Your appointment has been confirmed.</p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full bg-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-700 transition shadow-lg shadow-green-200"
                        >
                            Go to Dashboard
                        </button>
                    </>
                ) : (
                    <>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
                        <p className="text-gray-600 mb-8">We couldn't verify your payment. Please contact support.</p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full bg-gray-900 text-white py-3 px-4 rounded-xl font-semibold hover:bg-gray-800 transition"
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
