"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Lock, Palmtree } from "lucide-react";

import { formatSpecialRangeAll, formatTypesSummary } from "./utils";

import type { TreemapNode } from "./treemap";
import type { SpecialDay } from "@/components/dashboard/SpecialDayDialog";

// Locked — not tappable, only draggable to reposition. Every special-day
// entry (whatever the mix of Holiday/Leave/Sick) collapses into this one
// aggregate tile — e.g. 8h Leave + 8h Holiday reads as a single 16h block.
// Per-entry type/editing lives in the Registered Special Day Blocks section
// below.
export function SpecialDayGridTile({ node, days }: { node: TreemapNode; days: SpecialDay[] }) {
  const totalHours = days.reduce((sum, d) => sum + d.hours, 0);
  const isSuperMicro = node.w < 11 || node.h < 14;
  const draggable = useDraggable({ id: node.key });
  const droppable = useDroppable({ id: node.key });

  return (
    <div
      className="absolute transition-[left,top,width,height] duration-300 ease-out"
      style={{
        left: `${node.x}%`,
        top: `${node.y}%`,
        width: `${node.w}%`,
        height: `${node.h}%`,
        padding: 3,
      }}
    >
      <div
        ref={(el) => {
          draggable.setNodeRef(el);
          droppable.setNodeRef(el);
        }}
        title="Locked — manage in Registered Special Day Blocks below"
        {...draggable.listeners}
        {...draggable.attributes}
        style={{ opacity: draggable.isDragging ? 0.35 : 1 }}
        className={[
          "relative w-full h-full border border-dashed border-warning/35 rounded-lg flex flex-col select-none overflow-hidden touch-none cursor-grab bg-warning/8",
          isSuperMicro ? "p-1.5 items-center justify-center" : "p-3.5 pt-4",
          droppable.isOver ? "ring-2 ring-link ring-offset-1" : "",
        ].join(" ")}
      >
        {isSuperMicro ? (
          <div className="flex flex-col items-center gap-0.5 text-center">
            <Palmtree className="w-3 h-3 text-warning" />
            <span className="text-[8px] font-bold leading-none text-warning">{totalHours}h</span>
          </div>
        ) : (
          <>
            <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-white/70 flex items-center justify-center">
              <Lock className="w-2.5 h-2.5 text-warning/70" />
            </div>
            <div className="flex items-center gap-1.5">
              <Palmtree className="w-3.5 h-3.5 text-warning" />
              <span className="text-[10px] font-semibold uppercase tracking-wide text-warning">
                Special Day Block
              </span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-1 py-1 text-center">
              <span className="text-2xl font-semibold tracking-tight text-warning">
                {totalHours}h
              </span>
              <span className="text-[10px] text-warning/80 px-2">{formatTypesSummary(days)}</span>
              <span className="text-[10px] text-warning/80 px-2">
                {formatSpecialRangeAll(days)}
              </span>
            </div>

            <p className="text-[9px] text-warning/70 text-center leading-tight">
              Manage below in Special Day Blocks
            </p>
          </>
        )}
      </div>
    </div>
  );
}
