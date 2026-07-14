"use client";

import { LayoutGrid, List, Palmtree } from "lucide-react";

import { gardenColors } from "@/config/theme";

import type { ViewMode } from "./types";

interface RosterActionBarProps {
  totalLogged: number;
  totalTarget: number;
  overallPct: number;
  periodLocked: boolean;
  onAddSpecialDay: () => void;
  view: ViewMode;
  setView: (v: ViewMode) => void;
}

export function RosterActionBar({
  totalLogged,
  totalTarget,
  overallPct,
  periodLocked,
  onAddSpecialDay,
  view,
  setView,
}: RosterActionBarProps) {
  const pctColor =
    overallPct >= 115
      ? gardenColors.error
      : overallPct >= 100
        ? gardenColors.success
        : gardenColors.yellow;

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
      {/* Row 1: progress summary + off-day */}
      <div className="flex items-center justify-between lg:justify-start gap-2 min-w-0">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: pctColor }} />
          <span className="text-xs font-semibold text-ink tabular-nums">
            {totalLogged.toFixed(1)}h
          </span>
          <span className="text-xs text-ink-subtle">/</span>
          <span className="text-xs text-ink-muted tabular-nums">{totalTarget}h</span>
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded tabular-nums"
            style={{ color: pctColor, backgroundColor: `${pctColor}22` }}
          >
            {overallPct}%
          </span>
        </div>
        <button
          onClick={onAddSpecialDay}
          disabled={periodLocked}
          title={periodLocked ? "This month's timesheet is submitted — read only" : undefined}
          className="flex items-center gap-1 text-xs border border-garden-border rounded-md px-2.5 py-1 hover:bg-surface-2 transition-colors text-ink-muted font-medium disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed shrink-0"
        >
          <Palmtree className="w-3 h-3 text-ink-subtle" />
          <span className="hidden sm:inline">Log </span>Off-Day
        </button>
      </div>

      {/* View toggle — full width on mobile, shrink on desktop */}
      <div className="flex items-center rounded-md border border-garden-border bg-surface-2 p-0.5 lg:shrink-0">
        <button
          onClick={() => setView("grid")}
          title="Grid view"
          className={[
            "flex-1 lg:flex-none px-2 py-1 rounded-md text-xs font-medium flex items-center justify-center gap-1 transition-all",
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
            "flex-1 lg:flex-none px-2 py-1 rounded-md text-xs font-medium flex items-center justify-center gap-1 transition-all",
            view === "progress"
              ? "bg-white shadow-card text-ink border border-garden-border"
              : "text-ink-subtle hover:text-ink-muted",
          ].join(" ")}
        >
          <List className="w-3 h-3" />
          Progress
        </button>
      </div>
    </div>
  );
}
