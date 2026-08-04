// One-off generator for placeholder pomodoro ambience loops — procedurally
// synthesized noise/pad audio, not sourced from anywhere, so there's no
// licensing question. Run with `node scripts/generate-pomodoro-audio.mjs`.
// Safe to delete once real licensed tracks replace these.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const SAMPLE_RATE = 44100;
const DURATION_SEC = 14;
const FADE_SEC = 0.6;
const OUT_DIR = path.join(process.cwd(), "public", "audio", "pomodoro");

function writeWav(filename, samples) {
  const numSamples = samples.length;
  const buffer = Buffer.alloc(44 + numSamples * 2);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32); // block align
  buffer.writeUInt16LE(16, 34); // bits per sample
  buffer.write("data", 36);
  buffer.writeUInt32LE(numSamples * 2, 40);
  for (let i = 0; i < numSamples; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
  }
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(path.join(OUT_DIR, filename), buffer);
  console.log(`wrote ${filename} (${(buffer.length / 1024).toFixed(0)}KB)`);
}

function fadeGain(i, total) {
  const t = i / SAMPLE_RATE;
  const remaining = (total - i) / SAMPLE_RATE;
  if (t < FADE_SEC) return t / FADE_SEC;
  if (remaining < FADE_SEC) return remaining / FADE_SEC;
  return 1;
}

function render(gen) {
  const total = SAMPLE_RATE * DURATION_SEC;
  const out = new Float32Array(total);
  for (let i = 0; i < total; i++) {
    out[i] = gen(i / SAMPLE_RATE, i) * fadeGain(i, total);
  }
  return out;
}

// Leaky-integrated white noise — warm, low rumble (café room tone).
function brownNoise(scale) {
  let last = 0;
  return render(() => {
    const white = Math.random() * 2 - 1;
    last = (last + scale * white) / (1 + scale);
    return last * 3.2;
  });
}

// Plain white noise, gently scaled — rain/hiss.
function whiteNoise(volume) {
  return render(() => (Math.random() * 2 - 1) * volume);
}

// White noise with a slow sine envelope — wave swell.
function waveNoise() {
  let last = 0;
  return render((t) => {
    const white = Math.random() * 2 - 1;
    last = (last + 0.15 * white) / 1.15;
    const swell = 0.55 + 0.45 * Math.sin(2 * Math.PI * 0.09 * t);
    return last * 2.6 * swell;
  });
}

// Soft detuned sine chord + light noise floor — lounge pad.
function chordPad(freqs) {
  return render((t) => {
    const chord = freqs.reduce((sum, f) => sum + Math.sin(2 * Math.PI * f * t), 0) / freqs.length;
    const shimmer = Math.sin(2 * Math.PI * 0.12 * t) * 0.15 + 0.85;
    const noiseFloor = (Math.random() * 2 - 1) * 0.02;
    return chord * 0.5 * shimmer + noiseFloor;
  });
}

// Filtered noise with sparse soft chirps — forest/birdsong hint.
function forestAmbience() {
  let last = 0;
  const total = SAMPLE_RATE * DURATION_SEC;
  const chirps = Array.from({ length: 10 }, () => Math.floor(Math.random() * total));
  return render((t, i) => {
    const white = Math.random() * 2 - 1;
    last = (last + 0.2 * white) / 1.2;
    let signal = last * 2.2;
    for (const start of chirps) {
      const dt = (i - start) / SAMPLE_RATE;
      if (dt >= 0 && dt < 0.18) {
        const freq = 1800 + 400 * Math.sin(dt * 40);
        signal += Math.sin(2 * Math.PI * freq * dt) * Math.exp(-dt * 12) * 0.25;
      }
    }
    return signal;
  });
}

writeWav("cafe.wav", brownNoise(0.35));
writeWav("beach.wav", waveNoise());
writeWav("jazz.wav", chordPad([220, 277.18, 329.63, 440]));
writeWav("rain.wav", whiteNoise(0.5));
writeWav("forest.wav", forestAmbience());
