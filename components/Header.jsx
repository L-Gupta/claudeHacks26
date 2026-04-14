'use client';
import { useState } from 'react';
import Image from 'next/image';

function BuckyBadgerFallback({ size = 44 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className="inline-block align-middle">
      <ellipse cx="32" cy="34" rx="27" ry="25" fill="#4a4a4a" stroke="#333" strokeWidth="1.5"/>
      <ellipse cx="14" cy="16" rx="7" ry="9" fill="#4a4a4a" stroke="#333" strokeWidth="1" transform="rotate(-12,14,16)"/>
      <ellipse cx="50" cy="16" rx="7" ry="9" fill="#4a4a4a" stroke="#333" strokeWidth="1" transform="rotate(12,50,16)"/>
      <ellipse cx="14" cy="16" rx="4" ry="6" fill="#e8d5a3" transform="rotate(-12,14,16)"/>
      <ellipse cx="50" cy="16" rx="4" ry="6" fill="#e8d5a3" transform="rotate(12,50,16)"/>
      <path d="M7 34 Q14 14 26 11 Q24 22 22 34 Q18 46 12 50 Q6 46 7 34Z" fill="#1a1a1a"/>
      <path d="M57 34 Q50 14 38 11 Q40 22 42 34 Q46 46 52 50 Q58 46 57 34Z" fill="#1a1a1a"/>
      <path d="M32 8 Q36 22 35 38 Q34 50 32 54 Q30 50 29 38 Q28 22 32 8Z" fill="white"/>
      <ellipse cx="22" cy="30" rx="5" ry="5.5" fill="white"/>
      <ellipse cx="42" cy="30" rx="5" ry="5.5" fill="white"/>
      <circle cx="23" cy="30" r="2.5" fill="#c5050c"/>
      <circle cx="43" cy="30" r="2.5" fill="#c5050c"/>
      <circle cx="23.8" cy="29.2" r="0.8" fill="white"/>
      <circle cx="43.8" cy="29.2" r="0.8" fill="white"/>
      <ellipse cx="32" cy="42" rx="5.5" ry="3.5" fill="#222"/>
      <path d="M28 46 Q32 50 36 46" fill="none" stroke="#888" strokeWidth="1" strokeLinecap="round"/>
      <line x1="12" y1="32" x2="4" y2="30" stroke="#ddd" strokeWidth="0.8" strokeLinecap="round"/>
      <line x1="12" y1="35" x2="3" y2="36" stroke="#ddd" strokeWidth="0.8" strokeLinecap="round"/>
      <line x1="52" y1="32" x2="60" y2="30" stroke="#ddd" strokeWidth="0.8" strokeLinecap="round"/>
      <line x1="52" y1="35" x2="61" y2="36" stroke="#ddd" strokeWidth="0.8" strokeLinecap="round"/>
    </svg>
  );
}

export default function Header({ user }) {
  const [imgError, setImgError] = useState(false);

  return (
    <header className="fade-in text-center py-5 px-4 relative bg-gradient-to-b from-uwred to-[#9a0409]">
      <div className="flex items-center justify-center gap-3 mb-1">
        {!imgError ? (
          <Image
            src="/bucky.png"
            alt="Bucky Badger"
            width={44} height={44}
            className="inline-block"
            onError={() => setImgError(true)}
          />
        ) : (
          <BuckyBadgerFallback size={44} />
        )}
        <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-md">
          HelloNeighbour
        </h1>
      </div>
      <p className="text-sm font-medium text-white/75">On, Wisconsin 🦡</p>
      {user && (
        <div className="absolute right-4 top-5 text-xs text-white/60 text-right">
          <div className="font-semibold text-white/80">{user.name}</div>
          <div>Room {user.room}</div>
        </div>
      )}
    </header>
  );
}
