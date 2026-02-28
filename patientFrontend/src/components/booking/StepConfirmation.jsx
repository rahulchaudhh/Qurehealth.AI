import { useEffect, useState } from 'react';
import { CheckCircle2, Calendar, Clock, MapPin, Mail, ArrowRight, Home } from 'lucide-react';

export default function StepConfirmation({ doctor, bookingData, consultationType, onViewAppointments, onClose }) {
  const [showContent, setShowContent] = useState(false);

  // Staggered animation
  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 600);
    return () => clearTimeout(t);
  }, []);

  const handleAddToCalendar = () => {
    const startDt = (() => {
      const [timePart, meridiem] = bookingData.time.split(' ');
      let [h, m] = timePart.split(':').map(Number);
      if (meridiem?.toUpperCase() === 'PM' && h !== 12) h += 12;
      if (meridiem?.toUpperCase() === 'AM' && h === 12) h = 0;
      const d = new Date(`${bookingData.date}T00:00:00`);
      d.setHours(h, m, 0, 0);
      return d;
    })();
    const endDt = new Date(startDt.getTime() + 30 * 60 * 1000);
    const fmt = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `Consultation with ${doctor?.name}`,
      dates: `${fmt(startDt)}/${fmt(endDt)}`,
      details: `Appointment with ${doctor?.name} (${doctor?.specialty || 'Specialist'})\nType: ${consultationType === 'video' ? 'Video Consultation' : 'In-Person Visit'}`,
    });
    window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
  };

  return (
    <div className="p-6 pt-2">
      {/* Success animation */}
      <div className="flex flex-col items-center py-6">
        <div className="relative mb-4">
          {/* Ripple rings */}
          <div className="absolute inset-0 w-20 h-20 rounded-full bg-emerald-100 animate-ping opacity-20" />
          <div className="absolute inset-[6px] w-[68px] h-[68px] rounded-full bg-emerald-200 animate-ping opacity-15 animation-delay-150" />
          {/* Main check circle */}
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-200">
            <CheckCircle2 size={40} className="text-white" strokeWidth={2} />
          </div>
        </div>

        <h2 className="text-xl font-extrabold text-gray-900 mb-1">Appointment Confirmed!</h2>
        <p className="text-xs text-gray-400 font-medium">Your booking has been successfully placed</p>
      </div>

      {/* Details card */}
      <div
        className={`bg-gray-50 rounded-2xl border border-gray-100 p-5 mb-5 transition-all duration-500 ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
      >
        <div className="space-y-3">
          {/* Doctor */}
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
              Dr
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{doctor?.name}</p>
              <p className="text-[11px] text-gray-400">{doctor?.specialty}</p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Calendar size={14} className="text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-medium">Date</p>
                <p className="text-xs font-bold text-gray-800">
                  {new Date(bookingData.date + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Clock size={14} className="text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-medium">Time</p>
                <p className="text-xs font-bold text-gray-800">{bookingData.time}</p>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <MapPin size={14} className="text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-medium">{consultationType === 'video' ? 'Consultation Type' : 'Clinic Address'}</p>
              <p className="text-xs font-bold text-gray-800">
                {consultationType === 'video' ? 'Video Consultation — link sent via email' : 'Qurehealth Care, Jadibuti, Kathmandu'}
              </p>
            </div>
          </div>

          {/* Email confirmation */}
          <div className="flex items-center gap-2.5 pt-2 border-t border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Mail size={14} className="text-emerald-600" />
            </div>
            <p className="text-xs text-gray-500">
              Confirmation email sent to your registered email
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div
        className={`space-y-2.5 transition-all duration-500 delay-200 ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
      >
        <button
          type="button"
          onClick={handleAddToCalendar}
          className="w-full py-3 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
        >
          <Calendar size={15} className="text-blue-600" />
          Add to Calendar
        </button>

        <button
          type="button"
          onClick={onViewAppointments}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          View My Appointments
          <ArrowRight size={15} />
        </button>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-1.5"
        >
          <Home size={13} />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
