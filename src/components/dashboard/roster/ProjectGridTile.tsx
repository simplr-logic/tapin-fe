"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { ClipboardList, Clock, Lock, MoreHorizontal, MousePointerClick } from "lucide-react";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { formatHours, getHeatStyle, getPct } from "./utils";

import type { TreemapNode } from "./treemap";
import type { DisplayProject } from "./types";
import type { TapUnit } from "@/config/constants";

export function ProjectGridTile({
  node,
  project,
  onTap,
  tapUnit,
  containerWidth,
  containerHeight,
  onOpenComments,
  onOpenAdjust,
  locked = false,
}: {
  node: TreemapNode;
  project: DisplayProject;
  onTap: (id: number, sign: 1 | -1) => void;
  tapUnit: TapUnit;
  containerWidth?: number;
  containerHeight?: number;
  onOpenComments: (id: number) => void;
  onOpenAdjust: (id: number) => void;
  locked?: boolean;
}) {
  const [tapping, setTapping] = useState(false);
  const pct = getPct(project.loggedMinutes, project.targetHours);
  const style = getHeatStyle(pct);
  const draggable = useDraggable({ id: node.key, disabled: tapping || locked });
  const droppable = useDroppable({ id: node.key });

  const pixelW = containerWidth ? (node.w / 100) * containerWidth : 0;
  const pixelH = containerHeight ? (node.h / 100) * containerHeight : 0;
  const isTiny = pixelW > 0 ? pixelW < 90 || pixelH < 110 : node.w < 11 || node.h < 14;
  const isSmall =
    !isTiny && (pixelW > 0 ? pixelW < 160 || pixelH < 180 : node.w < 24 || node.h < 26);

  const pad = isTiny ? "p-1 pt-1.5 pb-6" : isSmall ? "p-1.5 pt-2.5 pb-7" : "p-2.5 pt-3.5 pb-8";
  const titleCls = isTiny ? "text-[8px]" : isSmall ? "text-[9px]" : "text-[11px]";
  const companyCls = isTiny ? "text-[7px]" : isSmall ? "text-[8px]" : "text-[10px]";
  const metaCls = isTiny ? "text-[7px]" : isSmall ? "text-[8px]" : "text-[10px]";
  const hoursPx = Math.min(
    32,
    Math.max(10, pixelW > 0 ? Math.min(pixelW, pixelH * 1.5) * 0.1 : 13 + node.w / 4)
  );

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
          pad,
          "transition-transform duration-100 hover:border-garden-border-strong group",
          droppable.isOver ? "ring-2 ring-link ring-offset-1" : "",
          style.bg,
          style.border,
        ].join(" ")}
      >
        {/* heat bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: style.pctColor }}
        />

        {/* top row: title + pct% */}
        <div className="flex items-start justify-between gap-0.5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-0.5">
              <p
                className={`${titleCls} font-semibold leading-tight truncate text-ink`}
                title={project.title}
              >
                {project.title}
              </p>
              {project.locked && <Lock className="w-2 h-2 text-ink-subtle shrink-0" />}
            </div>
            <p className={`${companyCls} truncate text-ink-muted leading-tight mt-0.5`}>
              {project.company}
            </p>
          </div>
          <span
            className={`${metaCls} font-bold shrink-0 mt-0.5`}
            style={{ color: style.pctColor }}
          >
            {pct}%
          </span>
        </div>

        {/* center: hours */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-0 py-0.5">
          <span
            className="font-semibold tracking-tight tabular-nums leading-none"
            style={{ color: style.pctColor, fontSize: `${hoursPx}px` }}
          >
            {formatHours(project.loggedMinutes)}
          </span>
          <span className={`${metaCls} text-ink-subtle truncate max-w-full text-center mt-0.5`}>
            of {project.targetHours}h target
          </span>
        </div>

        {/* ⋯ action menu — wrapper stops all pointer events reaching the tile */}
        <div
          className="absolute bottom-1.5 right-1.5"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger
              className={[
                "flex items-center justify-center rounded-md transition-colors",
                "bg-black/8 hover:bg-black/16 text-ink-muted",
                isTiny ? "w-5 h-5" : "w-6 h-6",
              ].join(" ")}
            >
              <MoreHorizontal className={isTiny ? "w-2.5 h-2.5" : "w-3.5 h-3.5"} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom" sideOffset={4}>
              <DropdownMenuItem disabled={locked} onClick={() => onOpenAdjust(project.id)}>
                <Clock className="w-3.5 h-3.5" />
                Adjust hours
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onOpenComments(project.id)}>
                <ClipboardList className="w-3.5 h-3.5" />
                Worklog
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* hover overlay */}
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
                <span className="text-[10px] font-semibold text-white">tap to log +{tapUnit}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
