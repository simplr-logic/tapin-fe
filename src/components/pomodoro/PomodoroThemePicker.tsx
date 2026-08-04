"use client";

import { Ban } from "lucide-react";

import { Button } from "@/components/ui/button";
import { POMODORO_THEMES } from "@/config/pomodoroThemes";

export function PomodoroThemePicker({
  current,
  onSelect,
}: {
  current: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <Button
        type="button"
        variant={current === "none" ? "default" : "outline"}
        size="sm"
        onClick={() => onSelect("none")}
        className="h-auto gap-1.5 px-2.5 py-1 text-[11px] font-medium"
      >
        <Ban className="w-3 h-3" />
        Off
      </Button>
      {POMODORO_THEMES.map((t) => {
        const Icon = t.icon;
        return (
          <Button
            key={t.id}
            type="button"
            variant={current === t.id ? "default" : "outline"}
            size="sm"
            onClick={() => onSelect(t.id)}
            className="h-auto gap-1.5 px-2.5 py-1 text-[11px] font-medium"
          >
            <Icon className="w-3 h-3" />
            {t.label}
          </Button>
        );
      })}
    </div>
  );
}
