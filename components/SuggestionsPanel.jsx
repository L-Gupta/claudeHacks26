'use client';

export default function SuggestionsPanel({ suggestions, onViewRoom }) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="fade-in rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
      <h3 className="text-sm font-bold text-uwdark mb-1 flex items-center gap-2">
        <span className="text-uwred">✨</span> AI Suggested Connections
      </h3>
      <p className="text-xs text-gray-400 mb-3">Based on your profile, hobbies, and voice note</p>

      <div className="space-y-2">
        {suggestions.map((s, i) => (
          <button key={i} onClick={() => onViewRoom?.(s.room)}
            className="w-full text-left p-3 rounded-xl bg-cream hover:bg-uwred/5 border border-gray-100 transition-all group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-uwred">Room {s.room}</span>
              <span className="text-xs text-gray-400 group-hover:text-uwred transition-colors">View →</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{s.reason}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
