import { Building2, CreditCard, Smartphone } from 'lucide-react';

const PAYMENT_METHODS = [
  {
    id: 'pay-at-clinic',
    name: 'Pay at Clinic',
    desc: 'Pay in cash or card at the clinic',
    icon: Building2,
    color: 'text-gray-600',
    bg: 'bg-gray-100',
  },
  {
    id: 'khalti',
    name: 'Khalti',
    desc: 'Pay via Khalti digital wallet',
    icon: Smartphone,
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    badge: 'Popular',
  },
  {
    id: 'esewa',
    name: 'eSewa',
    desc: 'Pay via eSewa mobile wallet',
    icon: Smartphone,
    color: 'text-green-600',
    bg: 'bg-green-100',
  },
  {
    id: 'card',
    name: 'Credit / Debit Card',
    desc: 'Visa, Mastercard, or other cards',
    icon: CreditCard,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
  },
];

export default function StepPayment({ paymentMethod, onChange, doctor }) {
  const feeNum = doctor?.fee ? parseInt(String(doctor.fee).replace(/[^0-9]/g, ''), 10) : 0;
  const platformFee = feeNum > 0 ? Math.round(feeNum * 0.05) : 0;
  const totalFee = feeNum + platformFee;
  const isFree = feeNum === 0;

  return (
    <div className="p-6 pt-4">
      <h3 className="text-sm font-bold text-gray-900 mb-1">Payment Method</h3>
      <p className="text-xs text-gray-400 mb-5">
        {isFree ? 'This consultation is free. Choose how you\'d like to confirm.' : 'Choose how you\'d like to pay for this consultation'}
      </p>

      <div className="space-y-2.5">
        {PAYMENT_METHODS.map((method) => {
          const isSelected = paymentMethod === method.id;
          const Icon = method.icon;
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onChange(method.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/50 shadow-md shadow-blue-100'
                  : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
              }`}
            >
              {/* Radio */}
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isSelected ? 'border-blue-600' : 'border-gray-300'
                }`}
              >
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
              </div>

              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${method.bg}`}>
                <Icon size={18} className={method.color} />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  {method.name}
                  {method.badge && (
                    <span className="text-[9px] font-bold uppercase bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full tracking-wider">
                      {method.badge}
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-gray-400">{method.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Amount display */}
      <div className="mt-5 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl border border-gray-100">
        {!isFree ? (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Consultation Fee</span>
              <span>NPR {feeNum}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Platform Fee (5%)</span>
              <span>NPR {platformFee}</span>
            </div>
            <div className="h-px bg-gray-200 my-1" />
            <div className="flex justify-between">
              <span className="text-sm font-bold text-gray-900">Total Amount</span>
              <span className="text-lg font-extrabold text-blue-600">NPR {totalFee}</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-gray-900">Total Amount</span>
            <span className="text-lg font-extrabold text-emerald-600">Free</span>
          </div>
        )}
      </div>
    </div>
  );
}
