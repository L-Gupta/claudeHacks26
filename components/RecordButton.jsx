'use client';

export default function RecordButton({ isRecording, time, onDown, onUp, recorded }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {isRecording && (
          <>
            <div className="ripple-ring" />
            <div className="ripple-ring" style={{ animationDelay: '0.35s' }} />
          </>
        )}
        <button
          onMouseDown={!recorded ? onDown : undefined}
          onMouseUp={isRecording ? onUp : undefined}
          onTouchStart={!recorded ? onDown : undefined}
          onTouchEnd={isRecording ? onUp : undefined}
          disabled={recorded}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-sm select-none
            ${recorded ? '' : isRecording ? 'record-active' : 'breathe'}`}
          style={{
            background: recorded ? '#22c55e'
              : isRecording ? 'radial-gradient(circle, #ff2222, #c5050c)'
              : 'radial-gradient(circle, #c5050c, #8a0308)',
            border: '3px solid rgba(255,255,255,0.25)',
            touchAction: 'none',
          }}>
          {recorded ? '✓' : isRecording ? `${15 - time}s` : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          )}
        </button>
      </div>
      <p className="text-xs text-gray-400 font-medium">
        {recorded ? 'Voice note live!' : isRecording ? 'Release to stop' : 'Hold to record'}
      </p>
    </div>
  );
}
