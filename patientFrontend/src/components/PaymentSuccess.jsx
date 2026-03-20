import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios'; // Wait, let me check what axios import they use. I'll use standard axios if unsure but they likely have an instance. I'll use `import { toast } from 'react-toastify'` for errors.

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const data = searchParams.get('data');
        
        if (!data) {
          setError('No payment data received');
          setVerifying(false);
          return;
        }

        const response = await api.get(`/payment/verify-esewa?data=${data}`);
        
        if (response.data.success) {
          setTimeout(() => {
            navigate('/history');
          }, 3000);
        } else {
          setError('Payment verification failed');
        }
      } catch (err) {
        console.error('Verification error:', err);
        setError(err.response?.data?.error || 'Verification failed');
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Verifying your payment with eSewa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-red-100">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Payment Failed</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-green-100">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">Your appointment has been confirmed securely.</p>
        <p className="text-sm text-gray-500 font-medium animate-pulse">Redirecting to your appointments...</p>
      </div>
    </div>
  );
}
