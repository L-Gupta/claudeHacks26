'use client';
import { useState } from 'react';

export default function Header({ user, onProfileClick, onLogout }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="fade-in text-center py-5 px-4 relative glass-strong border-b border-white/5">
      <div className="absolute inset-0 bg-gradient-to-r from-uwred/10 via-transparent to-purple-600/10 pointer-events-none" />

      <h1 className="relative text-2xl font-black tracking-tight bg-gradient-to-r from-white via-uwgold to-white bg-clip-text text-transparent drop-shadow-md gradient-shift">
        HelloNeighbour
      </h1>
      <p className="relative text-xs font-medium text-white/40 mt-0.5 tracking-widest uppercase">On, Wisconsin</p>

      {user && (
        <div className="absolute right-3 top-4 z-20">
          <button onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full glass hover:bg-white/10 transition-all">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-uwred to-rose-500 flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-uwred/20">
              {user.name?.[0]}
            </div>
            <span className="text-xs text-white/70 font-medium">{user.name}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-white/30">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-44 rounded-xl glass-card overflow-hidden z-50 scale-in">
                <button onClick={() => { setShowMenu(false); onProfileClick?.(); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 transition-colors text-left">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white/40">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  My Profile
                </button>
                <div className="h-px bg-white/5" />
                <button onClick={() => { setShowMenu(false); onLogout?.(); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-red-400/70">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Log Out
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
}
