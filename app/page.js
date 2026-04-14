'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import Header from '@/components/Header';
import SignupForm from '@/components/SignupForm';
import FloorMap from '@/components/FloorMap';
import RecordButton from '@/components/RecordButton';
import WaveformCanvas from '@/components/WaveformCanvas';
import VoiceModal from '@/components/VoiceModal';
import MatchCard from '@/components/MatchCard';
import ConfettiOverlay from '@/components/ConfettiOverlay';
import SuggestionsPanel from '@/components/SuggestionsPanel';
import { encodeVector, knnRank } from '@/lib/knn';

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
  const [floorUsers, setFloorUsers] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [selectedPin, setSelectedPin] = useState(null);
  const [resonatedPins, setResonatedPins] = useState(new Set());
  const [matchedUser, setMatchedUser] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMatchCard, setShowMatchCard] = useState(false);
  const [meetupSuggestion, setMeetupSuggestion] = useState('');
  const [playingPinId, setPlayingPinId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaRecRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const sourceRef = useRef(null);
  const playbackRef = useRef(null);
  const blobUrlRef = useRef(null);

  useEffect(() => { setTimeout(() => setLoaded(true), 50); }, []);

  useEffect(() => {
    if (!user) return;
    fetchFloorData();
  }, [user]);

  async function fetchFloorData() {
    try {
      const res = await fetch(`/api/users?dorm=${encodeURIComponent(user.dorm)}&userId=${user.id}`);
      const data = await res.json();
      setFloorUsers(data.users || []);
      setAiSuggestions(data.suggestions || []);
    } catch (err) {
      console.error('Fetch floor error:', err);
    }
  }

  function getAudioCtx() {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    return audioCtxRef.current;
  }

  const sortedRooms = useMemo(() => {
    if (!user?.features) return floorUsers.map(u => u.room);
    const others = floorUsers.filter(u => u.id !== user.id);
    return knnRank(user.features, others).map(u => u.room);
  }, [user, floorUsers]);

  async function startRec() {
    if (hasRecorded) return;
    try {
      const ctx = getAudioCtx();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const src = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser();
      an.fftSize = 256;
      src.connect(an);
      analyserRef.current = an;
      sourceRef.current = src;

      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.start();
      mediaRecRef.current = mr;
      setIsRecording(true);
      setRecordTime(0);

      timerRef.current = setInterval(() => {
        setRecordTime(prev => {
          if (prev >= 14) { stopRec(); return 15; }
          return prev + 1;
        });
      }, 1000);
    } catch {
      alert('Microphone access required.');
    }
  }

  function stopRec() {
    setIsRecording(false);
    clearInterval(timerRef.current);
    const mr = mediaRecRef.current;
    if (mr && mr.state !== 'inactive') {
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        blobUrlRef.current = URL.createObjectURL(blob);
        setHasRecorded(true);

        const transcript = "Hey, I'm looking for cool people on my floor. I love " +
          (user.hobbies || []).join(' and ') + ". " + user.major + " major here!";

        try {
          const res = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transcript, major: user.major, year: user.year, hobbies: user.hobbies }),
          });
          const analysis = await res.json();

          const updated = { ...user, summary: analysis.summary, features: analysis, blobUrl: blobUrlRef.current, isNew: true };
          setUser(updated);

          await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated),
          });

          fetchFloorData();
        } catch (err) {
          console.error('Re-analyze error:', err);
        }
      };
      mr.stop();
    }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (sourceRef.current) { sourceRef.current.disconnect(); sourceRef.current = null; }
    analyserRef.current = null;
  }

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
    } else {
      const buf = createMockAudioBuffer(ctx, pin.audioSeed || 1);
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

  function handlePinClick(pin) {
    stopPlayback();
    playPin(pin);
  }

  function handleCloseModal() {
    stopPlayback();
    setSelectedPin(null);
  }

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

  function handleViewRoom(room) {
    const pin = floorUsers.find(u => u.room === room);
    if (pin) handlePinClick(pin);
  }

  function handleSignupComplete(newUser) {
    setUser(newUser);
  }

  if (!loaded) return null;

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Header user={user} />

      {!user ? (
        <SignupForm onComplete={handleSignupComplete} />
      ) : (
        <>
          {/* Floor Map */}
          <div className="fade-in-d2 flex-1 px-3 pt-4 pb-2">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-2 px-1">
                <h2 className="text-xs font-bold tracking-widest uppercase text-uwred/70">
                  {user.dorm} — Floor {user.floor}
                </h2>
                <span className="text-xs text-gray-400">Room {user.room}</span>
              </div>

              <FloorMap
                users={floorUsers}
                currentUser={user}
                onPinClick={handlePinClick}
                sortedRooms={sortedRooms}
                resonatedPins={resonatedPins}
                dorm={user.dorm}
              />

              {user.features && (
                <p className="fade-in mt-2 px-1 text-xs text-gray-400">
                  📍 Pins sorted by compatibility (KNN k=3)
                </p>
              )}
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="fade-in-d3 px-3 pb-3">
            <div className="max-w-2xl mx-auto">
              <SuggestionsPanel suggestions={aiSuggestions} onViewRoom={handleViewRoom} />
            </div>
          </div>

          {/* Record Section */}
          <div className="fade-in-d4 pb-6 pt-2">
            {!hasRecorded ? (
              <div className="flex flex-col items-center">
                <p className="text-xs text-gray-400 mb-3">Drop a voice note on the map</p>
                <RecordButton
                  isRecording={isRecording} time={recordTime}
                  onDown={startRec} onUp={() => { if (isRecording) stopRec(); }}
                  recorded={hasRecorded}
                />
                {isRecording && (
                  <div className="mt-3 rounded-xl overflow-hidden" style={{ width: 240, height: 48, background: '#f0f0ee' }}>
                    <WaveformCanvas analyser={analyserRef.current} playing={isRecording} bg="#f0f0ee" />
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-sm text-gray-400 font-medium">
                ✅ Your note is live — tap a pin to listen & resonate
              </p>
            )}
          </div>
        </>
      )}

      {/* Overlays */}
      <VoiceModal
        pin={selectedPin} onClose={handleCloseModal}
        onResonate={handleResonate}
        resonated={selectedPin ? resonatedPins.has(selectedPin.id) : false}
        analyser={analyserRef.current} playing={!!playingPinId}
        isCurrentUser={selectedPin?.id === user?.id}
      />
      <ConfettiOverlay active={showConfetti} />
      {showMatchCard && matchedUser && (
        <MatchCard currentUser={user} matchedUser={matchedUser} suggestion={meetupSuggestion} onClose={closeMatch} />
      )}

      <footer className="text-center py-3 text-xs text-gray-400 border-t border-gray-100">
        HelloNeighbour &middot; UW-Madison &middot; Notes expire in 48h
      </footer>
    </div>
  );
}
