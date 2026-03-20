import { useState } from 'react';
import { Star, X, Send } from 'lucide-react';

export default function RatingModal({ appointment, onClose, onSubmit }) {
  const [score, setScore] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  const handleSubmit = async () => {
    if (score === 0) {
      setError('Please select a rating.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onSubmit(appointment._id, score, feedback);
    } catch (err) {
      setError(err.message || 'Failed to submit rating.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Rate Your Experience</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              with <span className="font-semibold text-gray-600">Dr. {appointment?.doctor?.name?.replace(/^(dr\.?)\s*/i, '')}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors group">
            <X size={14} className="text-gray-400 group-hover:text-gray-600" strokeWidth={2.5} />
          </button>
        </div>

        <div className="px-6 pb-6 pt-2">
          {/* Stars */}
          <div className="flex flex-col items-center py-4">
            <div className="flex gap-2 mb-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => { setScore(star); setError(''); }}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    size={32}
                    className={`transition-colors ${
                      star <= (hovered || score)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-200'
                    }`}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>
            <p className={`text-[10px] font-bold uppercase tracking-widest transition-all h-4 ${score > 0 ? 'text-gray-400' : 'text-transparent'}`}>
              {labels[hovered || score] || ''}
            </p>
          </div>

          {/* Feedback */}
          <div className="mb-6">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Feedback <span className="text-gray-300 font-normal normal-case">(optional)</span>
            </label>
            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Share your experience with the doctor..."
              rows={3}
              className="w-full px-4 py-3 text-sm border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-gray-200 transition-all resize-none placeholder:text-gray-300 bg-gray-50/50"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-[10px] text-red-500 font-bold mb-4 text-center uppercase tracking-tight">{error}</p>
          )}

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSubmit}
              disabled={submitting || score === 0}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                score > 0
                  ? 'text-[#1a73e8] hover:text-[#1557b0] active:scale-[0.98]'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></span>
                  Submitting
                </span>
              ) : (
                <>
                  <Send size={15} strokeWidth={2.5} />
                  Submit Rating
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
