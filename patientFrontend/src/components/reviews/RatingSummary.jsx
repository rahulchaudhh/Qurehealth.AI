import { Star, BadgeCheck, TrendingUp } from 'lucide-react';

function StarRow({ score, size = 16 }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          size={size}
          className={`transition-colors ${s <= score ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
        />
      ))}
    </span>
  );
}

export default function RatingSummary({ rating, reviewCount, distribution }) {
  const avg = rating > 0 ? rating.toFixed(1) : '0.0';
  const total = Object.values(distribution).reduce((s, v) => s + v, 0);
  const recommendPct = total > 0
    ? Math.round(((distribution[5] + distribution[4]) / total) * 100)
    : 0;

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50/40 rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Big rating number */}
        <div className="text-center sm:text-left shrink-0">
          <div className="flex items-baseline gap-1 justify-center sm:justify-start">
            <span className="text-6xl font-black text-gray-900 tracking-tight leading-none">
              {avg}
            </span>
            <span className="text-lg font-bold text-gray-300">/5</span>
          </div>
          <div className="mt-2 mb-2.5">
            <StarRow score={Math.round(rating)} size={18} />
          </div>
          <p className="text-xs text-gray-400 font-medium">
            Based on <span className="text-gray-600 font-semibold">{reviewCount}</span> verified reviews
          </p>
        </div>

        {/* Vertical divider */}
        <div className="hidden sm:block w-px h-28 bg-gray-100 self-center" />

        {/* Badges */}
        <div className="flex flex-col gap-3 flex-1">
          {/* Verified badge */}
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-100 w-fit">
            <BadgeCheck size={15} className="text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700">Verified Reviews Only</span>
          </div>

          {/* Recommendation metric */}
          {total > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 bg-blue-50/60 rounded-xl border border-blue-100/60">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                <TrendingUp size={18} className="text-white" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-gray-900 leading-tight">{recommendPct}%</p>
                <p className="text-[11px] text-gray-400 font-medium">of patients recommend this doctor</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
