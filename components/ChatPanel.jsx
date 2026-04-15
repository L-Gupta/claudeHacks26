'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

const REACTION_EMOJIS = ['❤️', '😂', '🔥', '👍', '😮', '🎉'];
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

function linkify(text) {
  const parts = text.split(URL_REGEX);
  return parts.map((part, i) =>
    URL_REGEX.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer"
        className="underline underline-offset-2 opacity-80 hover:opacity-100 break-all">
        {part.length > 40 ? part.slice(0, 40) + '…' : part}
      </a>
    ) : part
  );
}

function DateSeparator({ date }) {
  const d = new Date(date);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  const yest = new Date(today); yest.setDate(yest.getDate() - 1);
  const isYesterday = d.toDateString() === yest.toDateString();
  const label = isToday ? 'Today' : isYesterday ? 'Yesterday' : d.toLocaleDateString([], { month: 'short', day: 'numeric' });

  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

function TypingIndicator({ name }) {
  return (
    <div className="flex items-center gap-2 ml-8 mt-1 mb-2">
      <div className="flex gap-0.5 items-center px-3 py-2 rounded-2xl rounded-bl-md bg-white border border-gray-100">
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-[10px] text-gray-400">{name} is typing</span>
    </div>
  );
}

function ReactionBar({ reactions, currentUserId, onReact }) {
  if (!reactions || reactions.length === 0) return null;
  const grouped = {};
  reactions.forEach(r => {
    if (!grouped[r.emoji]) grouped[r.emoji] = { emoji: r.emoji, count: 0, byMe: false };
    grouped[r.emoji].count++;
    if (r.userId === currentUserId) grouped[r.emoji].byMe = true;
  });

  return (
    <div className="flex gap-1 mt-0.5 px-1">
      {Object.values(grouped).map(g => (
        <button key={g.emoji} onClick={() => onReact(g.emoji)}
          className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] transition-all ${
            g.byMe ? 'bg-uwred/10 border border-uwred/30' : 'bg-gray-100 border border-transparent hover:border-gray-200'
          }`}>
          <span>{g.emoji}</span>
          {g.count > 1 && <span className="text-gray-500 font-medium">{g.count}</span>}
        </button>
      ))}
    </div>
  );
}

export default function ChatPanel({ currentUser, chatPartner, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(null);
  const [loadingIcebreaker, setLoadingIcebreaker] = useState(false);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);
  const typingTimeout = useRef(null);
  const inputRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    if (!currentUser?.id || !chatPartner?.id) return;
    try {
      const res = await fetch(`/api/chat?userId=${currentUser.id}&withId=${chatPartner.id}`);
      const data = await res.json();
      setMessages(data.messages || []);
      setPartnerTyping(data.typing || false);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  }, [currentUser?.id, chatPartner?.id]);

  useEffect(() => {
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 1500);
    return () => clearInterval(pollRef.current);
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partnerTyping]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [chatPartner]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleInputChange(e) {
    setInput(e.target.value);
    sendTypingSignal(true);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => sendTypingSignal(false), 2000);
  }

  async function sendTypingSignal(isTyping) {
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'typing', fromId: currentUser.id, toId: chatPartner.id, typing: isTyping }),
      });
    } catch {}
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const text = input.trim();
    setInput('');
    setSending(true);
    sendTypingSignal(false);

    const optimistic = {
      id: `opt_${Date.now()}`,
      fromId: currentUser.id,
      toId: chatPartner.id,
      text,
      createdAt: Date.now(),
      reactions: [],
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromId: currentUser.id, toId: chatPartner.id, text }),
      });
      await fetchMessages();
    } catch (err) {
      console.error('Send failed:', err);
    } finally {
      setSending(false);
    }
  }

  async function handleIcebreaker() {
    setLoadingIcebreaker(true);
    try {
      const res = await fetch('/api/icebreaker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, partnerId: chatPartner.id }),
      });
      const data = await res.json();
      if (data.icebreaker) setInput(data.icebreaker);
    } catch (err) {
      console.error('Icebreaker error:', err);
    } finally {
      setLoadingIcebreaker(false);
      inputRef.current?.focus();
    }
  }

  async function handleReact(messageId, emoji) {
    setShowReactionPicker(null);
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'react', messageId, userId: currentUser.id, emoji }),
      });
      await fetchMessages();
    } catch {}
  }

  function formatTime(ts) {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function needsDateSeparator(msg, prevMsg) {
    if (!prevMsg) return true;
    const d1 = new Date(msg.createdAt).toDateString();
    const d2 = new Date(prevMsg.createdAt).toDateString();
    return d1 !== d2;
  }

  if (!chatPartner) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-cream">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
        <button onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M13 4L7 10L13 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="relative">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold bg-uwred/10 text-uwred border-2 border-uwred/30">
            {chatPartner.name?.[0] || '?'}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-uwdark truncate">{chatPartner.name}</div>
          <div className="text-xs text-gray-400">
            {partnerTyping ? (
              <span className="text-uwred font-medium">typing...</span>
            ) : (
              <>Room {chatPartner.room} &middot; {chatPartner.major}</>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5" onClick={() => setShowReactionPicker(null)}>
        {messages.length === 0 && !partnerTyping && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-uwred/10 flex items-center justify-center text-3xl mb-4">👋</div>
            <p className="text-sm font-semibold text-uwdark">You matched with {chatPartner.name}!</p>
            <p className="text-xs text-gray-400 mt-1 max-w-[240px] leading-relaxed">
              Break the ice — say hello to your new neighbor
            </p>
            <button onClick={handleIcebreaker} disabled={loadingIcebreaker}
              className="mt-4 px-4 py-2 rounded-full bg-uwred/10 text-uwred text-xs font-semibold hover:bg-uwred/20 transition-all flex items-center gap-1.5 disabled:opacity-50">
              {loadingIcebreaker ? (
                <div className="w-3 h-3 border-2 border-uwred/30 border-t-uwred rounded-full animate-spin" />
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              AI Icebreaker
            </button>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMine = msg.fromId === currentUser.id;
          const showAvatar = !isMine && (i === 0 || messages[i - 1]?.fromId !== msg.fromId);
          const isLast = i === messages.length - 1 || messages[i + 1]?.fromId !== msg.fromId;
          const showDate = needsDateSeparator(msg, messages[i - 1]);

          return (
            <div key={msg.id}>
              {showDate && <DateSeparator date={msg.createdAt} />}
              <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-3' : ''} group relative`}>
                {!isMine && (
                  <div className="w-6 mr-1.5 flex-shrink-0 flex items-end">
                    {showAvatar && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-uwred/10 text-uwred">
                        {chatPartner.name?.[0]}
                      </div>
                    )}
                  </div>
                )}
                <div className="max-w-[75%] relative">
                  <div
                    className={`chat-bubble px-3.5 py-2 text-sm leading-relaxed relative ${
                      isMine
                        ? 'bg-uwred text-white rounded-2xl rounded-br-md'
                        : 'bg-white text-uwdark rounded-2xl rounded-bl-md border border-gray-100'
                    }`}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setShowReactionPicker(showReactionPicker === msg.id ? null : msg.id);
                    }}
                  >
                    {linkify(msg.text)}
                  </div>

                  {/* Reaction picker */}
                  {showReactionPicker === msg.id && (
                    <div className={`absolute ${isMine ? 'right-0' : 'left-0'} -top-10 z-10 flex gap-0.5 px-2 py-1.5 rounded-full bg-white shadow-lg border border-gray-100 reaction-picker`}>
                      {REACTION_EMOJIS.map(emoji => (
                        <button key={emoji} onClick={(e) => { e.stopPropagation(); handleReact(msg.id, emoji); }}
                          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all hover:scale-125 text-sm">
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  <ReactionBar reactions={msg.reactions} currentUserId={currentUser.id}
                    onReact={(emoji) => handleReact(msg.id, emoji)} />

                  {isLast && (
                    <div className={`text-[10px] text-gray-400 mt-0.5 px-1 flex items-center gap-1 ${isMine ? 'justify-end' : ''}`}>
                      {formatTime(msg.createdAt)}
                      {isMine && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                          <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {partnerTyping && <TypingIndicator name={chatPartner.name} />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 bg-white border-t border-gray-100">
        <form onSubmit={handleSend} className="flex items-center gap-2 max-w-2xl mx-auto">
          <button type="button" onClick={handleIcebreaker} disabled={loadingIcebreaker}
            className="w-10 h-10 flex items-center justify-center rounded-full text-uwred hover:bg-uwred/10 transition-all disabled:opacity-30 flex-shrink-0"
            title="AI Icebreaker">
            {loadingIcebreaker ? (
              <div className="w-4 h-4 border-2 border-uwred/30 border-t-uwred rounded-full animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 text-sm rounded-full bg-cream border border-gray-200 focus:border-uwred/40 focus:outline-none focus:ring-2 focus:ring-uwred/10 transition-all placeholder:text-gray-400"
          />
          <button type="submit" disabled={!input.trim() || sending}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-uwred text-white disabled:opacity-30 hover:brightness-110 active:scale-95 transition-all flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
