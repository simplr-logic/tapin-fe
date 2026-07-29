import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

import type { TimesheetRecord } from "@/components/providers/TimesheetProvider";
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
} as const;

const LEGEND = [
  { label: "Under target", swatch: "bg-yellow/14" },
  { label: "On target", swatch: "bg-success/18" },
  { label: "Exceeded", swatch: "bg-error/18" },
  { label: "No log", swatch: "bg-surface-2" },
] as const;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function TimesheetDayBtn({ day: _day, modifiers, className, ...props }: DayButtonProps) {
  const paletteClass = modifiers.exceeded
    ? DAY_CLASSES.exceeded
    : modifiers.onTarget
      ? DAY_CLASSES.onTarget
      : modifiers.underTarget
        ? DAY_CLASSES.underTarget
        : DAY_CLASSES.noLog;

  return (
    <Button
      type="button"
      variant="ghost"
      {...props}
      className={cn(
        "h-auto flex aspect-square w-full items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none",
        paletteClass,
        modifiers.outside && "opacity-30",
        modifiers.disabled && "pointer-events-none opacity-30",
        modifiers.selected ? "ring-2 ring-kale" : "",
        className
      )}
    />
  );
}

export function TimesheetMonthCalendar({
  record,
  selectedDate,
  onSelect,
}: {
  record: TimesheetRecord;
  selectedDate: Date | undefined;
  onSelect: (d: Date | undefined) => void;
}) {
  const [year, monthNum] = record.monthKey.split("-").map(Number);
  const monthStart = new Date(year, monthNum - 1, 1);

  const dailyMins = useMemo(() => {
    const totals = new Map<string, number>();
    for (const p of record.projects) {
      for (const [date, mins] of Object.entries(p.logs ?? {})) {
        totals.set(date, (totals.get(date) ?? 0) + mins);
      }
    }
    return totals;
  }, [record]);

  const modifiers = useMemo(() => {
    const exceeded: Date[] = [],
      onTarget: Date[] = [],
      underTarget: Date[] = [];
    for (const [iso, mins] of dailyMins) {
      const d = new Date(`${iso}T00:00:00`);
      if (isNaN(d.getTime())) continue;
      if (mins >= EXCEEDED_THRESHOLD) exceeded.push(d);
      else if (mins >= DAILY_TARGET) onTarget.push(d);
      else underTarget.push(d);
    }
    return { exceeded, onTarget, underTarget };
  }, [dailyMins]);

  const totalMins = useMemo(
    () => Array.from(dailyMins.values()).reduce((s, v) => s + v, 0),
    [dailyMins]
  );
  const activeDays = dailyMins.size;

  return (
    <>
      <div className="px-2 py-3 max-w-75 mx-auto">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onSelect}
          month={monthStart}
          hideNavigation
          showOutsideDays={false}
          modifiers={modifiers}
          components={{ DayButton: TimesheetDayBtn }}
          className="w-full rounded-md"
        />
      </div>
      <div className="px-5 pb-3 flex items-center justify-center gap-3 flex-wrap">
        {LEGEND.map((l) => (
          <div key={l.label} className="flex items-center gap-1.5 text-[9px] text-ink-subtle">
            <div className={`w-3 h-3 rounded-sm ${l.swatch}`} />
            {l.label}
          </div>
        ))}
      </div>
      <div className="px-5 pb-4 flex items-center justify-between text-[10px] text-ink-subtle border-t border-garden-border pt-3">
        <span>
          {activeDays} active {activeDays === 1 ? "day" : "days"}
        </span>
        <span className="font-semibold text-ink tabular-nums">
          {(totalMins / 60).toFixed(1)}h total
        </span>
      </div>
    </>
  );
}
