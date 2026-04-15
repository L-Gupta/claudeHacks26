'use client';
import { useState, useRef, useEffect } from 'react';

const DORM_FLOORS = {
  'Witte Hall': 12, 'Sellery Hall': 12, 'Chadbourne Hall': 5,
  'Dejope Hall': 8, 'Ogg Hall': 8, 'Smith Hall': 6,
  'Adams Hall': 4, 'Tripp Hall': 4,
};
const DORMS = Object.keys(DORM_FLOORS);

const HOBBIES = [
  { id:'music', label:'🎵 Music' }, { id:'sports', label:'🏀 Sports' },
  { id:'gaming', label:'🎮 Gaming' }, { id:'art', label:'🎨 Art' },
  { id:'food', label:'🍜 Food' }, { id:'tech', label:'💻 Tech' },
  { id:'outdoors', label:'🌲 Outdoors' }, { id:'film', label:'🎬 Film' },
  { id:'fashion', label:'👗 Fashion' }, { id:'academics', label:'📚 Academics' },
];
const YEARS = ['Freshman', 'Sophomore', 'Junior', 'Senior'];
const MIN_FLOOR = 2;

function getValidRooms(floor) {
  return Array.from({ length: 12 }, (_, i) => `${floor}${String(i + 1).padStart(2, '0')}`);
}

