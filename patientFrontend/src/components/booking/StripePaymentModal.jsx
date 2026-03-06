import { useState, useEffect } from 'react';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Lock, CreditCard, ShieldCheck, X } from 'lucide-react';
import axios from '../../api/axios';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '15px',
      color: '#111827',
      fontFamily: '"Inter", system-ui, sans-serif',
      '::placeholder': { color: '#9ca3af' },
    },
    invalid: { color: '#ef4444' },
  },
};

// ─── Inner form ───────────────────────────────────────────────────────────────
// Charges the card only. Appointment is created AFTER payment succeeds.
function StripeForm({ amountUSD, amountNPR, onSuccess, onClose }) {
  const stripe = useStripe();
  const elements = useElements();

  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // Create payment intent with just the amount — no appointmentId needed yet
  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await axios.post('/payment/stripe/create-intent', {
          amount: amountUSD,
        });
        setClientSecret(data.clientSecret);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to initialize payment. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [amountUSD]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setProcessing(true);
    setError('');

    try {
      const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Payment done — tell parent to now create the appointment
        onSuccess(paymentIntent.id);
      }
    } catch (err) {
      setError('Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Initializing secure payment…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Card Number */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
          Card Number
        </label>
        <div className="px-3.5 py-3 border border-gray-200 rounded-xl bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      {/* Expiry + CVC */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Expiry Date
          </label>
          <div className="px-3.5 py-3 border border-gray-200 rounded-xl bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            CVC
          </label>
          <div className="px-3.5 py-3 border border-gray-200 rounded-xl bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <CardCvcElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
          <X size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Pay Button */}
      <button
        type="submit"
        disabled={!stripe || processing || !clientSecret}
        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all ${
          !stripe || processing || !clientSecret
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200 active:scale-[0.98]'
        }`}
      >
        {processing ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing…
          </>
        ) : (
          <>
            <Lock size={14} />
            Pay NPR {amountNPR.toLocaleString()}
          </>
        )}
      </button>

      {/* Security note */}
      <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
        <ShieldCheck size={13} className="text-green-500" />
        Secured by Stripe · SSL encrypted
      </div>

      {/* Test card hint */}
      <p className="text-center text-[10px] text-gray-400 border-t border-gray-100 pt-3">
        Test card: <span className="font-mono font-bold">4242 4242 4242 4242</span> · Any future date · Any CVC
      </p>
    </form>
  );
}

// ─── Modal Wrapper ─────────────────────────────────────────────────────────────
export default function StripePaymentModal({ amount, doctor, onSuccess, onClose }) {
  const feeNum = parseFloat(String(amount || '0').replace(/[^0-9.]/g, '')) || 0;
  // Convert NPR → USD for Stripe (test mode uses USD), min $0.50
  const amountUSD = Math.max(0.50, parseFloat((feeNum / 135).toFixed(2)));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <CreditCard size={18} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Pay with Card</h3>
              <p className="text-xs text-gray-400">{doctor?.name ? `Dr. ${doctor.name}` : 'Consultation'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Amount summary */}
        <div className="mx-5 mt-4 p-3.5 bg-blue-50 border border-blue-100 rounded-xl flex justify-between items-center">
          <span className="text-sm text-gray-600 font-medium">Consultation Fee</span>
          <span className="text-base font-extrabold text-blue-600">NPR {feeNum.toLocaleString()}</span>
        </div>

        {/* Form */}
        <div className="p-5">
          <Elements stripe={stripePromise}>
            <StripeForm
              amountUSD={amountUSD}
              amountNPR={feeNum}
              onSuccess={onSuccess}
              onClose={onClose}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
}
