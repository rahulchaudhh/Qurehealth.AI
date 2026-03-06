import { Check } from 'lucide-react';

const STEPS = [
  { num: 1, label: 'Type' },
  { num: 2, label: 'Schedule' },
  { num: 3, label: 'Details' },
  { num: 4, label: 'Payment' },
];

export default function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center">
      {STEPS.map((step, idx) => {
        const isCompleted = currentStep > step.num;
        const isActive = currentStep === step.num;

        return (
          <div key={step.num} className="flex items-center flex-1 last:flex-none">
            {/* Node */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-blue-600 text-white'
                    : isActive
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : 'bg-gray-100 text-gray-400 border border-gray-200'
                }`}
              >
                {isCompleted ? <Check size={14} strokeWidth={2.5} /> : step.num}
              </div>
              <span
                className={`text-[11px] mt-1 font-semibold whitespace-nowrap transition-colors duration-300 ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-gray-400' : 'text-gray-300'
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector */}
            {idx < STEPS.length - 1 && (
              <div className="flex-1 mx-2 mb-4 h-0.5 relative overflow-hidden rounded-full">
                <div className="absolute inset-0 bg-gray-100" />
                <div
                  className="absolute inset-y-0 left-0 bg-blue-500 transition-all duration-500 ease-out"
                  style={{ width: currentStep > step.num ? '100%' : '0%' }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