export default function SignupForm({ onComplete }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', dorm: 'Witte Hall', floor: '2', room: '201', major: '', year: 'Freshman', hobbies: [],
  });
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [recorded, setRecorded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [transcriptDone, setTranscriptDone] = useState(false);

  const mediaRecRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const blobRef = useRef(null);
  const recordingRef = useRef(false);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');

  const maxFloor = DORM_FLOORS[form.dorm] || 8;
  const validRooms = getValidRooms(parseInt(form.floor));

  function upd(key, val) {
    setForm(f => {
      const next = { ...f, [key]: val };
      if (key === 'dorm') {
        next.floor = String(MIN_FLOOR);
        next.room = `${MIN_FLOOR}01`;
      }
      if (key === 'floor') {
        next.room = `${val}01`;
      }
      return next;
    });
  }

  function toggleHobby(id) {
    setForm(f => ({
      ...f,
      hobbies: f.hobbies.includes(id) ? f.hobbies.filter(h => h !== id) : [...f.hobbies, id],
    }));
  }

  function resetRecording() {
    blobRef.current = null;
    transcriptRef.current = '';
    setLiveTranscript('');
    setTranscriptDone(false);
    setRecorded(false);
    setRecordTime(0);
  }

  async function toggleRecording() {
    if (recordingRef.current) {
      stopRecording();
    } else {
      if (recorded) resetRecording();
      await startRecording();
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      analyserRef.current = analyser;

      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.start();
      mediaRecRef.current = mr;

      recordingRef.current = true;
      setIsRecording(true);
      setRecordTime(0);
      transcriptRef.current = '';
      setLiveTranscript('');
      setTranscriptDone(false);

      // Start Web Speech API transcription alongside audio recording
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        let finalText = '';
        recognition.onresult = (event) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const t = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalText += t + ' ';
            } else {
              interim += t;
            }
          }
          transcriptRef.current = (finalText + interim).trim();
          setLiveTranscript(transcriptRef.current);
        };

        recognition.onerror = (e) => {
          if (e.error !== 'aborted') console.warn('Speech recognition error:', e.error);
        };

        recognition.onend = () => {
          if (transcriptRef.current) setTranscriptDone(true);
        };

        recognition.start();
        recognitionRef.current = recognition;
      }

      timerRef.current = setInterval(() => {
        setRecordTime(prev => {
          if (prev >= 14) {
            stopRecording();
            return 15;
          }
          return prev + 1;
        });
      }, 1000);

      drawWaveform();
    } catch {
      alert('Microphone access is required to record a voice note.');
    }
  }

  function stopRecording() {
    if (!recordingRef.current) return;
    recordingRef.current = false;
    setIsRecording(false);
    clearInterval(timerRef.current);
    cancelAnimationFrame(rafRef.current);

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }

    const mr = mediaRecRef.current;
    if (mr && mr.state !== 'inactive') {
      mr.onstop = () => {
        blobRef.current = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecorded(true);
        if (transcriptRef.current) setTranscriptDone(true);
      };
      mr.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }

  function drawWaveform() {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    const W = cvs.width, H = cvs.height;

    function frame() {
      ctx.clearRect(0, 0, W, H);
      if (analyserRef.current && recordingRef.current) {
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteTimeDomainData(data);
        const barW = W / data.length * 2.5;
        for (let i = 0; i < data.length; i++) {
          const v = data[i] / 255;
          const h = Math.max(2, v * H * 0.85);
          const x = i * barW;
          if (x > W) break;
          ctx.fillStyle = '#c5050c';
          ctx.globalAlpha = 0.5 + v * 0.5;
          ctx.fillRect(x, (H - h) / 2, Math.max(1, barW - 1), h);
        }
        ctx.globalAlpha = 1;
      }
      if (recordingRef.current) {
        rafRef.current = requestAnimationFrame(frame);
      }
    }
    rafRef.current = requestAnimationFrame(frame);
  }

  async function handleSubmit() {
    if (!form.name || !form.room || !form.major) return;
    setSubmitting(true);

    try {
      const realTranscript = transcriptRef.current?.trim();
      const fallbackTranscript = form.hobbies.length
        ? "Looking to meet my neighbors! I love " + form.hobbies.join(' and ') + ". " + form.major + " major here."
        : "Looking to meet my neighbors!";
      const transcript = realTranscript || fallbackTranscript;

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          major: form.major,
          year: form.year,
          hobbies: form.hobbies,
        }),
      });
      const analysis = await res.json();

      const user = {
        id: 'user_' + Date.now(),
        name: form.name,
        dorm: form.dorm,
        floor: parseInt(form.floor),
        room: form.room,
        major: form.major,
        year: form.year,
        hobbies: form.hobbies,
        transcript,
        summary: analysis.summary,
        features: analysis,
        blobUrl: blobRef.current ? URL.createObjectURL(blobRef.current) : null,
      };

      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });

      onComplete(user);
    } catch (err) {
      console.error('Signup error:', err);
      setSubmitting(false);
    }
  }

  const canProceed = step === 1
    ? form.name && form.room && form.major
    : form.hobbies.length > 0;

  return (
    <div className="flex items-start justify-center px-4 pt-6 pb-4">
      <div className="w-full max-w-md fade-in">
        <div className="glass-card rounded-2xl p-6 shimmer-border">
          <div className="text-center mb-6">
            <h2 className="text-xl font-black bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Welcome to HelloNeighbour</h2>
            <p className="text-xs text-white/40 mt-0.5">Tell us a bit about yourself</p>
            <div className="flex justify-center gap-2 mt-3">
              <div className={`w-14 h-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-gradient-to-r from-uwred to-rose-500 shadow-sm shadow-uwred/30' : 'bg-white/10'}`} />
              <div className={`w-14 h-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-gradient-to-r from-uwred to-rose-500 shadow-sm shadow-uwred/30' : 'bg-white/10'}`} />
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-3 fade-in">
              <div>
                <label className="block text-[11px] font-semibold text-white/50 mb-1">First Name</label>
                <input value={form.name} onChange={e => upd('name', e.target.value)}
                  placeholder="What should people call you?"
                  className="w-full px-3 py-2.5 rounded-lg glass-input text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-white/50 mb-1">Dorm</label>
                  <select value={form.dorm} onChange={e => upd('dorm', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg glass-input text-sm">
                    {DORMS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-white/50 mb-1">Floor</label>
                  <select value={form.floor} onChange={e => upd('floor', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg glass-input text-sm">
                    {Array.from({ length: maxFloor - MIN_FLOOR + 1 }, (_, i) => i + MIN_FLOOR).map(f =>
                      <option key={f} value={f}>Floor {f}</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-white/50 mb-1">Room Number</label>
                <select value={form.room} onChange={e => upd('room', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg glass-input text-sm">
                  {validRooms.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-white/50 mb-1">Major</label>
                  <input value={form.major} onChange={e => upd('major', e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full px-3 py-2.5 rounded-lg glass-input text-sm" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-white/50 mb-1">Year</label>
                  <select value={form.year} onChange={e => upd('year', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg glass-input text-sm">
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <button onClick={() => setStep(2)} disabled={!canProceed}
                className="w-full py-2.5 rounded-lg font-bold text-white btn-glow mt-1 text-sm">
                Next →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 fade-in">
              <div>
                <label className="block text-[11px] font-semibold text-white/50 mb-1.5">Pick your hobbies</label>
                <div className="flex flex-wrap gap-1.5">
                  {HOBBIES.map(h => (
                    <button key={h.id} onClick={() => toggleHobby(h.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-300
                        ${form.hobbies.includes(h.id)
                          ? 'bg-uwred/80 text-white border-uwred/60 shadow-sm shadow-uwred/20'
                          : 'bg-white/5 text-white/50 border-white/10 hover:border-uwred/40 hover:text-white/70'}`}>
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-white/50 mb-1">Record a voice note <span className="text-white/20">(optional)</span></label>
                <p className="text-[11px] text-white/30 mb-2">15 seconds about yourself — tap to start, tap again to stop</p>

                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    {isRecording && (
                      <>
                        <div className="ripple-ring" />
                        <div className="ripple-ring" style={{ animationDelay: '0.35s' }} />
                      </>
                    )}
                    <button
                      onClick={toggleRecording}
                      className={`relative w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xs select-none transition-all
                        ${recorded ? '' : isRecording ? 'record-active' : 'breathe'}`}
                      style={{
                        background: recorded ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                          : isRecording ? 'radial-gradient(circle, #ff2222, #c5050c)'
                          : 'radial-gradient(circle, #c5050c, #8a0308)',
                        border: '3px solid rgba(255,255,255,0.15)',
                        boxShadow: isRecording ? '0 0 30px rgba(197,5,12,0.4)' : recorded ? '0 0 20px rgba(34,197,94,0.3)' : '0 0 20px rgba(197,5,12,0.2)',
                      }}>
                      {recorded ? '✓' : isRecording ? `${15 - recordTime}s` : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                        </svg>
                      )}
                    </button>
                  </div>

                  {isRecording ? (
                    <div className="flex-1 space-y-1">
                      <canvas ref={canvasRef} width="260" height="40"
                        className="w-full rounded-lg" style={{ background:'rgba(255,255,255,0.05)', height: 40 }} />
                      {liveTranscript && (
                        <p className="text-[11px] text-uwred/80 italic leading-tight animate-pulse">
                          &ldquo;{liveTranscript}&rdquo;
                        </p>
                      )}
                    </div>
                  ) : recorded ? (
                    <div className="flex-1">
                      <p className="text-xs text-green-400/80">✅ Voice note recorded!</p>
                      <button onClick={resetRecording} className="text-[11px] text-uwred font-semibold mt-0.5 hover:underline">
                        Re-record
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-white/30">Tap the mic to start recording</p>
                  )}
                </div>

                {transcriptDone && liveTranscript && (
                  <div className="mt-2 p-2.5 rounded-lg glass border border-white/10">
                    <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wide mb-1">Transcribed from your voice</p>
                    <p className="text-xs text-white/60 leading-relaxed">&ldquo;{liveTranscript}&rdquo;</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2.5 mt-2">
                <button onClick={() => setStep(1)}
                  className="flex-1 py-2.5 rounded-lg font-bold text-white/60 bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm">
                  ← Back
                </button>
                <button onClick={handleSubmit} disabled={!canProceed || submitting}
                  className="flex-1 py-2.5 rounded-lg font-bold text-white btn-glow text-sm">
                  {submitting ? 'Setting up...' : 'Join Your Floor →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
