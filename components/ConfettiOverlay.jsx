'use client';
import { useRef, useEffect } from 'react';

export default function ConfettiOverlay({ active }) {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const raf = useRef(null);

  useEffect(() => {
    if (!active) { particles.current = []; return; }
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    cvs.width = window.innerWidth;
    cvs.height = window.innerHeight;
    const colors = ['#c5050c', '#ffffff', '#e8d5a3', '#ff4444', '#ffcccc'];

    particles.current = Array.from({ length: 180 }, () => ({
      x: Math.random() * cvs.width,
      y: Math.random() * -cvs.height,
      w: 6 + Math.random() * 8,
      h: 4 + Math.random() * 6,
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 5,
      rot: Math.random() * 360,
      vr: (Math.random() - 0.5) * 12,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1,
    }));

    let start = performance.now();
    function frame(now) {
      const dt = Math.min((now - start) / 1000, 0.05);
      start = now;
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      let alive = false;
      for (const p of particles.current) {
        if (p.life <= 0) continue;
        alive = true;
        p.x += p.vx * 60 * dt;
        p.y += p.vy * 60 * dt;
        p.vy += 0.15;
        p.rot += p.vr * 60 * dt;
        p.life -= 0.004;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (alive) raf.current = requestAnimationFrame(frame);
    }
    raf.current = requestAnimationFrame(frame);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [active]);

  if (!active) return null;
  return <canvas ref={canvasRef} className="fixed inset-0 z-[9998] pointer-events-none" />;
}
