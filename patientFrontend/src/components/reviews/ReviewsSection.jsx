import { useState, useMemo } from 'react';
import { MessageSquare, ChevronDown, Star, Inbox } from 'lucide-react';
import RatingSummary from './RatingSummary';
import RatingBreakdown from './RatingBreakdown';
import ReviewCard from './ReviewCard';

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'highest', label: 'Highest Rated' },
  { value: 'lowest', label: 'Lowest Rated' },
];

const FILTER_CHIPS = [
  { value: 'all', label: 'All' },
  { value: 5, label: '5★' },
  { value: 4, label: '4★' },
  { value: 3, label: '3★' },
  { value: 2, label: '2★' },
  { value: 1, label: '1★' },
];

const REVIEWS_PER_PAGE = 5;

export default function ReviewsSection({ reviews, rating, reviewCount, loading, currentUserId, onReviewUpdated }) {
  const [sortBy, setSortBy] = useState('recent');
  const [filterStar, setFilterStar] = useState('all');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [displayCount, setDisplayCount] = useState(REVIEWS_PER_PAGE);

  // Distribution
  const distribution = useMemo(() => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => { if (r.score >= 1 && r.score <= 5) dist[r.score]++; });
    return dist;
  }, [reviews]);

  // Filter + Sort
  const processedReviews = useMemo(() => {
    let filtered = filterStar === 'all'
      ? [...reviews]
      : reviews.filter(r => r.score === filterStar);

    switch (sortBy) {
      case 'highest':
        filtered.sort((a, b) => b.score - a.score);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.score - b.score);
        break;
      default: // recent
        filtered.sort((a, b) => new Date(b.givenAt) - new Date(a.givenAt));
    }
    return filtered;
  }, [reviews, filterStar, sortBy]);

  const visibleReviews = processedReviews.slice(0, displayCount);
  const hasMore = displayCount < processedReviews.length;

  const handleBreakdownFilter = (star) => {
    setFilterStar(prev => prev === star ? 'all' : star);
    setDisplayCount(REVIEWS_PER_PAGE);
  };

  // Loading skeletons
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-36 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  // Empty state
  if (reviews.length === 0) {
    return (
      <div className="text-center py-14 bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-dashed border-gray-200">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
          <Inbox size={28} className="text-gray-300" />
        </div>
        <h3 className="text-base font-bold text-gray-700 mb-1">No Reviews Yet</h3>
        <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
          This doctor hasn't received any patient reviews yet. Be the first to share your experience after a consultation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── 1. Rating Summary Hero ── */}
      <RatingSummary rating={rating} reviewCount={reviewCount} distribution={distribution} />

      {/* ── 2. Rating Distribution ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3.5">Rating Distribution</h4>
        <RatingBreakdown distribution={distribution} onFilter={handleBreakdownFilter} />
      </div>

      {/* ── 3. Reviews List ── */}
      <div>
        {/* Header with sort + filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare size={15} className="text-blue-500" />
            Patient Reviews
            <span className="text-xs text-gray-400 font-normal ml-1">
              ({processedReviews.length}{filterStar !== 'all' ? ` of ${reviews.length}` : ''})
            </span>
          </h3>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Sort: {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
              <ChevronDown size={13} className={`text-gray-400 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
            </button>
            {showSortMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-20 min-w-[160px]">
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { setSortBy(opt.value); setShowSortMenu(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${
                        sortBy === opt.value
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {FILTER_CHIPS.map(chip => {
            const isActive = filterStar === chip.value;
            const count = chip.value === 'all' ? reviews.length : distribution[chip.value] || 0;
            return (
              <button
                key={chip.value}
                type="button"
                onClick={() => {
                  setFilterStar(chip.value);
                  setDisplayCount(REVIEWS_PER_PAGE);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {chip.label}
                <span className={`ml-1 ${isActive ? 'text-blue-200' : 'text-gray-300'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Review cards */}
        {visibleReviews.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <Star size={24} className="text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400 font-medium">No reviews match this filter</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleReviews.map((review, idx) => (
              <div
                key={review.appointmentId || idx}
                className="animate-fadeIn"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <ReviewCard
                  review={review}
                  index={idx}
                  isOwn={!!currentUserId && review.patientId === currentUserId}
                  onReviewUpdated={onReviewUpdated}
                />
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="flex justify-center mt-5">
            <button
              type="button"
              onClick={() => setDisplayCount(prev => prev + REVIEWS_PER_PAGE)}
              className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              Load More Reviews
              <span className="text-gray-300 ml-1.5">
                ({processedReviews.length - displayCount} remaining)
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
