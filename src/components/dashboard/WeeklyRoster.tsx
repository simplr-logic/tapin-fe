"use client";

import { KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { Palmtree } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { SpecialDayDialog } from "@/components/dashboard/SpecialDayDialog";
import { sumLogs, useProjects } from "@/components/providers/ProjectsProvider";
import { useTimesheets } from "@/components/providers/TimesheetProvider";
import { type PeriodView, TAP_MINUTES, TARGET_SCALE } from "@/config/constants";

import { AdjustModal } from "./roster/AdjustModal";
import { PROJECT_ICONS, SPECIAL_DAY_AGG_KEY } from "./roster/constants";
import { LedgerSection } from "./roster/LedgerSection";
import { RosterActionBar } from "./roster/RosterActionBar";
import { RosterControls } from "./roster/RosterControls";
import { RosterGrid } from "./roster/RosterGrid";
import { SpecialDaySection } from "./roster/SpecialDaySection";
import { computeBoundedWeights, squarify } from "./roster/treemap";
import { useAdjustModal } from "./roster/useAdjustModal";
import { useRosterDrag } from "./roster/useRosterDrag";
import { useSpecialDays } from "./roster/useSpecialDays";
import { getPeriodLabel, getPeriodRange, isSamePeriod } from "./roster/utils";
import { WorklogModal } from "./roster/WorklogModal";

import type { DisplayProject, GridKey, ViewMode } from "./roster/types";

const toGridKey = (id: number): GridKey => `p-${id}`;

export default function WeeklyRoster({
  externalDate,
  externalPeriod,
  onPeriodChange,
}: {
  externalDate?: Date;
  externalPeriod?: PeriodView;
  onPeriodChange?: (p: PeriodView) => void;
}) {
  const { projects, comments, ledger, adjustLoggedMinutes, addComment } = useProjects();
  const { isMonthSubmitted, lastMonthSubmitted } = useTimesheets();

  const [listOrder, setListOrder] = useState<number[]>([]);
  const [slotAssignment, setSlotAssignment] = useState<GridKey[]>([]);
  // Reasonable desktop-ish default so the very first paint (before
  // ResizeObserver reports the real size) doesn't lay out against a 0x0
  // rect — updates to the real size almost immediately after mount.
  const [gridSize, setGridSize] = useState({ w: 800, h: 440 });
  const [view, setView] = useState<ViewMode>("grid");
  const [period, setPeriod] = useState<PeriodView>("week");
  const [selectedDate, setSelectedDate] = useState<Date>(() => externalDate ?? new Date());
  const isMounted = useRef(false);
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (externalDate) setSelectedDate(externalDate);
  }, [externalDate]);
  useEffect(() => {
    if (!isMounted.current) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (externalPeriod !== undefined) setPeriod(externalPeriod);
  }, [externalPeriod]);

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [commentModalId, setCommentModalId] = useState<number | null>(null);

  const sd = useSpecialDays();
  const adjust = useAdjustModal(adjustLoggedMinutes);

  const isCurrentPeriod = isSamePeriod(selectedDate, new Date(), period);
  const now = new Date();
  const isSelectedCurrentMonth =
    selectedDate.getFullYear() === now.getFullYear() && selectedDate.getMonth() === now.getMonth();
  const periodLocked =
    isMonthSubmitted(selectedDate) || (isSelectedCurrentMonth && !lastMonthSubmitted);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  function changePeriod(next: PeriodView) {
    setPeriod(next);
    setSelectedDate(new Date());
    onPeriodChange?.(next);
  }
  function handleTap(id: number, sign: 1 | -1 = 1) {
    const logDate = period === "day" ? selectedDate.toLocaleDateString("en-CA") : undefined;
    adjustLoggedMinutes(id, sign * TAP_MINUTES["1h"], undefined, logDate);
  }

  const { start: periodStart, end: periodEnd } = getPeriodRange(period, selectedDate);
  const periodSpecialDays = sd.specialDays.filter(
    (d) => d.startDate <= periodEnd && d.endDate >= periodStart
  );
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
    ...(!periodLocked && periodSpecialDays.length > 0 ? [SPECIAL_DAY_AGG_KEY] : []),
  ];
  const isValidSlotAssignment =
    slotAssignment.length === liveKeys.length && liveKeys.every((k) => slotAssignment.includes(k));
  const slotsKey = [...liveKeys].sort().join(",");

  const totalSpecialDayMinutes = periodSpecialDays.reduce((sum, d) => sum + d.hours * 60, 0);

  const sortedKeys = useMemo(() => {
    const minsOf = (k: GridKey) =>
      k === SPECIAL_DAY_AGG_KEY
        ? periodSpecialDays.reduce((s, d) => s + d.hours * 60, 0)
        : (projectById.get(Number(k.slice(2)))?.loggedMinutes ?? 0);
    return [...liveKeys].sort((a, b) => minsOf(b) - minsOf(a));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotsKey, periodStart]);

  const effectiveSlots: GridKey[] = isValidSlotAssignment ? slotAssignment : sortedKeys;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSlotAssignment(sortedKeys);
  }, [sortedKeys]);

  const weightByKey = computeBoundedWeights(
    liveKeys.map((key) => ({
      key,
      raw:
        key === SPECIAL_DAY_AGG_KEY
          ? totalSpecialDayMinutes
          : (projectById.get(Number(key.slice(2)))?.loggedMinutes ?? 0),
    }))
  );

  // Squarify against the *real* container pixels (not a percentage space),
  // then normalize back to 0-100 for CSS — the squareness optimization only
  // means something in real units. effectiveSlots' order is preserved
  // (drag/sort-derived), which is what keeps tiles from jumping to an
  // unrelated position when a tap changes their weight.
  const squarifiedNodes = squarify(
    effectiveSlots.map((key) => ({ key, weight: weightByKey.get(key) ?? 1 })),
    0,
    0,
    gridSize.w,
    gridSize.h
  );
  const treemapNodes =
    gridSize.w > 0 && gridSize.h > 0
      ? squarifiedNodes.map((n) => ({
          key: n.key,
          x: (n.x / gridSize.w) * 100,
          y: (n.y / gridSize.h) * 100,
          w: (n.w / gridSize.w) * 100,
          h: (n.h / gridSize.h) * 100,
        }))
      : [];

  const realProjectById = new Map(projects.map((p) => [p.id, p]));
  const commentModalProject =
    commentModalId !== null ? (realProjectById.get(commentModalId) ?? null) : null;
  const adjustModalProject =
    adjust.adjustModalId !== null ? (realProjectById.get(adjust.adjustModalId) ?? null) : null;

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
    <div className="bg-card rounded-lg border border-garden-border shadow-card flex flex-col lg:h-full lg:overflow-hidden">
      <RosterControls
        period={period}
        changePeriod={changePeriod}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        isDatePickerOpen={isDatePickerOpen}
        setIsDatePickerOpen={setIsDatePickerOpen}
        periodLocked={periodLocked}
        isCurrentPeriod={isCurrentPeriod}
      />
      <div className="lg:flex-1 lg:overflow-y-auto p-3 lg:p-5 space-y-3 lg:space-y-4">
        <RosterActionBar
          totalLogged={totalLogged}
          totalTarget={totalTarget}
          overallPct={overallPct}
          periodLocked={periodLocked}
          onAddSpecialDay={sd.openAdd}
          view={view}
          setView={setView}
        />
        <RosterGrid
          view={view}
          treemapNodes={treemapNodes}
          orderedProjects={orderedProjects}
          projectById={projectById}
          periodLocked={periodLocked}
          specialDays={periodSpecialDays}
          tapUnit="1h"
          activeDragPreview={activeDragPreview}
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onTap={handleTap}
          onOpenComments={setCommentModalId}
          onOpenAdjust={adjust.open}
          onContainerResize={setGridSize}
        />
        <SpecialDaySection
          specialDays={periodSpecialDays}
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
        <WorklogModal
          project={commentModalProject}
          comments={commentModalId !== null ? (comments[commentModalId] ?? []) : []}
          periodLabel={getPeriodLabel(period, selectedDate)}
          periodStart={periodStart}
          periodEnd={periodEnd}
          onAddEntry={(text) => commentModalId !== null && addComment(commentModalId, text)}
          onClose={() => setCommentModalId(null)}
        />
      )}
      {adjustModalProject && (
        <AdjustModal
          project={adjustModalProject}
          sign={adjust.adjustSign}
          onSignChange={adjust.setAdjustSign}
          hours={adjust.adjustHours}
          onHoursChange={adjust.setAdjustHours}
          minutes={adjust.adjustMinutes}
          onMinutesChange={adjust.setAdjustMinutes}
          note={adjust.adjustNote}
          onNoteChange={adjust.setAdjustNote}
          onSave={() =>
            adjust.submit(period === "day" ? selectedDate.toLocaleDateString("en-CA") : undefined)
          }
          onClose={adjust.close}
        />
      )}
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
