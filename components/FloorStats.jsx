'use client';
import { useState, useEffect, useCallback } from 'react';

function MiniBar({ label, value, max, color = '#c5050c' }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-gray-500 w-20 text-right truncate font-medium">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[10px] text-gray-400 font-semibold w-5 text-right">{value}</span>
    </div>
  );
}

export default function FloorStats({ dorm }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!dorm) return;
    try {
      const res = await fetch(`/api/stats?dorm=${encodeURIComponent(dorm)}`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Stats error:', err);
    } finally {
      setLoading(false);
    }
  }, [dorm]);

  useEffect(() => {
    fetchStats();
    const iv = setInterval(fetchStats, 10000);
    return () => clearInterval(iv);
  }, [fetchStats]);

  if (loading || !stats) return null;

  const hobbyMax = stats.topHobbies?.length > 0 ? stats.topHobbies[0][1] : 1;
  const majorMax = stats.topMajors?.length > 0 ? stats.topMajors[0][1] : 1;

  return (
    <div className="fade-in rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <button onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between p-4 hover:bg-cream/50 transition-all">
        <h3 className="text-sm font-bold text-uwdark flex items-center gap-2">
          <span className="text-uwred">📊</span> Dorm Analytics
        </h3>
        <span className="text-xs text-gray-400">{collapsed ? 'Expand ▾' : 'Collapse ▴'}</span>
      </button>

      {!collapsed && (
        <div className="px-4 pb-4 space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Residents', value: stats.totalUsers, icon: '👥' },
              { label: 'Resonations', value: stats.resonationCount, icon: '💫' },
              { label: 'Matches', value: stats.matchCount, icon: '🤝' },
              { label: 'Messages', value: stats.messageCount, icon: '💬' },
            ].map(m => (
              <div key={m.label} className="text-center p-2 rounded-lg bg-cream">
                <div className="text-base">{m.icon}</div>
                <div className="text-sm font-black text-uwdark">{m.value}</div>
                <div className="text-[9px] text-gray-400">{m.label}</div>
              </div>
            ))}
          </div>

          {/* Top Hobbies */}
          {stats.topHobbies?.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Top Hobbies</p>
              <div className="space-y-1.5">
                {stats.topHobbies.map(([hobby, count]) => (
                  <MiniBar key={hobby} label={hobby} value={count} max={hobbyMax} />
                ))}
              </div>
            </div>
          )}

          {/* Top Majors */}
          {stats.topMajors?.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Top Majors</p>
              <div className="space-y-1.5">
                {stats.topMajors.map(([major, count]) => (
                  <MiniBar key={major} label={major} value={count} max={majorMax} color="#e8d5a3" />
                ))}
              </div>
            </div>
          )}

          {/* Floor Distribution */}
          {Object.keys(stats.floorBreakdown || {}).length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Floor Distribution</p>
              <div className="flex gap-1.5">
                {Object.entries(stats.floorBreakdown).sort((a, b) => Number(a[0]) - Number(b[0])).map(([floor, count]) => (
                  <div key={floor} className="flex-1 text-center p-1.5 rounded-lg bg-cream">
                    <div className="text-xs font-bold text-uwdark">{count}</div>
                    <div className="text-[9px] text-gray-400">F{floor}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
