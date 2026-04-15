'use client';

function StatCard({ label, value, icon, color = '#c5050c' }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl glass border border-white/5">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base" style={{ background: color + '18' }}>
        {icon}
      </div>
      <div>
        <div className="text-lg font-black text-white leading-none">{value}</div>
        <div className="text-[10px] text-white/30 font-medium mt-0.5">{label}</div>
      </div>
    </div>
  );
}

function FeatureRadar({ features }) {
  if (!features) return null;
  const dims = [
    { key: 'energy_level', label: 'Energy', angle: -90 },
    { key: 'introvert_extrovert_score', label: 'Social', angle: -18 },
    { key: 'tone_warmth', label: 'Warmth', angle: 54 },
    { key: 'humor_score', label: 'Humor', angle: 126 },
  ];

  const cx = 60, cy = 60, r = 45;
  const points = dims.map(d => {
    const val = features[d.key] ?? 0.5;
    const rad = (d.angle * Math.PI) / 180;
    return { x: cx + Math.cos(rad) * r * val, y: cy + Math.sin(rad) * r * val, label: d.label, val };
  });
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';

  return (
    <div className="flex flex-col items-center">
      <svg width="120" height="120" viewBox="0 0 120 120">
        {[0.25, 0.5, 0.75, 1].map(s => (
          <circle key={s} cx={cx} cy={cy} r={r * s} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        ))}
        {dims.map(d => {
          const rad = (d.angle * Math.PI) / 180;
          return <line key={d.key} x1={cx} y1={cy} x2={cx + Math.cos(rad) * r} y2={cy + Math.sin(rad) * r} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />;
        })}
        <path d={path} fill="rgba(197,5,12,0.2)" stroke="#c5050c" strokeWidth="1.5" style={{ filter: 'drop-shadow(0 0 4px rgba(197,5,12,0.3))' }} />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="2.5" fill="#c5050c" style={{ filter: 'drop-shadow(0 0 3px rgba(197,5,12,0.5))' }} />
            <text x={cx + Math.cos((dims[i].angle * Math.PI) / 180) * (r + 12)}
              y={cy + Math.sin((dims[i].angle * Math.PI) / 180) * (r + 12)}
              textAnchor="middle" dominantBaseline="middle" fontSize="7" fill="rgba(255,255,255,0.4)" fontWeight="600">
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function ProfileStats({ user, matchCount, onClose }) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="slide-up w-full max-w-sm rounded-2xl glass-card p-6 max-h-[85vh] overflow-y-auto shimmer-border"
        onClick={e => e.stopPropagation()}>

        <button onClick={onClose} className="absolute top-3 right-4 text-white/30 hover:text-white/70 text-xl transition-colors">&times;</button>

        <div className="text-center mb-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-3 bg-gradient-to-br from-uwgold/30 to-uwgold/10 border-2 border-uwgold/30 text-uwgold shadow-lg shadow-uwgold/10">
            {user.name?.[0]}
          </div>
          <h3 className="text-lg font-black text-white">{user.name}</h3>
          <p className="text-xs text-white/30 mt-0.5">
            {user.major} &middot; {user.year} &middot; Room {user.room}
          </p>
        </div>

        <FeatureRadar features={user.features} />

        <div className="grid grid-cols-2 gap-2 mt-4">
          <StatCard label="Matches" value={matchCount} icon="🤝" />
          <StatCard label="Hobbies" value={user.hobbies?.length || 0} icon="🎯" />
          <StatCard label="Energy" value={`${Math.round((user.features?.energy_level || 0.5) * 100)}%`} icon="⚡" color="#eab308" />
          <StatCard label="Social" value={`${Math.round((user.features?.introvert_extrovert_score || 0.5) * 100)}%`} icon="🗣️" color="#3b82f6" />
        </div>

        {user.hobbies?.length > 0 && (
          <div className="mt-4">
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2">Interests</p>
            <div className="flex flex-wrap gap-1.5">
              {user.hobbies.map(h => (
                <span key={h} className="px-3 py-1 rounded-full text-xs font-medium bg-uwred/10 text-uwred border border-uwred/15">
                  {h}
                </span>
              ))}
            </div>
          </div>
        )}

        {user.summary && (
          <div className="mt-4 p-3 rounded-xl glass border border-white/5">
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1">AI Summary</p>
            <p className="text-xs text-white/60 leading-relaxed italic">&ldquo;{user.summary}&rdquo;</p>
          </div>
        )}

        <button onClick={onClose}
          className="w-full mt-4 py-2.5 rounded-xl font-bold text-sm text-uwred/80 bg-uwred/10 hover:bg-uwred/20 transition-all border border-uwred/10">
          Close
        </button>
      </div>
    </div>
  );
}
