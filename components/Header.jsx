'use client';

export default function Header({ user }) {
  return (
    <header className="fade-in text-center py-5 px-4 relative bg-gradient-to-b from-uwred to-[#9a0409]">
      <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-md">
        HelloNeighbour
      </h1>
      <p className="text-xs font-medium text-white/70 mt-0.5">On, Wisconsin 🦡</p>
      {user && (
        <div className="absolute right-4 top-3.5 text-right">
          <div className="text-xs font-semibold text-white/90">{user.name}</div>
          <div className="text-[10px] text-white/50">{user.dorm} · Room {user.room}</div>
        </div>
      )}
    </header>
  );
}
