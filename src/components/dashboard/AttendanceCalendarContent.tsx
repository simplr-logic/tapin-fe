"use client";

import { useMemo, useState } from "react";

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
  activeWeek: { bg: "rgba(3,54,61,0.07)", text: gardenColors.ink },
  today: { bg: "rgba(3,54,61,0.13)", text: gardenColors.ink },
  disabled: { bg: "transparent", text: gardenColors.inkSubtle },
} as const;

export const ATTENDANCE_LEGEND = [
  { label: "Under target", bg: DAY_COLORS.underTarget.bg },
  { label: "On target", bg: DAY_COLORS.onTarget.bg },
  { label: "Exceeded", bg: DAY_COLORS.exceeded.bg },
  { label: "No log", bg: DAY_COLORS.noLog.bg },
] as const;

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
            : modifiers.activeWeek
              ? DAY_COLORS.activeWeek
              : DAY_COLORS.noLog;

  const BAND = "rgba(3,54,61,0.45)";
  const bandShadow = modifiers.activeWeek
    ? [
        `inset 0 2px 0 ${BAND}`,
        `inset 0 -2px 0 ${BAND}`,
        ...(modifiers.weekStart ? [`inset 2px 0 0 ${BAND}`] : []),
        ...(modifiers.weekEnd ? [`inset -2px 0 0 ${BAND}`] : []),
      ].join(", ")
    : undefined;

  return (
    <button
      type="button"
      {...props}
      style={{ backgroundColor: palette.bg, color: palette.text, boxShadow: bandShadow }}
      className={cn(
        "flex aspect-square w-full items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none",
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
        modifiers.selected ? "ring-2 ring-kale" : modifiers.today ? "ring-2 ring-kale/50" : "",
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
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: l.bg }} />
            {l.label}
          </div>
        ))}
      </div>
    </>
  );
}
