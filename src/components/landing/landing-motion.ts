const LANDING_TAP_SOUND_KEY = "klong-landing-tap-sound";

export function getLandingTapSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(LANDING_TAP_SOUND_KEY) === "on";
}

export function setLandingTapSoundEnabled(enabled: boolean): void {
  window.localStorage.setItem(LANDING_TAP_SOUND_KEY, enabled ? "on" : "off");
  window.dispatchEvent(new Event("klong-landing-tap-sound"));
}

export function subscribeLandingTapSound(onStoreChange: () => void): () => void {
  const handler = () => onStoreChange();
  window.addEventListener("klong-landing-tap-sound", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("klong-landing-tap-sound", handler);
    window.removeEventListener("storage", handler);
  };
}

export function subscribeReducedMotion(onStoreChange: () => void): () => void {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

export function getReducedMotionSnapshot(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function getReducedMotionServerSnapshot(): boolean {
  return false;
}

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    const AudioCtx =
      window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    audioContext = new AudioCtx();
  }
  return audioContext;
}

/** Short crisp tap cue — only call after a user gesture. */
export function playLandingTapSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  void ctx.resume().then(() => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(920, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(640, ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.09);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  });
}

export function triggerLandingTapHaptic(): void {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  navigator.vibrate(12);
}
