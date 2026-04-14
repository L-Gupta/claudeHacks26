'use client';
import { useState } from 'react';

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

function PinMarker({ x, y, isNew, isUser, onClick, resonated }) {
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
    </g>
  );
}

export default function FloorMap({ users, currentUser, onPinClick, sortedRooms, resonatedPins, dorm }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">
      <svg viewBox="0 0 680 420" className="w-full" style={{ maxHeight: '50vh' }}>
        <defs>
          <linearGradient id="hallGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#e8e7e3" />
            <stop offset="50%" stopColor="#dddcd8" />
            <stop offset="100%" stopColor="#e8e7e3" />
          </linearGradient>
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

          return (
            <g key={rm.id}
              onMouseEnter={() => setHovered(rm.id)}
              onMouseLeave={() => setHovered(null)}>
              <rect
                x={rm.x} y={rm.y} width={ROOM_W} height={ROOM_H} rx="4"
                fill={isUserRoom ? '#fef3c7' : isHov ? '#f5f5f2' : '#fff'}
                stroke={isTopRanked ? '#c5050c88' : isHov ? '#ccc' : '#e5e5e5'}
                strokeWidth={isTopRanked ? 1.5 : 1}
                style={{ transition: 'all 300ms ease' }} />
              <text x={rm.x + ROOM_W / 2} y={rm.y + ROOM_H / 2 + 3} textAnchor="middle"
                fill={hasPin ? '#c5050c' : '#bbb'} fontSize="10" fontWeight="600">{rm.id}</text>
            </g>
          );
        })}

        {users.map(u => {
          const c = roomCenter(u.room);
          return (
            <PinMarker key={u.id} x={c.x} y={c.y - 8}
              isNew={u.isNew} isUser={u.id === currentUser?.id}
              resonated={resonatedPins?.has(u.id)}
              onClick={e => { e.stopPropagation(); onPinClick(u); }} />
          );
        })}
      </svg>
    </div>
  );
}
