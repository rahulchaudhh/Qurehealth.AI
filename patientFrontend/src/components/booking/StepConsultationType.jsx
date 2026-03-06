import { Video, Building2, Info } from 'lucide-react';

const OPTIONS = [
  {
    id: 'in-person',
    icon: Building2,
    title: 'In-Person Visit',
    subtitle: 'Physical examination at the clinic',
    desc: 'Meet your doctor face-to-face for a thorough examination and direct consultation.',
    color: 'blue',
  },
  {
    id: 'video',
    icon: Video,
    title: 'Video Consultation',
    subtitle: 'Secure online video call',
    desc: 'Consult from the comfort of your home. A meeting link will be emailed after confirmation.',
    color: 'purple',
    badge: 'Remote',
  },
];

export default function StepConsultationType({ consultationType, onChange }) {
  return (
    <div className="p-6 space-y-4">
      <div>
        <h3 className="text-lg font-bold text-gray-900">Choose Consultation Type</h3>
        <p className="text-sm text-gray-500 mt-1">How would you prefer to see the doctor?</p>
      </div>

      <div className="space-y-3">
        {OPTIONS.map(({ id, icon: Icon, title, subtitle, desc, badge }) => {
          const selected = consultationType === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                selected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    selected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <Icon size={22} strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold text-gray-900">{title}</span>
                    {badge && (
                      <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-purple-100 text-purple-600">
                        {badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-gray-500 mb-1">{subtitle}</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
                </div>
                <div className="flex-shrink-0 mt-0.5">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      selected ? 'border-blue-600' : 'border-gray-300'
                    }`}
                  >
                    {selected && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {consultationType === 'video' && (
        <div className="flex items-start gap-3 p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
          <Info size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-600 leading-relaxed">
            A secure meeting link will be emailed once the doctor confirms your appointment.
          </p>
        </div>
      )}
    </div>
  );
}

