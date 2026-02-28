import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

const BARS = [
  { key: 5, label: '5', color: 'bg-emerald-500' },
  { key: 4, label: '4', color: 'bg-lime-500' },
  { key: 3, label: '3', color: 'bg-amber-400' },
  { key: 2, label: '2', color: 'bg-orange-400' },
  { key: 1, label: '1', color: 'bg-red-400' },
];

export default function RatingBreakdown({ distribution, onFilter }) {
  const [animated, setAnimated] = useState(false);
  const total = Object.values(distribution).reduce((s, v) => s + v, 0);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-2.5">
      {BARS.map(bar => {
        const count = distribution[bar.key] || 0;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;

        return (
          <button
            key={bar.key}
            type="button"
            onClick={() => onFilter?.(bar.key)}
            className="w-full flex items-center gap-3 group cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1 -mx-2 transition-colors"
          >
            {/* Star label */}
            <span className="flex items-center gap-1 w-10 shrink-0 text-xs font-semibold text-gray-600">
              {bar.label}
              <Star size={11} className="text-amber-400 fill-amber-400" />
            </span>

            {/* Progress bar */}
            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${bar.color} transition-all duration-700 ease-out`}
                style={{ width: animated ? `${pct}%` : '0%' }}
              />
            </div>

            {/* Percentage */}
            <span className="w-10 text-right text-xs font-bold text-gray-500 tabular-nums">
              {pct}%
            </span>

            {/* Count */}
            <span className="w-8 text-right text-[11px] text-gray-300 font-medium tabular-nums">
              ({count})
            </span>
          </button>
        );
      })}
    </div>
  );
}
