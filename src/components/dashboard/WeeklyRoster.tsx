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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useProjects, type Project, type Comment } from "@/components/providers/ProjectsProvider";
import { ProjectFormDialog } from "@/components/projects/ProjectFormDialog";
import {
  SpecialDayDialog,
  SPECIAL_DAY_TYPES,
  type SpecialDay,
} from "@/components/dashboard/SpecialDayDialog";
import { TAP_MINUTES, MIN_TILE_WEIGHT, type TapUnit } from "@/config/constants";
import { gardenColors } from "@/config/theme";

type ViewMode = "grid" | "progress";

const PROJECT_ICONS = {
  truck: Truck,
  building: Building2,
  grid: LayoutGrid,
  cloud: Cloud,
} as const;

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

// Binary-split treemap. The split *topology* (which projects share a branch, and
// whether that branch cuts vertically or horizontally) is frozen from the current
// `order` array via buildTreeStructure, and only rebuilt when the user manually
// drags a tile to reorder. Every render then only recomputes the ratio *within*
// each frozen split from live weights (layoutTree) — so a tile can grow or shrink
// smoothly as it's tapped, but never jumps to a different quadrant on its own.
interface TreemapNode {
  id: number;
  project: Project;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface TreeLeaf {
  type: "leaf";
  id: number;
}
interface TreeSplit {
  type: "split";
  axis: "v" | "h";
  leftIds: number[];
  rightIds: number[];
  left: TreeStruct;
  right: TreeStruct;
}
type TreeStruct = TreeLeaf | TreeSplit;

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
  items: { id: number; weight: number }[],
  w: number,
  h: number
): TreeStruct {
  if (items.length === 1) return { type: "leaf", id: items[0].id };

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
    leftIds: firstGroup.map((i) => i.id),
    rightIds: secondGroup.map((i) => i.id),
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
  weightById: Map<number, number>,
  x: number,
  y: number,
  w: number,
  h: number
): { id: number; x: number; y: number; w: number; h: number }[] {
  if (node.type === "leaf") return [{ id: node.id, x, y, w, h }];

  const leftWeight = node.leftIds.reduce((sum, id) => sum + (weightById.get(id) ?? 0), 0);
  const rightWeight = node.rightIds.reduce((sum, id) => sum + (weightById.get(id) ?? 0), 0);
  const ratio = leftWeight / (leftWeight + rightWeight || 1);

  if (node.axis === "v") {
    const leftW = w * ratio;
    return [
      ...layoutTree(node.left, weightById, x, y, leftW, h),
      ...layoutTree(node.right, weightById, x + leftW, y, w - leftW, h),
    ];
  }
  const leftH = h * ratio;
  return [
    ...layoutTree(node.left, weightById, x, y, w, leftH),
    ...layoutTree(node.right, weightById, x, y + leftH, w, h - leftH),
  ];
}

function getHeatStyle(pct: number): { bg: string; border: string; pctColor: string } {
  if (pct >= 120)
    return { bg: "bg-error/18", border: "border-error/45", pctColor: gardenColors.error };
  if (pct >= 100)
    return { bg: "bg-open/16", border: "border-open/40", pctColor: gardenColors.open };
  if (pct >= 85)
    return { bg: "bg-warning/16", border: "border-warning/40", pctColor: gardenColors.warning };
  if (pct >= 60)
    return { bg: "bg-success/14", border: "border-success/35", pctColor: gardenColors.success };
  if (pct >= 30)
    return { bg: "bg-success/8", border: "border-success/22", pctColor: gardenColors.success };
  return { bg: "bg-surface-2", border: "border-garden-border", pctColor: gardenColors.inkSubtle };
}

