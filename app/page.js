'use client';
import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import SignupForm from '@/components/SignupForm';
import DormExplorer from '@/components/DormExplorer';
import VoiceModal from '@/components/VoiceModal';
import MatchCard from '@/components/MatchCard';
import ConfettiOverlay from '@/components/ConfettiOverlay';
import ChatPanel from '@/components/ChatPanel';
import MatchesDrawer from '@/components/MatchesDrawer';
import ProfileStats from '@/components/ProfileStats';
import FloorStats from '@/components/FloorStats';
import { useToast } from '@/components/Toast';

const SESSION_KEY = 'helloNeighbour_session';

function loadSession() {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(SESSION_KEY) : null;
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveSession(user) {
  try {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_KEY);
  } catch {}
}

function createMockAudioBuffer(ctx, seed) {
  const dur = 5, sr = ctx.sampleRate, len = dur * sr;
  const buf = ctx.createBuffer(1, len, sr);
  const d = buf.getChannelData(0);
  const base = 110 + seed * 45;
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    const env = Math.max(0, Math.sin(t * Math.PI * (3 + seed * 0.7)) * 0.6 + 0.4);
    const burst = Math.sin(t * 12 + seed) > -0.2 ? 1 : 0.15;
    const s = (Math.sin(2 * Math.PI * base * t) * 0.35 +
      Math.sin(2 * Math.PI * base * 1.5 * t + seed) * 0.2 +
      Math.sin(2 * Math.PI * base * 2.8 * t) * 0.1 +
      (Math.random() * 2 - 1) * 0.08) * env * burst * 0.45;
    d[i] = s * (1 - Math.pow(2 * t / dur - 1, 4));
  }
  return buf;
}

