"use client";

import { useSyncExternalStore } from "react";

import { PomodoroTaskList } from "./PomodoroTaskList";
import { timerStore } from "./timerStore";

export function PomodoroTaskPanel() {
  const { tasks, selectedProjectId } = useSyncExternalStore(
    timerStore.subscribe,
    timerStore.getSnapshot,
    timerStore.getSnapshot
  );

  return (
    <div className="px-6 py-6 h-full">
      <PomodoroTaskList tasks={tasks} />
      {selectedProjectId === null && tasks.length > 0 && (
        <p className="mt-2 text-[11px] text-ink-subtle">
          Select a project in the timer to auto-log tasks on session complete.
        </p>
      )}
    </div>
  );
}