// Each card is simultaneously a drag source and a drop target: dragging one onto
// another swaps their slot in `order`. PointerSensor's activation distance (see
// the DndContext below) means a plain tap still reaches onClick — only a
// deliberate drag gesture is captured by dnd-kit, so tap-to-log and drag-to-reorder
// don't fight each other.

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
}: Omit<TileActionsProps, "commentCount" | "onOpenComments" | "onOpenEdit"> & {
  className: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onOpenAdjust(project.id);
      }}
      title="Log a custom hour / unlog hours"
      className={[
        "rounded-md flex items-center justify-center text-ink-muted bg-white border border-garden-border hover:bg-surface-2 hover:text-ink transition-colors shrink-0",
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

function ProjectHeatBlock({
  node,
  onTap,
  tapUnit,
  commentCount,
  onOpenComments,
  onOpenAdjust,
  onOpenEdit,
}: {
  node: TreemapNode;
  onTap: (id: number) => void;
  tapUnit: TapUnit;
  commentCount: number;
  onOpenComments: (id: number) => void;
  onOpenAdjust: (id: number) => void;
  onOpenEdit: (id: number) => void;
}) {
  const { project } = node;
  const [tapping, setTapping] = useState(false);
  const pct = getPct(project.loggedMinutes, project.targetHours);
  const style = getHeatStyle(pct);
  const barPct = Math.min(100, pct);
  const draggable = useDraggable({ id: project.id, disabled: tapping });
  const droppable = useDroppable({ id: project.id });

  const isSuperMicro = node.w < 11 || node.h < 14;
  const isMicro = !isSuperMicro && (node.w < 24 || node.h < 26);

  function handleClick() {
    setTapping(true);
    onTap(project.id);
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
        ref={(node) => {
          draggable.setNodeRef(node);
          droppable.setNodeRef(node);
        }}
        onClick={handleClick}
        {...draggable.listeners}
        {...draggable.attributes}
        style={{
          transform: tapping ? "scale(0.97)" : "scale(1)",
          opacity: draggable.isDragging ? 0.35 : 1,
        }}
        className={[
          "relative w-full h-full border rounded-lg flex flex-col cursor-pointer select-none overflow-hidden touch-none",
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
                <p
                  className="text-xs font-semibold leading-tight truncate text-ink"
                  title={project.title}
                >
                  {project.title}
                </p>
                <p className="text-[10px] mt-0.5 truncate text-ink-muted">{project.company}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                <EditProjectButton project={project} onOpenEdit={onOpenEdit} className="w-5 h-5" />
                <AdjustHoursButton
                  project={project}
                  onOpenAdjust={onOpenAdjust}
                  className="w-5 h-5"
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
            <MousePointerClick className="w-3 h-3 text-white" />
            <span className="text-[10px] font-semibold text-white">+{tapUnit}</span>
          </div>
        </div>
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
}: {
  project: Project;
  onTap: (id: number) => void;
  commentCount: number;
  onOpenComments: (id: number) => void;
  onOpenAdjust: (id: number) => void;
  onOpenEdit: (id: number) => void;
}) {
  const [tapping, setTapping] = useState(false);
  const pct = getPct(project.loggedMinutes, project.targetHours);
  const style = getHeatStyle(pct);
  const barPct = Math.min(100, pct);
  const Icon = PROJECT_ICONS[project.icon];
  const draggable = useDraggable({ id: project.id, disabled: tapping });
  const droppable = useDroppable({ id: project.id });

  function handleClick() {
    setTapping(true);
    onTap(project.id);
    setTimeout(() => setTapping(false), 200);
  }

  return (
    <div
      ref={(node) => {
        draggable.setNodeRef(node);
        droppable.setNodeRef(node);
      }}
      onClick={handleClick}
      {...draggable.listeners}
      {...draggable.attributes}
      style={{
        transform: tapping ? "scale(0.99)" : "scale(1)",
        opacity: draggable.isDragging ? 0.35 : 1,
      }}
      className={[
        "rounded-lg border bg-white p-4 cursor-pointer select-none transition-all hover:border-garden-border-strong touch-none",
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
            <p className="text-sm font-semibold text-ink truncate">{project.title}</p>
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
          <AdjustHoursButton project={project} onOpenAdjust={onOpenAdjust} className="w-7 h-7" />
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

function DragGhost({ project }: { project: Project }) {
  const Icon = PROJECT_ICONS[project.icon];
  return (
    <div className="flex items-center gap-2 rounded-md bg-kale text-white px-3 py-2 shadow-elevated text-xs font-semibold">
      <Icon className="w-3.5 h-3.5" />
      {project.title}
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
  // Progress view: manual drag overrides for the flat list. Ids not yet present
  // (freshly added, or from before this mount) are appended in natural order.
  const [listOrder, setListOrder] = useState<number[]>([]);
  // Grid view: which project occupies which fixed treemap slot (see below).
  const [slotAssignment, setSlotAssignment] = useState<number[]>([]);
  const [view, setView] = useState<ViewMode>("grid");
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

  function addSpecialDay(input: Omit<SpecialDay, "id">) {
    setSpecialDays((prev) => [...prev, { ...input, id: Date.now() }]);
  }

  function removeSpecialDay(id: number) {
    setSpecialDays((prev) => prev.filter((d) => d.id !== id));
  }

  const [activeDragId, setActiveDragId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  function handleTap(id: number) {
    adjustLoggedMinutes(id, TAP_MINUTES[tap]);
  }

  // Progress view: splice-insert reorder — a normal list shuffle where the
  // dragged row moves in and everything between shifts by one, same as any
  // reorderable list.
  function handleListReorder(fromId: number, toId: number) {
    if (fromId === toId) return;
    const from = orderedIds.indexOf(fromId);
    const to = orderedIds.indexOf(toId);
    if (from === -1 || to === -1) return;
    const next = [...orderedIds];
    next.splice(from, 1);
    next.splice(to, 0, fromId);
    setListOrder(next);
  }

  // Grid view: swap which project occupies which fixed treemap slot. Unlike a
  // list splice, this only touches the two dragged slots' geometry — every
  // other tile's position and size is untouched, since the split topology is
  // keyed by slot index, not by project id (see effectiveSlots/treeStructure).
  function handleGridSwap(fromId: number, toId: number) {
    if (fromId === toId) return;
    const fromSlot = effectiveSlots.indexOf(fromId);
    const toSlot = effectiveSlots.indexOf(toId);
    if (fromSlot === -1 || toSlot === -1) return;
    const next = [...effectiveSlots];
    [next[fromSlot], next[toSlot]] = [next[toSlot], next[fromSlot]];
    setSlotAssignment(next);
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveDragId(Number(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveDragId(null);
    if (over && active.id !== over.id) {
      if (view === "grid") {
        handleGridSwap(Number(active.id), Number(over.id));
      } else {
        handleListReorder(Number(active.id), Number(over.id));
      }
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

  const projectById = new Map(projects.map((p) => [p.id, p]));
  const weightById = new Map(
    projects.map((p) => [p.id, Math.max(MIN_TILE_WEIGHT, Math.sqrt(Math.max(1, p.loggedMinutes)))])
  );

  // Progress view ordering — a plain id sequence, new/foreign ids fall back to
  // their natural order from the shared project list.
  const orderedIds = [
    ...listOrder.filter((id) => projectById.has(id)),
    ...projects.map((p) => p.id).filter((id) => !listOrder.includes(id)),
  ];
  const orderedProjects = orderedIds.map((id) => projectById.get(id)!);

  // Grid view: fixed slots. The split topology is keyed by slot index (0..n-1)
  // and only rebuilt when the *set* of project ids changes (add/remove) — never
  // from live weight changes or from swapping which project sits in which slot.
  // That's what keeps tapping from jittering the layout and keeps a manual drag
  // contained to just the two swapped tiles instead of reshuffling everything.
  const liveIds = projects.map((p) => p.id);
  const isValidSlotAssignment =
    slotAssignment.length === liveIds.length && liveIds.every((id) => slotAssignment.includes(id));
  const effectiveSlots = isValidSlotAssignment ? slotAssignment : liveIds;
  const slotsKey = [...liveIds].sort((a, b) => a - b).join(",");

  const treeStructure = useMemo(() => {
    const items = liveIds.map((id, slot) => ({ id: slot, weight: weightById.get(id) ?? 1 }));
    return buildTreeStructure(items, 100, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- topology intentionally frozen to the slot count; only membership changes (slotsKey) should rebuild it
  }, [slotsKey]);

  const weightBySlot = new Map(effectiveSlots.map((id, slot) => [slot, weightById.get(id) ?? 1]));
  const treemapNodes: TreemapNode[] = layoutTree(treeStructure, weightBySlot, 0, 0, 100, 100).map(
    (r) => {
      const projectId = effectiveSlots[r.id];
      return { ...r, id: projectId, project: projectById.get(projectId)! };
    }
  );

  const commentModalProject =
    commentModalId !== null ? (projectById.get(commentModalId) ?? null) : null;
  const adjustModalProject =
    adjustModalId !== null ? (projectById.get(adjustModalId) ?? null) : null;
  const editProject = editProjectId !== null ? (projectById.get(editProjectId) ?? null) : null;
  const activeDragProject = activeDragId !== null ? (projectById.get(activeDragId) ?? null) : null;

  const totalLogged = projects.reduce((sum, p) => sum + p.loggedMinutes / 60, 0);
  const totalTarget = projects.reduce((sum, p) => sum + p.targetHours, 0);
  const overallPct = Math.round((totalLogged / totalTarget) * 100);

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
          <button className="flex items-center gap-2 text-xs border border-garden-border rounded-md px-3 py-1.5 hover:bg-surface-2 transition-colors text-ink-muted">
            <CalendarDays className="w-3.5 h-3.5 text-ink-subtle" />
            <span className="font-medium">Week 27 (Current)</span>
            <span className="w-px h-3 bg-garden-border" />
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/25">
              Draft
            </span>
          </button>

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
              onClick={() => setIsSpecialDayOpen(true)}
              className="flex items-center gap-1.5 text-xs border border-garden-border rounded-md px-3 py-1.5 hover:bg-surface-2 transition-colors text-ink-muted font-medium"
            >
              <Palmtree className="w-3.5 h-3.5 text-ink-subtle" />
              Log Holiday/Leave
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-1.5 text-xs bg-kale hover:bg-kale-hover text-white rounded-md px-3 py-1.5 transition-colors font-medium shadow-card"
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
                {treemapNodes.map((node) => (
                  <ProjectHeatBlock
                    key={node.id}
                    node={node}
                    onTap={handleTap}
                    tapUnit={tap}
                    commentCount={comments[node.id]?.length ?? 0}
                    onOpenComments={setCommentModalId}
                    onOpenAdjust={(id) => {
                      setAdjustModalId(id);
                      resetAdjustForm();
                    }}
                    onOpenEdit={setEditProjectId}
                  />
                ))}
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
                  />
                ))}
              </div>
            )}
            <DragOverlay>
              {activeDragProject && <DragGhost project={activeDragProject} />}
            </DragOverlay>
          </DndContext>

          {/* Legend */}
          <div className="flex items-center justify-end gap-4 pt-1">
            {[
              { label: "Under target", color: gardenColors.success },
              { label: "Near target", color: gardenColors.warning },
              { label: "Exceeded", color: gardenColors.error },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5 text-[10px] text-ink-subtle">
                <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Special Day Blocks */}
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
                onClick={() => setIsSpecialDayOpen(true)}
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
                          <p className="text-[10px] text-ink-subtle">
                            {formatSpecialDate(day.date)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSpecialDay(day.id)}
                        title="Delete off-day block"
                        className="w-6 h-6 rounded-md flex items-center justify-center text-ink-subtle hover:text-error hover:bg-white/70 transition-colors shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
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
              block to log time using the selected TAP unit, or drag a block onto another to swap
              their order. Use the pencil to edit project details, the clock to log a custom
              hour/minute amount or unlog hours, and the message icon to view or add comments.
            </p>
          </div>
        </div>

        {/* Ledger Activity */}
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
        onOpenChange={setIsSpecialDayOpen}
        onSave={addSpecialDay}
      />
    </div>
  );
}
