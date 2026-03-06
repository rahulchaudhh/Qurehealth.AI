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
  Calendar, Clock, User, Stethoscope, CreditCard,
} from 'lucide-react';
import axios from '../../api/axios';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '15px',
      color: '#111827',
      fontFamily: '"Inter", system-ui, sans-serif',
      fontWeight: '500',
      '::placeholder': { color: '#9ca3af', fontWeight: '400' },
    },
    invalid: { color: '#ef4444' },
  },
};

// ─── Payment Form ─────────────────────────────────────────────────────────────
function CheckoutForm({ amountUSD, amountNPR, doctor, bookingData, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();

  const [clientSecret, setClientSecret]   = useState('');
  const [loading, setLoading]             = useState(true);
  const [processing, setProcessing]       = useState(false);
  const [error, setError]                 = useState('');
  const [succeeded, setSucceeded]         = useState(false);
  const [email, setEmail]                 = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await axios.post('/payment/stripe/create-intent', { amount: amountUSD });
        setClientSecret(data.clientSecret);
      } catch (err) {
        setError(err.response?.data?.error || 'Could not initialize payment. Please try again.');
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

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        setSucceeded(true);
        setTimeout(() => onSuccess(paymentIntent.id), 1200);
      }
    } catch {
      setError('Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  const cleanName = doctor?.name ? doctor.name.replace(/^(dr\.?)\s*/i, '') : '';
  const displayName = cleanName ? `Dr. ${cleanName.charAt(0).toUpperCase() + cleanName.slice(1)}` : doctor?.name || 'Doctor';

  const aptDate = bookingData?.date ? new Date(bookingData.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }) : '—';
  const aptTime = bookingData?.time || '—';

  // ── Success screen ──
  if (succeeded) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 py-16 px-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-2">
          <CheckCircle2 size={36} className="text-green-500" strokeWidth={2} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Payment successful!</h2>
        <p className="text-sm text-gray-500">Booking your appointment…</p>
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mt-2" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">

      {/* ── LEFT: Order Summary ── */}
      <div className="w-full md:w-[42%] bg-white border-b md:border-b-0 md:border-r border-gray-200 flex flex-col">
        {/* Brand / back */}
        <div className="px-8 pt-8 pb-6 flex items-center gap-3 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Stethoscope size={16} className="text-white" />
          </div>
          <span className="font-extrabold text-gray-900 text-base tracking-tight">Qurehealth AI</span>
        </div>

        <div className="flex-1 px-8 py-8 space-y-8">
          {/* Amount */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Consultation fee</p>
            <p className="text-4xl font-extrabold text-gray-900 tracking-tight">
              NPR {amountNPR.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">≈ USD {amountUSD.toFixed(2)}</p>
          </div>

          {/* What you get */}
          <div className="space-y-3">
            {[
              'One consultation session',
              'Verified specialist doctor',
              'Digital prescription (if applicable)',
              'Appointment confirmed instantly',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
                <CheckCircle2 size={15} className="text-blue-500 flex-shrink-0" strokeWidth={2.5} />
                {item}
              </div>
            ))}
          </div>

          {/* Appointment details */}
          <div className="bg-gray-50 rounded-2xl p-5 space-y-4 border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Appointment Details</p>

            <div className="flex items-center gap-3">
              {doctor?.profilePicture ? (
                <img src={doctor.profilePicture} alt={displayName}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  onError={e => e.target.style.display = 'none'} />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <User size={18} className="text-blue-500" />
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-gray-900">{displayName}</p>
                <p className="text-xs text-blue-600">{doctor?.specialty || doctor?.specialization || ''}</p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar size={13} className="text-gray-400" />
                {aptDate}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock size={13} className="text-gray-400" />
                {aptTime}
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="space-y-2 border-t border-gray-100 pt-5">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Consultation</span>
              <span>NPR {amountNPR.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Platform fee</span>
              <span className="text-green-600 font-semibold">Free</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-100 pt-2 mt-1">
              <span>Total due today</span>
              <span>NPR {amountNPR.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Security footer */}
        <div className="px-8 pb-8 flex items-center gap-1.5 text-xs text-gray-400">
          <ShieldCheck size={13} className="text-green-500" />
          Secured by Stripe · 256-bit SSL encryption
        </div>
      </div>

      {/* ── RIGHT: Payment Form ── */}
      <div className="flex-1 flex flex-col">
        {/* Back button */}
        <div className="px-8 pt-8 pb-4">
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to booking
          </button>
        </div>

        <div className="flex-1 px-8 pb-10 max-w-md">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Payment method</h1>
          <p className="text-sm text-gray-400 mb-8">Complete your secure payment below</p>

          {loading ? (
            <div className="flex items-center gap-3 py-12 text-gray-400">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Initializing secure payment…</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white"
                />
              </div>

              {/* Card section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-500">Card information</label>
                  <div className="flex items-center gap-1.5">
                    <img src="https://js.stripe.com/v3/fingerprinted/img/visa-729c05c240c4bdb47b03ac81d9945bfe.svg" alt="Visa" className="h-4" />
                    <img src="https://js.stripe.com/v3/fingerprinted/img/mastercard-4d8844094130711885b5e41b28c9848f.svg" alt="Mastercard" className="h-4" />
                    <img src="https://js.stripe.com/v3/fingerprinted/img/amex-a49b82f46c5cd6a96a6e418a6ca1717c.svg" alt="Amex" className="h-4" />
                  </div>
                </div>

                {/* Card number */}
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                  <div className="px-4 py-3.5 border-b border-gray-100">
                    <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
                  </div>
                  <div className="grid grid-cols-2">
                    <div className="px-4 py-3.5 border-r border-gray-100">
                      <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
                    </div>
                    <div className="px-4 py-3.5">
                      <CardCvcElement options={CARD_ELEMENT_OPTIONS} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Name on card */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Name on card</label>
                <input
                  type="text"
                  placeholder="Full name"
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
                  <span className="mt-0.5">⚠</span>
                  {error}
                </div>
              )}

              {/* Subscribe / Pay button */}
              <button
                type="submit"
                disabled={!stripe || processing || !clientSecret}
                className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-xl text-sm font-bold transition-all ${
                  !stripe || processing || !clientSecret
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-900 hover:bg-gray-800 text-white shadow-lg active:scale-[0.99]'
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

              {/* Terms */}
              <p className="text-[11px] text-gray-400 leading-relaxed">
                By confirming your payment, you authorize Qurehealth AI to charge your card for this appointment.{' '}
                <span className="underline cursor-pointer">Cancel anytime</span> before the appointment to receive a refund.
              </p>

              {/* Test hint */}
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-700">
                <CreditCard size={13} className="flex-shrink-0" />
                <span>Test: <span className="font-mono font-bold">4242 4242 4242 4242</span> · any future date · any CVC</span>
              </div>
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
    <div className="fixed inset-0 z-[70] bg-gray-50 overflow-y-auto">
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
