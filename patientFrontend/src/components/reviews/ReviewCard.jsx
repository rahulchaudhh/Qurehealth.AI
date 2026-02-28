import { useState } from 'react';
import { Star, BadgeCheck, ThumbsUp, Pencil, Trash2, X, Check, Loader2 } from 'lucide-react';
import api from '../../api/axios';

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

function StarRow({ score, size = 12, interactive = false, onSelect }) {
  return (
    <span className="flex items-center gap-px">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          size={size}
          className={`${s <= score ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
          onClick={() => interactive && onSelect?.(s)}
        />
      ))}
    </span>
  );
}

export default function ReviewCard({ review, index = 0, isOwn = false, onReviewUpdated }) {
  const [helpful, setHelpful] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editScore, setEditScore] = useState(review.score);
  const [editFeedback, setEditFeedback] = useState(review.feedback || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const avatarColors = [
    'bg-blue-500', 'bg-violet-500', 'bg-rose-400', 'bg-emerald-500',
    'bg-amber-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-pink-500'
  ];
  const colorClass = avatarColors[index % avatarColors.length];
  const initial = review.patientName?.charAt(0).toUpperCase() || '?';
  const dateStr = review.givenAt
    ? new Date(review.givenAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  const handleSaveEdit = async () => {
    if (!editScore || editScore < 1) return;
    setSaving(true);
    try {
      await api.put(`/appointments/${review.appointmentId}/rate`, {
        score: editScore,
        feedback: editFeedback
      });
      setEditing(false);
      onReviewUpdated?.();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update review');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/appointments/${review.appointmentId}/rate`);
      setShowDeleteConfirm(false);
      onReviewUpdated?.();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete review');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditScore(review.score);
    setEditFeedback(review.feedback || '');
  };

  return (
    <div className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 group ${isOwn ? 'border-blue-200 ring-1 ring-blue-100' : 'border-gray-100'}`}>
      <div className="flex items-start gap-3.5">
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${colorClass} shadow-sm`}>
          {initial}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-gray-900">{review.patientName}</p>
                {isOwn && (
                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    You
                  </span>
                )}
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  <BadgeCheck size={10} />
                  Verified
                </span>
              </div>
              {!editing && (
                <div className="flex items-center gap-2 mt-1">
                  <StarRow score={review.score} size={13} />
                  <span className="text-[11px] font-semibold text-gray-400">{STAR_LABELS[review.score]}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] text-gray-400 font-medium mt-0.5">{dateStr}</span>
              {/* Edit/Delete for own reviews */}
              {isOwn && !editing && !showDeleteConfirm && (
                <div className="flex items-center gap-0.5 ml-1">
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Edit review"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete review"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-xs font-semibold text-red-700 mb-2.5">Are you sure you want to delete this review?</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-3.5 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors flex items-center gap-1.5 disabled:opacity-60"
                >
                  {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3.5 py-1.5 bg-white text-gray-600 rounded-lg text-xs font-semibold border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Editing Mode */}
          {editing ? (
            <div className="mt-2 space-y-3">
              {/* Star selector */}
              <div>
                <p className="text-[11px] text-gray-500 font-medium mb-1.5">Your Rating</p>
                <div className="flex items-center gap-2">
                  <StarRow score={editScore} size={22} interactive onSelect={setEditScore} />
                  <span className="text-xs font-semibold text-gray-500">{STAR_LABELS[editScore]}</span>
                </div>
              </div>
              {/* Feedback textarea */}
              <div>
                <p className="text-[11px] text-gray-500 font-medium mb-1.5">Your Feedback</p>
                <textarea
                  value={editFeedback}
                  onChange={e => setEditFeedback(e.target.value)}
                  rows={3}
                  placeholder="Share your experience..."
                  className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-gray-700 placeholder:text-gray-300"
                />
              </div>
              {/* Save / Cancel buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={saving || !editScore}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-1.5 disabled:opacity-60 shadow-sm shadow-blue-200"
                >
                  {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-white text-gray-600 rounded-lg text-xs font-semibold border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                >
                  <X size={12} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Review text */}
              {!showDeleteConfirm && (
                <>
                  {review.feedback ? (
                    <p className="text-sm text-gray-600 leading-relaxed mt-2.5">
                      "{review.feedback}"
                    </p>
                  ) : (
                    <p className="text-xs text-gray-300 italic mt-2">No written feedback provided</p>
                  )}

                  {/* Helpful button */}
                  <div className="mt-3 pt-3 border-t border-gray-50">
                    <button
                      type="button"
                      onClick={() => setHelpful(!helpful)}
                      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 ${
                        helpful
                          ? 'text-blue-600 bg-blue-50 border border-blue-200'
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <ThumbsUp size={12} className={helpful ? 'fill-blue-600' : ''} />
                      {helpful ? 'Helpful' : 'Helpful?'}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
