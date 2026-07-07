"use client";

import { LayoutGrid, TrendingUp, CalendarDays, Clock, Plus, Palmtree, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { gardenColors } from "@/config/theme";

import { getPeriodLabel, stripTime, weekEnd } from "./utils";

import type { ViewMode } from "./types";
import type { TapUnit, PeriodView } from "@/config/constants";

interface RosterControlsProps {
  view: ViewMode;
  setView: (v: ViewMode) => void;
  tap: TapUnit;
  setTap: (t: TapUnit) => void;
  period: PeriodView;
  changePeriod: (p: PeriodView) => void;
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  isDatePickerOpen: boolean;
  setIsDatePickerOpen: (open: boolean) => void;
  periodLocked: boolean;
  isCurrentPeriod: boolean;
  totalLogged: number;
  totalTarget: number;
  overallPct: number;
  onAddSpecialDay: () => void;
  onNewProject: () => void;
}

const tapOptions: TapUnit[] = ["30m", "1h", "2h"];
const periodOptions: PeriodView[] = ["week", "month", "year"];

export function RosterControls({
  view,
  setView,
  tap,
  setTap,
  period,
  changePeriod,
  selectedDate,
  setSelectedDate,
  isDatePickerOpen,
  setIsDatePickerOpen,
  periodLocked,
  isCurrentPeriod,
  totalLogged,
  totalTarget,
  overallPct,
  onAddSpecialDay,
  onNewProject,
}: RosterControlsProps) {
  return (
    <div className="px-5 py-4 border-b border-garden-border space-y-3">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-ink-muted text-xs font-medium tracking-wide uppercase">
          <LayoutGrid className="w-3.5 h-3.5" />
          Weekly Roster Allocation Grid
        </div>

        <div className="flex items-center gap-2 flex-wrap overflow-x-auto">
          {/* View toggle */}
          <div className="flex items-center rounded-md border border-garden-border bg-surface-2 p-0.5">
            {(["grid", "progress"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={[
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                  view === v
                    ? "bg-white shadow-card text-ink border border-garden-border"
                    : "text-ink-subtle hover:text-ink-muted",
                ].join(" ")}
              >
                {v === "grid" ? (
                  <LayoutGrid className="w-3 h-3" />
                ) : (
                  <TrendingUp className="w-3 h-3" />
                )}
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>

          {/* TAP unit */}
          <div className="flex items-center gap-1 rounded-md border border-garden-border bg-surface-2 p-0.5">
            <span className="pl-1.5 text-[10px] text-ink-subtle font-medium">TAP</span>
            {tapOptions.map((t) => (
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

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap overflow-x-auto">
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
              {/* Month/Year granularity reuse the Calendar's own built-in
                  dropdown captions to jump around — same control, just a
                  different caption mode, instead of a hand-rolled picker.
                  Whatever day gets clicked, only its month/year matters. */}
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
                          const start = stripTime(selectedDate);
                          const end = weekEnd(start);
                          const d = stripTime(day);
                          return d > start && d <= end;
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
          <div className="flex items-center gap-2 text-xs text-ink-muted mr-2">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-medium">{totalLogged.toFixed(1)}h</span>
            <span className="text-ink-subtle">/</span>
            <span>{totalTarget}h</span>
            <span
              className="font-semibold"
              style={{ color: overallPct >= 100 ? gardenColors.error : gardenColors.success }}
            >
              {overallPct}%
            </span>
          </div>
          <button
            onClick={onAddSpecialDay}
            disabled={periodLocked}
            title={periodLocked ? "Switch to the current week to log holiday/leave" : undefined}
            className="flex items-center gap-1.5 text-xs border border-garden-border rounded-md px-3 py-1.5 hover:bg-surface-2 transition-colors text-ink-muted font-medium disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
          >
            <Palmtree className="w-3.5 h-3.5 text-ink-subtle" />
            Log Holiday/Leave
          </button>
          <button
            onClick={onNewProject}
            disabled={periodLocked}
            title={periodLocked ? "Switch to the current week to add a project" : undefined}
            className="flex items-center gap-1.5 text-xs bg-kale hover:bg-kale-hover text-white rounded-md px-3 py-1.5 transition-colors font-medium shadow-card disabled:opacity-40 disabled:hover:bg-kale disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5" />
            New Project
          </button>
        </div>
      </div>
    </div>
  );
}
