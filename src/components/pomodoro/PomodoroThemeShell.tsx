"use client";

import { useSyncExternalStore } from "react";

import { POMODORO_THEMES } from "@/config/pomodoroThemes";

import { PomodoroAmbientAudio } from "./PomodoroAmbientAudio";
import { PomodoroThemeBackground } from "./PomodoroThemeBackground";
import { PomodoroThemePicker } from "./PomodoroThemePicker";
import { themeStore } from "./themeStore";

export function PomodoroThemeShell({ children }: { children: React.ReactNode }) {
  const themeId = useSyncExternalStore(themeStore.subscribe, themeStore.getSnapshot, () => "none");
  const theme = POMODORO_THEMES.find((t) => t.id === themeId) ?? null;

  // AppShell renders this page's <main> content with no padding wrapper
  // (special-cased there specifically so this can genuinely fill the region
  // edge-to-edge with plain `min-h-full`, no `fixed`/z-index needed).
  return (
    <div className="relative min-h-full">
      {theme && <PomodoroThemeBackground theme={theme} />}

      <div className="relative z-10 flex flex-col items-center justify-start p-4 lg:p-8">
        <div className="w-full max-w-4xl">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
            <PomodoroThemePicker current={themeId} onSelect={themeStore.set} />
            {theme && <PomodoroAmbientAudio key={theme.audioSrc} src={theme.audioSrc} />}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
