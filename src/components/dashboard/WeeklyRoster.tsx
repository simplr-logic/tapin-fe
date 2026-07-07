"use client";

import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Palmtree } from "lucide-react";
import { useMemo, useState } from "react";

import { SpecialDayDialog, type SpecialDay } from "@/components/dashboard/SpecialDayDialog";
import { ProjectFormDialog } from "@/components/projects/ProjectFormDialog";
import { useProjects } from "@/components/providers/ProjectsProvider";
import { useTimesheets } from "@/components/providers/TimesheetProvider";
import { TAP_MINUTES, PERIOD_SCALE, type TapUnit, type PeriodView } from "@/config/constants";

import { AdjustModal } from "./roster/AdjustModal";
import { CommentsModal } from "./roster/CommentsModal";
import { PROJECT_ICONS, SPECIAL_DAY_AGG_KEY } from "./roster/constants";
import { LedgerSection } from "./roster/LedgerSection";
import { RosterControls } from "./roster/RosterControls";
import { RosterGrid } from "./roster/RosterGrid";
import { SpecialDaySection } from "./roster/SpecialDaySection";
import { computeBoundedWeights, buildTreeStructure, layoutTree } from "./roster/treemap";
import { isSamePeriod, formatHours } from "./roster/utils";

import type { GridKey, ViewMode } from "./roster/types";

const toGridKey = (id: number): GridKey => `p-${id}`;

export default function WeeklyRoster() {
  const { projects, comments, ledger, addProject, updateProject, adjustLoggedMinutes, addComment } =
    useProjects();
  const { currentWeekRecord } = useTimesheets();

  const [listOrder, setListOrder] = useState<number[]>([]);
  const [slotAssignment, setSlotAssignment] = useState<GridKey[]>([]);
  const [view, setView] = useState<ViewMode>("grid");
  const [period, setPeriod] = useState<PeriodView>("week");
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [tap, setTap] = useState<TapUnit>("1h");
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
  const [activeDragId, setActiveDragId] = useState<GridKey | number | null>(null);

  const isCurrentPeriod = isSamePeriod(selectedDate, new Date(), period);
  const periodLocked = period !== "week" || !isCurrentPeriod || currentWeekRecord !== null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  function changePeriod(next: PeriodView) {
    setPeriod(next);
    setSelectedDate(new Date());
  }
  function handleTap(id: number, sign: 1 | -1 = 1) {
    adjustLoggedMinutes(id, sign * TAP_MINUTES[tap]);
  }
  function addSpecialDay(input: Omit<SpecialDay, "id">) {
    setSpecialDays((prev) => [...prev, { ...input, id: Date.now() }]);
  }
  function updateSpecialDay(id: number, input: Omit<SpecialDay, "id">) {
    setSpecialDays((prev) => prev.map((d) => (d.id === id ? { ...input, id } : d)));
  }
  function removeSpecialDay(id: number) {
    setSpecialDays((prev) => prev.filter((d) => d.id !== id));
  }

  function resetAdjustForm() {
    setAdjustSign("add");
    setAdjustHours(1);
    setAdjustMinutes(0);
    setAdjustNote("");
  }

  function submitComment() {
    if (commentModalId === null || !commentDraft.trim()) return;
    addComment(commentModalId, commentDraft.trim());
    setCommentDraft("");
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
    if (describedNote) addComment(adjustModalId, describedNote);
    setAdjustModalId(null);
    resetAdjustForm();
  }

  // Data derivation
  const periodScale = PERIOD_SCALE[period];
  const displayProjects =
    period === "week"
      ? projects
      : projects.map((p) => ({
          ...p,
          loggedMinutes: Math.round(p.loggedMinutes * periodScale),
          targetHours: Math.round(p.targetHours * periodScale),
        }));

  const projectById = new Map(displayProjects.map((p) => [p.id, p]));
  const specialDayById = new Map(specialDays.map((d) => [d.id, d]));
  const orderedProjectIds = [
    ...listOrder.filter((id) => projectById.has(id)),
    ...displayProjects.map((p) => p.id).filter((id) => !listOrder.includes(id)),
  ];
  const orderedProjects = orderedProjectIds.map((id) => projectById.get(id)!);

  const liveKeys: GridKey[] = [
    ...displayProjects.map((p) => toGridKey(p.id)),
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
    if (view === "grid") handleGridSwap(active.id as GridKey, over.id as GridKey);
    else handleListReorder(Number(active.id), Number(over.id));
  }

  const openAddSpecialDay = () => {
    setEditingSpecialDayId(null);
    setIsSpecialDayOpen(true);
  };

  return (
    <div className="bg-white rounded-lg border border-garden-border shadow-card flex flex-col h-full overflow-hidden">
      <RosterControls
        view={view}
        setView={setView}
        tap={tap}
        setTap={setTap}
        period={period}
        changePeriod={changePeriod}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        isDatePickerOpen={isDatePickerOpen}
        setIsDatePickerOpen={setIsDatePickerOpen}
        periodLocked={periodLocked}
        isCurrentPeriod={isCurrentPeriod}
        totalLogged={totalLogged}
        totalTarget={totalTarget}
        overallPct={overallPct}
        onAddSpecialDay={openAddSpecialDay}
        onNewProject={() => setIsCreateOpen(true)}
      />
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        <RosterGrid
          view={view}
          treemapNodes={treemapNodes}
          orderedProjects={orderedProjects}
          projectById={projectById}
          comments={comments}
          periodLocked={periodLocked}
          specialDays={specialDays}
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
          specialDays={specialDays}
          periodLocked={periodLocked}
          onAdd={openAddSpecialDay}
          onEdit={(id) => {
            setEditingSpecialDayId(id);
            setIsSpecialDayOpen(true);
          }}
          onRemove={removeSpecialDay}
        />
        <LedgerSection ledger={ledger} />
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
