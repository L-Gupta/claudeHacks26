'use client';
import { useState } from 'react';

export default function Header({ user, onProfileClick, onLogout }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="fade-in text-center py-5 px-4 relative bg-gradient-to-b from-uwred to-[#9a0409]">
      <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-md">
        HelloNeighbour
      </h1>
      <p className="text-xs font-medium text-white/70 mt-0.5">On, Wisconsin</p>

      {user && (
        <div className="absolute right-3 top-4">
          <button onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold text-white">
              {user.name?.[0]}
            </div>
            <span className="text-xs text-white/80 font-medium">{user.name}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-white/50">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-white shadow-xl border border-gray-100 overflow-hidden z-50 fade-in" style={{ animation: 'fadeIn 0.15s ease' }}>
                <button onClick={() => { setShowMenu(false); onProfileClick?.(); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-uwdark hover:bg-cream transition-colors text-left">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  My Profile
                </button>
                <div className="h-px bg-gray-100" />
                <button onClick={() => { setShowMenu(false); onLogout?.(); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors text-left">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-red-400">
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
