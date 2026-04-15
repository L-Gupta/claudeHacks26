'use client';
import { useState, useEffect, useCallback } from 'react';
import SuggestionsPanel from './SuggestionsPanel';

const DORM_FLOORS = {
  'Witte Hall': 12, 'Sellery Hall': 12, 'Chadbourne Hall': 5,
  'Dejope Hall': 8, 'Ogg Hall': 8, 'Smith Hall': 6,
  'Adams Hall': 4, 'Tripp Hall': 4,
};
const DORM_LIST = Object.keys(DORM_FLOORS);
const MIN_FLOOR = 2;

function getRoomNumbers(floor) {
  return Array.from({ length: 12 }, (_, i) =>
    `${floor}${String(i + 1).padStart(2, '0')}`
  );
}

const HOBBY_EMOJI = {
  music: '🎵', sports: '🏀', gaming: '🎮', art: '🎨', food: '🍜',
  tech: '💻', outdoors: '🌲', film: '🎬', fashion: '👗', academics: '📚',
};

export default function DormExplorer({ currentUser, onRoomClick }) {
  const [dorm, setDorm] = useState(currentUser?.dorm || 'Witte Hall');
  const [floor, setFloor] = useState(currentUser?.floor || MIN_FLOOR);
  const [floorUsers, setFloorUsers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const maxFloor = DORM_FLOORS[dorm] || 8;
  const rooms = getRoomNumbers(floor);

  const fetchFloor = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ dorm, floor: String(floor) });
      if (currentUser?.id) params.set('userId', currentUser.id);
      const res = await fetch(`/api/users?${params}`);
      const data = await res.json();
      setFloorUsers(data.users || []);
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error('Fetch floor error:', err);
    }
    setLoading(false);
  }, [dorm, floor, currentUser?.id]);

  useEffect(() => { fetchFloor(); }, [fetchFloor]);

  function changeFloor(newFloor) {
    if (newFloor < MIN_FLOOR || newFloor > maxFloor) return;
    setTransitioning(true);
    setTimeout(() => {
      setFloor(newFloor);
      setTransitioning(false);
    }, 120);
  }

  function changeDorm(newDorm) {
    setDorm(newDorm);
    setFloor(MIN_FLOOR);
  }

  function handleRoomClick(roomNumber) {
    const occupant = floorUsers.find(u => u.room === roomNumber);
    if (occupant) onRoomClick(occupant);
  }

  function handleSuggestionClick(room) {
    const occupant = floorUsers.find(u => u.room === room);
    if (occupant) onRoomClick(occupant);
  }

  const isUserFloor = currentUser?.dorm === dorm && currentUser?.floor === floor;
  const occupiedCount = floorUsers.length;

  return (
    <div className="max-w-lg mx-auto px-4 py-3">

      {/* Dorm Selector */}
      <div className="mb-3 fade-in">
        <label className="block text-[10px] font-bold text-white/30 mb-1 uppercase tracking-widest">
          Explore Dorm
        </label>
        <select
          value={dorm}
          onChange={e => changeDorm(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg glass-input text-sm font-medium cursor-pointer">
          {DORM_LIST.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Floor Navigator */}
      <div className="flex items-center justify-between mb-3 fade-in-d1">
        <button
          onClick={() => changeFloor(floor - 1)}
          disabled={floor <= MIN_FLOOR}
          className="w-9 h-9 rounded-full flex items-center justify-center glass
            text-white/70 font-bold text-base hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed
            transition-all active:scale-95">
          ‹
        </button>
        <div className="text-center">
          <span className="text-sm font-bold text-white">Floor {floor}</span>
          <span className="text-[11px] text-white/30 ml-1">of {maxFloor}</span>
          {isUserFloor && (
            <span className="ml-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase
              bg-uwred/20 text-uwred border border-uwred/30 shadow-sm shadow-uwred/10">
              Your floor
            </span>
          )}
          <div className="text-[10px] text-white/20 mt-0.5">
            {occupiedCount} voice {occupiedCount === 1 ? 'note' : 'notes'}
          </div>
        </div>
        <button
          onClick={() => changeFloor(floor + 1)}
          disabled={floor >= maxFloor}
          className="w-9 h-9 rounded-full flex items-center justify-center glass
            text-white/70 font-bold text-base hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed
            transition-all active:scale-95">
          ›
        </button>
      </div>

      {/* Room Grid */}
      <div className={`grid grid-cols-4 gap-2 mb-3 transition-opacity duration-120 fade-in-d2 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>
        {rooms.map((room, idx) => {
          const occupant = floorUsers.find(u => u.room === room);
          const isYou = currentUser?.room === room && isUserFloor;

          return (
            <button
              key={room}
              onClick={() => handleRoomClick(room)}
              disabled={!occupant}
              style={{ animationDelay: `${idx * 30}ms` }}
              className={`relative rounded-xl py-2.5 px-1 text-center transition-all duration-300 scale-in
                ${occupant
                  ? isYou
                    ? 'glass border-2 border-uwgold/40 shadow-lg shadow-uwgold/10 hover:shadow-uwgold/20'
                    : 'glass border border-uwred/20 hover:border-uwred/50 hover:shadow-lg hover:shadow-uwred/10 cursor-pointer active:scale-[0.97] hover:bg-white/10'
                  : 'bg-white/[0.02] border border-white/5 cursor-default'
                }`}
            >
              <div className={`text-xs font-bold leading-none ${occupant ? 'text-white/90' : 'text-white/15'}`}>
                {room}
              </div>

              {occupant && (
                <div className="mt-1">
                  <div className="flex justify-center gap-0.5">
                    {(occupant.hobbies || []).slice(0, 2).map(h => (
                      <span key={h} className="text-[9px] leading-none">{HOBBY_EMOJI[h] || ''}</span>
                    ))}
                  </div>
                  {isYou ? (
                    <span className="text-[8px] font-bold text-uwgold uppercase leading-none">You</span>
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-uwred mx-auto mt-0.5 glow-pulse" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Empty Floor */}
      {!loading && occupiedCount === 0 && (
        <div className="text-center py-5 fade-in">
          <p className="text-lg mb-1">🤫</p>
          <p className="text-xs text-white/30">No voice notes on this floor yet</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-3">
          <div className="inline-block w-4 h-4 border-2 border-uwred/30 border-t-uwred rounded-full animate-spin" />
        </div>
      )}

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div className="fade-in-d2">
          <SuggestionsPanel suggestions={suggestions} onViewRoom={handleSuggestionClick}
            floorUsers={floorUsers} currentUser={currentUser} />
        </div>
      )}
    </div>
  );
}
