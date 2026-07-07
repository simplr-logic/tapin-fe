"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  LayoutGrid,
  TrendingUp,
  CalendarDays,
  Plus,
  Palmtree,
  Lightbulb,
  Truck,
  Building2,
  Cloud,
  MapPin,
  ChevronRight,
  Trees,
  Clock,
  Lock,
  MousePointerClick,
  MessageSquare,
  Pencil,
  Send,
  GripVertical,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useProjects, type Project, type Comment } from "@/components/providers/ProjectsProvider";
import { useTimesheets } from "@/components/providers/TimesheetProvider";
import { ProjectFormDialog } from "@/components/projects/ProjectFormDialog";
import {
  SpecialDayDialog,
  SPECIAL_DAY_TYPES,
  type SpecialDay,
} from "@/components/dashboard/SpecialDayDialog";
import {
  TAP_MINUTES,
  MAX_TILE_RATIO,
  PERIOD_SCALE,
  type TapUnit,
  type PeriodView,
} from "@/config/constants";
import { gardenColors } from "@/config/theme";

type ViewMode = "grid" | "progress";
type GridKey = `p-${number}` | "s-agg";

// All special-day entries — whatever mix of Holiday/Leave/Sick — collapse
// into ONE grid tile (e.g. 8h Leave + 8h Holiday = 16h Special Day), since
// there's only ever a single aggregate slot in the grid.
const SPECIAL_DAY_AGG_KEY: GridKey = "s-agg";

const PROJECT_ICONS = {
  truck: Truck,
  building: Building2,
  grid: LayoutGrid,
  cloud: Cloud,
} as const;

function projectKey(id: number): GridKey {
  return `p-${id}`;
}

function getPct(loggedMinutes: number, targetHours: number): number {
  return Math.round((loggedMinutes / 60 / targetHours) * 100);
}

function formatHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatSpecialDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatSpecialRange(day: SpecialDay): string {
  if (day.startDate === day.endDate) return formatSpecialDate(day.startDate);
  return `${formatSpecialDate(day.startDate)} – ${formatSpecialDate(day.endDate)}`;
}

function formatSpecialRangeAll(days: SpecialDay[]): string {
  const starts = days.map((d) => d.startDate).sort();
  const ends = days.map((d) => d.endDate).sort();
  const start = starts[0];
  const end = ends[ends.length - 1];
  if (start === end) return formatSpecialDate(start);
  return `${formatSpecialDate(start)} – ${formatSpecialDate(end)}`;
}

function formatTypesSummary(days: SpecialDay[]): string {
  const labels = Array.from(
    new Set(days.map((d) => SPECIAL_DAY_TYPES.find((t) => t.value === d.type)!.label))
  );
  return labels.join(" + ");
}

function shortDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function stripTime(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

// A "week" is a rolling 7-day window starting on whatever date is picked —
// pick Jul 6 and the window is Jul 6 – Jul 12, not snapped to a calendar
// Monday.
function weekEnd(start: Date): Date {
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end;
}

// Picking any date outside the current week/month/year is a read-only
// projection — there's no real historical backend, only the current week's
// live data. For "week" that means: does today fall inside the picked
// 7-day window?
function isSamePeriod(a: Date, b: Date, period: PeriodView): boolean {
  if (period === "week") {
    const start = stripTime(a);
    const end = weekEnd(start);
    const target = stripTime(b);
    return target >= start && target <= end;
  }
  if (period === "month")
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
  return a.getFullYear() === b.getFullYear();
}

function getPeriodLabel(period: PeriodView, date: Date): string {
  if (period === "week") {
    const start = stripTime(date);
    const end = weekEnd(start);
    return `${shortDate(start)} – ${shortDate(end)}, ${end.getFullYear()}`;
  }
  if (period === "month")
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  return String(date.getFullYear());
}

// Project heat tiers deliberately never use "warning" (the brownish tone) —
// that hue is reserved for Holiday special-day blocks. Projects only ever
// read as success (on track), open (near/over target), or error (well over).
function getHeatStyle(pct: number): { bg: string; border: string; pctColor: string } {
  if (pct >= 120)
    return { bg: "bg-error/18", border: "border-error/45", pctColor: gardenColors.error };
  if (pct >= 100)
    return { bg: "bg-error/12", border: "border-error/32", pctColor: gardenColors.error };
  if (pct >= 85) return { bg: "bg-open/14", border: "border-open/35", pctColor: gardenColors.open };
  if (pct >= 60)
    return { bg: "bg-success/14", border: "border-success/35", pctColor: gardenColors.success };
  if (pct >= 30)
    return { bg: "bg-success/8", border: "border-success/22", pctColor: gardenColors.success };
  return { bg: "bg-surface-2", border: "border-garden-border", pctColor: gardenColors.inkSubtle };
}

// Binary-split treemap, same shape as a crypto market-cap heatmap: nested
// proportional-area rectangles, not a uniform grid. The split *topology*
// (which entries share a branch, and whether that branch cuts vertically or
// horizontally) is frozen from the current order via buildTreeStructure, and
// only rebuilt when the set of grid entries changes (add/remove). Every
// render then only recomputes the ratio *within* each frozen split from live
// weights (layoutTree) — so a tile can grow or shrink smoothly as it's
// tapped without jumping to a different quadrant, and a manual drag-swap only
// touches the two dragged tiles' geometry.
//
// Weights are scaled into [1, MAX_TILE_RATIO] (see computeBoundedWeights)
// instead of used raw, so the biggest tile is never more than that ratio
// bigger than the smallest — real proportional sizing, capped short of ever
// looking like a 2:1 split.
interface TreemapNode {
  key: GridKey;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface TreeLeaf {
  type: "leaf";
  slot: number;
}
interface TreeSplit {
  type: "split";
  axis: "v" | "h";
  leftSlots: number[];
  rightSlots: number[];
  left: TreeStruct;
  right: TreeStruct;
}
type TreeStruct = TreeLeaf | TreeSplit;

function computeBoundedWeights(values: { key: GridKey; raw: number }[]): Map<GridKey, number> {
  const map = new Map<GridKey, number>();
  if (values.length === 0) return map;
  const min = Math.min(...values.map((v) => v.raw));
  const max = Math.max(...values.map((v) => v.raw));
  for (const v of values) {
    if (max === min) {
      map.set(v.key, 1);
      continue;
    }
    const t = (v.raw - min) / (max - min);
    map.set(v.key, 1 + (MAX_TILE_RATIO - 1) * t);
  }
  return map;
}

function splitByWeight<T extends { weight: number }>(items: T[]): [T[], T[]] {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let accumulated = 0;
  let splitIndex = 1;
  for (let i = 0; i < items.length - 1; i++) {
    accumulated += items[i].weight;
    if (accumulated >= totalWeight / 2) {
      splitIndex = i + 1;
      break;
    }
  }
  return [items.slice(0, splitIndex), items.slice(splitIndex)];
}

function buildTreeStructure(
  items: { slot: number; weight: number }[],
  w: number,
  h: number
): TreeStruct {
  if (items.length <= 1) return { type: "leaf", slot: items[0]?.slot ?? 0 };

  const [firstGroup, secondGroup] = splitByWeight(items);
  const firstWeight = firstGroup.reduce((sum, item) => sum + item.weight, 0);
  const secondWeight = secondGroup.reduce((sum, item) => sum + item.weight, 0);
  const ratio = firstWeight / (firstWeight + secondWeight || 1);
  const axis: "v" | "h" = w >= h ? "v" : "h";
  const leftW = axis === "v" ? w * ratio : w;
  const leftH = axis === "h" ? h * ratio : h;

  return {
    type: "split",
    axis,
    leftSlots: firstGroup.map((i) => i.slot),
    rightSlots: secondGroup.map((i) => i.slot),
    left: buildTreeStructure(firstGroup, leftW, leftH),
    right: buildTreeStructure(
      secondGroup,
      w - (axis === "v" ? leftW : 0),
      h - (axis === "h" ? leftH : 0)
    ),
  };
}

function layoutTree(
  node: TreeStruct,
  weightBySlot: Map<number, number>,
  x: number,
  y: number,
  w: number,
  h: number
): { slot: number; x: number; y: number; w: number; h: number }[] {
  if (node.type === "leaf") return [{ slot: node.slot, x, y, w, h }];

  const leftWeight = node.leftSlots.reduce((sum, s) => sum + (weightBySlot.get(s) ?? 0), 0);
  const rightWeight = node.rightSlots.reduce((sum, s) => sum + (weightBySlot.get(s) ?? 0), 0);
  const ratio = leftWeight / (leftWeight + rightWeight || 1);

  if (node.axis === "v") {
    const leftW = w * ratio;
    return [
      ...layoutTree(node.left, weightBySlot, x, y, leftW, h),
      ...layoutTree(node.right, weightBySlot, x + leftW, y, w - leftW, h),
    ];
  }
  const leftH = h * ratio;
  return [
    ...layoutTree(node.left, weightBySlot, x, y, w, leftH),
    ...layoutTree(node.right, weightBySlot, x, y + leftH, w, h - leftH),
  ];
}

// Every card is simultaneously a drag source and a drop target: dragging one
// onto another swaps their slot. PointerSensor's activation distance (see
// the DndContext below) means a plain tap still reaches onClick — only a
// deliberate drag gesture is captured by dnd-kit, so tap-to-log and
// drag-to-swap don't fight each other.

interface TileActionsProps {
  project: Project;
  commentCount: number;
  onOpenComments: (id: number) => void;
  onOpenAdjust: (id: number) => void;
  onOpenEdit: (id: number) => void;
}

function CommentButton({
  project,
  commentCount,
  onOpenComments,
  className,
}: Omit<TileActionsProps, "onOpenAdjust" | "onOpenEdit"> & { className: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onOpenComments(project.id);
      }}
      title="View / add comments"
      className={[
        "relative rounded-md flex items-center justify-center text-white shrink-0 bg-kale hover:bg-kale-hover transition-colors",
        className,
      ].join(" ")}
    >
      <MessageSquare className="w-3 h-3" />
      {commentCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] px-0.5 rounded-full bg-link text-white text-[8px] font-bold flex items-center justify-center leading-none">
          {commentCount}
        </span>
      )}
    </button>
  );
}

