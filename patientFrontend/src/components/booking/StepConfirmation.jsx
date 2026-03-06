import { useEffect, useState } from 'react';
import { CheckCircle2, Calendar, Clock, MapPin, Mail, ArrowRight, Home } from 'lucide-react';

export default function StepConfirmation({ doctor, bookingData, consultationType, onViewAppointments, onClose }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 300);
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
    <div className="p-6 space-y-6">
      {/* Success header */}
      <div className="flex flex-col items-center py-6 text-center">
        <div className="relative mb-4">
          <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-40" />
          <div className="relative w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-200">
            <CheckCircle2 size={38} className="text-white" strokeWidth={2} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-500 text-sm max-w-xs">
          Your appointment has been successfully scheduled. We'll see you soon!
        </p>
      </div>

      {/* Details card */}
      <div
        className={`bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden transition-all duration-500 ${
          show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Doctor row */}
        <div className="flex items-center gap-3 px-5 py-4 bg-blue-50 border-b border-blue-100">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
            Dr
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">{doctor?.name}</p>
            <p className="text-xs text-blue-600 font-medium">{doctor?.specialty}</p>
          </div>
        </div>

        {/* Info rows */}
        <div className="divide-y divide-gray-100">
          <div className="grid grid-cols-2 divide-x divide-gray-100">
            <div className="flex items-center gap-3 px-5 py-3.5">
              <Calendar size={15} className="text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-[11px] text-gray-400 uppercase font-semibold tracking-wide">Date</p>
                <p className="text-sm font-bold text-gray-800">
                  {new Date(bookingData.date + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'short', month: 'short', day: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-3.5">
              <Clock size={15} className="text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-[11px] text-gray-400 uppercase font-semibold tracking-wide">Time</p>
                <p className="text-sm font-bold text-gray-800">{bookingData.time}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-5 py-3.5">
            <MapPin size={15} className="text-blue-500 flex-shrink-0" />
            <div>
              <p className="text-[11px] text-gray-400 uppercase font-semibold tracking-wide">
                {consultationType === 'video' ? 'Consultation Type' : 'Location'}
              </p>
              <p className="text-sm font-semibold text-gray-700">
                {consultationType === 'video'
                  ? 'Video Call — link will be sent by email'
                  : 'Qurehealth Care, Jadibuti, Kathmandu'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-5 py-3.5 bg-green-50">
            <Mail size={15} className="text-green-500 flex-shrink-0" />
            <p className="text-sm text-gray-500">Confirmation has been sent to your email</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div
        className={`space-y-3 transition-all duration-500 delay-100 ${
          show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <button
          type="button"
          onClick={handleAddToCalendar}
          className="w-full py-3 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
        >
          <Calendar size={15} className="text-blue-500" />
          Add to Calendar
        </button>

        <button
          type="button"
          onClick={onViewAppointments}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-200 active:scale-[0.98]"
        >
          View My Appointments
          <ArrowRight size={15} />
        </button>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2"
        >
          <Home size={14} />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

