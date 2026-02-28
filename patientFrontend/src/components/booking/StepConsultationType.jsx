import { Video, Building2, Info } from 'lucide-react';

export default function StepConsultationType({ consultationType, onChange }) {
  return (
    <div className="p-6 pt-4">
      <h3 className="text-sm font-bold text-gray-900 mb-1">Choose Consultation Type</h3>
      <p className="text-xs text-gray-400 mb-5">How would you like to meet your doctor?</p>

      <div className="grid grid-cols-2 gap-3">
        {/* In-Person */}
        <button
          type="button"
          onClick={() => onChange('in-person')}
          className={`relative p-5 rounded-2xl border-2 transition-all duration-200 text-left group ${
            consultationType === 'in-person'
              ? 'border-blue-500 bg-blue-50/60 shadow-md shadow-blue-100'
              : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
          }`}
        >
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-colors ${
              consultationType === 'in-person'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
            }`}
          >
            <Building2 size={20} />
          </div>
          <p className="text-sm font-bold text-gray-900 mb-0.5">In-Person Visit</p>
          <p className="text-[11px] text-gray-400 leading-snug">Visit the doctor at the clinic for a face-to-face consultation</p>
          {consultationType === 'in-person' && (
            <div className="absolute top-3 right-3 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          )}
        </button>

        {/* Video Consultation */}
        <button
          type="button"
          onClick={() => onChange('video')}
          className={`relative p-5 rounded-2xl border-2 transition-all duration-200 text-left group ${
            consultationType === 'video'
              ? 'border-blue-500 bg-blue-50/60 shadow-md shadow-blue-100'
              : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
          }`}
        >
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-colors ${
              consultationType === 'video'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
            }`}
          >
            <Video size={20} />
          </div>
          <p className="text-sm font-bold text-gray-900 mb-0.5">Video Consultation</p>
          <p className="text-[11px] text-gray-400 leading-snug">Connect with your doctor remotely via secure video call</p>
          {consultationType === 'video' && (
            <div className="absolute top-3 right-3 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          )}
        </button>
      </div>

      {/* Video info text */}
      {consultationType === 'video' && (
        <div className="mt-4 flex items-start gap-2.5 p-3 bg-amber-50 rounded-xl border border-amber-100 animate-fadeIn">
          <Info size={15} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-700 leading-relaxed">
            A secure meeting link will be sent to your email after the appointment is confirmed by the doctor.
          </p>
        </div>
      )}
    </div>
  );
}
