import { useEffect, useState } from 'react';
import {
  X, Star, Stethoscope, Calendar, Clock, Award, Phone,
  ChevronLeft, ChevronRight, MessageSquare, CheckCircle2, User
} from 'lucide-react';
import api from '../api/axios';

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

function StarRow({ score, size = 14 }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          size={size}
          className={s <= score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}
        />
      ))}
    </span>
  );
}

function RatingBar({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-16 text-gray-500 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%`, transition: 'width 0.6s ease' }} />
      </div>
      <span className="w-6 text-gray-400 text-right shrink-0">{count}</span>
    </div>
  );
}

export default function DoctorProfileModal({ doctor, onClose, onBook }) {
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewPage, setReviewPage] = useState(0);
  const REVIEWS_PER_PAGE = 3;

  useEffect(() => {
    if (!doctor?.id) return;
    setLoadingReviews(true);
    api.get(`/doctor/${doctor.id}/reviews`)
      .then(res => setReviews(res.data.data || []))
      .catch(() => setReviews([]))
      .finally(() => setLoadingReviews(false));
  }, [doctor?.id]);

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!doctor) return null;

  const cleanName = doctor.name.replace(/^(dr\.?)\s*/i, '');
  const displayName = `Dr. ${cleanName.charAt(0).toUpperCase() + cleanName.slice(1)}`;

  // Rating distribution
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => { if (r.score >= 1 && r.score <= 5) dist[r.score]++; });

  // Paginated reviews
  const totalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
  const visibleReviews = reviews.slice(reviewPage * REVIEWS_PER_PAGE, (reviewPage + 1) * REVIEWS_PER_PAGE);

  const avatarInitial = cleanName.charAt(0).toUpperCase();
  const ratingAvg = doctor.rating > 0 ? doctor.rating.toFixed(1) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={handleBackdrop}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        style={{ animation: 'modalIn 0.22s cubic-bezier(.4,0,.2,1)' }}
      >
        {/* ── Hero Header ── */}
        <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 px-6 pt-8 pb-16 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X size={16} />
          </button>

          <div className="flex items-end gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl border-4 border-white/30 overflow-hidden bg-blue-500 flex items-center justify-center shrink-0 shadow-lg">
              <img
                src={`/api/doctor/${doctor.id}/profile-picture`}
                alt={displayName}
                className="w-full h-full object-cover"
                onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
              <div className="w-full h-full hidden items-center justify-center text-white text-2xl font-bold">
                {avatarInitial}
              </div>
            </div>

            {/* Name / specialty */}
            <div className="pb-1 min-w-0">
              <h2 className="text-xl font-bold text-white leading-tight truncate">{displayName}</h2>
              <p className="text-blue-100 text-sm mt-0.5">{doctor.specialty}</p>
              <div className="flex items-center gap-3 mt-2">
                {ratingAvg ? (
                  <span className="flex items-center gap-1 text-yellow-300 text-sm font-bold">
                    <Star size={13} fill="currentColor" />
                    {ratingAvg}
                    <span className="text-blue-200 font-normal text-xs">({doctor.ratingCount} reviews)</span>
                  </span>
                ) : (
                  <span className="text-blue-200 text-xs font-medium">No reviews yet</span>
                )}
                <span className="flex items-center gap-1 text-blue-100 text-xs">
                  <CheckCircle2 size={12} className="text-green-300" />
                  Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stat Strip ── */}
        <div className="-mt-8 mx-5 bg-white rounded-xl shadow-md border border-gray-100 grid grid-cols-3 divide-x divide-gray-100 shrink-0 relative z-10">
          {[
            { icon: <Award size={15} className="text-blue-500" />, label: 'Experience', value: `${doctor.experience} yrs` },
            { icon: <Clock size={15} className="text-green-500" />, label: 'Available', value: doctor.available },
            { icon: <Calendar size={15} className="text-purple-500" />, label: 'Consult Fee', value: doctor.fee },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center py-3 px-2 gap-1">
              <div className="flex items-center gap-1.5">
                {s.icon}
                <span className="text-xs text-gray-400 font-medium">{s.label}</span>
              </div>
              <span className="text-sm font-bold text-gray-800">{s.value}</span>
            </div>
          ))}
        </div>

        {/* ── Scrollable Body ── */}
        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-6">

          {/* About */}
          <section>
            <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Stethoscope size={14} className="text-blue-500" /> About
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {displayName} is a qualified <span className="font-medium text-gray-700">{doctor.specialty}</span> with{' '}
              <span className="font-medium text-gray-700">{doctor.experience} years</span> of clinical experience at{' '}
              <span className="font-medium text-gray-700">{doctor.hospital}</span>. Committed to delivering compassionate,
              evidence-based care to every patient.
            </p>
          </section>

          {/* Tags */}
          <section>
            <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Award size={14} className="text-blue-500" /> Specializations
            </h3>
            <div className="flex flex-wrap gap-2">
              {[doctor.specialty, 'Consultations', 'Diagnosis', 'Patient Care', 'Follow-ups'].map(tag => (
                <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
                  {tag}
                </span>
              ))}
            </div>
          </section>

          {/* Info row */}
          <section className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-white rounded-lg shadow-sm flex items-center justify-center shrink-0">
                <Phone size={13} className="text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Hospital</p>
                <p className="text-xs font-semibold text-gray-700">{doctor.hospital}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-white rounded-lg shadow-sm flex items-center justify-center shrink-0">
                <Calendar size={13} className="text-green-500" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Next Slot</p>
                <p className="text-xs font-semibold text-gray-700">{doctor.available}</p>
              </div>
            </div>
          </section>

          {/* Reviews Section */}
          <section>
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <MessageSquare size={14} className="text-blue-500" />
              Patient Reviews
              {reviews.length > 0 && (
                <span className="ml-auto text-xs text-gray-400 font-normal">{reviews.length} total</span>
              )}
            </h3>

            {loadingReviews ? (
              <div className="space-y-2">
                {[1, 2].map(i => (
                  <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Star size={24} className="text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400 font-medium">No reviews yet</p>
                <p className="text-xs text-gray-300 mt-0.5">Be the first to share your experience</p>
              </div>
            ) : (
              <>
                {/* Rating summary */}
                <div className="flex gap-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 mb-4 border border-blue-100/60">
                  <div className="text-center shrink-0">
                    <p className="text-4xl font-black text-blue-600">{ratingAvg || '—'}</p>
                    <StarRow score={Math.round(doctor.rating)} size={12} />
                    <p className="text-[10px] text-gray-400 mt-1">{reviews.length} reviews</p>
                  </div>
                  <div className="flex-1 flex flex-col justify-center gap-1.5">
                    {[
                      { label: '5 stars', count: dist[5], color: 'bg-green-400' },
                      { label: '4 stars', count: dist[4], color: 'bg-lime-400' },
                      { label: '3 stars', count: dist[3], color: 'bg-yellow-400' },
                      { label: '2 stars', count: dist[2], color: 'bg-orange-400' },
                      { label: '1 star',  count: dist[1], color: 'bg-red-400' },
                    ].map(b => (
                      <RatingBar key={b.label} label={b.label} count={b.count} total={reviews.length} color={b.color} />
                    ))}
                  </div>
                </div>

                {/* Review Cards */}
                <div className="space-y-3">
                  {visibleReviews.map((r, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${r.patientGender === 'female' ? 'bg-pink-400' : 'bg-blue-400'}`}>
                          {r.patientName?.charAt(0).toUpperCase() || <User size={14} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-gray-800 truncate">{r.patientName}</p>
                            <span className="text-[10px] text-gray-400 shrink-0">
                              {r.givenAt ? new Date(r.givenAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <StarRow score={r.score} size={11} />
                            <span className="text-[10px] text-gray-400 font-medium">{STAR_LABELS[r.score]}</span>
                          </div>
                          {r.feedback && (
                            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">"{r.feedback}"</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-3">
                    <button
                      onClick={() => setReviewPage(p => Math.max(0, p - 1))}
                      disabled={reviewPage === 0}
                      className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-colors"
                    >
                      <ChevronLeft size={14} className="text-gray-500" />
                    </button>
                    <span className="text-xs text-gray-500 font-medium">
                      {reviewPage + 1} / {totalPages}
                    </span>
                    <button
                      onClick={() => setReviewPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={reviewPage === totalPages - 1}
                      className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-colors"
                    >
                      <ChevronRight size={14} className="text-gray-500" />
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>

        {/* ── Footer CTA ── */}
        <div className="px-5 py-4 border-t border-gray-100 bg-white shrink-0">
          <button
            onClick={() => { onBook(doctor); onClose(); }}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 transition-all"
          >
            Book Appointment with {displayName}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
