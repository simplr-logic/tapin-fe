"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import type { PomodoroTheme } from "@/config/pomodoroThemes";

// Tries a muted looping video at the theme's conventional path first, falls
// back to the token-based gradient if none exists — same
// graceful-degradation pattern as PomodoroAmbientAudio. No video ships with
// the app (can't source/embed real footage without an explicit source);
// drop one at the path below and it takes over automatically, no code
// changes needed.
export function PomodoroThemeBackground({ theme }: { theme: PomodoroTheme }) {
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {videoFailed ? (
        <div className={cn("absolute inset-0", theme.bgClassName)}>
          <div className="absolute -top-16 -right-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute top-1/3 right-1/4 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        </div>
      ) : (
        <>
          {}
          <video
            key={theme.videoSrc}
            className="absolute inset-0 h-full w-full object-cover"
            src={theme.videoSrc}
            muted
            loop
            autoPlay
            playsInline
            onError={() => setVideoFailed(true)}
          />
          <div className="absolute inset-0 bg-black/15" />
        </>
      )}
    </div>
  );
}
