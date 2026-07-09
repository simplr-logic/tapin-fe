"use client";

import { Clock, Palmtree, Plus } from "lucide-react";

import { gardenColors } from "@/config/theme";

interface RosterActionBarProps {
  totalLogged: number;
  totalTarget: number;
  overallPct: number;
  periodLocked: boolean;
  onAddSpecialDay: () => void;
  onNewProject: () => void;
}

export function RosterActionBar({
  totalLogged,
  totalTarget,
  overallPct,
  periodLocked,
  onAddSpecialDay,
  onNewProject,
}: RosterActionBarProps) {
  const pctColor =
    overallPct >= 115
      ? gardenColors.error
      : overallPct >= 100
        ? gardenColors.success
        : gardenColors.yellow;

  return (
    <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
      {/* Hours summary + actions */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-ink-muted mr-1">
          <Clock className="w-3.5 h-3.5" />
          <span className="font-medium">{totalLogged.toFixed(1)}h</span>
          <span className="text-ink-subtle">/</span>
          <span>{totalTarget}h</span>
          <span className="font-semibold" style={{ color: pctColor }}>
            {overallPct}%
          </span>
        </div>
        <button
          onClick={onAddSpecialDay}
          disabled={periodLocked}
          title={periodLocked ? "This month's timesheet is submitted — read only" : undefined}
          className="flex items-center gap-1.5 text-xs border border-garden-border rounded-md px-3 py-1.5 hover:bg-surface-2 transition-colors text-ink-muted font-medium disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
        >
          <Palmtree className="w-3.5 h-3.5 text-ink-subtle" />
          Log Off-Day
        </button>
        <button
          onClick={onNewProject}
          disabled={periodLocked}
          title={periodLocked ? "This month's timesheet is submitted — read only" : undefined}
          className="flex items-center gap-1.5 text-xs bg-kale hover:bg-kale-hover text-white rounded-md px-3 py-1.5 transition-colors font-medium shadow-card disabled:opacity-40 disabled:hover:bg-kale disabled:cursor-not-allowed"
        >
          <Plus className="w-3.5 h-3.5" />
          New Project
        </button>
      </div>
    </div>
  );
}
