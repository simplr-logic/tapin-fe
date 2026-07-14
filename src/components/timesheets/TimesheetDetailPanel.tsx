"use client";

import { ArrowLeft, CalendarClock, UserCheck, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Calendar } from "@/components/ui/calendar";
import { gardenColors, getComplianceColor } from "@/config/theme";
import { cn } from "@/lib/utils";

import type {
  TimesheetProjectSnapshot,
  TimesheetRecord,
} from "@/components/providers/TimesheetProvider";
import type { DayButtonProps } from "react-day-picker";

const DAILY_TARGET = 480;
const EXCEEDED_THRESHOLD = Math.round(DAILY_TARGET * 1.15);

const DAY_COLORS = {
  exceeded: { bg: "rgba(204,51,64,0.18)", text: gardenColors.error },
  onTarget: { bg: "rgba(3,129,83,0.18)", text: gardenColors.success },
  underTarget: { bg: "rgba(202,138,4,0.14)", text: gardenColors.yellow },
  noLog: { bg: gardenColors.surface2, text: gardenColors.inkMuted },
} as const;

const LEGEND = [
  { label: "Under target", bg: DAY_COLORS.underTarget.bg },
  { label: "On target", bg: DAY_COLORS.onTarget.bg },
  { label: "Exceeded", bg: DAY_COLORS.exceeded.bg },
  { label: "No log", bg: DAY_COLORS.noLog.bg },
] as const;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function TimesheetDayBtn({ day: _day, modifiers, className, ...props }: DayButtonProps) {
  const palette = modifiers.exceeded
    ? DAY_COLORS.exceeded
    : modifiers.onTarget
      ? DAY_COLORS.onTarget
      : modifiers.underTarget
        ? DAY_COLORS.underTarget
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
        modifiers.selected ? "ring-2 ring-kale" : "",
        className
      )}
    />
  );
}

function MonthCalendar({
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
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: l.bg }} />
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

function ProjectRow({ p }: { p: TimesheetProjectSnapshot }) {
  const pct = p.targetHours > 0 ? Math.round((p.loggedMinutes / 60 / p.targetHours) * 100) : 0;
  const color = getComplianceColor(pct);
  const h = Math.floor(p.loggedMinutes / 60);
  const m = p.loggedMinutes % 60;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-ink truncate">{p.title}</p>
          <p className="text-[10px] text-ink-subtle truncate">{p.company}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs font-semibold text-ink tabular-nums">
            {m > 0 ? `${h}h ${m}m` : `${h}h`}
            <span className="text-ink-subtle font-normal"> / {p.targetHours}h</span>
          </p>
          <p className="text-[10px] font-bold tabular-nums" style={{ color }}>
            {pct}%
          </p>
        </div>
      </div>
      <div className="h-1 rounded-full bg-surface-2 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(100, pct)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function DayProjectRow({ p, minutes }: { p: TimesheetProjectSnapshot; minutes: number }) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return (
    <div className="flex items-center justify-between gap-2 py-2">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-ink truncate">{p.title}</p>
        <p className="text-[10px] text-ink-subtle truncate">{p.company}</p>
      </div>
      <span className="text-xs font-semibold text-ink tabular-nums shrink-0">
        {m > 0 ? `${h}h ${m}m` : `${h}h`}
      </span>
    </div>
  );
}

export function TimesheetDetailPanel({
  record,
  onBack,
}: {
  record: TimesheetRecord;
  onBack: () => void;
}) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const pct =
    record.totalTargetHours > 0
      ? Math.round((record.totalLoggedHours / record.totalTargetHours) * 100)
      : 0;
  const color = getComplianceColor(pct);

  const dateStr = selectedDate ? selectedDate.toLocaleDateString("en-CA") : null;
  const dayProjects = dateStr
    ? record.projects
        .map((p) => ({ p, minutes: p.logs?.[dateStr] ?? 0 }))
        .filter(({ minutes }) => minutes > 0)
    : null;
  const dayTotal = dayProjects ? dayProjects.reduce((s, { minutes }) => s + minutes, 0) : 0;

  return (
    <div className="bg-white rounded-lg border border-garden-border shadow-card overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-garden-border flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 rounded-md hover:bg-surface-2 text-ink-subtle hover:text-ink transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">{record.monthLabel}</p>
          <div className="flex items-center gap-3 text-[10px] text-ink-subtle mt-0.5 flex-wrap">
            <span className="flex items-center gap-1">
              <UserCheck className="w-3 h-3" />
              {record.submittedBy}
            </span>
            <span className="flex items-center gap-1">
              <CalendarClock className="w-3 h-3" />
              {new Date(record.submittedAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-semibold text-ink tabular-nums">
            {record.totalLoggedHours.toFixed(1)}h
          </p>
          <p className="text-[10px] font-bold tabular-nums" style={{ color }}>
            {pct}%
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="border-b border-garden-border">
          <MonthCalendar record={record} selectedDate={selectedDate} onSelect={setSelectedDate} />
        </div>

        <div className="p-5 space-y-3">
          {dayProjects !== null ? (
            <>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-ink-subtle uppercase tracking-wide font-medium">
                  {selectedDate!.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                  {" · "}
                  <span className="tabular-nums">{(dayTotal / 60).toFixed(1)}h</span>
                </p>
                <button
                  onClick={() => setSelectedDate(undefined)}
                  className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-surface-3 hover:bg-surface-2 border border-garden-border text-ink-muted hover:text-ink transition-colors"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              </div>
              {dayProjects.length === 0 ? (
                <p className="text-xs text-ink-subtle py-2">No hours logged this day.</p>
              ) : (
                <div className="divide-y divide-garden-border">
                  {dayProjects.map(({ p, minutes }) => (
                    <DayProjectRow key={p.id} p={p} minutes={minutes} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-[10px] text-ink-subtle uppercase tracking-wide font-medium">
                Projects · {record.projects.length}
              </p>
              <div className="space-y-4">
                {record.projects.map((p) => (
                  <ProjectRow key={p.id} p={p} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
