"use client";

import { useState } from "react";

import type { SpecialDay } from "@/components/dashboard/SpecialDayDialog";

export function useSpecialDays() {
  const [specialDays, setSpecialDays] = useState<SpecialDay[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const specialDayById = new Map(specialDays.map((d) => [d.id, d]));
  const editingDay = editingId !== null ? (specialDayById.get(editingId) ?? null) : null;

  return {
    specialDays,
    isOpen,
    editingDay,
    openAdd: () => {
      setEditingId(null);
      setIsOpen(true);
    },
    openEdit: (id: number) => {
      setEditingId(id);
      setIsOpen(true);
    },
    closeDialog: () => {
      setIsOpen(false);
      setEditingId(null);
    },
    add: (input: Omit<SpecialDay, "id">) =>
      setSpecialDays((prev) => [...prev, { ...input, id: Date.now() }]),
    update: (id: number, input: Omit<SpecialDay, "id">) =>
      setSpecialDays((prev) => prev.map((d) => (d.id === id ? { ...input, id } : d))),
    remove: (id: number) => setSpecialDays((prev) => prev.filter((d) => d.id !== id)),
  };
}
