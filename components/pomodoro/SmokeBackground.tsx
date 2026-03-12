'use client';

export function SmokeBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Center ambient glow — pulses slowly */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full animate-smoke-pulse"
        style={{
          background:
            'radial-gradient(circle at center, rgba(245,158,11,0.12) 0%, rgba(234,88,12,0.06) 40%, transparent 70%)',
        }}
      />

      {/* Drifting smoke blobs */}
      <div
        className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full blur-[120px] animate-smoke-1"
        style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full blur-[100px] animate-smoke-2"
        style={{ background: 'radial-gradient(circle, rgba(234,88,12,0.09) 0%, transparent 70%)' }}
      />
      <div
        className="absolute top-2/3 left-1/2 w-64 h-64 rounded-full blur-[80px] animate-smoke-3"
        style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.07) 0%, transparent 70%)' }}
      />

      {/* Subtle dark vignette at edges */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(26,22,20,0.5) 100%)',
        }}
      />
    </div>
  );
}
