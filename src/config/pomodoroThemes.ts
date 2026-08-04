import { CloudRain, Coffee, Music2, Trees, Waves } from "lucide-react";

export interface PomodoroTheme {
  id: string;
  label: string;
  icon: typeof Coffee;
  // Decorative gradient built only from existing sanctioned design tokens
  // (kale/link/success/warning/surface) — no new hex literals, per the
  // "every color traces back to gardenColors/PALETTES" rule in CLAUDE.md.
  bgClassName: string;
  // Conventional path under public/ — procedurally generated placeholder
  // loops (scripts/generate-pomodoro-audio.mjs), not sourced/downloaded from
  // anywhere, so there's no licensing question. Swap for real licensed
  // tracks at the same path whenever those are sourced; nothing else needs
  // to change.
  audioSrc: string;
  // Conventional path under public/ for a muted looping background video —
  // no file ships (can't source/embed real footage), so PomodoroThemeBackground
  // falls back to `bgClassName`'s gradient via onError until one is added.
  videoSrc: string;
}

export const POMODORO_THEMES: PomodoroTheme[] = [
  {
    id: "cafe",
    label: "Café",
    icon: Coffee,
    bgClassName: "bg-linear-to-br from-warning/25 via-kale-accent/15 to-surface-2",
    audioSrc: "/audio/pomodoro/cafe.wav",
    videoSrc: "/video/pomodoro/cafe.mp4",
  },
  {
    id: "beach",
    label: "Beach",
    icon: Waves,
    bgClassName: "bg-linear-to-br from-link/20 via-success/10 to-surface-2",
    audioSrc: "/audio/pomodoro/beach.wav",
    videoSrc: "/video/pomodoro/beach.mp4",
  },
  {
    id: "jazz",
    label: "Jazz Lounge",
    icon: Music2,
    bgClassName: "bg-linear-to-br from-kale via-kale-accent/60 to-warning/10",
    audioSrc: "/audio/pomodoro/jazz.wav",
    videoSrc: "/video/pomodoro/jazz.mp4",
  },
  {
    id: "rain",
    label: "Rainy Day",
    icon: CloudRain,
    bgClassName: "bg-linear-to-br from-link/15 via-surface-2 to-surface-3",
    audioSrc: "/audio/pomodoro/rain.wav",
    videoSrc: "/video/pomodoro/rain.mp4",
  },
  {
    id: "forest",
    label: "Forest",
    icon: Trees,
    bgClassName: "bg-linear-to-br from-success/20 via-kale-accent/15 to-surface-2",
    audioSrc: "/audio/pomodoro/forest.wav",
    videoSrc: "/video/pomodoro/forest.mp4",
  },
];
