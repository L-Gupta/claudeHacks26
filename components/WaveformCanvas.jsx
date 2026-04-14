'use client';
import { useRef, useEffect } from 'react';

export default function WaveformCanvas({ analyser, playing, color = '#c5050c', bg = '#f5f5f2' }) {
  const canvasRef = useRef(null);
  const raf = useRef(null);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    cvs.width = cvs.offsetWidth * dpr;
    cvs.height = cvs.offsetHeight * dpr;
    ctx.scale(dpr, dpr);
    const W = cvs.offsetWidth, H = cvs.offsetHeight;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      if (analyser && playing) {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteTimeDomainData(data);
        const barW = W / data.length * 2.5;
        for (let i = 0; i < data.length; i++) {
          const v = data[i] / 255;
          const h = Math.max(2, v * H * 0.85);
          const x = i * barW;
          if (x > W) break;
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.5 + v * 0.5;
          ctx.fillRect(x, (H - h) / 2, Math.max(1, barW - 1), h);
        }
        ctx.globalAlpha = 1;
      } else {
        const bars = 40, barW = W / bars;
        for (let i = 0; i < bars; i++) {
          const h = 3 + Math.sin(Date.now() * 0.002 + i * 0.3) * 2;
          ctx.fillStyle = '#ccc';
          ctx.fillRect(i * barW + 1, (H - h) / 2, barW - 2, h);
        }
      }
      raf.current = requestAnimationFrame(draw);
    }
    raf.current = requestAnimationFrame(draw);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [analyser, playing, color]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', background: bg, borderRadius: 8 }} />;
}
