"use client";

import { LayoutGrid, List, Palmtree } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const pctColorCls =
    overallPct >= 115 ? "text-error" : overallPct >= 100 ? "text-success" : "text-yellow";
  const pctDotCls = overallPct >= 115 ? "bg-error" : overallPct >= 100 ? "bg-success" : "bg-yellow";
  const pctBgCls =
    overallPct >= 115 ? "bg-error/13" : overallPct >= 100 ? "bg-success/13" : "bg-yellow/13";

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
      {/* Row 1: progress summary + off-day */}
      <div className="flex items-center justify-between lg:justify-start gap-2 min-w-0">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={cn("w-2 h-2 rounded-full shrink-0", pctDotCls)} />
          <span className="text-xs font-semibold text-ink tabular-nums">
            {totalLogged.toFixed(1)}h
          </span>
          <span className="text-xs text-ink-subtle">/</span>
          <span className="text-xs text-ink-muted tabular-nums">{totalTarget}h</span>
          <span
            className={cn(
              "text-[10px] font-bold px-1.5 py-0.5 rounded tabular-nums",
              pctColorCls,
              pctBgCls
            )}
          >
            {overallPct}%
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddSpecialDay}
          disabled={periodLocked}
          title={periodLocked ? "This month's timesheet is submitted — read only" : undefined}
          className="h-auto gap-1 px-2.5 py-1 hover:bg-surface-2 text-ink-muted font-medium disabled:opacity-40 disabled:hover:bg-transparent shrink-0"
        >
          <Palmtree className="w-3 h-3 text-ink-subtle" />
          <span className="hidden sm:inline">Log </span>Off-Day
        </Button>
      </div>

      {/* View toggle — full width on mobile, shrink on desktop */}
      <div className="flex items-center rounded-md border border-garden-border bg-surface-2 p-0.5 lg:shrink-0">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setView("grid")}
          title="Grid view"
          className={cn(
            "h-auto flex-1 lg:flex-none px-2 py-1 gap-1 text-xs font-medium",
            view === "grid"
              ? "bg-card shadow-card text-ink border border-garden-border hover:bg-card"
              : "text-ink-subtle hover:text-ink-muted"
          )}
        >
          <LayoutGrid className="w-3 h-3" />
          Grid
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setView("progress")}
          title="Progress view"
          className={cn(
            "h-auto flex-1 lg:flex-none px-2 py-1 gap-1 text-xs font-medium",
            view === "progress"
              ? "bg-card shadow-card text-ink border border-garden-border hover:bg-card"
              : "text-ink-subtle hover:text-ink-muted"
          )}
        >
          <List className="w-3 h-3" />
          Progress
        </Button>
      </div>
    </div>
  );
}