function AdjustHoursButton({
  project,
  onOpenAdjust,
  className,
  disabled = false,
}: Omit<TileActionsProps, "commentCount" | "onOpenComments" | "onOpenEdit"> & {
  className: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onOpenAdjust(project.id);
      }}
      title={disabled ? "Not editable outside the current week" : "Log a custom hour / unlog hours"}
      className={[
        "rounded-md flex items-center justify-center text-ink-muted bg-white border border-garden-border hover:bg-surface-2 hover:text-ink transition-colors shrink-0",
        "disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed",
        className,
      ].join(" ")}
    >
      <Clock className="w-3 h-3" />
    </button>
  );
}

function EditProjectButton({
  project,
  onOpenEdit,
  className,
}: Omit<TileActionsProps, "commentCount" | "onOpenComments" | "onOpenAdjust"> & {
  className: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onOpenEdit(project.id);
      }}
      title="Edit project details"
      className={[
        "rounded-md flex items-center justify-center text-ink-muted bg-white border border-garden-border hover:bg-surface-2 hover:text-ink transition-colors shrink-0",
        className,
      ].join(" ")}
    >
      <Pencil className="w-3 h-3" />
    </button>
  );
}

function getShortCode(title: string): string {
  const words = title.trim().split(/\s+/);
  if (words.length > 1)
    return words
      .map((w) => w[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();
  return title.slice(0, 3).toUpperCase();
}

function ProjectGridTile({
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

// Locked — not tappable, only draggable to reposition. Every special-day
// entry (whatever the mix of Holiday/Leave/Sick) collapses into this one
// aggregate tile — e.g. 8h Leave + 8h Holiday reads as a single 16h block.
// Per-entry type/editing lives in the Registered Special Day Blocks section
// below.
function SpecialDayGridTile({ node, days }: { node: TreemapNode; days: SpecialDay[] }) {
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

function ProjectProgressRow({
  project,
  onTap,
  commentCount,
  onOpenComments,
  onOpenAdjust,
  onOpenEdit,
  locked = false,
}: {
  project: Project;
  onTap: (id: number, sign: 1 | -1) => void;
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
    if (locked) return;
    setTapping(true);
    onTap(project.id, -1);
    setTimeout(() => setTapping(false), 200);
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
        "rounded-lg border bg-white p-4 select-none transition-all hover:border-garden-border-strong touch-none",
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
            <p className="text-[11px] text-ink-muted truncate">
              {project.company} · {project.assignee}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold" style={{ color: style.pctColor }}>
            {pct}%
          </span>
          <EditProjectButton project={project} onOpenEdit={onOpenEdit} className="w-7 h-7" />
          <AdjustHoursButton
            project={project}
            onOpenAdjust={onOpenAdjust}
            className="w-7 h-7"
            disabled={locked}
          />
          <CommentButton
            project={project}
            commentCount={commentCount}
            onOpenComments={onOpenComments}
            className="w-7 h-7"
          />
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        <div className="h-2 rounded-full overflow-hidden bg-garden-border">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${barPct}%`, backgroundColor: style.pctColor }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-ink-muted">
          <span>
            Logged: <b className="text-ink font-semibold">{formatHours(project.loggedMinutes)}</b>
          </span>
          <span>Target: {project.targetHours}h</span>
        </div>
      </div>
    </div>
  );
}

function DragGhost({ title, Icon }: { title: string; Icon: typeof Truck }) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-kale text-white px-3 py-2 shadow-elevated text-xs font-semibold">
      <Icon className="w-3.5 h-3.5" />
      {title}
    </div>
  );
}

function CommentsModal({
  project,
  comments,
  draft,
  onDraftChange,
  onAdd,
  onClose,
}: {
  project: Project;
  comments: Comment[];
  draft: string;
  onDraftChange: (v: string) => void;
  onAdd: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <span className="text-[10px] font-semibold text-link uppercase tracking-wide">
            Comments
          </span>
          <DialogTitle className="truncate max-w-[240px]">{project.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 max-h-52 overflow-y-auto">
          {comments.length === 0 ? (
            <p className="text-xs text-ink-subtle text-center py-4">No comments yet.</p>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className="rounded-md bg-surface-2 border border-garden-border px-3 py-2"
              >
                <p className="text-xs text-ink leading-relaxed">{c.text}</p>
                <p className="text-[10px] text-ink-subtle mt-1">{c.timestamp}</p>
              </div>
            ))
          )}
        </div>

        <div className="flex items-end gap-2">
          <Textarea
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            placeholder="Add a comment…"
            rows={2}
            className="flex-1 text-xs min-h-16 resize-none"
          />
          <Button
            type="button"
            onClick={onAdd}
            disabled={!draft.trim()}
            size="icon"
            className="shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AdjustModal({
  project,
  sign,
  onSignChange,
  hours,
  onHoursChange,
  minutes,
  onMinutesChange,
  note,
  onNoteChange,
  onSave,
  onClose,
}: {
  project: Project;
  sign: "add" | "subtract";
  onSignChange: (s: "add" | "subtract") => void;
  hours: number;
  onHoursChange: (h: number) => void;
  minutes: number;
  onMinutesChange: (m: number) => void;
  note: string;
  onNoteChange: (v: string) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <span className="text-[10px] font-semibold text-link uppercase tracking-wide">
            Adjust Hours
          </span>
          <DialogTitle className="truncate max-w-[240px]">{project.title}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 bg-surface-2 p-1 rounded-md border border-garden-border">
          <button
            type="button"
            onClick={() => onSignChange("subtract")}
            className={[
              "py-1.5 text-xs font-semibold rounded-md transition-all",
              sign === "subtract"
                ? "bg-error/12 text-error border border-error/30"
                : "text-ink-subtle hover:text-ink-muted",
            ].join(" ")}
          >
            Unlog hours
          </button>
          <button
            type="button"
            onClick={() => onSignChange("add")}
            className={[
              "py-1.5 text-xs font-semibold rounded-md transition-all",
              sign === "add"
                ? "bg-success/12 text-success border border-success/30"
                : "text-ink-subtle hover:text-ink-muted",
            ].join(" ")}
          >
            Log custom hours
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide mb-1">
              Hours
            </Label>
            <Input
              type="number"
              min={0}
              step={1}
              value={hours}
              onChange={(e) => onHoursChange(Math.max(0, Math.floor(Number(e.target.value))))}
            />
          </div>
          <div>
            <Label className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide mb-1">
              Minutes
            </Label>
            <Input
              type="number"
              min={0}
              max={59}
              step={5}
              value={minutes}
              onChange={(e) =>
                onMinutesChange(Math.min(59, Math.max(0, Math.floor(Number(e.target.value)))))
              }
            />
          </div>
        </div>

        <div>
          <Label className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide mb-1">
            Note (optional, saved as a comment)
          </Label>
          <Input
            type="text"
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="e.g. forgot to clock out, backfilled from calendar"
          />
        </div>

        <Button
          type="button"
          onClick={onSave}
          disabled={hours === 0 && minutes === 0}
          className={[
            "w-full text-xs font-semibold uppercase tracking-wide h-9",
            sign === "subtract" ? "bg-error hover:brightness-90 text-white" : "",
          ].join(" ")}
        >
          Confirm {sign === "subtract" ? "Deduction" : "Addition"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default function WeeklyRoster() {
  const { projects, comments, ledger, addProject, updateProject, adjustLoggedMinutes, addComment } =
    useProjects();
  const { currentWeekRecord } = useTimesheets();

  // Progress view: manual drag overrides for the flat project list.
  const [listOrder, setListOrder] = useState<number[]>([]);
  // Grid view: which entry (project or special day) occupies which fixed
  // treemap slot — see buildTreeStructure/layoutTree above.
  const [slotAssignment, setSlotAssignment] = useState<GridKey[]>([]);

  const [view, setView] = useState<ViewMode>("grid");
  const [period, setPeriod] = useState<PeriodView>("week");
  const periodOptions: PeriodView[] = ["week", "month", "year"];
  // Which date is being viewed — any date outside the live current
  // week/month/year (or any Month/Year granularity, even the current one) is
  // a read-only projection, since there's no real per-period backend yet.
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const isCurrentPeriod = isSamePeriod(selectedDate, new Date(), period);
  // The current week's timesheet, once submitted/certified, is also
  // read-only — same as any other closed period.
  const periodLocked = period !== "week" || !isCurrentPeriod || currentWeekRecord !== null;

  function changePeriod(next: PeriodView) {
    setPeriod(next);
    setSelectedDate(new Date());
  }

  const [tap, setTap] = useState<TapUnit>("1h");
  const tapOptions: TapUnit[] = ["30m", "1h", "2h"];
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [commentModalId, setCommentModalId] = useState<number | null>(null);
  const [commentDraft, setCommentDraft] = useState("");

  const [adjustModalId, setAdjustModalId] = useState<number | null>(null);
  const [editProjectId, setEditProjectId] = useState<number | null>(null);
  const [adjustSign, setAdjustSign] = useState<"add" | "subtract">("add");
  const [adjustHours, setAdjustHours] = useState(1);
  const [adjustMinutes, setAdjustMinutes] = useState(0);
  const [adjustNote, setAdjustNote] = useState("");

  const [specialDays, setSpecialDays] = useState<SpecialDay[]>([]);
  const [isSpecialDayOpen, setIsSpecialDayOpen] = useState(false);
  const [editingSpecialDayId, setEditingSpecialDayId] = useState<number | null>(null);

  function addSpecialDay(input: Omit<SpecialDay, "id">) {
    setSpecialDays((prev) => [...prev, { ...input, id: Date.now() }]);
  }

  function updateSpecialDay(id: number, input: Omit<SpecialDay, "id">) {
    setSpecialDays((prev) => prev.map((d) => (d.id === id ? { ...input, id } : d)));
  }

  function removeSpecialDay(id: number) {
    setSpecialDays((prev) => prev.filter((d) => d.id !== id));
  }

  const [activeDragId, setActiveDragId] = useState<GridKey | number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  function handleTap(id: number, sign: 1 | -1 = 1) {
    adjustLoggedMinutes(id, sign * TAP_MINUTES[tap]);
  }

  // Progress view: splice-insert reorder — a normal list shuffle.
  function handleListReorder(fromId: number, toId: number) {
    if (fromId === toId) return;
    const from = orderedProjectIds.indexOf(fromId);
    const to = orderedProjectIds.indexOf(toId);
    if (from === -1 || to === -1) return;
    const next = [...orderedProjectIds];
    next.splice(from, 1);
    next.splice(to, 0, fromId);
    setListOrder(next);
  }

  // Grid view: swap which entry occupies which fixed treemap slot. Unlike a
  // list splice, this only touches the two dragged slots' geometry — every
  // other tile's position and size is untouched, since the split topology is
  // keyed by slot index, not by entry id.
  function handleGridSwap(fromKey: GridKey, toKey: GridKey) {
    if (fromKey === toKey) return;
    const fromSlot = effectiveSlots.indexOf(fromKey);
    const toSlot = effectiveSlots.indexOf(toKey);
    if (fromSlot === -1 || toSlot === -1) return;
    const next = [...effectiveSlots];
    [next[fromSlot], next[toSlot]] = [next[toSlot], next[fromSlot]];
    setSlotAssignment(next);
  }

  function handleDragStart(event: DragStartEvent) {
    const id = event.active.id;
    setActiveDragId(typeof id === "string" ? (id as GridKey) : id);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveDragId(null);
    if (!over || active.id === over.id) return;
    if (view === "grid") {
      handleGridSwap(active.id as GridKey, over.id as GridKey);
    } else {
      handleListReorder(Number(active.id), Number(over.id));
    }
  }

  function submitComment() {
    if (commentModalId === null || !commentDraft.trim()) return;
    addComment(commentModalId, commentDraft.trim());
    setCommentDraft("");
  }

  function resetAdjustForm() {
    setAdjustSign("add");
    setAdjustHours(1);
    setAdjustMinutes(0);
    setAdjustNote("");
  }

  function submitAdjust() {
    if (adjustModalId === null) return;
    const totalMinutes = adjustHours * 60 + adjustMinutes;
    const delta = (adjustSign === "add" ? 1 : -1) * totalMinutes;
    const trimmedNote = adjustNote.trim();
    const describedNote = trimmedNote
      ? `${adjustSign === "add" ? "+" : "−"}${formatHours(totalMinutes)} — ${trimmedNote}`
      : undefined;
    adjustLoggedMinutes(adjustModalId, delta, describedNote);
    if (describedNote) {
      addComment(adjustModalId, describedNote);
    }
    setAdjustModalId(null);
    resetAdjustForm();
  }

  // Month/Year are mocked by projecting the current week's numbers forward
  // by a period factor — same shape of data, same renderer, just scaled.
  const periodScale = PERIOD_SCALE[period];
  const displayProjects: Project[] =
    period === "week"
      ? projects
      : projects.map((p) => ({
          ...p,
          loggedMinutes: Math.round(p.loggedMinutes * periodScale),
          targetHours: Math.round(p.targetHours * periodScale),
        }));

  const projectById = new Map(displayProjects.map((p) => [p.id, p]));
  const specialDayById = new Map(specialDays.map((d) => [d.id, d]));

  // Progress view ordering — a plain id sequence, new/foreign ids fall back to
  // their natural order from the shared project list.
  const orderedProjectIds = [
    ...listOrder.filter((id) => projectById.has(id)),
    ...displayProjects.map((p) => p.id).filter((id) => !listOrder.includes(id)),
  ];
  const orderedProjects = orderedProjectIds.map((id) => projectById.get(id)!);

  // Grid view: fixed slots shared by projects and the single special-day
  // aggregate tile. The split topology is keyed by slot index (0..n-1) and
  // only rebuilt when the *set* of grid keys changes (add/remove) — never
  // from live weight changes or from swapping which entry sits in which
  // slot.
  const liveKeys: GridKey[] = [
    ...displayProjects.map((p) => projectKey(p.id)),
    ...(!periodLocked && specialDays.length > 0 ? [SPECIAL_DAY_AGG_KEY] : []),
  ];
  const isValidSlotAssignment =
    slotAssignment.length === liveKeys.length && liveKeys.every((k) => slotAssignment.includes(k));
  const effectiveSlots: GridKey[] = isValidSlotAssignment ? slotAssignment : liveKeys;
  const slotsKey = [...liveKeys].sort().join(",");

  const totalSpecialDayMinutes = specialDays.reduce((sum, d) => sum + d.hours * 60, 0);
  const weightByKey = computeBoundedWeights(
    liveKeys.map((key) => {
      if (key === SPECIAL_DAY_AGG_KEY) return { key, raw: totalSpecialDayMinutes };
      const p = projectById.get(Number(key.slice(2)))!;
      return { key, raw: p.loggedMinutes };
    })
  );

  const treeStructure = useMemo(() => {
    if (liveKeys.length === 0) return null;
    const items = liveKeys.map((key, slot) => ({ slot, weight: weightByKey.get(key) ?? 1 }));
    return buildTreeStructure(items, 100, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- topology intentionally frozen to slot membership; only slotsKey changes should rebuild it
  }, [slotsKey]);

  const weightBySlot = new Map(
    effectiveSlots.map((key, slot) => [slot, weightByKey.get(key) ?? 1])
  );
  const treemapNodes: TreemapNode[] = treeStructure
    ? layoutTree(treeStructure, weightBySlot, 0, 0, 100, 100).map((r) => ({
        ...r,
        key: effectiveSlots[r.slot],
      }))
    : [];

  // Edit/comment dialogs always operate on the real (unscaled) project data,
  // never the Month/Year projection.
  const realProjectById = new Map(projects.map((p) => [p.id, p]));
  const commentModalProject =
    commentModalId !== null ? (realProjectById.get(commentModalId) ?? null) : null;
  const adjustModalProject =
    adjustModalId !== null ? (realProjectById.get(adjustModalId) ?? null) : null;
  const editProject = editProjectId !== null ? (realProjectById.get(editProjectId) ?? null) : null;
  const editingSpecialDay =
    editingSpecialDayId !== null ? (specialDayById.get(editingSpecialDayId) ?? null) : null;

  const activeDragPreview = (() => {
    if (activeDragId === null) return null;
    if (typeof activeDragId === "number") {
      const p = realProjectById.get(activeDragId);
      return p ? { title: p.title, Icon: PROJECT_ICONS[p.icon] } : null;
    }
    if (activeDragId.startsWith("p-")) {
      const p = realProjectById.get(Number(activeDragId.slice(2)));
      return p ? { title: p.title, Icon: PROJECT_ICONS[p.icon] } : null;
    }
    return { title: "Special Day Block", Icon: Palmtree };
  })();

  const totalLogged = displayProjects.reduce((sum, p) => sum + p.loggedMinutes / 60, 0);
  const totalTarget = displayProjects.reduce((sum, p) => sum + p.targetHours, 0);
  const overallPct = totalTarget > 0 ? Math.round((totalLogged / totalTarget) * 100) : 0;

  return (
    <div className="bg-white rounded-lg border border-garden-border shadow-card flex flex-col h-full overflow-hidden">
      {/* Panel header */}
      <div className="px-5 py-4 border-b border-garden-border space-y-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-ink-muted text-xs font-medium tracking-wide uppercase">
            <LayoutGrid className="w-3.5 h-3.5" />
            Weekly Roster Allocation Grid
          </div>

          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center rounded-md border border-garden-border bg-surface-2 p-0.5">
              {(["grid", "progress"] as ViewMode[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={[
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                    view === v
                      ? "bg-white shadow-card text-ink border border-garden-border"
                      : "text-ink-subtle hover:text-ink-muted",
                  ].join(" ")}
                >
                  {v === "grid" ? (
                    <LayoutGrid className="w-3 h-3" />
                  ) : (
                    <TrendingUp className="w-3 h-3" />
                  )}
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>

            {/* TAP unit */}
            <div className="flex items-center gap-1 rounded-md border border-garden-border bg-surface-2 p-0.5">
              <span className="pl-1.5 text-[10px] text-ink-subtle font-medium">TAP</span>
              {tapOptions.map((t) => (
                <button
                  key={t}
                  onClick={() => setTap(t)}
                  className={[
                    "px-2 py-1 rounded-md text-xs font-semibold transition-all",
                    tap === t
                      ? "bg-kale text-white shadow-card"
                      : "text-ink-subtle hover:text-ink-muted",
                  ].join(" ")}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {/* Period granularity */}
            <div className="flex items-center rounded-md border border-garden-border bg-surface-2 p-0.5">
              {periodOptions.map((p) => (
                <button
                  key={p}
                  onClick={() => changePeriod(p)}
                  className={[
                    "px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-all",
                    period === p
                      ? "bg-white shadow-card text-ink border border-garden-border"
                      : "text-ink-subtle hover:text-ink-muted",
                  ].join(" ")}
                >
                  {p}
                </button>
              ))}
            </div>

            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className="h-auto py-1.5 px-3 text-xs font-normal text-ink-muted gap-2"
                  />
                }
              >
                <CalendarDays className="w-3.5 h-3.5 text-ink-subtle" />
                <span className="font-medium">{getPeriodLabel(period, selectedDate)}</span>
                <span className="w-px h-3 bg-garden-border" />
                {periodLocked ? (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-surface-3 text-ink-muted border border-garden-border-strong flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    Read-only
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/25">
                    Draft
                  </span>
                )}
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0">
                {/* Month/Year granularity reuse the Calendar's own built-in
                    dropdown captions to jump around — same control, just a
                    different caption mode, instead of a hand-rolled picker.
                    Whatever day gets clicked, only its month/year matters. */}
                <Calendar
                  mode="single"
                  captionLayout={period === "week" ? "label" : "dropdown"}
                  selected={selectedDate}
                  onSelect={(d) => {
                    if (d) {
                      setSelectedDate(d);
                      setIsDatePickerOpen(false);
                    }
                  }}
                  startMonth={new Date(new Date().getFullYear() - 5, 0)}
                  endMonth={new Date(new Date().getFullYear() + 5, 11)}
                  autoFocus
                  modifiers={
                    period === "week"
                      ? {
                          weekTail: (day: Date) => {
                            const start = stripTime(selectedDate);
                            const end = weekEnd(start);
                            const d = stripTime(day);
                            return d > start && d <= end;
                          },
                        }
                      : undefined
                  }
                  modifiersClassNames={{ weekTail: "bg-kale/12 text-kale rounded-none" }}
                />
              </PopoverContent>
            </Popover>
            <button
              onClick={() => setSelectedDate(new Date())}
              disabled={isCurrentPeriod}
              className="text-xs font-medium text-link hover:text-link-hover disabled:text-ink-subtle disabled:cursor-not-allowed px-1"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-xs text-ink-muted mr-2">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-medium">{totalLogged.toFixed(1)}h</span>
              <span className="text-ink-subtle">/</span>
              <span>{totalTarget}h</span>
              <span
                className="font-semibold"
                style={{ color: overallPct >= 100 ? gardenColors.error : gardenColors.success }}
              >
                {overallPct}%
              </span>
            </div>
            <button
              onClick={() => {
                setEditingSpecialDayId(null);
                setIsSpecialDayOpen(true);
              }}
              disabled={periodLocked}
              title={periodLocked ? "Switch to the current week to log holiday/leave" : undefined}
              className="flex items-center gap-1.5 text-xs border border-garden-border rounded-md px-3 py-1.5 hover:bg-surface-2 transition-colors text-ink-muted font-medium disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
            >
              <Palmtree className="w-3.5 h-3.5 text-ink-subtle" />
              Log Holiday/Leave
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              disabled={periodLocked}
              title={periodLocked ? "Switch to the current week to add a project" : undefined}
              className="flex items-center gap-1.5 text-xs bg-kale hover:bg-kale-hover text-white rounded-md px-3 py-1.5 transition-colors font-medium shadow-card disabled:opacity-40 disabled:hover:bg-kale disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" />
              New Project
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Heatmap / progress */}
        <div className="space-y-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {view === "grid" ? (
              <div className="relative w-full h-[440px] rounded-lg border border-garden-border bg-surface-2 overflow-hidden">
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
                        onTap={handleTap}
                        tapUnit={tap}
                        commentCount={comments[project.id]?.length ?? 0}
                        onOpenComments={setCommentModalId}
                        onOpenAdjust={(id) => {
                          setAdjustModalId(id);
                          resetAdjustForm();
                        }}
                        onOpenEdit={setEditProjectId}
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
                    onTap={handleTap}
                    commentCount={comments[p.id]?.length ?? 0}
                    onOpenComments={setCommentModalId}
                    onOpenAdjust={(id) => {
                      setAdjustModalId(id);
                      resetAdjustForm();
                    }}
                    onOpenEdit={setEditProjectId}
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
              { label: "Under target", color: gardenColors.success },
              { label: "Near target", color: gardenColors.open },
              { label: "Exceeded", color: gardenColors.error },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5 text-[10px] text-ink-subtle">
                <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Special Day Blocks — always real, current-week data regardless of
            the period being browsed above (no Month/Year projection for these). */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] text-ink-subtle uppercase tracking-wide font-medium">
              <Trees className="w-3.5 h-3.5" />
              <Palmtree className="w-3.5 h-3.5" />
              Registered Special Day Blocks ({specialDays.length})
            </div>
            <span className="text-[10px] text-ink-subtle">Counts as non-worked roster hours</span>
          </div>

          {specialDays.length === 0 ? (
            <div className="rounded-lg border border-dashed border-garden-border bg-surface-2/50 px-5 py-4 text-center text-xs text-ink-subtle leading-relaxed">
              No public holidays or annual leaves logged for this week.{" "}
              <span
                onClick={() => {
                  setEditingSpecialDayId(null);
                  setIsSpecialDayOpen(true);
                }}
                className="font-semibold text-link cursor-pointer hover:text-link-hover hover:underline"
              >
                Click &quot;Log Holiday/Leave&quot;
              </span>{" "}
              above to register one!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {specialDays.map((day) => {
                const typeInfo = SPECIAL_DAY_TYPES.find((t) => t.value === day.type)!;
                const Icon = typeInfo.icon;
                return (
                  <div
                    key={day.id}
                    className={["rounded-lg border px-4 py-3 space-y-2", typeInfo.cardClass].join(
                      " "
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-md bg-white/70 flex items-center justify-center shrink-0">
                          <Icon className="w-3.5 h-3.5" style={{ color: typeInfo.hex }} />
                        </div>
                        <div className="min-w-0">
                          <p
                            className="text-[10px] font-semibold uppercase tracking-wide"
                            style={{ color: typeInfo.hex }}
                          >
                            {typeInfo.label}
                          </p>
                          <p className="text-[10px] text-ink-subtle">{formatSpecialRange(day)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSpecialDayId(day.id);
                            setIsSpecialDayOpen(true);
                          }}
                          title="Edit hours / dates"
                          className="w-6 h-6 rounded-md flex items-center justify-center text-ink-subtle hover:text-ink hover:bg-white/70 transition-colors"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSpecialDay(day.id)}
                          title="Delete off-day block"
                          className="w-6 h-6 rounded-md flex items-center justify-center text-ink-subtle hover:text-error hover:bg-white/70 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {day.notes && (
                      <p className="text-xs text-ink truncate" title={day.notes}>
                        {day.notes}
                      </p>
                    )}

                    <div
                      className="flex items-center justify-between pt-2 border-t"
                      style={{ borderColor: `${typeInfo.hex}33` }}
                    >
                      <span className="text-[9px] text-ink-subtle uppercase tracking-wide font-medium">
                        Roster Credit
                      </span>
                      <span className="text-xs font-bold" style={{ color: typeInfo.hex }}>
                        {day.hours}h
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-start gap-2.5 rounded-lg bg-warning/8 border border-warning/20 px-4 py-3">
            <Lightbulb className="w-3.5 h-3.5 mt-0.5 shrink-0 text-warning" />
            <p className="text-[11px] text-warning leading-relaxed">
              <span className="font-semibold">How to log:</span> Click anywhere inside a project
              tile to log time using the selected TAP unit, or drag a tile onto another to swap
              their position. Special day blocks (dashed border) are locked — drag to reposition
              them, but edit or delete them below. Use the pencil to edit project details, the clock
              to log a custom hour/minute amount or unlog hours, and the message icon to view or add
              comments.
            </p>
          </div>
        </div>

        {/* Ledger Activity — also always current-week, unaffected by the
            period selector above. */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] text-ink-subtle uppercase tracking-wide font-medium">
              <LayoutGrid className="w-3.5 h-3.5" />
              Roster Ledger Activity
            </div>
            <span className="text-[10px] font-semibold text-ink-muted bg-surface-2 px-2 py-0.5 rounded-full">
              {ledger.length} Records
            </span>
          </div>

          {ledger.length === 0 ? (
            <div className="rounded-lg border border-dashed border-garden-border bg-surface-2/50 px-5 py-4 text-center text-xs text-ink-subtle leading-relaxed">
              No activity yet. Tap a project block or log an adjustment to start the ledger.
            </div>
          ) : (
            <div className="relative space-y-3">
              <div className="absolute left-[9px] top-3 bottom-3 w-px bg-garden-border" />

              {ledger.map((entry) => {
                const Icon = PROJECT_ICONS[entry.icon];
                const isDeduction = entry.note.startsWith("−");
                const color = isDeduction ? gardenColors.error : gardenColors.success;
                return (
                  <div key={entry.id} className="relative pl-7">
                    <div
                      className="absolute left-0 top-3 w-[18px] h-[18px] rounded-full flex items-center justify-center"
                      style={{ backgroundColor: color }}
                    >
                      <ChevronRight className="w-2.5 h-2.5 text-white" />
                    </div>

                    <div className="rounded-lg border border-garden-border bg-white p-4 space-y-3 hover:border-garden-border-strong transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wide border border-garden-border rounded-md px-2 py-0.5 bg-surface-2">
                          {isDeduction ? "Roster Hour Deducted" : "Roster Hour Credited"}
                        </span>
                        <span className="text-[10px] text-ink-subtle">{entry.timestamp}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
                          <span className="text-sm font-semibold text-ink">
                            {entry.projectTitle}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-ink-subtle pl-5">
                          <MapPin className="w-3 h-3" />
                          {entry.company}
                        </div>
                      </div>

                      <div
                        className="flex items-center gap-2.5 rounded-md px-3 py-2"
                        style={{ backgroundColor: `${color}14`, border: `1px solid ${color}33` }}
                      >
                        <div
                          className="w-4 h-4 rounded-md flex items-center justify-center shrink-0"
                          style={{ backgroundColor: color }}
                        >
                          <span className="text-[8px] text-white font-bold">
                            {isDeduction ? "−" : "✓"}
                          </span>
                        </div>
                        <span className="text-xs italic" style={{ color }}>
                          &quot;{entry.note}&quot;
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <p className="text-center text-[10px] text-ink-subtle/70 pb-1">
          Systems Inc. · Secure Timesheet Certified Ledger · ledger-v3.8
        </p>
      </div>

      {commentModalProject && (
        <CommentsModal
          project={commentModalProject}
          comments={comments[commentModalProject.id] ?? []}
          draft={commentDraft}
          onDraftChange={setCommentDraft}
          onAdd={submitComment}
          onClose={() => {
            setCommentModalId(null);
            setCommentDraft("");
          }}
        />
      )}

      {adjustModalProject && (
        <AdjustModal
          project={adjustModalProject}
          sign={adjustSign}
          onSignChange={setAdjustSign}
          hours={adjustHours}
          onHoursChange={setAdjustHours}
          minutes={adjustMinutes}
          onMinutesChange={setAdjustMinutes}
          note={adjustNote}
          onNoteChange={setAdjustNote}
          onSave={submitAdjust}
          onClose={() => setAdjustModalId(null)}
        />
      )}

      <ProjectFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onCreate={addProject} />
      <ProjectFormDialog
        open={editProject !== null}
        onOpenChange={(open) => !open && setEditProjectId(null)}
        project={editProject}
        onSave={updateProject}
      />

      <SpecialDayDialog
        open={isSpecialDayOpen}
        onOpenChange={(open) => {
          setIsSpecialDayOpen(open);
          if (!open) setEditingSpecialDayId(null);
        }}
        editing={editingSpecialDay}
        onSave={addSpecialDay}
        onUpdate={updateSpecialDay}
      />
    </div>
  );
}
