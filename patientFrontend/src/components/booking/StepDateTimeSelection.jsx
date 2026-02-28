import { Calendar, Clock, Star, User, Shield, CalendarCheck } from 'lucide-react';

export default function StepDateTimeSelection({
  doctor,
  bookingData,
  setBookingData,
  availableSlots,
  loadingSlots,
  consultationType,
}) {
  const feeNum = doctor?.fee ? parseInt(String(doctor.fee).replace(/[^0-9]/g, ''), 10) : 0;
  const platformFee = feeNum > 0 ? Math.round(feeNum * 0.05) : 0;
  const totalFee = feeNum + platformFee;

  return (
    <div className="p-6 pt-4">
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left: Date & Time */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-900 mb-1">Select Date & Time</h3>
          <p className="text-xs text-gray-400 mb-4">Choose a convenient date and available time slot</p>

          {/* Date Picker */}
          <div className="mb-5">
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
              Preferred Date
            </label>
            <div className="relative">
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={bookingData.date}
                onChange={(e) => setBookingData({ ...bookingData, date: e.target.value, time: '' })}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all bg-white text-gray-800 font-medium text-sm cursor-pointer hover:border-gray-300"
              />
            </div>
          </div>

          {/* Time Slots */}
          <div className="mb-4">
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
              Available Slots
            </label>

            {!bookingData.date ? (
              <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Calendar size={24} className="text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400 font-medium">Select a date to view available slots</p>
              </div>
            ) : loadingSlots ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="h-11 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-6 bg-red-50 rounded-xl border border-red-100">
                <p className="text-xs text-red-600 font-semibold">No available slots on this date</p>
                <p className="text-[10px] text-red-400 mt-1">
                  The doctor is either off or fully booked. Try another date.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {availableSlots.map((slot) => {
                  const isSelected = bookingData.time === slot.time12;
                  return (
                    <button
                      key={slot.time12}
                      type="button"
                      onClick={() => setBookingData({ ...bookingData, time: slot.time12 })}
                      className={`relative py-2.5 px-2 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 ring-2 ring-blue-300 scale-[1.02]'
                          : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-700 border border-gray-150 hover:border-blue-200 hover:shadow-sm'
                      }`}
                    >
                      <span className="flex items-center justify-center gap-1">
                        <Clock size={10} className={isSelected ? 'text-blue-200' : 'text-gray-300 group-hover:text-blue-400'} />
                        {slot.time12}
                      </span>
                      {!isSelected && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full border border-white" title="Available" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Trust badges */}
          <div className="flex items-center gap-4 px-0.5 mt-4">
            <span className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
              <Shield size={11} className="text-gray-300" />
              Free cancellation 24h before
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
              <CalendarCheck size={11} className="text-gray-300" />
              Instant confirmation
            </span>
          </div>
        </div>

        {/* Right: Booking Summary Card */}
        <div className="lg:w-[240px] flex-shrink-0">
          <div className="sticky top-4 bg-gradient-to-br from-slate-50 to-gray-50/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-4 shadow-sm">
            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Booking Summary</h4>

            {/* Doctor mini-card */}
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-gray-100">
              <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                {doctor?.profilePicture ? (
                  <img src={doctor.profilePicture} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600">
                    <User size={16} />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate">{doctor?.name}</p>
                <p className="text-[10px] text-gray-400">{doctor?.specialty}</p>
              </div>
            </div>

            {/* Summary rows */}
            <div className="space-y-2.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-gray-400">Experience</span>
                <span className="font-semibold text-gray-700">{doctor?.experience || 0} yrs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Type</span>
                <span className="font-semibold text-gray-700 capitalize">{consultationType === 'video' ? 'Video Call' : 'In-Person'}</span>
              </div>
              {bookingData.date && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Date</span>
                  <span className="font-semibold text-gray-700">
                    {new Date(bookingData.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              )}
              {bookingData.time && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Time</span>
                  <span className="font-semibold text-blue-600">{bookingData.time}</span>
                </div>
              )}
            </div>

            {/* Price breakdown */}
            {feeNum > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-400">Consultation Fee</span>
                  <span className="text-gray-600">NPR {feeNum}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-400">Platform Fee</span>
                  <span className="text-gray-600">NPR {platformFee}</span>
                </div>
                <div className="flex justify-between text-xs font-bold pt-1.5 border-t border-dashed border-gray-200 mt-1.5">
                  <span className="text-gray-700">Total</span>
                  <span className="text-blue-600">NPR {totalFee}</span>
                </div>
              </div>
            )}

            {feeNum === 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-gray-700">Total</span>
                  <span className="text-emerald-600">Free</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
