'use client';
import { useState, useMemo } from 'react';
import { compatibilityScore } from '@/lib/knn';

const ROOM_W = 88, ROOM_H = 56, GAP = 7, START_X = 80;

function buildRooms() {
  const rooms = [];
  const row = (base, y, floor) => {
    for (let i = 0; i < 6; i++)
      rooms.push({ id: `${base + i}`, x: START_X + i * (ROOM_W + GAP), y, floor });
  };
  row(201, 38, 2); row(207, 134, 2);
  row(101, 256, 1); row(107, 352, 1);
  return rooms;
}

const ALL_ROOMS = buildRooms();

export function roomCenter(roomId) {
  const r = ALL_ROOMS.find(rm => rm.id === roomId);
  return r ? { x: r.x + ROOM_W / 2, y: r.y + ROOM_H / 2 } : { x: 400, y: 240 };
}

function scoreColor(score) {
  if (score >= 75) return '#22c55e';
  if (score >= 50) return '#eab308';
  if (score >= 25) return '#f97316';
  return '#ef4444';
}

function PinMarker({ x, y, isNew, isUser, onClick, resonated, score }) {
  const fill = isUser ? '#e8d5a3' : resonated ? '#22c55e' : '#c5050c';
  return (
    <g className={`${isNew ? 'pin-drop' : ''} pin-alive`}
      style={{ cursor: 'pointer', transformOrigin: `${x}px ${y}px` }}
      onClick={onClick}>
      <path
        d={`M${x},${y + 2} C${x - 10},${y - 8} ${x - 12},${y - 22} ${x},${y - 28} C${x + 12},${y - 22} ${x + 10},${y - 8} ${x},${y + 2}Z`}
        fill={fill} stroke="white" strokeWidth="1.5" />
      <circle cx={x} cy={y - 18} r="4.5" fill="white" opacity="0.9" />
      {isUser && <text x={x} y={y - 15} textAnchor="middle" fontSize="6" fill="#0a0a0a" fontWeight="700">♪</text>}
      {!isUser && score !== null && score !== undefined && (
        <>
          <rect x={x - 12} y={y - 42} width="24" height="13" rx="3" fill="white" stroke={scoreColor(score)} strokeWidth="0.8" />
          <text x={x} y={y - 33} textAnchor="middle" fontSize="7" fontWeight="700" fill={scoreColor(score)}>
            {score}%
          </text>
        </>
      )}
    </g>
  );
}

