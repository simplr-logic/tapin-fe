"use client";

import { Lock, Palmtree } from "lucide-react";

import { formatSpecialRangeAll, formatTypesSummary } from "./utils";

import type { SpecialDay } from "@/components/dashboard/SpecialDayDialog";

// List-view counterpart to SpecialDayGridTile — same aggregate-block,
// warning-colored treatment (not a project status color, so it reads as a
// distinct kind of roster item), but as a static row: list order here is
// project-only (see WeeklyRoster's orderedProjectIds), so this isn't wired
// into drag-reorder like the grid tile is into slot assignment.
export function SpecialDayProgressRow({ days }: { days: SpecialDay[] }) {
  const totalHours = days.reduce((sum, d) => sum + d.hours, 0);

  return (
    <div className="relative rounded-lg border border-dashed border-warning/35 bg-warning/8 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0 bg-warning/15">
            <Palmtree className="w-4 h-4 text-warning" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-warning truncate">Special Day Block</p>
              <span className="flex items-center gap-1 text-[9px] font-semibold tracking-wide text-warning/80 bg-white/50 border border-warning/25 rounded-full px-1.5 py-0.5 shrink-0">
                <Lock className="w-2.5 h-2.5" />
                Locked
              </span>
            </div>
            <p className="text-[11px] text-warning/80 truncate">{formatTypesSummary(days)}</p>
          </div>
        </div>
        <span className="text-xs font-bold text-warning shrink-0">{totalHours}h</span>
      </div>
      <p className="text-[10px] text-warning/70 mt-1.5">{formatSpecialRangeAll(days)}</p>
    </div>
  );
}