export default function Home() {
  const [user, setUser] = useState(null);
  const [selectedPin, setSelectedPin] = useState(null);
  const [resonatedPins, setResonatedPins] = useState(new Set());
  const [matchedUser, setMatchedUser] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMatchCard, setShowMatchCard] = useState(false);
  const [meetupSuggestion, setMeetupSuggestion] = useState('');
  const [playingPinId, setPlayingPinId] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [chatPartner, setChatPartner] = useState(null);
  const [showMatchesDrawer, setShowMatchesDrawer] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [showProfile, setShowProfile] = useState(false);

  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const playbackRef = useRef(null);

  const toast = useToast();

  // Restore session from localStorage
  useEffect(() => {
    const saved = loadSession();
    if (saved) setUser(saved);
    setTimeout(() => setLoaded(true), 50);
  }, []);

  // Persist session
  useEffect(() => {
    if (user) {
      const serializable = { ...user };
      delete serializable.blobUrl;
      saveSession(serializable);
    }
  }, [user]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        if (chatPartner) setChatPartner(null);
        else if (showMatchesDrawer) setShowMatchesDrawer(false);
        else if (showMatchCard) { setShowMatchCard(false); setMatchedUser(null); setMeetupSuggestion(''); }
        else if (showProfile) setShowProfile(false);
        else if (selectedPin) { stopPlayback(); setSelectedPin(null); }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [chatPartner, showMatchesDrawer, showMatchCard, showProfile, selectedPin]);

  function getAudioCtx() {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    return audioCtxRef.current;
  }

  /* ── Audio Playback ── */
  function playPin(pin) {
    setSelectedPin(pin);
    const ctx = getAudioCtx();
    const an = ctx.createAnalyser();
    an.fftSize = 256;
    analyserRef.current = an;

    if (pin.blobUrl) {
      const audio = new Audio(pin.blobUrl);
      const src = ctx.createMediaElementSource(audio);
      src.connect(an); an.connect(ctx.destination);
      audio.play();
      audio.onended = () => setPlayingPinId(null);
      playbackRef.current = { audio };
    } else if (pin.audioSeed) {
      const buf = createMockAudioBuffer(ctx, pin.audioSeed);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(an); an.connect(ctx.destination);
      src.start();
      src.onended = () => setPlayingPinId(null);
      playbackRef.current = { bufSrc: src };
    }
    setPlayingPinId(pin.id);
  }

  function stopPlayback() {
    if (playbackRef.current) {
      try { playbackRef.current.audio?.pause(); } catch {}
      try { playbackRef.current.bufSrc?.stop(); } catch {}
      playbackRef.current = null;
    }
    setPlayingPinId(null);
    analyserRef.current = null;
  }

  function handleRoomClick(occupant) {
    stopPlayback();
    playPin(occupant);
  }

  function handleCloseModal() {
    stopPlayback();
    setSelectedPin(null);
  }

  /* ── Resonate & Match ── */
  async function handleResonate(pinId) {
    setResonatedPins(prev => new Set([...prev, pinId]));
    toast?.('Resonating... waiting for mutual match', 'info');

    setTimeout(async () => {
      try {
        const res = await fetch('/api/resonate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fromId: user.id, toId: pinId }),
        });
        const data = await res.json();

        if (data.match) {
          handleCloseModal();
          setShowConfetti(true);
          setMeetupSuggestion(data.suggestion);
          setMatchedUser(data.matchedUser);
          setTimeout(() => setShowMatchCard(true), 400);
          setTimeout(() => setShowConfetti(false), 4500);
          toast?.(`It's a match with ${data.matchedUser?.name || 'someone'}!`, 'match');
        }
      } catch (err) {
        console.error('Resonate error:', err);
        toast?.('Failed to resonate — try again', 'error');
      }
    }, 2500);
  }

  useEffect(() => {
    if (!user?.id) return;
    async function fetchMatchCount() {
      try {
        const res = await fetch(`/api/chat?userId=${user.id}`);
        const data = await res.json();
        setMatchCount((data.matches || []).length);
      } catch {}
    }
    fetchMatchCount();
    const iv = setInterval(fetchMatchCount, 5000);
    return () => clearInterval(iv);
  }, [user?.id]);

  function closeMatch() {
    setShowMatchCard(false);
    setMatchedUser(null);
    setMeetupSuggestion('');
  }

  function handleStartChat(partner) {
    setShowMatchCard(false);
    setShowMatchesDrawer(false);
    setChatPartner(partner);
  }

  function handleSignupComplete(newUser) {
    setUser(newUser);
    toast?.(`Welcome, ${newUser.name}! You're on the map.`, 'success');
  }

  function handleLogout() {
    saveSession(null);
    setUser(null);
    setMatchCount(0);
    toast?.('Logged out successfully', 'info');
  }

  if (!loaded) return null;

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Header user={user} onProfileClick={() => setShowProfile(true)} onLogout={handleLogout} />

      {!user ? (
        <SignupForm onComplete={handleSignupComplete} />
      ) : (
        <>
          <DormExplorer currentUser={user} onRoomClick={handleRoomClick} />

          {/* Floor Stats */}
          <div className="fade-in-d3 px-4 pb-3">
            <div className="max-w-lg mx-auto">
              <FloorStats dorm={user.dorm} />
            </div>
          </div>
        </>
      )}

      {/* ── Overlays ── */}
      <VoiceModal
        pin={selectedPin}
        onClose={handleCloseModal}
        onResonate={handleResonate}
        resonated={selectedPin ? resonatedPins.has(selectedPin.id) : false}
        analyser={analyserRef.current}
        playing={!!playingPinId}
        isCurrentUser={selectedPin?.id === user?.id}
        currentUser={user}
      />

      <ConfettiOverlay active={showConfetti} />

      {showMatchCard && matchedUser && (
        <MatchCard
          currentUser={user}
          matchedUser={matchedUser}
          suggestion={meetupSuggestion}
          onClose={closeMatch}
          onStartChat={handleStartChat}
        />
      )}

      {/* Profile stats modal */}
      {showProfile && (
        <ProfileStats user={user} matchCount={matchCount} onClose={() => setShowProfile(false)} />
      )}

      {/* Floating chat button */}
      {user && matchCount > 0 && !chatPartner && (
        <button
          onClick={() => setShowMatchesDrawer(true)}
          className="fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full bg-uwred text-white shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center chat-fab"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-uwgold text-[10px] font-bold text-uwdark flex items-center justify-center border-2 border-white">
            {matchCount}
          </span>
        </button>
      )}

      {/* Matches drawer */}
      {showMatchesDrawer && (
        <MatchesDrawer
          currentUser={user}
          onOpenChat={handleStartChat}
          onClose={() => setShowMatchesDrawer(false)}
        />
      )}

      {/* Chat panel */}
      {chatPartner && (
        <ChatPanel
          currentUser={user}
          chatPartner={chatPartner}
          onClose={() => setChatPartner(null)}
        />
      )}

      <footer className="text-center py-3 text-xs text-gray-400 border-t border-gray-100 mt-auto">
        HelloNeighbour &middot; UW-Madison &middot; Notes expire in 48h &middot; Press <kbd className="px-1 py-0.5 rounded bg-gray-100 text-gray-500 text-[10px] font-mono">Esc</kbd> to close
      </footer>
    </div>
  );
}
