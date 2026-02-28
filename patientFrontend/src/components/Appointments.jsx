import { useState } from 'react';
import { Search, Calendar, Clock, ArrowLeft, CalendarDays, Plus, Stethoscope, Video, Info, XCircle, Trash2, Star } from 'lucide-react';
import RatingModal from './RatingModal';

// Only allow genuine external meeting URLs (not localhost or relative paths)
const isValidMeetingLink = (link) => {
  if (!link) return false;
  try {
    const url = new URL(link);
    return (url.protocol === 'https:' || url.protocol === 'http:') &&
      !['localhost', '127.0.0.1'].includes(url.hostname);
  } catch {
    return false;
  }
};

export default function Appointments({
  myAppointments,
  appointmentFilter,
  setAppointmentFilter,
  aptSearch,
  setAptSearch,
  setCurrentPage,
  setViewAppointment,
  handleCancelAppointment,
  handleDeleteRecord,
  onRateAppointment,
}) {
  const [ratingModalApt, setRatingModalApt] = useState(null);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Parse "9:30 am" / "10:00 pm" style time strings into { hours, minutes }
  const parseTime = (timeStr) => {
    if (!timeStr) return { hours: 23, minutes: 59 };
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
    if (!match) return { hours: 23, minutes: 59 };
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const meridiem = match[3].toLowerCase();
    if (meridiem === 'pm' && hours !== 12) hours += 12;
    if (meridiem === 'am' && hours === 12) hours = 0;
    return { hours, minutes };
  };

  const enriched = myAppointments.map(apt => {
    const aptDate = new Date(apt.date);
    const { hours, minutes } = parseTime(apt.time);
    // Full datetime of the appointment
    const aptDateTime = new Date(aptDate.getFullYear(), aptDate.getMonth(), aptDate.getDate(), hours, minutes, 0);
    const isPastDateTime = aptDateTime < now;

    const isMissed =
      (aptDate < todayStart && apt.status === 'pending') ||   // pending & date passed
      (isPastDateTime && apt.status === 'confirmed');          // confirmed but time passed

    const effectiveStatus = isMissed ? 'missed' : apt.status;
    const isUpcoming = (effectiveStatus === 'confirmed' || effectiveStatus === 'pending') && !isPastDateTime;
    return { ...apt, effectiveStatus, isUpcoming, isPastDateTime, isMissed };
  });

  const counts = {
    all: enriched.length,
    upcoming: enriched.filter(a => a.isUpcoming).length,
    completed: enriched.filter(a => a.effectiveStatus === 'completed').length,
    cancelled: enriched.filter(a => a.effectiveStatus === 'cancelled' || a.effectiveStatus === 'missed').length,
  };

  const filtered = enriched.filter(a => {
    const matchesFilter = appointmentFilter === 'all' ? true
      : appointmentFilter === 'upcoming' ? a.isUpcoming
        : appointmentFilter === 'completed' ? a.effectiveStatus === 'completed'
          : (a.effectiveStatus === 'cancelled' || a.effectiveStatus === 'missed');

    const matchesSearch = a.doctor.name.toLowerCase().includes(aptSearch.toLowerCase()) ||
      (a.reason && a.reason.toLowerCase().includes(aptSearch.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const badgeStyle = {
    confirmed: 'text-emerald-600',
    completed: 'text-blue-600',
    cancelled: 'text-gray-400',
    pending: 'text-amber-600',
    missed: 'text-red-500'
  };

  const statusDisplayLabel = {
    confirmed: 'CONFIRMED',
    completed: 'COMPLETED',
    cancelled: 'CANCELLED',
    pending: 'PENDING',
    missed: 'MISSED',
  };

  const filterTabs = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'upcoming', label: 'Upcoming', count: counts.upcoming },
    { key: 'completed', label: 'Completed', count: counts.completed },
    { key: 'cancelled', label: 'Cancelled', count: counts.cancelled },
  ];

  return (
    <main className="max-w-6xl mx-auto py-10 px-5 min-h-[calc(100vh-140px)]">

      {/* Header */}
      <div className="mb-10">
        <button className="text-xs font-semibold text-neutral-400 hover:text-black transition-colors mb-6 flex items-center gap-1.5 group" onClick={() => setCurrentPage('dashboard')}>
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </button>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-black mb-2">My Appointments</h1>
            <p className="text-sm font-medium text-neutral-400">Manage and track your consultations</p>
          </div>
          <button
            onClick={() => setCurrentPage('doctors')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full text-sm font-bold shadow-lg shadow-blue-200/50 hover:bg-blue-700 transition-all active:scale-[0.98]"
          >
            <Plus size={18} strokeWidth={3} />
            Book Appointment
          </button>
        </div>
      </div>

      {/* Filter + Search */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
        <div className="flex gap-1 bg-neutral-100 rounded-full p-1 w-fit">
          {filterTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setAppointmentFilter(tab.key)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${appointmentFilter === tab.key
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-500 hover:text-black'
                }`}
            >
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${appointmentFilter === tab.key
                ? 'bg-neutral-100 text-black'
                : 'bg-neutral-200/50 text-neutral-400'
                }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search doctors..."
            value={aptSearch}
            onChange={e => setAptSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-full focus:outline-none focus:ring-2 focus:ring-neutral-100 focus:border-neutral-300 transition-all placeholder:text-neutral-400 font-medium"
          />
        </div>
      </div>

      {/* Appointments List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <CalendarDays size={32} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">
            {appointmentFilter === 'all' ? 'No appointments yet' : `No ${appointmentFilter} appointments`}
          </h3>
          <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
            {appointmentFilter === 'all' ? 'Book your first consultation with a specialist' : 'Check back later or try a different filter'}
          </p>
          {appointmentFilter === 'all' && (
            <button onClick={() => setCurrentPage('doctors')} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200/50 transition-all">
              Find a Doctor
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-0 divide-y divide-neutral-100">
          {filtered.map(apt => {
            const aptDate = new Date(apt.date);
            const isToday = aptDate.toDateString() === now.toDateString();
            const isTomorrow = aptDate.toDateString() === new Date(now.getTime() + 86400000).toDateString();
            const dateLabel = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : aptDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

            return (
              <div key={apt._id} className="group py-6 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    {/* Doctor initials/avatar */}
                    <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 font-bold text-sm flex-shrink-0">
                      {apt.doctor.name?.charAt(0) || 'D'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-black">{apt.doctor.name}</h3>
                        {isToday && apt.effectiveStatus === 'confirmed' && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-black">
                            <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                            Today
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-neutral-400 font-medium lowercase">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={12} strokeWidth={2.5} />
                          {dateLabel}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={12} strokeWidth={2.5} />
                          {apt.time}
                        </span>
                      </div>
                      {apt.reason && (
                        <p className="text-xs text-neutral-500 mt-2 line-clamp-1">{apt.reason}</p>
                      )}
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold tracking-widest ${badgeStyle[apt.effectiveStatus] || 'text-neutral-400'}`}>
                    {statusDisplayLabel[apt.effectiveStatus] || apt.effectiveStatus.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center justify-between pl-14">
                  <div className="flex items-center gap-1.5">
                    {/* Only show action buttons if confirmed AND time has NOT passed */}
                    {apt.effectiveStatus === 'confirmed' && !apt.isPastDateTime && (
                      <>
                        <button
                          onClick={() => {/* Existing Start logic */ }}
                          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-full text-[10px] font-bold shadow-md shadow-blue-100 hover:bg-blue-700 transition-all"
                        >
                          <Stethoscope size={12} strokeWidth={3} />
                          Start Consultation
                        </button>
                        {isValidMeetingLink(apt.meetingLink) && (
                          <a
                            href={apt.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-full text-[10px] font-bold shadow-md shadow-emerald-100 hover:bg-emerald-700 transition-all"
                          >
                            <Video size={12} strokeWidth={3} />
                            Join Meeting
                          </a>
                        )}
                      </>
                    )}
                    {apt.effectiveStatus === 'missed' && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-red-400 bg-red-50 rounded-full border border-red-100">
                        <Clock size={11} strokeWidth={2.5} />
                        Appointment time has passed
                      </span>
                    )}
                    {apt.effectiveStatus === 'completed' && !apt.rating?.isRated && (
                      <button
                        onClick={() => setRatingModalApt(apt)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white rounded-full text-[10px] font-bold shadow-md shadow-amber-100 hover:bg-amber-600 transition-all"
                      >
                        <Star size={12} strokeWidth={3} fill="currentColor" />
                        Rate Experience
                      </button>
                    )}
                    {apt.effectiveStatus === 'completed' && apt.rating?.isRated && (
                      <span className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold text-amber-600">
                        <Star size={12} fill="currentColor" /> {apt.rating.score}/5 Rated
                      </span>
                    )}
                    <button
                      onClick={() => setViewAppointment(apt)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-neutral-400 hover:text-black transition-colors text-[10px] font-bold"
                    >
                      <Info size={12} strokeWidth={2.5} />
                      VIEW DETAILS
                    </button>
                  </div>

                  {apt.effectiveStatus !== 'cancelled' && apt.effectiveStatus !== 'completed' && apt.effectiveStatus !== 'missed' && (
                    <button
                      onClick={() => handleCancelAppointment(apt._id)}
                      className="text-[10px] font-bold text-neutral-400 hover:text-red-500 transition-colors uppercase tracking-tight flex items-center gap-1.5"
                    >
                      <XCircle size={12} strokeWidth={2.5} />
                      Cancel appointment
                    </button>
                  )}
                  {(apt.effectiveStatus === 'cancelled' || apt.effectiveStatus === 'completed' || apt.effectiveStatus === 'missed') && (
                    <button
                      onClick={() => handleDeleteRecord(apt._id)}
                      className="text-[10px] font-bold text-neutral-400 hover:text-red-500 transition-colors uppercase tracking-tight flex items-center gap-1.5"
                    >
                      <Trash2 size={12} strokeWidth={2.5} />
                      Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rating Modal */}
      {ratingModalApt && (
        <RatingModal
          appointment={ratingModalApt}
          onClose={() => setRatingModalApt(null)}
          onSubmit={async (aptId, score, feedback) => {
            await onRateAppointment(aptId, score, feedback);
            setRatingModalApt(null);
          }}
        />
      )}
    </main>
  );
}
