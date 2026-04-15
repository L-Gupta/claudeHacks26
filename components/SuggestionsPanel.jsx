'use client';
import { useState, useMemo } from 'react';
import { compatibilityScore, compatibilityBreakdown } from '@/lib/knn';

function ScoreBadge({ score }) {
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#eab308' : '#f97316';
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, background: color, boxShadow: `0 0 6px ${color}40` }} />
      </div>
      <span className="text-[10px] font-bold" style={{ color }}>{score}%</span>
    </div>
  );
}

export default function SuggestionsPanel({ suggestions, onViewRoom, floorUsers, currentUser }) {
  const [expanded, setExpanded] = useState(null);

  const enriched = useMemo(() => {
    if (!suggestions?.length) return [];
    return suggestions.map(s => {
      const roomUser = floorUsers?.find(u => u.room === s.room);
      const score = currentUser?.features && roomUser?.features
        ? compatibilityScore(currentUser.features, roomUser.features) : null;
      const breakdown = currentUser?.features && roomUser?.features
        ? compatibilityBreakdown(currentUser.features, roomUser.features) : null;
      return { ...s, score, breakdown, user: roomUser };
    });
  }, [suggestions, floorUsers, currentUser]);

  if (!enriched.length) return null;

  return (
    <div className="fade-in rounded-2xl glass-card p-4">
      <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
        <span className="text-uwred">✨</span> AI Suggested Connections
      </h3>
      <p className="text-xs text-white/30 mb-3">Based on KNN ranking, profile similarity, and voice analysis</p>

      <div className="space-y-2">
        {enriched.map((s, i) => (
          <div key={i} className="rounded-xl glass border border-white/5 transition-all overflow-hidden hover:border-uwred/20">
            <button
              onClick={() => onViewRoom?.(s.room)}
              className="w-full text-left p-3 hover:bg-white/5 transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-uwred">Room {s.room}</span>
                  {s.score !== null && <ScoreBadge score={s.score} />}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); setExpanded(expanded === i ? null : i); }}
                    className="text-[10px] text-white/30 hover:text-uwred transition-colors px-1"
                  >
                    {expanded === i ? 'Less ▴' : 'Details ▾'}
                  </button>
                  <span className="text-xs text-white/25 group-hover:text-uwred transition-colors">View →</span>
                </div>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">{s.reason}</p>
            </button>

            {expanded === i && s.breakdown && (
              <div className="px-3 pb-3 pt-0 border-t border-white/5">
                {s.breakdown.sharedInterests.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {s.breakdown.sharedInterests.map(h => (
                      <span key={h} className="px-2 py-0.5 rounded-full text-[10px] bg-uwred/10 text-uwred font-medium border border-uwred/15">
                        ✦ {h}
                      </span>
                    ))}
                  </div>
                )}
                <div className="space-y-1 mt-2">
                  {Object.entries(s.breakdown.dimensions).map(([label, val]) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="text-[9px] text-white/25 w-14 text-right">{label}</span>
                      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-uwred/40 transition-all duration-500" style={{ width: `${val}%` }} />
                      </div>
                      <span className="text-[9px] text-white/35 font-medium w-6">{val}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
