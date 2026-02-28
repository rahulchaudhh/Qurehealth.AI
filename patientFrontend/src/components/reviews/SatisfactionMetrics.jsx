import { Star, MessageCircle, Sparkles, Clock, HeartPulse } from 'lucide-react';

const METRICS = [
  { label: 'Communication', icon: MessageCircle, color: 'text-blue-500', bg: 'bg-blue-50' },
  { label: 'Cleanliness', icon: Sparkles, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { label: 'Effectiveness', icon: HeartPulse, color: 'text-rose-500', bg: 'bg-rose-50' },
  { label: 'Wait Time', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
];

// Derive per-metric scores from the overall rating with slight variance
function deriveMetricScores(avgRating) {
  if (!avgRating || avgRating <= 0) return METRICS.map(() => 0);
  const offsets = [0.1, -0.1, 0, -0.3];
  return offsets.map(offset => {
    const val = Math.min(5, Math.max(0, avgRating + offset));
    return Math.round(val * 10) / 10;
  });
}

function MiniStarBar({ value, max = 5 }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-bold text-gray-700 tabular-nums w-7 text-right">{value}</span>
    </div>
  );
}

export default function SatisfactionMetrics({ rating }) {
  const scores = deriveMetricScores(rating);

  return (
    <div className="grid grid-cols-2 gap-3">
      {METRICS.map((metric, idx) => {
        const Icon = metric.icon;
        const score = scores[idx];
        return (
          <div
            key={metric.label}
            className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group"
          >
            <div className="flex items-center gap-2.5 mb-1">
              <div className={`w-8 h-8 rounded-lg ${metric.bg} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                <Icon size={15} className={metric.color} />
              </div>
              <span className="text-xs font-semibold text-gray-700">{metric.label}</span>
            </div>
            <MiniStarBar value={score} />
          </div>
        );
      })}
    </div>
  );
}
