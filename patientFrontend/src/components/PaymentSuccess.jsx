import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, ArrowRight, Loader2, Calendar } from 'lucide-react';
import api from '../api/axios';

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
          setError('No payment data received from eSewa');
          setVerifying(false);
          return;
        }

        const response = await api.get(`/payment/verify-esewa?data=${data}`);
        
        if (response.data.success) {
          // Success! Redirect to history after 5 seconds
          const timer = setTimeout(() => {
            navigate('/patientdashboard/history');
          }, 5000);
          return () => clearTimeout(timer);
        } else {
          setError('Payment verification failed. Please contact support.');
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
      <div className="min-h-screen flex items-center justify-center bg-white font-sans">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
          <p className="text-gray-500">Securing your transaction with eSewa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4 font-sans">
        <div className="bg-white p-10 rounded-3xl shadow-2xl shadow-gray-200/50 text-center max-w-md w-full border border-red-100">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <AlertCircle className="w-10 h-10 text-red-500" strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3 uppercase tracking-tight">Payment Issue</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">{error}</p>
          <button
            onClick={() => navigate('/patientdashboard')}
            className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all active:scale-[0.98]"
          >
            Return to Dashboard
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50/30 p-4 font-sans">
      <div className="bg-white p-10 rounded-3xl shadow-2xl shadow-blue-100/50 text-center max-w-md w-full border border-blue-50">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
          <CheckCircle2 className="w-12 h-12 text-green-500" strokeWidth={2.5} />
          <div className="absolute inset-0 rounded-full border-4 border-green-500/20 animate-ping"></div>
        </div>
        
        <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Payment Successful!</h2>
        <p className="text-gray-500 mb-10 leading-relaxed">
          Your appointment has been confirmed. You will receive an email shortly with the details.
        </p>

        <div className="space-y-4">
          <Link
            to="/patientdashboard/history"
            className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
          >
            <Calendar size={18} />
            View My Appointments
          </Link>
          
          <p className="text-xs text-gray-400 font-medium">
            Auto-redirecting in <span className="text-blue-500">5 seconds</span>...
          </p>
        </div>
      </div>
    </div>
  );
}
