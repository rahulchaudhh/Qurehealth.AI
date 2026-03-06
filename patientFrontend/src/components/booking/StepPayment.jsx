import { Building2, CreditCard, Smartphone } from 'lucide-react';

const PAYMENT_METHODS = [
  {
    id: 'pay-at-clinic',
    name: 'Pay at Clinic',
    desc: 'Cash or card at reception',
    icon: Building2,
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
    badge: null,
  },
  {
    id: 'khalti',
    name: 'Khalti',
    desc: 'Digital wallet',
    icon: Smartphone,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    badge: 'Popular',
  },
  {
    id: 'esewa',
    name: 'eSewa',
    desc: 'Mobile wallet',
    icon: Smartphone,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    badge: null,
  },
  {
    id: 'card',
    name: 'Credit / Debit Card',
    desc: 'Visa, Mastercard & more',
    icon: CreditCard,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    badge: 'Stripe',
    badgeBg: 'bg-blue-100 text-blue-600',
  },
];

export default function StepPayment({ paymentMethod, onChange, doctor }) {
  const feeNum = doctor?.fee ? parseInt(String(doctor.fee).replace(/[^0-9]/g, ''), 10) : 0;
  const platformFee = feeNum > 0 ? Math.round(feeNum * 0.05) : 0;
  const totalFee = feeNum + platformFee;
  const isFree = feeNum === 0;

  return (
    <div className="p-6 space-y-5">
      <div>
        <h3 className="text-lg font-bold text-gray-900">Payment Method</h3>
        <p className="text-sm text-gray-500 mt-1">
          {isFree ? 'This consultation is free — select a method to continue.' : 'Choose how you would like to pay'}
        </p>
      </div>

      {/* Methods */}
      <div className="space-y-2.5">
        {PAYMENT_METHODS.map(({ id, name, desc, icon: Icon, iconBg, iconColor, badge, badgeBg }) => {
          const selected = paymentMethod === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-150 ${
                selected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {/* Radio */}
              <div
                className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  selected ? 'border-blue-600' : 'border-gray-300'
                }`}
              >
                {selected && <div className="w-2 h-2 rounded-full bg-blue-600" />}
              </div>

              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                <Icon size={18} className={iconColor} strokeWidth={1.8} />
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">{name}</span>
                  {badge && (
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wide ${badgeBg || 'bg-purple-100 text-purple-600'}`}>
                      {badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Fee breakdown */}
      <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
        {!isFree ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Consultation Fee</span>
              <span className="text-gray-700 font-medium">NPR {feeNum}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Platform Fee (5%)</span>
              <span className="text-gray-700 font-medium">NPR {platformFee}</span>
            </div>
            <div className="h-px bg-gray-200 my-1" />
            <div className="flex justify-between items-center">
              <span className="text-base font-bold text-gray-900">Total</span>
              <span className="text-lg font-extrabold text-blue-600">NPR {totalFee}</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <span className="text-base font-bold text-gray-900">Total</span>
            <span className="text-lg font-extrabold text-green-600">Free</span>
          </div>
        )}
      </div>
    </div>
  );
}

