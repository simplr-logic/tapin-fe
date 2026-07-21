"use client";

import { useMemo } from "react";

import { buildTreeStructure, layoutTree } from "@/components/dashboard/roster/treemap";
import { formatHours, getHeatStyle, getPct } from "@/components/dashboard/roster/utils";
import { LANDING_WEEK_PROJECTS } from "@/components/landing/landing-mock-data";
import { LandingCard } from "@/components/landing/landing-ui";
import { cn } from "@/lib/utils";

function TreemapTile({
  x,
  y,
  w,
  h,
  title,
  company,
  minutes,
  targetHours,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  company: string;
  minutes: number;
  targetHours: number;
}) {
  const pct = getPct(minutes, targetHours);
  const heat = getHeatStyle(pct);
  const isSmall = w < 28 || h < 28;

  return (
    <div
      className={cn(
        "absolute overflow-hidden rounded-md border",
        heat.bg,
        heat.border,
        isSmall ? "p-1.5" : "p-2.5"
      )}
      style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }}
    >
      <p className={cn("font-semibold text-ink truncate", isSmall ? "text-[8px]" : "text-[11px]")}>
        {title}
      </p>
      {!isSmall ? <p className="text-[10px] text-ink-muted truncate">{company}</p> : null}
      <p
        className={cn(
          "font-bold tabular-nums leading-none",
          isSmall ? "text-sm mt-1" : "text-xl mt-2"
        )}
        style={{ color: heat.pctColor }}
      >
        {formatHours(minutes)}
      </p>
    </div>
  );
}

export default function LandingTreemapPreview() {
  const nodes = useMemo(() => {
    const items = LANDING_WEEK_PROJECTS.map((project) => ({
      slot: project.slot,
      weight: project.minutes,
    }));
    const tree = buildTreeStructure(items, 100, 100);
    const weightBySlot = new Map(items.map((item) => [item.slot, item.weight]));
    return layoutTree(tree, weightBySlot, 0, 0, 100, 100);
  }, []);

  return (
    <LandingCard className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-garden-border px-4 py-3 md:px-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Your week</p>
          <p className="text-sm text-ink-subtle">Mon 7 Jul – Sun 13 Jul</p>
        </div>
        <p className="text-sm font-semibold text-ink tabular-nums">43h logged</p>
      </div>
      <div className="relative aspect-4/3 md:aspect-16/10 bg-surface-2/40 p-2 md:p-3">
        <div className="relative h-full w-full">
          {nodes.map((node) => {
            const project = LANDING_WEEK_PROJECTS.find((item) => item.slot === node.slot);
            if (!project) return null;

            return (
              <TreemapTile
                key={project.slot}
                x={node.x}
                y={node.y}
                w={node.w}
                h={node.h}
                title={project.title}
                company={project.company}
                minutes={project.minutes}
                targetHours={project.targetHours}
              />
            );
          })}
        </div>
      </div>
    </LandingCard>
  );
}
