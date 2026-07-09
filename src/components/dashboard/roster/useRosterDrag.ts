"use client";

import { useState } from "react";

import type { GridKey, ViewMode } from "./types";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";

interface UseRosterDragArgs {
  view: ViewMode;
  effectiveSlots: GridKey[];
  setSlotAssignment: (slots: GridKey[]) => void;
  orderedProjectIds: number[];
  setListOrder: (ids: number[]) => void;
}

export function useRosterDrag({
  view,
  effectiveSlots,
  setSlotAssignment,
  orderedProjectIds,
  setListOrder,
}: UseRosterDragArgs) {
  const [activeDragId, setActiveDragId] = useState<GridKey | number | null>(null);

  function handleDragStart(event: DragStartEvent) {
    const id = event.active.id;
    setActiveDragId(typeof id === "string" ? (id as GridKey) : (id as number));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveDragId(null);
    if (!over || active.id === over.id) return;
    if (view === "grid") {
      const fromKey = active.id as GridKey;
      const toKey = over.id as GridKey;
      const fromSlot = effectiveSlots.indexOf(fromKey);
      const toSlot = effectiveSlots.indexOf(toKey);
      if (fromSlot === -1 || toSlot === -1 || fromKey === toKey) return;
      const next = [...effectiveSlots];
      [next[fromSlot], next[toSlot]] = [next[toSlot], next[fromSlot]];
      setSlotAssignment(next);
    } else {
      const fromId = Number(active.id);
      const toId = Number(over.id);
      if (fromId === toId) return;
      const from = orderedProjectIds.indexOf(fromId);
      const to = orderedProjectIds.indexOf(toId);
      if (from === -1 || to === -1) return;
      const next = [...orderedProjectIds];
      next.splice(from, 1);
      next.splice(to, 0, fromId);
      setListOrder(next);
    }
  }

  return { activeDragId, handleDragStart, handleDragEnd };
}
