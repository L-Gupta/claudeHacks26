'use client';
import { useState, useRef, useEffect } from 'react';

const DORMS = [
  'Witte Hall','Sellery Hall','Chadbourne Hall','Dejope Hall',
  'Ogg Hall','Smith Hall','Adams Hall','Tripp Hall',
  'Slichter Hall','Kronshage Hall','Leopold Hall','Cole Hall',
];

const HOBBIES = [
  { id:'music', label:'🎵 Music' },
  { id:'sports', label:'🏀 Sports' },
  { id:'gaming', label:'🎮 Gaming' },
  { id:'art', label:'🎨 Art' },
  { id:'food', label:'🍜 Food' },
  { id:'tech', label:'💻 Tech' },
  { id:'outdoors', label:'🌲 Outdoors' },
  { id:'film', label:'🎬 Film' },
  { id:'fashion', label:'👗 Fashion' },
  { id:'academics', label:'📚 Academics' },
];

const YEARS = ['Freshman', 'Sophomore', 'Junior', 'Senior'];

export default function SignupForm({ onComplete }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', dorm: 'Witte Hall', floor: '2', room: '', major: '', year: 'Freshman', hobbies: [],
  });
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [recorded, setRecorded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const mediaRecRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const blobRef = useRef(null);

  function upd(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function toggleHobby(id) {
    setForm(f => ({
      ...f,
      hobbies: f.hobbies.includes(id)
        ? f.hobbies.filter(h => h !== id)
        : [...f.hobbies, id],
    }));
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
      setIsRecording(true);
      setRecordTime(0);

      timerRef.current = setInterval(() => {
        setRecordTime(prev => {
          if (prev >= 14) { stopRecording(); return 15; }
          return prev + 1;
        });
      }, 1000);

      drawWaveform();
    } catch (err) {
      alert('Microphone access is required to record a voice note.');
    }
  }

  function stopRecording() {
    setIsRecording(false);
    clearInterval(timerRef.current);
    cancelAnimationFrame(rafRef.current);

    const mr = mediaRecRef.current;
    if (mr && mr.state !== 'inactive') {
      mr.onstop = () => {
        blobRef.current = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecorded(true);
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
      if (analyserRef.current) {
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
      rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);
  }

  async function handleSubmit() {
    if (!form.name || !form.room || !form.major) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: recorded
            ? "Hey, I'm looking for cool people on my floor to hang out with. I love " + form.hobbies.join(' and ') + "."
            : "Looking to meet my neighbors!",
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
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg fade-in">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-uwdark">Welcome to HelloNeighbour</h2>
          <p className="text-sm text-gray-500 mt-1">Tell us a bit about yourself</p>
          <div className="flex justify-center gap-2 mt-4">
            <div className={`w-16 h-1.5 rounded-full transition-colors ${step >= 1 ? 'bg-uwred' : 'bg-gray-200'}`} />
            <div className={`w-16 h-1.5 rounded-full transition-colors ${step >= 2 ? 'bg-uwred' : 'bg-gray-200'}`} />
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4 fade-in">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">First Name</label>
              <input value={form.name} onChange={e => upd('name', e.target.value)}
                placeholder="What should people call you?"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-uwdark text-sm focus:outline-none focus:ring-2 focus:ring-uwred/30 focus:border-uwred transition-all" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Dorm</label>
                <select value={form.dorm} onChange={e => upd('dorm', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-uwdark text-sm focus:outline-none focus:ring-2 focus:ring-uwred/30 focus:border-uwred transition-all">
                  {DORMS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Floor</label>
                <select value={form.floor} onChange={e => upd('floor', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-uwdark text-sm focus:outline-none focus:ring-2 focus:ring-uwred/30 focus:border-uwred transition-all">
                  {[1,2,3,4,5,6,7,8].map(f => <option key={f} value={f}>Floor {f}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Room Number</label>
              <input value={form.room} onChange={e => upd('room', e.target.value)}
                placeholder="e.g. 205"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-uwdark text-sm focus:outline-none focus:ring-2 focus:ring-uwred/30 focus:border-uwred transition-all" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Major</label>
                <input value={form.major} onChange={e => upd('major', e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-uwdark text-sm focus:outline-none focus:ring-2 focus:ring-uwred/30 focus:border-uwred transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Year</label>
                <select value={form.year} onChange={e => upd('year', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-uwdark text-sm focus:outline-none focus:ring-2 focus:ring-uwred/30 focus:border-uwred transition-all">
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <button onClick={() => setStep(2)} disabled={!canProceed}
              className="w-full py-3 rounded-xl font-bold text-white bg-uwred hover:brightness-110 disabled:opacity-40 transition-all mt-2">
              Next →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 fade-in">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Pick your hobbies</label>
              <div className="flex flex-wrap gap-2">
                {HOBBIES.map(h => (
                  <button key={h.id} onClick={() => toggleHobby(h.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all
                      ${form.hobbies.includes(h.id)
                        ? 'bg-uwred text-white border-uwred'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-uwred/50'}`}>
                    {h.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Record a voice note (optional)</label>
              <p className="text-xs text-gray-400 mb-3">15 seconds about yourself — what makes you, you?</p>

              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  {isRecording && (
                    <>
                      <div className="ripple-ring" />
                      <div className="ripple-ring" style={{ animationDelay: '0.35s' }} />
                    </>
                  )}
                  <button
                    onMouseDown={!recorded ? startRecording : undefined}
                    onMouseUp={isRecording ? stopRecording : undefined}
                    onTouchStart={!recorded ? startRecording : undefined}
                    onTouchEnd={isRecording ? stopRecording : undefined}
                    disabled={recorded}
                    className={`relative w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xs select-none transition-all
                      ${recorded ? 'bg-green-500' : isRecording ? 'record-active' : 'breathe'}`}
                    style={{
                      background: recorded ? '#22c55e'
                        : isRecording ? 'radial-gradient(circle, #ff2222, #c5050c)'
                        : 'radial-gradient(circle, #c5050c, #8a0308)',
                      border: '3px solid rgba(255,255,255,0.2)',
                      touchAction: 'none',
                    }}>
                    {recorded ? '✓' : isRecording ? `${15 - recordTime}s` : (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  {recorded ? 'Voice note recorded!' : isRecording ? 'Release to stop' : 'Hold to record'}
                </p>
              </div>

              {isRecording && (
                <canvas ref={canvasRef} width="300" height="48"
                  className="mt-3 mx-auto block rounded-lg" style={{ background:'#f0f0ee' }} />
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all">
                ← Back
              </button>
              <button onClick={handleSubmit} disabled={!canProceed || submitting}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-uwred hover:brightness-110 disabled:opacity-40 transition-all">
                {submitting ? 'Setting up...' : 'Join Your Floor →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
