import { Calendar, Clock, User } from 'lucide-react';

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
    <div className="p-6 space-y-5">
      <div>
        <h3 className="text-lg font-bold text-gray-900">Select Date &amp; Time</h3>
        <p className="text-sm text-gray-500 mt-1">Pick your preferred appointment slot</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left: date + slots */}
        <div className="flex-1 space-y-5">
          {/* Date picker */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Preferred Date</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={bookingData.date}
                onChange={(e) => setBookingData({ ...bookingData, date: e.target.value, time: '' })}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all cursor-pointer hover:border-gray-300 bg-white"
              />
            </div>
          </div>

          {/* Time slots */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Available Time Slots</label>

            {!bookingData.date ? (
              <div className="flex flex-col items-center justify-center py-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                <Clock size={24} className="text-gray-300 mb-2" />
                <p className="text-sm text-gray-400 font-medium">Select a date first</p>
              </div>
            ) : loadingSlots ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-6 bg-red-50 rounded-xl border border-red-100">
                <p className="text-sm text-red-600 font-semibold">No slots available on this date</p>
                <p className="text-xs text-red-400 mt-1">Try selecting a different date.</p>
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
                      className={`relative py-2.5 px-1 rounded-xl text-xs font-semibold transition-all duration-150 ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                          : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700'
                      }`}
                    >
                      {!isSelected && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-green-400 rounded-full" />
                      )}
                      {slot.time12}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: summary */}
        <div className="lg:w-[200px] flex-shrink-0">
          <div className="border border-gray-100 rounded-xl p-4 bg-gray-50 space-y-3 sticky top-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Booking Summary</p>

            {/* Doctor */}
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-blue-100">
                {doctor?.profilePicture ? (
                  <img src={doctor.profilePicture} alt="" className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-blue-500">
                    <User size={14} />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate">{doctor?.name}</p>
                <p className="text-[11px] text-blue-600 truncate">{doctor?.specialty}</p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Type</span>
                <span className="font-semibold text-gray-700 capitalize">
                  {consultationType === 'video' ? 'Video' : 'In-Person'}
                </span>
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
                  <span className="font-bold text-blue-600">{bookingData.time}</span>
                </div>
              )}
            </div>

            {/* Fee */}
            <div className="pt-3 border-t border-gray-100 space-y-1.5">
              {feeNum > 0 ? (
                <>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Consult Fee</span>
                    <span className="text-gray-600">NPR {feeNum}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Platform (5%)</span>
                    <span className="text-gray-600">NPR {platformFee}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 border-t border-dashed border-gray-200">
                    <span className="text-sm font-bold text-gray-800">Total</span>
                    <span className="text-sm font-extrabold text-blue-600">NPR {totalFee}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-800">Total</span>
                  <span className="text-sm font-extrabold text-green-600">Free</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

