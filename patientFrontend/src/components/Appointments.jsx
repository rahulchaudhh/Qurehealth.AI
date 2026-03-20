import { useState } from 'react';
import { Search, Calendar, Clock, ArrowLeft, CalendarDays, Plus, Stethoscope, Video, Info, XCircle, Trash2, Star, Filter, CreditCard, CheckCircle2, AlertCircle, MessageCircle } from 'lucide-react';
import RatingModal from './RatingModal';
import PaymentDetailModal from './PaymentDetailModal';
import ChatModal from './chat/ChatModal';

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
  onRefresh,
}) {
  const [ratingModalApt, setRatingModalApt] = useState(null);
  const [paymentModalApt, setPaymentModalApt] = useState(null);
  const [chatModalApt, setChatModalApt] = useState(null); // State for chat modal
  const [dateFilter, setDateFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
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
    confirmed: enriched.filter(a => a.effectiveStatus === 'confirmed').length,
    pending: enriched.filter(a => a.effectiveStatus === 'pending').length,
    completed: enriched.filter(a => a.effectiveStatus === 'completed').length,
    cancelled: enriched.filter(a => a.effectiveStatus === 'cancelled').length,
    missed: enriched.filter(a => a.effectiveStatus === 'missed').length,
  };

  const filtered = enriched.filter(a => {
    // Status filter
    const matchesFilter = appointmentFilter === 'all' ? true
      : appointmentFilter === 'upcoming'
        ? a.isUpcoming
        : a.effectiveStatus === appointmentFilter;

    // Date filter
    const aptDate = new Date(a.date);
    const aptDateStart = new Date(aptDate.getFullYear(), aptDate.getMonth(), aptDate.getDate());
    const weekStart = new Date(todayStart); weekStart.setDate(todayStart.getDate() - todayStart.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const matchesDate =
      dateFilter === 'all' ? true
      : dateFilter === 'today' ? aptDateStart.getTime() === todayStart.getTime()
      : dateFilter === 'week' ? aptDateStart >= weekStart && aptDateStart <= todayStart
      : dateFilter === 'month' ? aptDateStart >= monthStart && aptDateStart <= todayStart
      : true;

    // Search
    const matchesSearch = (a.doctor?.name || '').toLowerCase().includes(aptSearch.toLowerCase()) ||
      (a.reason && a.reason.toLowerCase().includes(aptSearch.toLowerCase()));

    return matchesFilter && matchesDate && matchesSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    const aptDateA = new Date(a.date);
    const { hours: hA, minutes: mA } = parseTime(a.time);
    const dateTimeA = new Date(aptDateA.getFullYear(), aptDateA.getMonth(), aptDateA.getDate(), hA, mA, 0).getTime();

    const aptDateB = new Date(b.date);
    const { hours: hB, minutes: mB } = parseTime(b.time);
    const dateTimeB = new Date(aptDateB.getFullYear(), aptDateB.getMonth(), aptDateB.getDate(), hB, mB, 0).getTime();

    return sortOrder === 'newest' ? dateTimeB - dateTimeA : dateTimeA - dateTimeB;
  });

  const badgeStyle = {
    confirmed: 'text-blue-600',
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
    { key: 'confirmed', label: 'Confirmed', count: counts.confirmed },
    { key: 'pending', label: 'Pending', count: counts.pending },
    { key: 'completed', label: 'Completed', count: counts.completed },
    { key: 'cancelled', label: 'Cancelled', count: counts.cancelled },
    { key: 'missed', label: 'Missed', count: counts.missed },
  ];

  const dateTabs = [
    { key: 'all', label: 'All Time' },
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
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

      {/* Filter + Search bar */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-4 mb-8 space-y-3">

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by patient name or reason..."
            value={aptSearch}
            onChange={e => setAptSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all placeholder:text-neutral-400"
          />
        </div>

        {/* Status pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-neutral-400 flex-shrink-0" />
          {filterTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setAppointmentFilter(tab.key)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
                appointmentFilter === tab.key
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200'
                  : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300 hover:text-neutral-700'
              }`}
            >
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                appointmentFilter === tab.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-neutral-100 text-neutral-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Date range pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <CalendarDays size={14} className="text-neutral-400 flex-shrink-0" />
          {dateTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setDateFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
                dateFilter === tab.key
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200'
                  : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300 hover:text-neutral-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Result count & Sort */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-neutral-500">
          Showing <span className="font-bold text-neutral-800">{sorted.length}</span> of <span className="font-bold text-neutral-800">{enriched.length}</span> appointments
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Sort by:</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="text-sm font-medium bg-white border border-neutral-200 text-neutral-800 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 cursor-pointer"
          >
            <option value="newest">Recent</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      {/* Appointments List */}
      {sorted.length === 0 ? (
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
          {sorted.map(apt => {
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

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Payment pill */}
                    {apt.paymentStatus === 'paid' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-semibold border border-blue-100">
                        <CheckCircle2 size={9} strokeWidth={3} />Paid
                      </span>
                    ) : apt.paymentStatus === 'failed' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-semibold border border-gray-200">
                        <AlertCircle size={9} strokeWidth={3} />Failed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-400 text-[10px] font-semibold border border-blue-100">
                        <CreditCard size={9} strokeWidth={2.5} />Unpaid
                      </span>
                    )}
                    {/* Appointment status */}
                    <span className={`text-[10px] font-bold tracking-widest ${badgeStyle[apt.effectiveStatus] || 'text-neutral-400'}`}>
                      {statusDisplayLabel[apt.effectiveStatus] || apt.effectiveStatus.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pl-14">
                  <div className="flex items-center gap-1.5">
                    {/* Only show action buttons if confirmed AND time has NOT passed */}
                    {apt.effectiveStatus === 'confirmed' && !apt.isPastDateTime && (
                      <>
                        <button
                          onClick={() => {
                            const startDt = (() => {
                              const [timePart, meridiem] = apt.time.split(' ');
                              let [h, m] = timePart.split(':').map(Number);
                              if (meridiem?.toUpperCase() === 'PM' && h !== 12) h += 12;
                              if (meridiem?.toUpperCase() === 'AM' && h === 12) h = 0;
                              const d = new Date(`${apt.date}T00:00:00`);
                              d.setHours(h, m, 0, 0);
                              return d;
                            })();
                            const endDt = new Date(startDt.getTime() + 30 * 60 * 1000);
                            const fmt = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
                            const params = new URLSearchParams({
                              action: 'TEMPLATE',
                              text: `Consultation with ${apt.doctor.name}`,
                              dates: `${fmt(startDt)}/${fmt(endDt)}`,
                              details: `Appointment with ${apt.doctor.name} (${apt.doctor.specialization || 'Specialist'})\nReason: ${apt.reason || 'Consultation'}${apt.meetingLink ? '\nMeeting Link: ' + apt.meetingLink : ''}`,
                              ...(apt.meetingLink ? { location: apt.meetingLink } : {}),
                            });
                            window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-full text-[10px] font-bold shadow-md shadow-blue-100 hover:bg-blue-700 transition-all"
                        >
                          <Calendar size={12} strokeWidth={3} />
                          Add to Calendar
                        </button>
                        {apt.meetingLink && (
                          <a
                            href={apt.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-4 py-2 text-[#1a73e8] hover:text-[#1557b0] text-[10px] font-bold transition-all"
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
                      onClick={() => setChatModalApt(apt)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:text-blue-800 transition-colors text-[10px] font-bold bg-blue-50 hover:bg-blue-100 rounded-full"
                    >
                      <MessageCircle size={12} strokeWidth={2.5} />
                      MESSAGE
                    </button>
                    <button
                      onClick={() => setViewAppointment(apt)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-neutral-400 hover:text-black transition-colors text-[10px] font-bold"
                    >
                      <Info size={12} strokeWidth={2.5} />
                      VIEW DETAILS
                    </button>
                    <button
                      onClick={() => setPaymentModalApt(apt)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-neutral-400 hover:text-blue-600 transition-colors text-[10px] font-bold"
                    >
                      <CreditCard size={12} strokeWidth={2.5} />
                      PAYMENT
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

      {/* Payment Detail Modal */}
      {paymentModalApt && (
        <PaymentDetailModal
          appointment={paymentModalApt}
          onClose={() => setPaymentModalApt(null)}
        />
      )}
      
      {/* Chat Modal */}
      {chatModalApt && (
        <ChatModal
          isOpen={true}
          onClose={() => setChatModalApt(null)}
          appointmentId={chatModalApt._id}
          doctorName={chatModalApt.doctor?.name}
          doctorImage={chatModalApt.doctor?.hasProfilePicture ? `/api/doctor/${chatModalApt.doctor._id}/profile-picture` : null}
        />
      )}
    </main>
  );
}
