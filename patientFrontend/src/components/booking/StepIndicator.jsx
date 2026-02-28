import { Check } from 'lucide-react';

const STEPS = [
  { num: 1, label: 'Type' },
  { num: 2, label: 'Schedule' },
  { num: 3, label: 'Details' },
  { num: 4, label: 'Payment' },
  { num: 5, label: 'Confirm' },
];

export default function StepIndicator({ currentStep }) {
  return (
    <div className="px-6 pt-5 pb-3">
      <div className="flex items-center justify-between relative">
        {/* Background connector line */}
        <div className="absolute top-[14px] left-[24px] right-[24px] h-[2px] bg-gray-100 z-0" />
        {/* Animated progress bar */}
        <div
          className="absolute top-[14px] left-[24px] h-[2px] bg-blue-600 z-[1] transition-all duration-500 ease-out"
          style={{ width: `calc(${((currentStep - 1) / (STEPS.length - 1)) * 100}% - ${currentStep === STEPS.length ? 0 : 12}px)` }}
        />

        {STEPS.map((step) => {
          const isCompleted = currentStep > step.num;
          const isActive = currentStep === step.num;
          const isFuture = currentStep < step.num;

          return (
            <div key={step.num} className="flex flex-col items-center relative z-10">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-300 ring-4 ring-blue-100'
                    : 'bg-gray-100 text-gray-400 border border-gray-200'
                }`}
              >
                {isCompleted ? <Check size={14} strokeWidth={3} /> : step.num}
              </div>
              <span
                className={`text-[10px] mt-1.5 font-semibold tracking-wide transition-colors duration-300 ${
                  isCompleted || isActive ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
