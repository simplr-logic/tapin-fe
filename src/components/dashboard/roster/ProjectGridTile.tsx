"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Lock, MousePointerClick } from "lucide-react";
import { useState } from "react";

import { CommentButton, AdjustHoursButton, EditProjectButton } from "./TileButtons";
import { getPct, formatHours, getHeatStyle, getShortCode } from "./utils";

import type { TreemapNode } from "./treemap";
import type { Project } from "@/components/providers/ProjectsProvider";
import type { TapUnit } from "@/config/constants";

export function ProjectGridTile({
  node,
  project,
  onTap,
  tapUnit,
  commentCount,
  onOpenComments,
  onOpenAdjust,
  onOpenEdit,
  locked = false,
}: {
  node: TreemapNode;
  project: Project;
  onTap: (id: number, sign: 1 | -1) => void;
  tapUnit: TapUnit;
  commentCount: number;
  onOpenComments: (id: number) => void;
  onOpenAdjust: (id: number) => void;
  onOpenEdit: (id: number) => void;
  locked?: boolean;
}) {
  const [tapping, setTapping] = useState(false);
  const pct = getPct(project.loggedMinutes, project.targetHours);
  const style = getHeatStyle(pct);
  const barPct = Math.min(100, pct);
  const draggable = useDraggable({ id: node.key, disabled: tapping || locked });
  const droppable = useDroppable({ id: node.key });

  const isSuperMicro = node.w < 11 || node.h < 14;
  const isMicro = !isSuperMicro && (node.w < 24 || node.h < 26);

  function handleClick() {
    if (locked) return;
    setTapping(true);
    onTap(project.id, 1);
    setTimeout(() => setTapping(false), 200);
  }

  // Right-click is an accelerator for unlogging the same TAP unit — the
  // clock button stays the discoverable path, this is just a shortcut for
  // people who've learned it.
  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    if (locked) return;
    setTapping(true);
    onTap(project.id, -1);
    setTimeout(() => setTapping(false), 200);
  }

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
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        {...(locked ? {} : draggable.listeners)}
        {...(locked ? {} : draggable.attributes)}
        style={{
          transform: tapping ? "scale(0.97)" : "scale(1)",
          opacity: draggable.isDragging ? 0.35 : 1,
        }}
        className={[
          "relative w-full h-full border rounded-lg flex flex-col select-none overflow-hidden touch-none",
          locked ? "cursor-default border-dashed" : "cursor-pointer",
          isSuperMicro ? "p-1.5 items-center justify-center" : isMicro ? "p-2" : "p-3.5 pt-4",
          "transition-transform duration-100 hover:border-garden-border-strong group",
          droppable.isOver ? "ring-2 ring-link ring-offset-1" : "",
          style.bg,
          style.border,
        ].join(" ")}
      >
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: style.pctColor }}
        />

        {isSuperMicro ? (
          <div className="flex flex-col items-center justify-center text-center gap-0.5">
            <span className="text-[9px] font-bold tracking-tight text-ink leading-none">
              {getShortCode(project.title)}
            </span>
            <span
              className="text-[8px] font-semibold leading-none"
              style={{ color: style.pctColor }}
            >
              {formatHours(project.loggedMinutes)} · {pct}%
            </span>
          </div>
        ) : isMicro ? (
          <>
            <div className="flex items-start justify-between gap-1">
              <p
                className="text-[10px] font-semibold leading-tight truncate text-ink"
                title={project.title}
              >
                {project.title}
              </p>
              <span className="text-[9px] font-bold shrink-0" style={{ color: style.pctColor }}>
                {pct}%
              </span>
            </div>
            <div className="mt-auto flex items-end justify-between gap-1">
              <span className="text-[10px] font-semibold text-ink">
                {formatHours(project.loggedMinutes)}
              </span>
              <div className="flex items-center gap-1">
                <EditProjectButton project={project} onOpenEdit={onOpenEdit} className="w-5 h-5" />
                <AdjustHoursButton
                  project={project}
                  onOpenAdjust={onOpenAdjust}
                  className="w-5 h-5"
                  disabled={locked}
                />
                <CommentButton
                  project={project}
                  commentCount={commentCount}
                  onOpenComments={onOpenComments}
                  className="w-5 h-5"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start justify-between gap-1">
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <p
                    className="text-xs font-semibold leading-tight truncate text-ink"
                    title={project.title}
                  >
                    {project.title}
                  </p>
                  {project.locked && (
                    <span title="Project locked" className="shrink-0">
                      <Lock className="w-2.5 h-2.5 text-ink-subtle" />
                    </span>
                  )}
                </div>
                <p className="text-[10px] mt-0.5 truncate text-ink-muted">{project.company}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                <EditProjectButton project={project} onOpenEdit={onOpenEdit} className="w-5 h-5" />
                <AdjustHoursButton
                  project={project}
                  onOpenAdjust={onOpenAdjust}
                  className="w-5 h-5"
                  disabled={locked}
                />
                <span className="text-[10px] font-bold" style={{ color: style.pctColor }}>
                  {pct}%
                </span>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-0.5 min-h-0 py-1">
              <span
                className="font-semibold tracking-tight tabular-nums leading-none"
                style={{ color: style.pctColor, fontSize: `${Math.min(34, 18 + node.w / 4)}px` }}
              >
                {formatHours(project.loggedMinutes)}
              </span>
              <span className="text-[10px] text-ink-subtle">
                logged of {project.targetHours}h target
              </span>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between gap-1">
                <CommentButton
                  project={project}
                  commentCount={commentCount}
                  onOpenComments={onOpenComments}
                  className="w-6 h-6"
                />
                <span className="text-[10px] font-medium text-ink-muted">{project.assignee}</span>
              </div>

              <div className="h-1 rounded-full overflow-hidden bg-garden-border">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${barPct}%`, backgroundColor: style.pctColor }}
                />
              </div>
            </div>
          </>
        )}

        <div className="absolute inset-0 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-kale/85 backdrop-blur-[1px] rounded-md px-2 py-1 flex items-center gap-1">
            {locked ? (
              <>
                <Lock className="w-3 h-3 text-white" />
                <span className="text-[10px] font-semibold text-white">Read-only period</span>
              </>
            ) : (
              <>
                <MousePointerClick className="w-3 h-3 text-white" />
                <span className="text-[10px] font-semibold text-white">
                  +{tapUnit} · right-click −{tapUnit}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
