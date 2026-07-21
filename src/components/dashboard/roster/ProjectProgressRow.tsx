"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { GripVertical, Lock, MousePointerClick } from "lucide-react";
import { useState } from "react";

import { PROJECT_ICONS } from "./constants";
import { AdjustHoursButton, WorklogButton } from "./TileButtons";
import { formatHours, getHeatStyle, getPct } from "./utils";

import type { DisplayProject } from "./types";
import type { TapUnit } from "@/config/constants";

export function ProjectProgressRow({
  project,
  onTap,
  tapUnit,
  onOpenComments,
  onOpenAdjust,
  locked = false,
}: {
  project: DisplayProject;
  onTap: (id: number, sign: 1 | -1) => void;
  tapUnit: TapUnit;
  onOpenComments: (id: number) => void;
  onOpenAdjust: (id: number) => void;
  locked?: boolean;
}) {
  const [tapping, setTapping] = useState(false);
  const pct = getPct(project.loggedMinutes, project.targetHours);
  const style = getHeatStyle(pct);
  const barPct = Math.min(100, pct);
  const Icon = PROJECT_ICONS[project.icon];
  const draggable = useDraggable({ id: project.id, disabled: tapping || locked });
  const droppable = useDroppable({ id: project.id });

  function handleClick() {
    if (locked) return;
    setTapping(true);
    onTap(project.id, 1);
    setTimeout(() => setTapping(false), 200);
  }

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
  }

  return (
    <div
      ref={(node) => {
        draggable.setNodeRef(node);
        droppable.setNodeRef(node);
      }}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      {...(locked ? {} : draggable.listeners)}
      {...(locked ? {} : draggable.attributes)}
      style={{
        transform: tapping ? "scale(0.99)" : "scale(1)",
        opacity: draggable.isDragging ? 0.35 : 1,
      }}
      className={[
        "relative rounded-lg border bg-white px-4 py-3 select-none transition-all hover:border-garden-border-strong touch-none overflow-hidden group",
        locked ? "cursor-default border-dashed" : "cursor-pointer",
        droppable.isOver ? "ring-2 ring-link ring-offset-1 border-link" : "border-garden-border",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <GripVertical className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
          <div
            className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
            style={{ backgroundColor: style.pctColor }}
          >
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-ink truncate">{project.title}</p>
              {project.locked && (
                <span className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide text-ink-subtle bg-surface-2 border border-garden-border-strong rounded-full px-1.5 py-0.5 shrink-0">
                  <Lock className="w-2.5 h-2.5" />
                  Locked
                </span>
              )}
            </div>
            <p className="text-[11px] text-ink-muted truncate">{project.company}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold" style={{ color: style.pctColor }}>
            {pct}%
          </span>
        </div>
      </div>

      <div className="mt-2.5">
        <div className="h-1.5 rounded-full overflow-hidden bg-garden-border">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: barPct === 0 ? "3px" : `${barPct}%`, backgroundColor: style.pctColor }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] text-ink-muted">
            <b className="text-ink font-semibold">{formatHours(project.loggedMinutes)}</b>
            <span className="mx-1 text-ink-subtle">/</span>
            {project.targetHours}h
          </span>
          <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
            <AdjustHoursButton
              project={project}
              onOpenAdjust={onOpenAdjust}
              className="w-6 h-6"
              disabled={locked}
            />
            <WorklogButton project={project} onOpenComments={onOpenComments} className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-kale/85 backdrop-blur-[1px] rounded-md px-2 py-1 flex items-center gap-1">
          {locked ? (
            <>
              <Lock className="w-3 h-3 text-white" />
              <span className="text-[10px] font-semibold text-white">Read-only period</span>
            </>
          ) : (
            <>
              <MousePointerClick className="w-3 h-3 text-white" />
              <span className="text-[10px] font-semibold text-white">tap to log +{tapUnit}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
