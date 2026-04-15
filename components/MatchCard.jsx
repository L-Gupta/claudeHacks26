'use client';

export default function MatchCard({ currentUser, matchedUser, suggestion, onClose, onStartChat }) {
  if (!matchedUser) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="slide-up match-glow w-full max-w-sm rounded-3xl p-8 text-center glass-card shimmer-border">

        <div className="text-5xl mb-3 float">🎉</div>
        <h2 className="text-3xl font-black bg-gradient-to-r from-uwred via-rose-400 to-uwred bg-clip-text text-transparent gradient-shift mb-1">It&apos;s a Match!</h2>
        <p className="text-white/40 text-sm mb-5">You both resonated — here&apos;s the reveal</p>

        <div className="flex justify-around mb-6">
          <div>
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-2 bg-uwgold/20 border-2 border-uwgold/40 text-uwgold shadow-lg shadow-uwgold/10">
              {currentUser?.name?.[0] || 'Y'}
            </div>
            <div className="text-xs font-semibold text-white/80">{currentUser?.name}</div>
            <div className="text-xs text-white/30">Room {currentUser?.room}</div>
          </div>
          <div className="flex items-center text-2xl text-uwred float" style={{ animationDelay: '0.5s' }}>❤️</div>
          <div>
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-2 bg-uwred/15 border-2 border-uwred/30 text-uwred shadow-lg shadow-uwred/10">
              {matchedUser?.name?.[0] || '?'}
            </div>
            <div className="text-xs font-semibold text-white/80">{matchedUser?.name || matchedUser?.label}</div>
            <div className="text-xs text-white/30">Room {matchedUser?.room}</div>
          </div>
        </div>

        <div className="rounded-xl p-4 mb-5 glass border border-uwgold/10">
          <p className="text-sm font-medium text-uwgold">☕ Meetup Suggestion</p>
          <p className="text-white/60 text-sm mt-2 leading-relaxed">{suggestion}</p>
        </div>

        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold text-uwred/80 bg-uwred/10 hover:bg-uwred/20 transition-all border border-uwred/10">
            Close
          </button>
          <button onClick={() => onStartChat?.(matchedUser)}
            className="flex-1 py-3 rounded-xl font-bold text-white btn-glow flex items-center justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Chat
          </button>
        </div>
      </div>
    </div>
  );
}
