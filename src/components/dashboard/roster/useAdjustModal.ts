"use client";

import { useState } from "react";

import { formatHours } from "./utils";

export function useAdjustModal(
  adjustLoggedMinutes: (id: number, delta: number, note?: string, logDate?: string) => void
) {
  const [adjustModalId, setAdjustModalId] = useState<number | null>(null);
  const [adjustSign, setAdjustSign] = useState<"add" | "subtract">("add");
  const [adjustHours, setAdjustHours] = useState(1);
  const [adjustMinutes, setAdjustMinutes] = useState(0);
  const [adjustNote, setAdjustNote] = useState("");

  function resetAdjustForm() {
    setAdjustSign("add");
    setAdjustHours(1);
    setAdjustMinutes(0);
    setAdjustNote("");
  }

  function open(id: number) {
    setAdjustModalId(id);
    resetAdjustForm();
  }

  function submit(logDate?: string) {
    if (adjustModalId === null) return;
    const totalMinutes = adjustHours * 60 + adjustMinutes;
    const delta = (adjustSign === "add" ? 1 : -1) * totalMinutes;
    const trimmedNote = adjustNote.trim();
    const note = trimmedNote
      ? `${adjustSign === "add" ? "+" : "−"}${formatHours(totalMinutes)} — ${trimmedNote}`
      : undefined;
    adjustLoggedMinutes(adjustModalId, delta, note, logDate);
    setAdjustModalId(null);
    resetAdjustForm();
  }

  return {
    adjustModalId,
    adjustSign,
    setAdjustSign,
    adjustHours,
    setAdjustHours,
    adjustMinutes,
    setAdjustMinutes,
    adjustNote,
    setAdjustNote,
    open,
    submit,
    close: () => setAdjustModalId(null),
  };
}
