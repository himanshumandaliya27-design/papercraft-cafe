/**
 * Boutique Web Audio synthesizer for warm cafe notifications
 * Zero external audio files required.
 * Offers 3 distinct sound profiles + mute, stored per terminal in localStorage.
 */

export type ChimeOption = 'brass-bell' | 'soft-marimba' | 'modern-digital' | 'mute';

export const CHIME_OPTIONS: { id: ChimeOption; label: string; description: string }[] = [
  { id: 'brass-bell', label: 'Antique Brass Bell', description: 'Warm counter-service bell with natural harmonics' },
  { id: 'soft-marimba', label: 'Artisan Wood Marimba', description: 'Mellow wooden chord with gentle resonance' },
  { id: 'modern-digital', label: 'Modern Register Ping', description: 'Crisp two-tone electronic POS confirmation' },
  { id: 'mute', label: 'Muted (Silent)', description: 'No audio alerts; visual alerts only' },
];

let cachedAudioContext: AudioContext | null = null;
let audioUnlocked = false;

export function isAudioUnlocked(): boolean {
  return audioUnlocked;
}

/**
 * Explicitly unlocks the Web Audio API on first user gesture.
 * Resolves browser autoplay restrictions.
 */
export function unlockAudioContext(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return false;

    if (!cachedAudioContext) {
      cachedAudioContext = new AudioContextClass();
    }
    if (cachedAudioContext.state === 'suspended') {
      cachedAudioContext.resume().then(() => {
        audioUnlocked = true;
      });
    } else {
      audioUnlocked = true;
    }
    return true;
  } catch (err) {
    console.debug('Audio unlock error:', err);
    return false;
  }
}

export function getChimeSoundPreference(): ChimeOption {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('atelier_chime_sound');
    if (saved === 'brass-bell' || saved === 'soft-marimba' || saved === 'modern-digital' || saved === 'mute') {
      return saved;
    }
  }
  return 'brass-bell';
}

export function setChimeSoundPreference(option: ChimeOption): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('atelier_chime_sound', option);
  }
}

export function playOrderAlertChime(overrideOption?: ChimeOption) {
  if (typeof window === 'undefined') return;
  const chosenSound = overrideOption || getChimeSoundPreference();
  if (chosenSound === 'mute') return;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    if (chosenSound === 'brass-bell') {
      // 1. Fundamental brass counter service bell (A5, E6, A6 harmonics)
      const tones = [880, 1320, 1760];
      tones.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const delay = idx * 0.04;
        const initialVol = idx === 0 ? 0.35 : 0.15;

        gain.gain.setValueAtTime(0, ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(initialVol, ctx.currentTime + delay + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 1.3);
      });
    } else if (chosenSound === 'soft-marimba') {
      // 2. Warm wooden marimba chord (C5, E5, G5, B5)
      const notes = [523.25, 659.25, 783.99, 987.77];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const delay = idx * 0.07;
        gain.gain.setValueAtTime(0, ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + delay + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + 0.7);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.75);
      });
    } else if (chosenSound === 'modern-digital') {
      // 3. Crisp modern double-tone digital chime
      const tones = [1046.5, 1567.98]; // C6 then G6
      tones.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const delay = idx * 0.1;
        gain.gain.setValueAtTime(0, ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + delay + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.5);
      });
    }
  } catch (e) {
    console.debug('Audio chime notification bypassed:', e);
  }
}
