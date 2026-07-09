"use client";

import { CalendarDays, LayoutGrid, List, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { getPeriodLabel, weekEnd, weekStart } from "./utils";

import type { ViewMode } from "./types";
import type { PeriodView, TapUnit } from "@/config/constants";

interface RosterControlsProps {
  period: PeriodView;
  changePeriod: (p: PeriodView) => void;
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  isDatePickerOpen: boolean;
  setIsDatePickerOpen: (open: boolean) => void;
  periodLocked: boolean;
  isCurrentPeriod: boolean;
  view: ViewMode;
  setView: (v: ViewMode) => void;
  tap: TapUnit;
  setTap: (t: TapUnit) => void;
}

const periodOptions: PeriodView[] = ["day", "week", "month", "year"];
const TAP_OPTIONS: TapUnit[] = ["30m", "1h", "2h"];

export function RosterControls({
  period,
  changePeriod,
  selectedDate,
  setSelectedDate,
  isDatePickerOpen,
  setIsDatePickerOpen,
  periodLocked,
  isCurrentPeriod,
  view,
  setView,
  tap,
  setTap,
}: RosterControlsProps) {
  return (
    <div className="px-3 py-2.5 md:px-5 md:py-3 border-b border-garden-border space-y-2">
      <div className="flex items-center gap-2 text-ink-muted text-xs font-medium tracking-wide uppercase">
        <LayoutGrid className="w-3.5 h-3.5" />
        Project Roster
      </div>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {/* Period granularity */}
          <div className="flex items-center rounded-md border border-garden-border bg-surface-2 p-0.5">
            {periodOptions.map((p) => (
              <button
                key={p}
                onClick={() => changePeriod(p)}
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

          {/* Date picker */}
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  className="h-auto py-1.5 px-3 text-xs font-normal text-ink-muted gap-2"
                />
              }
            >
              <CalendarDays className="w-3.5 h-3.5 text-ink-subtle" />
              <span className="font-medium">{getPeriodLabel(period, selectedDate)}</span>
              <span className="w-px h-3 bg-garden-border" />
              {periodLocked ? (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-surface-3 text-ink-muted border border-garden-border-strong flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  Read-only
                </span>
              ) : (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/25">
                  Draft
                </span>
              )}
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                mode="single"
                captionLayout={period === "week" ? "label" : "dropdown"}
                selected={selectedDate}
                onSelect={(d) => {
                  if (d) {
                    setSelectedDate(d);
                    setIsDatePickerOpen(false);
                  }
                }}
                startMonth={new Date(new Date().getFullYear() - 5, 0)}
                endMonth={new Date(new Date().getFullYear() + 5, 11)}
                autoFocus
                modifiers={
                  period === "week"
                    ? {
                        weekTail: (day: Date) => {
                          const start = weekStart(selectedDate);
                          const end = weekEnd(start);
                          const d = new Date(day);
                          d.setHours(0, 0, 0, 0);
                          return d >= start && d <= end;
                        },
                      }
                    : undefined
                }
                modifiersClassNames={{ weekTail: "bg-kale/12 text-kale rounded-none" }}
              />
            </PopoverContent>
          </Popover>

          <button
            onClick={() => setSelectedDate(new Date())}
            disabled={isCurrentPeriod}
            className="text-xs font-medium text-link hover:text-link-hover disabled:text-ink-subtle disabled:cursor-not-allowed px-1"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center rounded-md border border-garden-border bg-surface-2 p-0.5">
            <button
              onClick={() => setView("grid")}
              title="Grid view"
              className={[
                "px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-all",
                view === "grid"
                  ? "bg-white shadow-card text-ink border border-garden-border"
                  : "text-ink-subtle hover:text-ink-muted",
              ].join(" ")}
            >
              <LayoutGrid className="w-3 h-3" />
              Grid
            </button>
            <button
              onClick={() => setView("progress")}
              title="Progress view"
              className={[
                "px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-all",
                view === "progress"
                  ? "bg-white shadow-card text-ink border border-garden-border"
                  : "text-ink-subtle hover:text-ink-muted",
              ].join(" ")}
            >
              <List className="w-3 h-3" />
              Progress
            </button>
          </div>

          {/* TAP selector */}
          <div className="flex items-center gap-1 rounded-md border border-garden-border bg-surface-2 p-0.5">
            <span className="pl-1.5 text-[10px] text-ink-subtle font-medium">TAP</span>
            {TAP_OPTIONS.map((t) => (
              <button
                key={t}
                onClick={() => setTap(t)}
                className={[
                  "px-2 py-1 rounded-md text-xs font-semibold transition-all",
                  tap === t
                    ? "bg-kale text-white shadow-card"
                    : "text-ink-subtle hover:text-ink-muted",
                ].join(" ")}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
