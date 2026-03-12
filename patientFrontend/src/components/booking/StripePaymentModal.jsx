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
import {
  Lock, ShieldCheck, ArrowLeft, CheckCircle2,
  Calendar, Clock, User, Stethoscope,
} from 'lucide-react';
import axios from '../../api/axios';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '15px',
      color: '#0f172a',
      fontFamily: '"Inter", system-ui, sans-serif',
      fontWeight: '500',
      '::placeholder': { color: '#94a3b8', fontWeight: '400' },
    },
    invalid: { color: '#ef4444' },
  },
};

// ─── Inner Form ───────────────────────────────────────────────────────────────
function CheckoutForm({ amountUSD, amountNPR, doctor, bookingData, onSuccess, onCancel }) {
  const stripe   = useStripe();
  const elements = useElements();

  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading]           = useState(true);
  const [processing, setProcessing]     = useState(false);
  const [error, setError]               = useState('');
  const [succeeded, setSucceeded]       = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await axios.post('/payment/stripe/create-intent', { amount: amountUSD });
        setClientSecret(data.clientSecret);
      } catch (err) {
        setError(err.response?.data?.error || 'Could not initialize payment.');
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
        payment_method: { card: elements.getElement(CardNumberElement) },
      });
      if (stripeError) { setError(stripeError.message); setProcessing(false); return; }
      if (paymentIntent.status === 'succeeded') {
        setSucceeded(true);
        setTimeout(() => onSuccess(paymentIntent.id), 1400);
      }
    } catch {
      setError('Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  const cleanName   = doctor?.name ? doctor.name.replace(/^(dr\.?)\s*/i, '') : '';
  const displayName = cleanName ? `Dr. ${cleanName.charAt(0).toUpperCase() + cleanName.slice(1)}` : doctor?.name || 'Doctor';
  const aptDate     = bookingData?.date
    ? new Date(bookingData.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })
    : null;
  const aptTime = bookingData?.time || null;

  // ── Success ──
  if (succeeded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white gap-5 px-6">
        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
          <CheckCircle2 size={30} className="text-blue-600" strokeWidth={2.5} />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-bold text-slate-900">Payment confirmed</h2>
          <p className="text-sm text-slate-500 mt-1">Booking your appointment…</p>
        </div>
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-start py-10 px-4">

      {/* ── Top nav ── */}
      <div className="w-full max-w-lg mb-6 flex items-center justify-between">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <Stethoscope size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold text-slate-900">Qurehealth AI</span>
        </div>
      </div>

      {/* ── Card ── */}
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Header — amount */}
        <div className="px-8 pt-8 pb-6 border-b border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Consultation fee</p>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              NPR {amountNPR.toLocaleString()}
            </span>
            <span className="text-sm text-slate-400 mb-0.5">≈ USD {amountUSD.toFixed(2)}</span>
          </div>
        </div>

        {/* Appointment summary row */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {doctor?.profilePicture ? (
              <img
                src={doctor.profilePicture}
                alt={displayName}
                className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0"
                onError={e => e.target.style.display = 'none'}
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 border border-blue-100">
                <User size={16} className="text-blue-500" />
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-slate-900">{displayName}</p>
              <p className="text-xs text-blue-600">{doctor?.specialty || doctor?.specialization || ''}</p>
            </div>
          </div>

          {(aptDate || aptTime) && (
            <div className="text-right space-y-0.5 flex-shrink-0">
              {aptDate && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 justify-end">
                  <Calendar size={11} className="text-slate-400" />
                  {aptDate}
                </div>
              )}
              {aptTime && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 justify-end">
                  <Clock size={11} className="text-slate-400" />
                  {aptTime}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Form */}
        <div className="px-8 py-7">
          {loading ? (
            <div className="flex items-center gap-3 py-8 justify-center text-slate-400">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Initializing secure checkout…</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Card section label */}
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Card details</p>
                <div className="flex items-center gap-1.5 opacity-60">
                  <img src="https://js.stripe.com/v3/fingerprinted/img/visa-729c05c240c4bdb47b03ac81d9945bfe.svg" alt="Visa" className="h-[14px]" />
                  <img src="https://js.stripe.com/v3/fingerprinted/img/mastercard-4d8844094130711885b5e41b28c9848f.svg" alt="MC" className="h-[14px]" />
                  <img src="https://js.stripe.com/v3/fingerprinted/img/amex-a49b82f46c5cd6a96a6e418a6ca1717c.svg" alt="Amex" className="h-[14px]" />
                </div>
              </div>

              {/* Card number */}
              <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 transition-all bg-white">
                <div className="px-4 py-3.5 border-b border-slate-100">
                  <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
                </div>
                <div className="grid grid-cols-2 divide-x divide-slate-100">
                  <div className="px-4 py-3.5">
                    <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
                  </div>
                  <div className="px-4 py-3.5">
                    <CardCvcElement options={CARD_ELEMENT_OPTIONS} />
                  </div>
                </div>
              </div>

              {/* Name on card */}
              <input
                type="text"
                placeholder="Name on card"
                className="w-full px-4 py-3 text-sm text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-400 transition-all placeholder:text-slate-400 bg-white"
              />

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
                  <span className="mt-0.5 flex-shrink-0">⚠</span>
                  {error}
                </div>
              )}

              {/* Divider + line items */}
              <div className="space-y-2 py-1 border-t border-slate-100">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Consultation fee</span>
                  <span>NPR {amountNPR.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Platform fee</span>
                  <span className="text-blue-600 font-semibold">Free</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-100 pt-2">
                  <span>Total due today</span>
                  <span>NPR {amountNPR.toLocaleString()}</span>
                </div>
              </div>

              {/* Pay button */}
              <button
                type="submit"
                disabled={!stripe || processing || !clientSecret}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all ${
                  !stripe || processing || !clientSecret
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 active:scale-[0.99]'
                }`}
              >
                {processing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    <Lock size={13} />
                    Pay NPR {amountNPR.toLocaleString()}
                  </>
                )}
              </button>

              {/* Footer */}
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 pt-1">
                <ShieldCheck size={13} className="text-blue-400" />
                Secured by Stripe · SSL encrypted
              </div>

              {/* Test hint */}
              <p className="text-center text-[11px] text-slate-400 border-t border-slate-100 pt-3">
                Test card: <span className="font-mono font-semibold text-slate-600">4242 4242 4242 4242</span> · any future date · any CVC
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Full-screen wrapper ──────────────────────────────────────────────────────
export default function StripePaymentModal({ amount, doctor, bookingData, onSuccess, onClose }) {
  const feeNum    = parseFloat(String(amount || '0').replace(/[^0-9.]/g, '')) || 0;
  const amountUSD = Math.max(0.50, parseFloat((feeNum / 135).toFixed(2)));

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-slate-50">
      <Elements stripe={stripePromise}>
        <CheckoutForm
          amountUSD={amountUSD}
          amountNPR={feeNum}
          doctor={doctor}
          bookingData={bookingData}
          onSuccess={onSuccess}
          onCancel={onClose}
        />
      </Elements>
    </div>
  );
}
