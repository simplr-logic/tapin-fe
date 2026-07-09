"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  useSensors,
} from "@dnd-kit/core";

import { gardenColors } from "@/config/theme";

import { DragGhost } from "./DragGhost";
import { ProjectGridTile } from "./ProjectGridTile";
import { ProjectProgressRow } from "./ProjectProgressRow";
import { SpecialDayGridTile } from "./SpecialDayGridTile";

import type { TreemapNode } from "./treemap";
import type { DisplayProject, ViewMode } from "./types";
import type { SpecialDay } from "@/components/dashboard/SpecialDayDialog";
import type { TapUnit } from "@/config/constants";

interface RosterGridProps {
  view: ViewMode;
  treemapNodes: TreemapNode[];
  orderedProjects: DisplayProject[];
  projectById: Map<number, DisplayProject>;

  periodLocked: boolean;
  specialDays: SpecialDay[];
  tapUnit: TapUnit;
  activeDragPreview: { title: string; Icon: React.ElementType } | null;
  sensors: ReturnType<typeof useSensors>;
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onTap: (id: number, sign: 1 | -1) => void;
  onOpenComments: (id: number) => void;
  onOpenAdjust: (id: number) => void;
  onOpenEdit: (id: number) => void;
}

export function RosterGrid({
  view,
  treemapNodes,
  orderedProjects,
  projectById,
  periodLocked,
  specialDays,
  tapUnit,
  activeDragPreview,
  sensors,
  onDragStart,
  onDragEnd,
  onTap,
  onOpenComments,
  onOpenAdjust,
  onOpenEdit,
}: RosterGridProps) {
  return (
    <div className="space-y-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        {view === "grid" ? (
          <div className="relative w-full h-[280px] sm:h-[360px] md:h-[440px] rounded-lg border border-garden-border bg-surface-2 overflow-hidden">
            {treemapNodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-center px-8">
                <p className="text-xs text-ink-subtle leading-relaxed">
                  {periodLocked
                    ? "No projected data for this period."
                    : 'No projects yet. Click "New Project" above to add one to the roster.'}
                </p>
              </div>
            )}
            {treemapNodes.map((node) => {
              if (node.key.startsWith("p-")) {
                const project = projectById.get(Number(node.key.slice(2)));
                if (!project) return null;
                return (
                  <ProjectGridTile
                    key={node.key}
                    node={node}
                    project={project}
                    onTap={onTap}
                    tapUnit={tapUnit}

                    onOpenComments={onOpenComments}
                    onOpenAdjust={onOpenAdjust}
                    locked={project.locked || periodLocked}
                  />
                );
              }
              if (specialDays.length === 0) return null;
              return <SpecialDayGridTile key={node.key} node={node} days={specialDays} />;
            })}
          </div>
        ) : (
          <div className="space-y-2.5">
            {orderedProjects.map((p) => (
              <ProjectProgressRow
                key={p.id}
                project={p}
                onTap={onTap}
                tapUnit={tapUnit}

                onOpenComments={onOpenComments}
                onOpenAdjust={onOpenAdjust}
                onOpenEdit={onOpenEdit}
                locked={p.locked || periodLocked}
              />
            ))}
          </div>
        )}
        <DragOverlay>
          {activeDragPreview && (
            <DragGhost title={activeDragPreview.title} Icon={activeDragPreview.Icon} />
          )}
        </DragOverlay>
      </DndContext>

      {/* Legend */}
      <div className="flex items-center justify-end gap-4 pt-1">
        {[
          { label: "Under target", color: gardenColors.yellow },
          { label: "On target", color: gardenColors.success },
          { label: "Exceeded", color: gardenColors.error },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5 text-[10px] text-ink-subtle">
            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: l.color }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}
