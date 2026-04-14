'use client';

export default function MatchCard({ currentUser, matchedUser, suggestion, onClose }) {
  if (!matchedUser) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70">
      <div className="slide-up match-glow w-full max-w-sm rounded-3xl p-8 text-center bg-white shadow-2xl border-2 border-uwred/20">

        <div className="text-5xl mb-3">🎉</div>
        <h2 className="text-3xl font-black text-uwred mb-1">It&apos;s a Match!</h2>
        <p className="text-gray-400 text-sm mb-5">You both resonated — here&apos;s the reveal</p>

        <div className="flex justify-around mb-6">
          <div>
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-2 bg-uwgold/20 border-2 border-uwgold">
              {currentUser?.name?.[0] || 'Y'}
            </div>
            <div className="text-xs font-semibold text-uwdark">{currentUser?.name}</div>
            <div className="text-xs text-gray-400">Room {currentUser?.room}</div>
          </div>
          <div className="flex items-center text-2xl text-uwred">❤️</div>
          <div>
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-2 bg-uwred/10 border-2 border-uwred">
              {matchedUser?.name?.[0] || '?'}
            </div>
            <div className="text-xs font-semibold text-uwdark">{matchedUser?.name || matchedUser?.label}</div>
            <div className="text-xs text-gray-400">Room {matchedUser?.room}</div>
          </div>
        </div>

        <div className="rounded-xl p-4 mb-5 bg-cream border border-gray-100">
          <p className="text-sm font-medium text-uwgold">☕ Meetup Suggestion</p>
          <p className="text-gray-600 text-sm mt-2 leading-relaxed">{suggestion}</p>
        </div>

        <button onClick={onClose}
          className="w-full py-3 rounded-xl font-bold text-white bg-uwred hover:brightness-110 transition-all">
          Nice! Close
        </button>
      </div>
    </div>
  );
}
