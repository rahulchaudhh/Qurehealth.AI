import { useEffect, useState } from 'react';
import {
  ArrowLeft, Star, Stethoscope, Calendar, Clock, Award, Phone,
  CheckCircle2, MapPin, Share2, Heart
} from 'lucide-react';
import api from '../api/axios';
import ReviewsSection from './reviews/ReviewsSection';

export default function DoctorProfileModal({ doctor, onClose, onBook, currentUserId }) {
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [saved, setSaved] = useState(false);

  const fetchReviews = () => {
    if (!doctor?.id) return;
    setLoadingReviews(true);
    api.get(`/doctor/${doctor.id}/reviews`)
      .then(res => setReviews(res.data.data || []))
      .catch(() => setReviews([]))
      .finally(() => setLoadingReviews(false));
  };

  useEffect(() => {
    fetchReviews();
  }, [doctor?.id]);

  // Lock body scroll when profile is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!doctor) return null;

  const cleanName = doctor.name.replace(/^(dr\.?)\s*/i, '');
  const displayName = `Dr. ${cleanName.charAt(0).toUpperCase() + cleanName.slice(1)}`;
  const avatarInitial = cleanName.charAt(0).toUpperCase();
  const ratingAvg = doctor.rating > 0 ? doctor.rating.toFixed(1) : null;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col" style={{ animation: 'pageSlideIn 0.28s cubic-bezier(.4,0,.2,1)' }}>

      {/* ── Sticky Top Bar (Google-style) ── */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} strokeWidth={2} />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-gray-900 truncate">{displayName}</h1>
            <p className="text-[11px] text-gray-400 font-medium truncate">{doctor.specialty}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSaved(!saved)}
            className={`p-2 rounded-full transition-colors ${saved ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:bg-gray-100'}`}
            aria-label="Save doctor"
          >
            <Heart size={18} className={saved ? 'fill-red-500' : ''} />
          </button>
          <button
            onClick={() => { navigator.clipboard?.writeText(window.location.href); }}
            className="p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
            aria-label="Share"
          >
            <Share2 size={18} />
          </button>
        </div>
      </header>

      {/* ── Scrollable Full Page Content ── */}
      <div className="flex-1 overflow-y-auto overscroll-contain">

        {/* Hero Banner */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 px-6 sm:px-10 pt-8 sm:pt-10 pb-20 sm:pb-24">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-end gap-5">
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white/25 overflow-hidden bg-blue-500 flex items-center justify-center shrink-0 shadow-xl">
              <img
                src={`/api/doctor/${doctor.id}/profile-picture`}
                alt={displayName}
                className="w-full h-full object-cover"
                onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
              <div className="w-full h-full hidden items-center justify-center text-white text-3xl font-bold">
                {avatarInitial}
              </div>
            </div>

            {/* Name / Specialty / Rating */}
            <div className="pb-1 min-w-0">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight truncate">{displayName}</h2>
              <p className="text-blue-100 text-sm sm:text-base mt-1">{doctor.specialty}</p>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                {ratingAvg ? (
                  <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold text-white">
                    <Star size={14} fill="currentColor" className="text-yellow-300" />
                    {ratingAvg}
                    <span className="text-blue-200 font-normal text-xs ml-0.5">({doctor.ratingCount} reviews)</span>
                  </span>
                ) : (
                  <span className="text-blue-200 text-xs font-medium bg-white/10 px-3 py-1.5 rounded-full">No reviews yet</span>
                )}
                <span className="flex items-center gap-1.5 text-white/90 text-xs bg-white/10 px-3 py-1.5 rounded-full">
                  <CheckCircle2 size={13} className="text-green-300" />
                  Verified Doctor
                </span>
                <span className="flex items-center gap-1.5 text-white/90 text-xs bg-white/10 px-3 py-1.5 rounded-full">
                  <MapPin size={13} className="text-blue-200" />
                  {doctor.hospital}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stat Strip — overlapping hero */}
        <div className="max-w-4xl mx-auto px-4 sm:px-8 -mt-12 sm:-mt-14 relative z-10">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 grid grid-cols-3 divide-x divide-gray-100">
            {[
              { icon: <Award size={18} className="text-blue-500" />, label: 'Experience', value: `${doctor.experience} yrs` },
              { icon: <Clock size={18} className="text-emerald-500" />, label: 'Available', value: doctor.available },
              { icon: <Calendar size={18} className="text-purple-500" />, label: 'Consult Fee', value: doctor.fee },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center py-5 px-3 gap-1.5">
                <div className="flex items-center gap-2">
                  {s.icon}
                  <span className="text-xs text-gray-400 font-medium">{s.label}</span>
                </div>
                <span className="text-base font-bold text-gray-900">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content — 2-column on desktop like Google */}
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column — Main content (2/3) */}
            <div className="lg:col-span-2 space-y-8">

              {/* About */}
              <section>
                <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Stethoscope size={16} className="text-blue-500" /> About
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {displayName} is a qualified <span className="font-medium text-gray-700">{doctor.specialty}</span> with{' '}
                  <span className="font-medium text-gray-700">{doctor.experience} years</span> of clinical experience at{' '}
                  <span className="font-medium text-gray-700">{doctor.hospital}</span>. Committed to delivering compassionate,
                  evidence-based care to every patient.
                </p>
              </section>

              {/* Specializations */}
              <section>
                <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Award size={16} className="text-blue-500" /> Specializations
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[doctor.specialty, 'Consultations', 'Diagnosis', 'Patient Care', 'Follow-ups'].map(tag => (
                    <span key={tag} className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-100">
                      {tag}
                    </span>
                  ))}
                </div>
              </section>

              {/* Reviews Section — Premium */}
              <section>
                <ReviewsSection
                  reviews={reviews}
                  rating={doctor.rating || 0}
                  reviewCount={doctor.ratingCount || reviews.length}
                  loading={loadingReviews}
                  currentUserId={currentUserId}
                  onReviewUpdated={fetchReviews}
                />
              </section>
            </div>

            {/* Right Column — Sidebar (1/3) */}
            <div className="lg:col-span-1">
              <div className="sticky top-[65px] space-y-5">

                {/* Book CTA Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5">
                  <h4 className="text-sm font-bold text-gray-900 mb-1">Book an Appointment</h4>
                  <p className="text-xs text-gray-400 mb-4">Choose a convenient time & get confirmed instantly</p>
                  <button
                    onClick={() => { onBook(doctor); onClose(); }}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 transition-all"
                  >
                    Book Appointment
                  </button>
                  <div className="flex items-center justify-center gap-4 mt-3">
                    <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                      <CheckCircle2 size={10} className="text-emerald-500" />
                      Instant confirmation
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                      <Clock size={10} className="text-gray-300" />
                      Free cancellation
                    </span>
                  </div>
                </div>

                {/* Info Card */}
                <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 space-y-4">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Practice Info</h4>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin size={14} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-700">{doctor.hospital}</p>
                      <p className="text-[11px] text-gray-400">Kathmandu, Nepal</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center shrink-0 mt-0.5">
                      <Phone size={14} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-700">Contact via Platform</p>
                      <p className="text-[11px] text-gray-400">Available through Qurehealth.AI</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center shrink-0 mt-0.5">
                      <Calendar size={14} className="text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-700">Next Available</p>
                      <p className="text-[11px] text-emerald-600 font-semibold">{doctor.available}</p>
                    </div>
                  </div>
                </div>

                {/* Fee Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100/60 p-5">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Consultation Fee</h4>
                  <p className="text-2xl font-extrabold text-gray-900">{doctor.fee}</p>
                  <p className="text-[11px] text-gray-400 mt-1">Per consultation · Inclusive of platform fees</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Mobile-only Sticky Bottom CTA ── */}
      <div className="lg:hidden sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => { onBook(doctor); onClose(); }}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
        >
          Book Appointment with {displayName}
        </button>
      </div>

      <style>{`
        @keyframes pageSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
