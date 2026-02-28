import { useState, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Star, User, Share2 } from 'lucide-react';

import StepIndicator from './StepIndicator';
import StepConsultationType from './StepConsultationType';
import StepDateTimeSelection from './StepDateTimeSelection';
import StepPatientDetails from './StepPatientDetails';
import StepPayment from './StepPayment';
import StepConfirmation from './StepConfirmation';

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
  const [slideDir, setSlideDir] = useState('right'); // animation direction

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

  // Step validation
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!consultationType;
      case 2:
        return !!bookingData.date && !!bookingData.time;
      case 3:
        return (
          patientDetails.name.trim() &&
          patientDetails.email.trim() &&
          patientDetails.phone.trim() &&
          patientDetails.reason.trim()
        );
      case 4:
        return !!paymentMethod;
      default:
        return true;
    }
  };

  const goNext = () => {
    if (!canProceed()) return;
    setSlideDir('right');
    setCurrentStep((s) => Math.min(s + 1, 5));
  };

  const goBack = () => {
    setSlideDir('left');
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  const handleConfirm = async () => {
    // Sync reason one final time
    const finalBookingData = { ...bookingData, reason: patientDetails.reason };
    setBookingData(finalBookingData);

    // Fake form event for the existing handler
    const fakeEvent = { preventDefault: () => {} };
    await onSubmit(fakeEvent);
    setIsConfirmed(true);
    setCurrentStep(5);
  };

  const handleClose = () => {
    onClose();
  };

  const cleanName = doctor?.name ? doctor.name.replace(/^(dr\.?)\s*/i, '') : '';
  const displayName = cleanName ? `Dr. ${cleanName.charAt(0).toUpperCase() + cleanName.slice(1)}` : doctor?.name || 'Doctor';

  return (
    <div
      className="fixed inset-0 z-50 bg-white flex flex-col"
      style={{ animation: 'pageSlideIn 0.28s cubic-bezier(.4,0,.2,1)' }}
    >
      {/* ── Sticky Top Bar ── */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {!isConfirmed && (
            <button
              onClick={currentStep > 1 ? goBack : handleClose}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={20} strokeWidth={2} />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-gray-900 truncate">
              {isConfirmed ? 'Booking Confirmed' : 'Book Appointment'}
            </h1>
            <p className="text-[11px] text-gray-400 font-medium truncate">
              {isConfirmed ? 'Your appointment is all set' : `Step ${currentStep} of 4 — ${displayName}`}
            </p>
          </div>
        </div>
        {!isConfirmed && (
          <button
            onClick={handleClose}
            className="text-xs font-semibold text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </header>

      {/* ── Main Scrollable Content ── */}
      <div className="flex-1 overflow-y-auto overscroll-contain">

        {/* Doctor Hero Bar (visible on steps 1-4) */}
        {currentStep < 5 && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-5">
            <div className="max-w-3xl mx-auto flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-blue-500 border-2 border-white/20 shadow-lg">
                {doctor?.profilePicture ? (
                  <img
                    src={doctor.profilePicture}
                    alt={doctor.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <User size={24} />
                  </div>
                )}
                <div className="w-full h-full items-center justify-center text-white hidden">
                  <User size={24} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-white truncate">{displayName}</h2>
                <p className="text-blue-100 text-xs font-medium">{doctor?.specialty}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-white/90 font-medium">
                    <Star size={11} fill="currentColor" className="text-yellow-300" />
                    {doctor?.rating || 0}
                  </span>
                  <span className="text-white/40">•</span>
                  <span className="text-xs font-bold text-white">{doctor?.fee || 'Free'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step Indicator */}
        <div className="max-w-3xl mx-auto">
          {!isConfirmed && <StepIndicator currentStep={currentStep} />}
        </div>

        {/* Step Content */}
        <div className="max-w-3xl mx-auto pb-28 lg:pb-8">
          <div
            key={currentStep}
            className="animate-fadeIn"
          >
            {currentStep === 1 && (
              <StepConsultationType
                consultationType={consultationType}
                onChange={setConsultationType}
              />
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
              <StepPatientDetails
                patientDetails={patientDetails}
                onChange={setPatientDetails}
                user={user}
              />
            )}

            {currentStep === 4 && (
              <StepPayment
                paymentMethod={paymentMethod}
                onChange={setPaymentMethod}
                doctor={doctor}
              />
            )}

            {currentStep === 5 && isConfirmed && (
              <StepConfirmation
                doctor={doctor}
                bookingData={bookingData}
                consultationType={consultationType}
                onViewAppointments={onViewAppointments}
                onClose={handleClose}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Footer Navigation (sticky bottom) ── */}
      {!isConfirmed && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-3.5 shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
            {/* Back */}
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all border border-gray-200"
              >
                <ChevronLeft size={16} strokeWidth={2.5} />
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all border border-gray-200"
              >
                Cancel
              </button>
            )}

            {/* Next / Confirm */}
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={goNext}
                disabled={!canProceed()}
                className={`flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  canProceed()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 active:scale-[0.98]'
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
                className={`flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  canProceed() && !isBooking
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 active:scale-[0.98]'
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                }`}
              >
                {isBooking ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Confirming...
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
        </div>
      )}

      <style>{`
        @keyframes pageSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
