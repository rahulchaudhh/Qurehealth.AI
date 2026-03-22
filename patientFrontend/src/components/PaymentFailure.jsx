import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ChevronLeft, LayoutDashboard } from 'lucide-react';

export default function PaymentFailure() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4 font-sans">
      <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full border border-amber-100">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-amber-500" strokeWidth={2.5} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">PAYMENT CANCELLED</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Your eSewa payment was not completed. You can try booking the appointment again from the dashboard.
        </p>
        <div className="flex gap-3">
            <button
            onClick={() => navigate(-1)}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all active:scale-[0.98]"
            >
            <ChevronLeft size={18} />
            Go Back
            </button>
            <button
            onClick={() => navigate('/patientdashboard')}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
            >
            <LayoutDashboard size={18} />
            Dashboard
            </button>
        </div>
      </div>
    </div>
  );
}
