'use client';
import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import SignupForm from '@/components/SignupForm';
import DormExplorer from '@/components/DormExplorer';
import VoiceModal from '@/components/VoiceModal';
import MatchCard from '@/components/MatchCard';
import ConfettiOverlay from '@/components/ConfettiOverlay';

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

  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const playbackRef = useRef(null);

  useEffect(() => { setTimeout(() => setLoaded(true), 50); }, []);

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
      src.connect(an);
      an.connect(ctx.destination);
      audio.play();
      audio.onended = () => setPlayingPinId(null);
      playbackRef.current = { audio };
    } else if (pin.audioSeed) {
      const buf = createMockAudioBuffer(ctx, pin.audioSeed);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(an);
      an.connect(ctx.destination);
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
        }
      } catch (err) {
        console.error('Resonate error:', err);
      }
    }, 2500);
  }

  function closeMatch() {
    setShowMatchCard(false);
    setMatchedUser(null);
    setMeetupSuggestion('');
  }

  if (!loaded) return null;

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Header user={user} />

      {!user ? (
        <SignupForm onComplete={setUser} />
      ) : (
        <DormExplorer currentUser={user} onRoomClick={handleRoomClick} />
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
      />

      <ConfettiOverlay active={showConfetti} />

      {showMatchCard && matchedUser && (
        <MatchCard
          currentUser={user}
          matchedUser={matchedUser}
          suggestion={meetupSuggestion}
          onClose={closeMatch}
        />
      )}

      <footer className="text-center py-3 text-xs text-gray-400 border-t border-gray-100 mt-auto">
        HelloNeighbour &middot; UW-Madison &middot; Notes expire in 48h
      </footer>
    </div>
  );
}