export default function FloorMap({ users, currentUser, onPinClick, sortedRooms, resonatedPins, dorm }) {
  const [hovered, setHovered] = useState(null);

  const scoreMap = useMemo(() => {
    if (!currentUser?.features) return {};
    const map = {};
    users.forEach(u => {
      if (u.id !== currentUser.id && u.features) {
        map[u.id] = compatibilityScore(currentUser.features, u.features);
      }
    });
    return map;
  }, [currentUser, users]);

  const hoveredUser = useMemo(() => {
    if (!hovered) return null;
    return users.find(u => u.room === hovered);
  }, [hovered, users]);

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm relative">
      <svg viewBox="0 0 680 420" className="w-full" style={{ maxHeight: '50vh' }}>
        <defs>
          <linearGradient id="hallGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#e8e7e3" />
            <stop offset="50%" stopColor="#dddcd8" />
            <stop offset="100%" stopColor="#e8e7e3" />
          </linearGradient>
          <filter id="heatGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <rect x="0" y="0" width="680" height="420" rx="12" fill="#faf9f6" />
        <text x="42" y="22" fill="#c5050c" fontSize="11" fontWeight="700" opacity="0.6">
          {(dorm || 'WITTE HALL').toUpperCase()}
        </text>

        {/* Floor 2 */}
        <text x="16" y="92" fill="#999" fontSize="9" fontWeight="600" transform="rotate(-90,16,92)">FLOOR 2</text>
        <rect x={START_X - 4} y="98" width={6 * (ROOM_W + GAP) - GAP + 8} height="26" rx="3" fill="url(#hallGrad)" />
        <text x={START_X + (6 * (ROOM_W + GAP) - GAP) / 2} y="115" textAnchor="middle" fill="#aaa" fontSize="7" letterSpacing="3">HALLWAY</text>

        {/* Floor 1 */}
        <text x="16" y="310" fill="#999" fontSize="9" fontWeight="600" transform="rotate(-90,16,310)">FLOOR 1</text>
        <rect x={START_X - 4} y="316" width={6 * (ROOM_W + GAP) - GAP + 8} height="26" rx="3" fill="url(#hallGrad)" />
        <text x={START_X + (6 * (ROOM_W + GAP) - GAP) / 2} y="333" textAnchor="middle" fill="#aaa" fontSize="7" letterSpacing="3">HALLWAY</text>

        <line x1="40" y1="230" x2="640" y2="230" stroke="#ddd" strokeWidth="1" strokeDasharray="4,4" />

        {ALL_ROOMS.map(rm => {
          const hasPin = users.some(u => u.room === rm.id);
          const isUserRoom = currentUser && rm.id === currentUser.room;
          const isHov = hovered === rm.id;
          const rank = sortedRooms.indexOf(rm.id);
          const isTopRanked = rank >= 0 && rank < 3;
          const roomUser = users.find(u => u.room === rm.id && u.id !== currentUser?.id);
          const roomScore = roomUser ? scoreMap[roomUser.id] : null;

          return (
            <g key={rm.id}
              onMouseEnter={() => setHovered(rm.id)}
              onMouseLeave={() => setHovered(null)}>
              <rect
                x={rm.x} y={rm.y} width={ROOM_W} height={ROOM_H} rx="4"
                fill={isUserRoom ? '#fef3c7' : isTopRanked ? '#c5050c08' : isHov ? '#f5f5f2' : '#fff'}
                stroke={isTopRanked ? '#c5050c88' : isHov ? '#ccc' : '#e5e5e5'}
                strokeWidth={isTopRanked ? 1.5 : 1}
                style={{ transition: 'all 300ms ease' }} />
              <text x={rm.x + ROOM_W / 2} y={rm.y + ROOM_H / 2 + 3} textAnchor="middle"
                fill={hasPin ? '#c5050c' : '#bbb'} fontSize="10" fontWeight="600">{rm.id}</text>

              {isTopRanked && rank >= 0 && (
                <g>
                  <rect x={rm.x + ROOM_W - 16} y={rm.y + 2} width="14" height="12" rx="3" fill="#c5050c" />
                  <text x={rm.x + ROOM_W - 9} y={rm.y + 10.5} textAnchor="middle" fill="white" fontSize="7" fontWeight="700">
                    {rank + 1}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {users.map(u => {
          const c = roomCenter(u.room);
          return (
            <PinMarker key={u.id} x={c.x} y={c.y - 8}
              isNew={u.isNew} isUser={u.id === currentUser?.id}
              resonated={resonatedPins?.has(u.id)}
              score={u.id !== currentUser?.id ? scoreMap[u.id] : null}
              onClick={e => { e.stopPropagation(); onPinClick(u); }} />
          );
        })}
      </svg>

      {/* Hover tooltip */}
      {hoveredUser && hoveredUser.id !== currentUser?.id && (
        <div className="absolute bottom-2 left-2 right-2 p-2.5 rounded-xl bg-white/95 backdrop-blur border border-gray-100 shadow-md flex items-center gap-3 fade-in" style={{ animation: 'fadeIn 0.15s ease' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-uwred/10 text-uwred flex-shrink-0">
            {scoreMap[hoveredUser.id] ?? '?'}%
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-uwdark truncate">Room {hoveredUser.room} &middot; {hoveredUser.major}</div>
            <div className="text-[10px] text-gray-400 truncate">{hoveredUser.summary}</div>
          </div>
        </div>
      )}
    </div>
  );
}
