"use client";

import { CalendarIcon, Flame } from "lucide-react";
import { useMemo } from "react";

import { useProjects } from "@/components/providers/ProjectsProvider";
import { Calendar } from "@/components/ui/calendar";
import { gardenColors } from "@/config/theme";
import { cn } from "@/lib/utils";

import type { DayButtonProps } from "react-day-picker";

const DAILY_TARGET = 480;
const EXCEEDED_THRESHOLD = Math.round(DAILY_TARGET * 1.15);

const DAY_COLORS = {
  exceeded: { bg: "rgba(204,51,64,0.18)", text: gardenColors.error },
  onTarget: { bg: "rgba(3,129,83,0.18)", text: gardenColors.success },
  underTarget: { bg: "rgba(202,138,4,0.14)", text: gardenColors.yellow },
  noLog: { bg: gardenColors.surface2, text: gardenColors.inkMuted },
  today: { bg: gardenColors.surface3, text: gardenColors.ink },
  disabled: { bg: "transparent", text: gardenColors.inkSubtle },
} as const;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function CheckinDayBtn({ day: _day, modifiers, className, ...props }: DayButtonProps) {
  const palette = modifiers.disabled
    ? DAY_COLORS.disabled
    : modifiers.exceeded
      ? DAY_COLORS.exceeded
      : modifiers.onTarget
        ? DAY_COLORS.onTarget
        : modifiers.underTarget
          ? DAY_COLORS.underTarget
          : modifiers.today
            ? DAY_COLORS.today
            : DAY_COLORS.noLog;

  return (
    <button
      type="button"
      {...props}
      style={{ backgroundColor: palette.bg, color: palette.text }}
      className={cn(
        "flex aspect-square w-full items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none",
        modifiers.outside && "opacity-30",
        modifiers.disabled && "pointer-events-none opacity-30",
        modifiers.selected
          ? "ring-2 ring-kale"
          : modifiers.today
            ? "ring-1 ring-garden-border"
            : "",
        className
      )}
    />
  );
}

export default function DailyAttendance({
  selectedDate,
  onDaySelect,
}: {
  selectedDate?: Date;
  onDaySelect?: (date: Date) => void;
}) {
  const { projects, streak } = useProjects();

  const logs = useMemo<Record<string, number>>(() => {
    const totals: Record<string, number> = {};
    for (const p of projects) {
      for (const [date, minutes] of Object.entries(p.logs)) {
        totals[date] = (totals[date] ?? 0) + minutes;
      }
    }
    return totals;
  }, [projects]);

  const calendarModifiers = useMemo(() => {
    const exceeded: Date[] = [];
    const onTarget: Date[] = [];
    const underTarget: Date[] = [];
    for (const [iso, minutes] of Object.entries(logs)) {
      const date = new Date(`${iso}T00:00:00`);
      if (isNaN(date.getTime())) continue;
      if (minutes >= EXCEEDED_THRESHOLD) exceeded.push(date);
      else if (minutes >= DAILY_TARGET) onTarget.push(date);
      else underTarget.push(date);
    }
    return { exceeded, onTarget, underTarget };
  }, [logs]);

  return (
    <div className="bg-white rounded-lg border border-garden-border shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-garden-border flex items-center justify-between">
        <div className="flex items-center gap-2 text-ink-muted text-xs font-medium tracking-wide uppercase">
          <CalendarIcon className="w-3.5 h-3.5" />
          Calendar
        </div>
        {streak >= 1 && (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-warning">
            <Flame className="w-3 h-3" />
            {streak}d streak
          </span>
        )}
      </div>

      <div className="px-2 py-3">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(d) => d && onDaySelect?.(d)}
          modifiers={calendarModifiers}
          components={{ DayButton: CheckinDayBtn }}
          className="w-full"
        />
      </div>

      <div className="px-5 pb-4 flex items-center justify-center gap-3 flex-wrap">
        {(
          [
            { label: "Under target", bg: DAY_COLORS.underTarget.bg },
            { label: "On target", bg: DAY_COLORS.onTarget.bg },
            { label: "Exceeded", bg: DAY_COLORS.exceeded.bg },
            { label: "No log", bg: DAY_COLORS.noLog.bg },
          ] as const
        ).map((l) => (
          <div key={l.label} className="flex items-center gap-1.5 text-[9px] text-ink-subtle">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: l.bg }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}
