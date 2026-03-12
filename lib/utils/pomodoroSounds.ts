let sharedCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!sharedCtx) {
      const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      sharedCtx = new AudioCtx!();
    }
    if (sharedCtx.state === 'suspended') sharedCtx.resume();
    return sharedCtx;
  } catch {
    return null;
  }
}

function tone(ctx: AudioContext, freq: number, startAt: number, vol = 0.25, duration = 0.45) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(vol, startAt + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.05);
}

/**
 * Start sound: two ascending tones C5 → E5 (upbeat, "ready")
 */
export function playTimerStart() {
  const ctx = getCtx();
  if (!ctx) return;
  tone(ctx, 523.25, ctx.currentTime, 0.2);
  tone(ctx, 659.25, ctx.currentTime + 0.18, 0.22);
}

/**
 * End sound: three descending tones G5 → E5 → C5 (completion, more prominent)
 */
export function playTimerEnd() {
  const ctx = getCtx();
  if (!ctx) return;
  tone(ctx, 783.99, ctx.currentTime, 0.3);
  tone(ctx, 659.25, ctx.currentTime + 0.22, 0.27);
  tone(ctx, 523.25, ctx.currentTime + 0.44, 0.24, 0.6);
}
