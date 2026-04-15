'use client';
import { useMemo } from 'react';
import WaveformCanvas from './WaveformCanvas';
import { compatibilityScore, compatibilityBreakdown } from '@/lib/knn';

function CompatRing({ score }) {
  if (score === null || score === undefined) return null;
  const r = 28, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#eab308' : '#f97316';

  return (
    <div className="relative w-[72px] h-[72px] mx-auto mb-3">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#f0f0ee" strokeWidth="4" />
        <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          className="compat-ring" style={{ '--target-offset': offset }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-black" style={{ color }}>{score}%</span>
      </div>
    </div>
  );
}

function DimensionBars({ dimensions }) {
  if (!dimensions) return null;
  return (
    <div className="space-y-1.5 mt-3">
      {Object.entries(dimensions).map(([label, val]) => (
        <div key={label} className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400 w-16 text-right font-medium">{label}</span>
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700 ease-out bg-uwred/70"
              style={{ width: `${val}%` }} />
          </div>
          <span className="text-[10px] text-gray-500 font-semibold w-8">{val}%</span>
        </div>
      ))}
    </div>
  );
}

export default function VoiceModal({ pin, onClose, onResonate, resonated, analyser, playing, isCurrentUser, currentUser }) {
  if (!pin) return null;

  const score = useMemo(
    () => currentUser?.features && pin.features ? compatibilityScore(currentUser.features, pin.features) : null,
    [currentUser?.features, pin.features]
  );

  const breakdown = useMemo(
    () => currentUser?.features && pin.features ? compatibilityBreakdown(currentUser.features, pin.features) : null,
    [currentUser?.features, pin.features]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="slide-up w-full max-w-md rounded-2xl p-6 relative bg-white shadow-2xl border border-gray-100"
        onClick={e => e.stopPropagation()}>

        <button onClick={onClose} className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-xl transition-colors">&times;</button>

        <div className="text-center mb-4">
          {!isCurrentUser && score !== null && <CompatRing score={score} />}

          <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 bg-uwred/10 text-uwred border border-uwred/20">
            Room {pin.room} &middot; {isCurrentUser ? pin.name : 'Anonymous'}
          </div>
          {pin.major && (
            <div className="text-xs text-gray-400 mt-1">{pin.major} &middot; {pin.year}</div>
          )}
          <p className="text-sm text-gray-500 mt-2 leading-relaxed italic">&ldquo;{pin.summary}&rdquo;</p>

          {pin.hobbies?.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 mt-3">
              {pin.hobbies.map(h => {
                const isShared = breakdown?.sharedInterests?.includes(h);
                return (
                  <span key={h} className={`px-2 py-0.5 rounded-full text-xs transition-all ${
                    isShared
                      ? 'bg-uwred/10 text-uwred font-semibold border border-uwred/20'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {isShared && '✦ '}{h}
                  </span>
                );
              })}
            </div>
          )}

          {!isCurrentUser && breakdown && (
            <div className="mt-4 px-2">
              {breakdown.sharedInterests.length > 0 && (
                <p className="text-[11px] text-uwred/80 font-semibold mb-1">
                  {breakdown.sharedInterests.length} shared interest{breakdown.sharedInterests.length > 1 ? 's' : ''}
                </p>
              )}
              <DimensionBars dimensions={breakdown.dimensions} />
            </div>
          )}
        </div>

        <div className="rounded-xl p-3 mb-4" style={{ height: 56 }}>
          <WaveformCanvas analyser={analyser} playing={playing} bg="#f5f5f2" />
        </div>

        {!isCurrentUser && (
          <button onClick={() => onResonate(pin.id)} disabled={resonated}
            className="w-full py-3 rounded-xl font-bold text-lg transition-all duration-300"
            style={{
              background: resonated ? '#22c55e' : '#c5050c',
              color: 'white',
              opacity: resonated ? 0.8 : 1,
              transform: resonated ? 'scale(0.98)' : 'scale(1)',
            }}>
            {resonated ? '✓ Resonated' : `Resonate ${score !== null ? `(${score}% match)` : '❤️'}`}
          </button>
        )}
      </div>
    </div>
  );
}
