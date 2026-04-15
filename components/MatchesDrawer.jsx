'use client';
import { useState, useEffect, useCallback } from 'react';

export default function MatchesDrawer({ currentUser, onOpenChat, onClose }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      const res = await fetch(`/api/chat?userId=${currentUser.id}`);
      const data = await res.json();
      setMatches(data.matches || []);
    } catch (err) {
      console.error('Failed to fetch matches:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function timeAgo(ts) {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  const totalUnread = matches.reduce((sum, m) => sum + (m.unreadCount || 0), 0);

  return (
    <div className="fixed inset-0 z-[9998] flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="slide-up w-full max-w-md rounded-t-2xl bg-white shadow-2xl border-t border-gray-100"
        style={{ maxHeight: '75vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        <div className="flex items-center justify-between px-5 pt-2 pb-3">
          <div>
            <h3 className="text-base font-bold text-uwdark flex items-center gap-2">
              <span className="text-uwred">💬</span> Your Matches
              {totalUnread > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-uwred text-white text-[10px] font-bold">
                  {totalUnread} new
                </span>
              )}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {matches.length} match{matches.length !== 1 ? 'es' : ''} &middot; Tap to chat
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 text-lg">
            &times;
          </button>
        </div>

        <div className="overflow-y-auto px-4 pb-5" style={{ maxHeight: 'calc(75vh - 90px)' }}>
          {loading && (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="w-5 h-5 border-2 border-uwred/30 border-t-uwred rounded-full animate-spin" />
              <span className="text-xs text-gray-400">Loading matches...</span>
            </div>
          )}

          {!loading && matches.length === 0 && (
            <div className="text-center py-10">
              <div className="text-3xl mb-2">🤝</div>
              <p className="text-sm text-gray-500 font-medium">No matches yet</p>
              <p className="text-xs text-gray-400 mt-1">Resonate with neighbors to match!</p>
            </div>
          )}

          {!loading && matches.map(match => (
            <button
              key={match.id}
              onClick={() => onOpenChat(match)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-cream transition-all group text-left"
            >
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold bg-uwred/10 text-uwred border-2 border-uwred/20 group-hover:border-uwred/40 transition-colors">
                  {match.name?.[0] || '?'}
                </div>
                {(match.unreadCount || 0) > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-uwred text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">
                    {match.unreadCount > 9 ? '9+' : match.unreadCount}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-sm truncate ${match.unreadCount > 0 ? 'font-bold text-uwdark' : 'font-semibold text-uwdark'}`}>
                    {match.name}
                  </span>
                  <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
                    {match.lastMessage ? timeAgo(match.lastMessage.createdAt) : timeAgo(match.matchedAt)}
                  </span>
                </div>
                <div className={`text-xs truncate mt-0.5 ${match.unreadCount > 0 ? 'text-uwdark font-medium' : 'text-gray-400'}`}>
                  {match.lastMessage ? (
                    <>
                      {match.lastMessage.fromId === currentUser.id && (
                        <span className="text-gray-400">You: </span>
                      )}
                      {match.lastMessage.text}
                    </>
                  ) : (
                    <span className="text-gray-400 italic">Room {match.room} &middot; {match.major}</span>
                  )}
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-300 group-hover:text-uwred transition-colors flex-shrink-0">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
