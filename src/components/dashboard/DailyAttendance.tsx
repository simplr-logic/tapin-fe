"use client";

import { CalendarIcon, Flame } from "lucide-react";

import { useProjects } from "@/components/providers/ProjectsProvider";

import { AttendanceCalendarContent } from "./AttendanceCalendarContent";

import type { PeriodView } from "@/config/constants";

const periodOptions: PeriodView[] = ["day", "week", "month", "year"];

export default function DailyAttendance({
  selectedDate,
  onDaySelect,
  period,
  onPeriodChange,
  isCurrentPeriod,
  onTodayClick,
}: {
  selectedDate?: Date;
  onDaySelect?: (date: Date) => void;
  period?: PeriodView;
  onPeriodChange?: (p: PeriodView) => void;
  isCurrentPeriod?: boolean;
  onTodayClick?: () => void;
}) {
  const { streak } = useProjects();

  return (
    <div className="bg-white rounded-lg border border-garden-border shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-garden-border">
        <div className="flex items-center justify-between mb-3">
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

        {onPeriodChange && period && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center rounded-md border border-garden-border bg-surface-2 p-0.5">
              {periodOptions.map((p) => (
                <button
                  key={p}
                  onClick={() => onPeriodChange(p)}
                  className={[
                    "px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-all",
                    period === p
                      ? "bg-white shadow-card text-ink border border-garden-border"
                      : "text-ink-subtle hover:text-ink-muted",
                  ].join(" ")}
                >
                  {p}
                </button>
              ))}
            </div>
            {onTodayClick && (
              <button
                onClick={onTodayClick}
                disabled={isCurrentPeriod}
                className="text-xs font-medium text-link hover:text-link-hover disabled:text-ink-subtle disabled:cursor-not-allowed px-1"
              >
                Today
              </button>
            )}
          </div>
        )}
      </div>

      <AttendanceCalendarContent selectedDate={selectedDate} onDaySelect={onDaySelect} />
    </div>
  );
}
