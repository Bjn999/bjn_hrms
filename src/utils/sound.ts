/**
 * High-performance Web Audio API Synthesizer for Notifications.
 * Generates an elegant, crystal-clear dual-tone harmonic chime without any external audio asset dependencies.
 */

const SOUND_STORAGE_KEY = 'bjn_notification_sound_enabled';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }

    return audioCtx;
  } catch (err) {
    console.warn('Web Audio API not supported in this environment:', err);
    return null;
  }
}

/**
 * Check if notification sound is enabled by the user.
 */
export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem(SOUND_STORAGE_KEY);
  return stored === null ? true : stored === 'true';
}

/**
 * Set notification sound state (persisted in localStorage).
 */
export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SOUND_STORAGE_KEY, enabled ? 'true' : 'false');
}

/**
 * Synthesizes and plays a modern, pleasant dual-tone chime.
 */
export function playNotificationSound(): void {
  if (!isSoundEnabled()) return;
  synthesizeChime();
}

/**
 * Test play notification sound (ignores mute setting for previewing).
 */
export function testNotificationSound(): void {
  synthesizeChime();
}

function synthesizeChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // Master Gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.3, now);
    masterGain.connect(ctx.destination);

    // Tone 1 (Warm D5: 587.33 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.exponentialRampToValueAtTime(0.8, now + 0.03);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc1.connect(gain1);
    gain1.connect(masterGain);

    osc1.start(now);
    osc1.stop(now + 0.52);

    // Tone 2 (Crisp A5: 880.00 Hz - Delayed by 90ms)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.09);

    gain2.gain.setValueAtTime(0.001, now + 0.09);
    gain2.gain.exponentialRampToValueAtTime(0.9, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

    osc2.connect(gain2);
    gain2.connect(masterGain);

    osc2.start(now + 0.09);
    osc2.stop(now + 0.87);

    // Tone 3 (Soft harmonic sparkle F#6: 1479.98 Hz - Shimmer effect)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(1479.98, now + 0.15);

    gain3.gain.setValueAtTime(0.001, now + 0.15);
    gain3.gain.exponentialRampToValueAtTime(0.25, now + 0.18);
    gain3.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

    osc3.connect(gain3);
    gain3.connect(masterGain);

    osc3.start(now + 0.15);
    osc3.stop(now + 0.67);
  } catch (err) {
    console.error('Failed to play notification audio chime:', err);
  }
}
