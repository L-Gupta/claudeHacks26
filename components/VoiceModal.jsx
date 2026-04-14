'use client';
import WaveformCanvas from './WaveformCanvas';

export default function VoiceModal({ pin, onClose, onResonate, resonated, analyser, playing, isCurrentUser }) {
  if (!pin) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="slide-up w-full max-w-md rounded-2xl p-6 relative bg-white shadow-2xl border border-gray-100"
        onClick={e => e.stopPropagation()}>

        <button onClick={onClose} className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-xl transition-colors">&times;</button>

        <div className="text-center mb-4">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 bg-uwred/10 text-uwred border border-uwred/20">
            Room {pin.room} &middot; {isCurrentUser ? pin.name : 'Anonymous'}
          </div>
          {pin.major && (
            <div className="text-xs text-gray-400 mt-1">{pin.major} &middot; {pin.year}</div>
          )}
          <p className="text-sm text-gray-500 mt-2 leading-relaxed italic">&ldquo;{pin.summary}&rdquo;</p>
          {pin.hobbies?.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 mt-3">
              {pin.hobbies.map(h => (
                <span key={h} className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">{h}</span>
              ))}
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
            {resonated ? '✓ Resonated' : 'Resonate ❤️'}
          </button>
        )}
      </div>
    </div>
  );
}
