"use client";

import { useMemo, useState } from "react";

import { useProjects } from "@/components/providers/ProjectsProvider";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

import type { DayButtonProps } from "react-day-picker";

const DAILY_TARGET = 480;
const EXCEEDED_THRESHOLD = Math.round(DAILY_TARGET * 1.15);

// Tailwind classes (not inline hex/rgba) so every day cell resolves through
// the theme-aware color tokens and stays legible in dark mode.
const DAY_CLASSES = {
  exceeded: "bg-error/18 text-error",
  onTarget: "bg-success/18 text-success",
  underTarget: "bg-yellow/14 text-yellow",
  noLog: "bg-surface-2 text-ink-muted",
  activeWeek: "bg-primary/8 text-ink",
  today: "bg-primary/14 text-ink",
  disabled: "text-ink-subtle",
} as const;

export const ATTENDANCE_LEGEND = [
  { label: "Under target", swatch: "bg-yellow/14" },
  { label: "On target", swatch: "bg-success/18" },
  { label: "Exceeded", swatch: "bg-error/18" },
  { label: "No log", swatch: "bg-surface-2" },
] as const;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function CheckinDayBtn({ day: _day, modifiers, className, ...props }: DayButtonProps) {
  const paletteClass = modifiers.disabled
    ? DAY_CLASSES.disabled
    : modifiers.exceeded
      ? DAY_CLASSES.exceeded
      : modifiers.onTarget
        ? DAY_CLASSES.onTarget
        : modifiers.underTarget
          ? DAY_CLASSES.underTarget
          : modifiers.today
            ? DAY_CLASSES.today
            : modifiers.activeWeek
              ? DAY_CLASSES.activeWeek
              : DAY_CLASSES.noLog;

  const BAND = "color-mix(in srgb, var(--color-primary) 55%, transparent)";
  const bandShadow = modifiers.activeWeek
    ? [
        `inset 0 2px 0 ${BAND}`,
        `inset 0 -2px 0 ${BAND}`,
        ...(modifiers.weekStart ? [`inset 2px 0 0 ${BAND}`] : []),
        ...(modifiers.weekEnd ? [`inset -2px 0 0 ${BAND}`] : []),
      ].join(", ")
    : undefined;

  return (
    <Button
      type="button"
      variant="ghost"
      {...props}
      style={{ boxShadow: bandShadow }}
      className={cn(
        "h-auto flex aspect-square w-full items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none",
        paletteClass,
        modifiers.activeWeek
          ? modifiers.weekStart && modifiers.weekEnd
            ? "rounded-md"
            : modifiers.weekStart
              ? "rounded-l-md rounded-r-none"
              : modifiers.weekEnd
                ? "rounded-l-none rounded-r-md"
                : "rounded-none"
          : "rounded-md",
        modifiers.outside && "opacity-30",
        modifiers.disabled && "pointer-events-none opacity-30",
        modifiers.selected
          ? "ring-2 ring-primary"
          : modifiers.today
            ? "ring-2 ring-primary/50"
            : "",
        className
      )}
    />
  );
}

export function AttendanceCalendarContent({
  selectedDate,
  onDaySelect,
  weekRange,
}: {
  selectedDate?: Date;
  onDaySelect?: (date: Date) => void;
  weekRange?: { start: string; end: string };
}) {
  const { projects } = useProjects();
  const [month, setMonth] = useState<Date>(() => selectedDate ?? new Date());

  const logs = useMemo<Record<string, number>>(() => {
    const totals: Record<string, number> = {};
    for (const p of projects) {
      for (const [date, minutes] of Object.entries(p.logs)) {
        totals[date] = (totals[date] ?? 0) + minutes;
      }
    }
    return totals;
  }, [projects]);

  const modifiers = useMemo(() => {
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
    const activeWeek: Date[] = [];
    const weekStart: Date[] = [];
    const weekEnd: Date[] = [];
    if (weekRange) {
      const cur = new Date(`${weekRange.start}T00:00:00`);
      const end = new Date(`${weekRange.end}T00:00:00`);
      weekStart.push(new Date(cur));
      weekEnd.push(new Date(end));
      while (cur <= end) {
        activeWeek.push(new Date(cur));
        cur.setDate(cur.getDate() + 1);
      }
    }
    return { exceeded, onTarget, underTarget, activeWeek, weekStart, weekEnd };
  }, [logs, weekRange]);

  return (
    <>
      <div className="px-2 py-3">
        <Calendar
          mode="single"
          selected={selectedDate}
          month={month}
          onMonthChange={setMonth}
          onSelect={(d) => {
            if (!d) return;
            onDaySelect?.(d);
            setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
          }}
          modifiers={modifiers}
          components={{ DayButton: CheckinDayBtn }}
          className="w-full"
        />
      </div>
      <div className="px-5 pb-4 flex items-center justify-center gap-3 flex-wrap">
        {ATTENDANCE_LEGEND.map((l) => (
          <div key={l.label} className="flex items-center gap-1.5 text-[9px] text-ink-subtle">
            <div className={cn("w-3 h-3 rounded-sm", l.swatch)} />
            {l.label}
          </div>
        ))}
      </div>
    </>
  );
}
