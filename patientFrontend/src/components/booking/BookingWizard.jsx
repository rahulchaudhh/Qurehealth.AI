import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Star, User, CheckCircle2 } from 'lucide-react';

import StepIndicator from './StepIndicator';
import StepConsultationType from './StepConsultationType';
import StepDateTimeSelection from './StepDateTimeSelection';
import StepPatientDetails from './StepPatientDetails';
import StepPayment from './StepPayment';
import StepConfirmation from './StepConfirmation';
import StripePaymentModal from './StripePaymentModal';

export default function BookingWizard({
  doctor,
  user,
  bookingData,
  setBookingData,
  availableSlots,
  loadingSlots,
  isBooking,
  onSubmit,
  onClose,
  onViewAppointments,
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [consultationType, setConsultationType] = useState('in-person');
  const [paymentMethod, setPaymentMethod] = useState('pay-at-clinic');
  const [patientDetails, setPatientDetails] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    reason: bookingData.reason || '',
    bookingForOther: false,
    otherName: '',
    relationship: '',
  });
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [bookedAppointmentId, setBookedAppointmentId] = useState(null);
  const [showStripe, setShowStripe] = useState(false);
  const [pendingBookingData, setPendingBookingData] = useState(null);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Sync reason to bookingData
  useEffect(() => {
    if (patientDetails.reason !== bookingData.reason) {
      setBookingData((prev) => ({ ...prev, reason: patientDetails.reason }));
    }
  }, [patientDetails.reason]);

  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!consultationType;
      case 2: return !!bookingData.date && !!bookingData.time;
      case 3: return (
        patientDetails.name.trim() &&
        patientDetails.email.trim() &&
        patientDetails.phone.trim() &&
        patientDetails.reason.trim()
      );
      case 4: return !!paymentMethod;
      default: return true;
    }
  };

  const goNext = () => { if (canProceed()) setCurrentStep((s) => Math.min(s + 1, 5)); };
  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const handleConfirm = async () => {
    const finalBookingData = { ...bookingData, reason: patientDetails.reason };
    setBookingData(finalBookingData);

    if (paymentMethod === 'card') {
      // For card: show Stripe modal FIRST — appointment is created only after payment succeeds
      setPendingBookingData(finalBookingData);
      setShowStripe(true);
    } else {
      // For Pay at Clinic: create appointment immediately
      const result = await onSubmit({ preventDefault: () => {} });
      const appointmentId = result?._id || result?.appointment?._id || null;
      setBookedAppointmentId(appointmentId);
      setIsConfirmed(true);
      setCurrentStep(5);
    }
  };

  // Called by StripePaymentModal after card is charged successfully
  // At this point we create the appointment
  const handleStripeSuccess = async (paymentIntentId) => {
    setShowStripe(false);
    const result = await onSubmit({ preventDefault: () => {} });
    const appointmentId = result?._id || result?.appointment?._id || null;
    setBookedAppointmentId(appointmentId);
    setIsConfirmed(true);
    setCurrentStep(5);
  };

  const cleanName = doctor?.name ? doctor.name.replace(/^(dr\.?)\s*/i, '') : '';
  const displayName = cleanName
    ? `Dr. ${cleanName.charAt(0).toUpperCase() + cleanName.slice(1)}`
    : doctor?.name || 'Doctor';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[92vh]">
        <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Book Appointment</h2>
              {!isConfirmed && (
                <p className="text-sm text-gray-500 mt-0.5">Step {currentStep} of 4</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} strokeWidth={2} />
            </button>
          </div>

          {/* Doctor card */}
          {!isConfirmed && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-blue-200 border-2 border-blue-100">
                {doctor?.profilePicture ? (
                  <img src={doctor.profilePicture} alt={doctor.name} className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-blue-500">
                    <User size={18} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
                <p className="text-xs text-blue-600 truncate">{doctor?.specialty}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 text-sm">
                <span className="flex items-center gap-1 text-amber-500 font-semibold">
                  <Star size={13} fill="currentColor" /> {doctor?.rating || 0}
                </span>
                <span className="text-gray-400">·</span>
                <span className="font-bold text-gray-700">{doctor?.fee || 'Free'}</span>
              </div>
            </div>
          )}

          {/* Step indicator */}
          {!isConfirmed && (
            <div className="mt-4">
              <StepIndicator currentStep={currentStep} />
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div key={currentStep}>
            {currentStep === 1 && (
              <StepConsultationType consultationType={consultationType} onChange={setConsultationType} />
            )}
            {currentStep === 2 && (
              <StepDateTimeSelection
                doctor={doctor}
                bookingData={bookingData}
                setBookingData={setBookingData}
                availableSlots={availableSlots}
                loadingSlots={loadingSlots}
                consultationType={consultationType}
              />
            )}
            {currentStep === 3 && (
              <StepPatientDetails patientDetails={patientDetails} onChange={setPatientDetails} user={user} />
            )}
            {currentStep === 4 && (
              <StepPayment paymentMethod={paymentMethod} onChange={setPaymentMethod} doctor={doctor} />
            )}
            {currentStep === 5 && isConfirmed && (
              <StepConfirmation
                doctor={doctor}
                bookingData={bookingData}
                consultationType={consultationType}
                onViewAppointments={onViewAppointments}
                onClose={onClose}
              />
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        {!isConfirmed && (
          <div className="flex-shrink-0 border-t border-gray-100 bg-gray-50 px-6 py-4 flex items-center justify-between gap-3 rounded-b-2xl">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-white border border-gray-200 hover:border-gray-300 transition-all"
              >
                <ChevronLeft size={16} strokeWidth={2.5} />
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-white border border-gray-200 hover:border-gray-300 transition-all"
              >
                Cancel
              </button>
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={goNext}
                disabled={!canProceed()}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  canProceed()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-100 active:scale-[0.98]'
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                }`}
              >
                Continue
                <ChevronRight size={16} strokeWidth={2.5} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!canProceed() || isBooking}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  canProceed() && !isBooking
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-100 active:scale-[0.98]'
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                }`}
              >
                {isBooking ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Booking…
                  </>
                ) : paymentMethod === 'card' ? (
                  <>
                    Proceed to Payment
                    <ChevronRight size={16} strokeWidth={2.5} />
                  </>
                ) : (
                  <>
                    Confirm Booking
                    <ChevronRight size={16} strokeWidth={2.5} />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Stripe Payment Modal — shown BEFORE appointment is created for card payments */}
      {showStripe && (
        <StripePaymentModal
          amount={(() => {
            const fee = doctor?.fee ? parseFloat(String(doctor.fee).replace(/[^0-9.]/g, '')) : 0;
            return fee.toFixed(2);
          })()}
          doctor={doctor}
          onSuccess={handleStripeSuccess}
          onClose={() => setShowStripe(false)}
        />
      )}
    </div>
  );
}
