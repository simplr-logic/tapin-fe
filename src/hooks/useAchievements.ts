"use client";

import { useMemo, useSyncExternalStore } from "react";

import { useProjects } from "@/components/providers/ProjectsProvider";
import { useTimesheets } from "@/components/providers/TimesheetProvider";
import { getDragCount, subscribeDragCount } from "@/lib/achievementEvents";
import { evaluateAchievements } from "@/lib/achievements";

import type { EvaluatedAchievement } from "@/types/achievements";

function getServerDragCount(): number {
  return 0;
}

export function useAchievements(hasOnboarded: boolean): EvaluatedAchievement[] {
  const { projects, ledger, streak } = useProjects();
  const { lastMonthRecord } = useTimesheets();
  const dragCount = useSyncExternalStore(subscribeDragCount, getDragCount, getServerDragCount);

  return useMemo(
    () =>
      evaluateAchievements({
        projects,
        ledger,
        streak,
        lastMonthRecord,
        hasOnboarded,
        dragCount,
      }),
    [projects, ledger, streak, lastMonthRecord, hasOnboarded, dragCount]
  );
}
