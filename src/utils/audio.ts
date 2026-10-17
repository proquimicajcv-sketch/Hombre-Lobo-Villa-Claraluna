/**
 * Web Audio API synthesizer for gothic ambient sounds and game cues.
 * Completely zero-dependency, works cross-browser and offline.
 */

let audioCtx: AudioContext | null = null;
let ambientWindNode: AudioNode | null = null;
let isAudioMuted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function toggleMute(): boolean {
  isAudioMuted = !isAudioMuted;
  if (isAudioMuted && ambientWindNode) {
    stopAmbientWind();
  }
  return isAudioMuted;
}

export function getMuteState(): boolean {
  return isAudioMuted;
}

/**
 * Play a low resonant church bell toll (for Dawn / Day trial / Lynching)
 */
export function playChurchBell() {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const partials = [180, 360, 540, 720, 1100];
  const gains = [0.35, 0.25, 0.15, 0.08, 0.04];

  partials.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = i % 2 === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(gains[i], now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 3.2);
  });
}

/**
 * Play a haunting wolf howl
 */
export function playWolfHowl() {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sawtooth';
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(650, now);

  // Frequency envelope mimicking a wolf howl: rises then gently wavers and falls
  osc.frequency.setValueAtTime(240, now);
  osc.frequency.linearRampToValueAtTime(420, now + 0.6);
  osc.frequency.linearRampToValueAtTime(540, now + 1.2);
  osc.frequency.linearRampToValueAtTime(460, now + 2.0);
  osc.frequency.linearRampToValueAtTime(280, now + 3.0);

  // Gain envelope
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.2, now + 0.5);
  gain.gain.linearRampToValueAtTime(0.25, now + 1.2);
  gain.gain.linearRampToValueAtTime(0.12, now + 2.2);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 3.1);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 3.2);
}

/**
 * Play a mystical celestial chime (Seer card flip / inspection)
 */
export function playMysticChime() {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [587.33, 739.99, 880.0, 1174.66, 1479.98]; // D5, F#5, A5, D6, F#6

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.08);

    gain.gain.setValueAtTime(0.001, now + idx * 0.08);
    gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.08 + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.08);
    osc.stop(now + idx * 0.08 + 1.9);
  });
}

/**
 * Play a dramatic wooden gavel / thud sound (Judgment verdict)
 */
export function playGavelStrike() {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(120, now);
  osc.frequency.exponentialRampToValueAtTime(35, now + 0.25);

  gain.gain.setValueAtTime(0.5, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.35);
}

/**
 * Play a card flip whoosh
 */
export function playCardWhoosh() {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(140, now);
  osc.frequency.linearRampToValueAtTime(320, now + 0.09);
  osc.frequency.linearRampToValueAtTime(110, now + 0.2);

  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(450, now);

  gain.gain.setValueAtTime(0.01, now);
  gain.gain.linearRampToValueAtTime(0.2, now + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.25);
}

/**
 * Play a tactile click/tap
 */
export function playClickSound() {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.06);
}

/**
 * Play a fast rolling dice / card shuffle sound effect
 */
export function playDiceShuffle() {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const clicks = [0, 0.04, 0.09, 0.14, 0.20, 0.26, 0.32];
  clicks.forEach((offset, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const freq = 450 + Math.random() * 350;

    osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, now + offset);
    osc.frequency.exponentialRampToValueAtTime(150, now + offset + 0.04);

    gain.gain.setValueAtTime(0.2, now + offset);
    gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + offset);
    osc.stop(now + offset + 0.05);
  });
}

/**
 * Stop ambient wind
 */
export function stopAmbientWind() {
  if (ambientWindNode) {
    try {
      (ambientWindNode as AudioNode & { stop?: () => void }).stop?.();
    } catch {
      // ignore
    }
    ambientWindNode = null;
  }
}
