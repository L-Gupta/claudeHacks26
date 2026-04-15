'use client';
import { useState, useEffect, useCallback } from 'react';
import SuggestionsPanel from './SuggestionsPanel';

const DORM_FLOORS = {
  'Witte Hall': 12, 'Sellery Hall': 12, 'Chadbourne Hall': 5,
  'Dejope Hall': 8, 'Ogg Hall': 8, 'Smith Hall': 6,
  'Adams Hall': 4, 'Tripp Hall': 4,
};
const DORM_LIST = Object.keys(DORM_FLOORS);

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
  const [floor, setFloor] = useState(currentUser?.floor || 2);
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
    if (newFloor < 1 || newFloor > maxFloor) return;
    setTransitioning(true);
    setTimeout(() => {
      setFloor(newFloor);
      setTransitioning(false);
    }, 150);
  }

  function changeDorm(newDorm) {
    setDorm(newDorm);
    setFloor(1);
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

  return (
    <div className="max-w-xl mx-auto px-4 py-5">

      {/* Dorm Selector */}
      <div className="mb-5 fade-in">
        <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">
          Explore Dorm
        </label>
        <select
          value={dorm}
          onChange={e => changeDorm(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-uwdark text-sm font-medium
            focus:outline-none focus:ring-2 focus:ring-uwred/20 focus:border-uwred transition-all cursor-pointer">
          {DORM_LIST.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Floor Navigator */}
      <div className="flex items-center justify-center gap-5 mb-5 fade-in-d1">
        <button
          onClick={() => changeFloor(floor - 1)}
          disabled={floor <= 1}
          className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 bg-white
            text-uwdark font-bold text-lg hover:bg-gray-50 disabled:opacity-25 disabled:cursor-not-allowed
            transition-all active:scale-95 shadow-sm">
          ‹
        </button>
        <div className="text-center min-w-[120px]">
          <span className="text-base font-bold text-uwdark">Floor {floor}</span>
          <span className="text-xs text-gray-400 ml-1.5">of {maxFloor}</span>
        </div>
        <button
          onClick={() => changeFloor(floor + 1)}
          disabled={floor >= maxFloor}
          className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 bg-white
            text-uwdark font-bold text-lg hover:bg-gray-50 disabled:opacity-25 disabled:cursor-not-allowed
            transition-all active:scale-95 shadow-sm">
          ›
        </button>
      </div>

      {/* Your Floor Indicator */}
      {isUserFloor && (
        <div className="text-center mb-4 fade-in">
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide
            bg-uwred/10 text-uwred border border-uwred/20">
            Your floor
          </span>
        </div>
      )}

      {/* Room Grid */}
      <div className={`grid grid-cols-4 gap-2.5 mb-6 transition-opacity duration-150 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>
        {rooms.map(room => {
          const occupant = floorUsers.find(u => u.room === room);
          const isYou = currentUser?.room === room && isUserFloor;

          return (
            <button
              key={room}
              onClick={() => handleRoomClick(room)}
              disabled={!occupant}
              className={`relative rounded-xl p-3 text-center transition-all duration-200
                ${occupant
                  ? isYou
                    ? 'bg-uwgold/20 border-2 border-uwgold hover:shadow-md cursor-pointer'
                    : 'bg-white border-2 border-uwred/20 hover:border-uwred/50 hover:shadow-md cursor-pointer active:scale-[0.97]'
                  : 'bg-gray-50 border border-gray-100 cursor-default opacity-60'
                }`}
            >
              <div className={`text-sm font-bold ${occupant ? 'text-uwdark' : 'text-gray-300'}`}>
                {room}
              </div>

              {occupant && (
                <div className="mt-1.5">
                  <div className="flex justify-center gap-0.5 mb-1">
                    {(occupant.hobbies || []).slice(0, 2).map(h => (
                      <span key={h} className="text-[10px]">{HOBBY_EMOJI[h] || ''}</span>
                    ))}
                  </div>
                  {isYou ? (
                    <span className="text-[9px] font-bold text-uwgold uppercase">You</span>
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-uwred mx-auto animate-pulse" />
                  )}
                </div>
              )}

              {!occupant && (
                <div className="mt-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-200 mx-auto" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Empty Floor Message */}
      {!loading && floorUsers.length === 0 && (
        <div className="text-center py-8 fade-in">
          <p className="text-2xl mb-2">🤫</p>
          <p className="text-sm text-gray-400">No voice notes on this floor yet</p>
          <p className="text-xs text-gray-300 mt-1">Be the first to drop one!</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block w-5 h-5 border-2 border-uwred/30 border-t-uwred rounded-full animate-spin" />
        </div>
      )}

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div className="fade-in-d2 mt-2">
          <SuggestionsPanel suggestions={suggestions} onViewRoom={handleSuggestionClick} />
        </div>
      )}
    </div>
  );
}
