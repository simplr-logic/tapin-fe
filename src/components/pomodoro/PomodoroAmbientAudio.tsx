"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const FADE_IN_MS = 800;
const FADE_OUT_MS = 500;
const DEFAULT_VOLUME = 60;

// Ships with procedurally generated placeholder loops (see
// pomodoroThemes.ts) rather than real licensed tracks. Still degrades
// gracefully via onError if a file is ever missing/fails to load, so
// swapping in real audio later — or a file going missing — never breaks
// this, just falls back to the disabled state below.
//
// The caller (PomodoroThemeShell) keys this component by `src` so switching
// themes remounts it with fresh state, instead of syncing via an effect.
export function PomodoroAmbientAudio({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [available, setAvailable] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);

  useEffect(() => {
    return () => {
      if (fadeRef.current) clearInterval(fadeRef.current);
    };
  }, []);

  function fade(from: number, to: number, durationMs: number, onDone?: () => void) {
    const el = audioRef.current;
    if (!el) return;
    if (fadeRef.current) clearInterval(fadeRef.current);
    const steps = 16;
    let i = 0;
    fadeRef.current = setInterval(() => {
      i++;
      el.volume = Math.max(0, Math.min(1, from + ((to - from) * i) / steps));
      if (i >= steps) {
        if (fadeRef.current) clearInterval(fadeRef.current);
        fadeRef.current = null;
        onDone?.();
      }
    }, durationMs / steps);
  }

  if (!available) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled
        title={`Add a file at ${src} to enable ambience`}
        className="h-auto gap-1.5 px-2.5 py-1 text-[10px] font-medium"
      >
        <VolumeX className="w-3 h-3" />
        No ambience track yet
      </Button>
    );
  }

  function toggle() {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      fade(el.volume, 0, FADE_OUT_MS, () => el.pause());
      setPlaying(false);
    } else {
      el.volume = 0;
      el.play()
        .then(() => fade(0, volume / 100, FADE_IN_MS))
        .catch(() => setAvailable(false));
      setPlaying(true);
    }
  }

  function handleVolumeChange(next: number | readonly number[]) {
    const v = typeof next === "number" ? next : (next[0] ?? DEFAULT_VOLUME);
    setVolume(v);
    if (audioRef.current && playing && !fadeRef.current) {
      audioRef.current.volume = v / 100;
    }
  }

  return (
    <div className="flex items-center gap-2">
      <audio ref={audioRef} src={src} loop onError={() => setAvailable(false)} />
      <Button
        type="button"
        variant={playing ? "default" : "outline"}
        size="sm"
        onClick={toggle}
        title={playing ? "Pause ambience" : "Play ambience"}
        className="h-auto gap-1.5 px-2.5 py-1 text-[11px] font-medium"
      >
        {playing ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
        {playing ? "Ambience playing" : "Play ambience"}
      </Button>
      {playing && (
        <Slider
          value={[volume]}
          onValueChange={handleVolumeChange}
          min={0}
          max={100}
          step={5}
          className="w-20"
          aria-label="Ambience volume"
        />
      )}
    </div>
  );
}
