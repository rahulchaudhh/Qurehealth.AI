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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Rate Your Experience</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              with <span className="font-semibold text-gray-600">Dr. {appointment?.doctor?.name?.replace(/^(dr\.?)\s*/i, '')}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="px-6 pb-6">
          {/* Stars */}
          <div className="flex flex-col items-center py-6">
            <div className="flex gap-2 mb-3">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => { setScore(star); setError(''); }}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    size={36}
                    className={`transition-colors ${
                      star <= (hovered || score)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className={`text-sm font-semibold transition-all h-5 ${score > 0 ? 'text-gray-700' : 'text-transparent'}`}>
              {labels[hovered || score] || ''}
            </p>
          </div>

          {/* Feedback */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Feedback <span className="text-gray-300 font-normal normal-case">(optional)</span>
            </label>
            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Share your experience with the doctor..."
              rows={3}
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all resize-none placeholder:text-gray-300"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-500 font-medium mb-4 text-center">{error}</p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting || score === 0}
            className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              score > 0
                ? 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-200 active:scale-[0.98]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Submitting...
              </span>
            ) : (
              <>
                <Send size={14} strokeWidth={2.5} />
                Submit Rating
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
