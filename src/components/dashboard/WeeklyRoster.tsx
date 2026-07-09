"use client";

import { KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { Palmtree } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { SpecialDayDialog } from "@/components/dashboard/SpecialDayDialog";
import { ProjectFormDialog } from "@/components/projects/ProjectFormDialog";
import { sumLogs, useProjects } from "@/components/providers/ProjectsProvider";
import { useTimesheets } from "@/components/providers/TimesheetProvider";
import {
  MAX_TILE_RATIO,
  type PeriodView,
  TAP_MINUTES,
  type TapUnit,
  TARGET_SCALE,
} from "@/config/constants";

import { AdjustModal } from "./roster/AdjustModal";
import { CommentsModal } from "./roster/CommentsModal";
import { PROJECT_ICONS, SPECIAL_DAY_AGG_KEY } from "./roster/constants";
import { LedgerSection } from "./roster/LedgerSection";
import { RosterActionBar } from "./roster/RosterActionBar";
import { RosterControls } from "./roster/RosterControls";
import { RosterGrid } from "./roster/RosterGrid";
import { SpecialDaySection } from "./roster/SpecialDaySection";
import { buildTreeStructure, layoutTree } from "./roster/treemap";
import { useRosterDrag } from "./roster/useRosterDrag";
import { useSpecialDays } from "./roster/useSpecialDays";
import { formatHours, getPeriodRange, isSamePeriod } from "./roster/utils";

import type { DisplayProject, GridKey, ViewMode } from "./roster/types";

const toGridKey = (id: number): GridKey => `p-${id}`;

export default function WeeklyRoster({ externalDate }: { externalDate?: Date }) {
  const { projects, comments, ledger, addProject, updateProject, adjustLoggedMinutes, addComment } =
    useProjects();
  const { isMonthSubmitted } = useTimesheets();

  const [listOrder, setListOrder] = useState<number[]>([]);
  const [slotAssignment, setSlotAssignment] = useState<GridKey[]>([]);
  const [view, setView] = useState<ViewMode>("grid");
  const [period, setPeriod] = useState<PeriodView>("week");
  const [selectedDate, setSelectedDate] = useState<Date>(() => externalDate ?? new Date());
  const isMounted = useRef(false);
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (externalDate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedDate(externalDate);
      setPeriod("day");
    }
  }, [externalDate]);

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [tap, setTap] = useState<TapUnit>("1h");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [commentModalId, setCommentModalId] = useState<number | null>(null);
  const [adjustModalId, setAdjustModalId] = useState<number | null>(null);
  const [editProjectId, setEditProjectId] = useState<number | null>(null);
  const [adjustSign, setAdjustSign] = useState<"add" | "subtract">("add");
  const [adjustHours, setAdjustHours] = useState(1);
  const [adjustMinutes, setAdjustMinutes] = useState(0);
  const [adjustNote, setAdjustNote] = useState("");

  const sd = useSpecialDays();

  const isCurrentPeriod = isSamePeriod(selectedDate, new Date(), period);
  const periodLocked = isMonthSubmitted(selectedDate);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  function changePeriod(next: PeriodView) {
    setPeriod(next);
    setSelectedDate(new Date());
  }
  function handleTap(id: number, sign: 1 | -1 = 1) {
    const logDate = period === "day" ? selectedDate.toLocaleDateString("en-CA") : undefined;
    adjustLoggedMinutes(id, sign * TAP_MINUTES[tap], undefined, logDate);
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
    const note = trimmedNote
      ? `${adjustSign === "add" ? "+" : "−"}${formatHours(totalMinutes)} — ${trimmedNote}`
      : undefined;
    const logDate = period === "day" ? selectedDate.toLocaleDateString("en-CA") : undefined;
    adjustLoggedMinutes(adjustModalId, delta, note, logDate);
    if (note) addComment(adjustModalId, note);
    setAdjustModalId(null);
    resetAdjustForm();
  }

  const { start: periodStart, end: periodEnd } = getPeriodRange(period, selectedDate);
  const displayProjects = projects.map((p) => ({
    ...p,
    loggedMinutes: sumLogs(p.logs, periodStart, periodEnd),
    targetHours: Math.max(1, Math.round(p.targetHours * TARGET_SCALE[period])),
  }));

  const projectById = new Map<number, DisplayProject>(displayProjects.map((p) => [p.id, p]));
  const orderedProjectIds = [
    ...listOrder.filter((id) => projectById.has(id)),
    ...displayProjects.map((p) => p.id).filter((id) => !listOrder.includes(id)),
  ];
  const orderedProjects: DisplayProject[] = orderedProjectIds.map((id) => projectById.get(id)!);

  const liveKeys: GridKey[] = [
    ...displayProjects.map((p) => toGridKey(p.id)),
    ...(!periodLocked && sd.specialDays.length > 0 ? [SPECIAL_DAY_AGG_KEY] : []),
  ];
  const isValidSlotAssignment =
    slotAssignment.length === liveKeys.length && liveKeys.every((k) => slotAssignment.includes(k));
  const effectiveSlots: GridKey[] = isValidSlotAssignment ? slotAssignment : liveKeys;
  const slotsKey = [...liveKeys].sort().join(",");

  const totalSpecialDayMinutes = sd.specialDays.reduce((sum, d) => sum + d.hours * 60, 0);

  // Anchor weights to per-item average target so 0h projects are equal-sized,
  // and special day hours scale proportionally (8h vs 16h produce visibly different tiles).
  const perItemTargetMinutes =
    displayProjects.length > 0
      ? displayProjects.reduce((s, p) => s + p.targetHours * 60, 0) / displayProjects.length
      : 480;
  const weightByKey = new Map<GridKey, number>(
    liveKeys.map((key) => {
      const raw =
        key === SPECIAL_DAY_AGG_KEY
          ? totalSpecialDayMinutes
          : (projectById.get(Number(key.slice(2)))?.loggedMinutes ?? 0);
      return [key, Math.max(1, (raw / perItemTargetMinutes) * MAX_TILE_RATIO)];
    })
  );

  // Build with equal weights so topology is always a balanced binary tree.
  // layoutTree handles proportional sizing via live weightBySlot.
  const treeStructure = useMemo(() => {
    if (liveKeys.length === 0) return null;
    const items = liveKeys.map((_key, slot) => ({ slot, weight: 1 }));
    return buildTreeStructure(items, 100, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotsKey]);

  const weightBySlot = new Map(
    effectiveSlots.map((key, slot) => [slot, weightByKey.get(key) ?? 1])
  );
  const treemapNodes = treeStructure
    ? layoutTree(treeStructure, weightBySlot, 0, 0, 100, 100).map((r) => ({
        ...r,
        key: effectiveSlots[r.slot],
      }))
    : [];

  const realProjectById = new Map(projects.map((p) => [p.id, p]));
  const commentModalProject =
    commentModalId !== null ? (realProjectById.get(commentModalId) ?? null) : null;
  const adjustModalProject =
    adjustModalId !== null ? (realProjectById.get(adjustModalId) ?? null) : null;
  const editProject = editProjectId !== null ? (realProjectById.get(editProjectId) ?? null) : null;

  const { activeDragId, handleDragStart, handleDragEnd } = useRosterDrag({
    view,
    effectiveSlots,
    setSlotAssignment,
    orderedProjectIds,
    setListOrder,
  });

  const activeDragPreview = (() => {
    if (activeDragId === null) return null;
    if (typeof activeDragId === "number") {
      const p = realProjectById.get(activeDragId);
      return p ? { title: p.title, Icon: PROJECT_ICONS[p.icon] } : null;
    }
    if ((activeDragId as string).startsWith("p-")) {
      const p = realProjectById.get(Number((activeDragId as string).slice(2)));
      return p ? { title: p.title, Icon: PROJECT_ICONS[p.icon] } : null;
    }
    return { title: "Special Day Block", Icon: Palmtree };
  })();

  const totalLogged = displayProjects.reduce((sum, p) => sum + p.loggedMinutes / 60, 0);
  const totalTarget = displayProjects.reduce((sum, p) => sum + p.targetHours, 0);
  const overallPct = totalTarget > 0 ? Math.round((totalLogged / totalTarget) * 100) : 0;

  return (
    <div className="bg-white rounded-lg border border-garden-border shadow-card flex flex-col h-full overflow-hidden">
      <RosterControls
        period={period}
        changePeriod={changePeriod}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        isDatePickerOpen={isDatePickerOpen}
        setIsDatePickerOpen={setIsDatePickerOpen}
        periodLocked={periodLocked}
        isCurrentPeriod={isCurrentPeriod}
        view={view}
        setView={setView}
        tap={tap}
        setTap={setTap}
      />
      <div className="flex-1 overflow-y-auto p-3 md:p-5 space-y-3 md:space-y-4">
        <RosterActionBar
          totalLogged={totalLogged}
          totalTarget={totalTarget}
          overallPct={overallPct}
          periodLocked={periodLocked}
          onAddSpecialDay={sd.openAdd}
          onNewProject={() => setIsCreateOpen(true)}
        />
        <RosterGrid
          view={view}
          treemapNodes={treemapNodes}
          orderedProjects={orderedProjects}
          projectById={projectById}
          periodLocked={periodLocked}
          specialDays={sd.specialDays}
          tapUnit={tap}
          activeDragPreview={activeDragPreview}
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onTap={handleTap}
          onOpenComments={setCommentModalId}
          onOpenAdjust={(id) => {
            setAdjustModalId(id);
            resetAdjustForm();
          }}
          onOpenEdit={setEditProjectId}
        />
        <SpecialDaySection
          specialDays={sd.specialDays}
          onAdd={sd.openAdd}
          onEdit={sd.openEdit}
          onRemove={sd.remove}
        />
        <LedgerSection ledger={ledger} />
        <p className="text-center text-[10px] text-ink-subtle/70 pb-1">
          Systems Inc. · Secure Timesheet Certified Ledger · ledger-v3.8
        </p>
      </div>

      {commentModalProject && (
        <CommentsModal
          project={commentModalProject}
          comments={commentModalId !== null ? (comments[commentModalId] ?? []) : []}
          onClose={() => setCommentModalId(null)}
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
        open={sd.isOpen}
        onOpenChange={(open) => !open && sd.closeDialog()}
        editing={sd.editingDay}
        onSave={sd.add}
        onUpdate={sd.update}
      />
    </div>
  );
}
