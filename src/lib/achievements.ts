import { sumLogs } from "@/components/providers/ProjectsProvider";
import achievementsSeed from "@/data/achievements.json";
import complianceSeed from "@/data/compliance.json";

import type { LedgerEntry, Project } from "@/components/providers/ProjectsProvider";
import type { TimesheetRecord } from "@/components/providers/TimesheetProvider";
import type { Achievement, AchievementProgress, EvaluatedAchievement } from "@/types/achievements";

const catalog = achievementsSeed as Achievement[];
const compliance = complianceSeed as { monthly: { pct: number }; yearly: { pct: number } };

interface EvaluateInput {
  projects: Project[];
  ledger: LedgerEntry[];
  streak: number;
  lastMonthRecord: TimesheetRecord | null;
  hasOnboarded: boolean;
  dragCount: number;
}

type UnlockState = { unlocked: boolean; progress?: AchievementProgress };

// Ledger timestamps look like "Jul 7 · 09:30 AM" — cheap enough to regex-parse
// rather than storing a separate hour field on the entry.
function countEntriesBeforeHour(ledger: LedgerEntry[], hour: number): number {
  return ledger.filter((entry) => {
    const match = /(\d{1,2}):\d{2}\s?(AM|PM)/i.exec(entry.timestamp);
    if (!match) return false;
    let h = Number(match[1]) % 12;
    if (match[2].toUpperCase() === "PM") h += 12;
    return h < hour;
  }).length;
}

function countEntriesAfterHour(ledger: LedgerEntry[], hour: number): number {
  return ledger.filter((entry) => {
    const match = /(\d{1,2}):\d{2}\s?(AM|PM)/i.exec(entry.timestamp);
    if (!match) return false;
    let h = Number(match[1]) % 12;
    if (match[2].toUpperCase() === "PM") h += 12;
    return h >= hour;
  }).length;
}

function computeUnlockMap(input: EvaluateInput): Record<string, UnlockState> {
  const { projects, ledger, streak, lastMonthRecord, hasOnboarded, dragCount } = input;

  const loggedDays = new Set<string>();
  let totalMinutes = 0;
  for (const p of projects) {
    for (const [date, mins] of Object.entries(p.logs)) {
      if (mins > 0) loggedDays.add(date);
      totalMinutes += mins;
    }
  }

  const now = new Date();
  const today = now.toLocaleDateString("en-CA");
  const weekAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toLocaleDateString("en-CA");
  const activeProjectsThisWeek = projects.filter((p) => sumLogs(p.logs, weekAgo, today) > 0).length;
  const overachieverHit = projects.some(
    (p) => p.targetHours > 0 && sumLogs(p.logs, weekAgo, today) / 60 > p.targetHours * 1.2
  );
  const closedProject = projects.some((p) => p.locked && p.endDate);
  const earlyBirdCount = countEntriesBeforeHour(ledger, 9);
  const nightOwlCount = countEntriesAfterHour(ledger, 20);
  const totalHours = totalMinutes / 60;

  return {
    first_tap: { unlocked: loggedDays.size > 0 },
    streak_7_day: {
      unlocked: streak >= 7,
      progress: { current: Math.min(streak, 7), target: 7 },
    },
    streak_perfect_month: {
      unlocked:
        !!lastMonthRecord &&
        lastMonthRecord.totalTargetHours > 0 &&
        lastMonthRecord.totalLoggedHours >= lastMonthRecord.totalTargetHours,
    },
    early_bird: {
      unlocked: earlyBirdCount >= 5,
      progress: { current: Math.min(earlyBirdCount, 5), target: 5 },
    },
    night_owl: {
      unlocked: nightOwlCount >= 5,
      progress: { current: Math.min(nightOwlCount, 5), target: 5 },
    },
    century_club: {
      unlocked: loggedDays.size >= 100,
      progress: { current: Math.min(loggedDays.size, 100), target: 100 },
    },
    "1000_hours": {
      unlocked: totalHours >= 1000,
      progress: { current: Math.min(Math.round(totalHours), 1000), target: 1000 },
    },
    overachiever: { unlocked: overachieverHit },
    project_starter: { unlocked: projects.length > 0 },
    juggler: {
      unlocked: activeProjectsThisWeek >= 5,
      progress: { current: Math.min(activeProjectsThisWeek, 5), target: 5 },
    },
    project_closer: { unlocked: closedProject },
    on_time_quarter: { unlocked: compliance.monthly.pct === 100 },
    audit_ready: { unlocked: compliance.yearly.pct >= 90 },
    compliance_star: {
      unlocked: compliance.yearly.pct >= 95,
      progress: { current: compliance.yearly.pct, target: 95 },
    },
    // No roster-wide/company-wide data available client-side yet — stays
    // locked until team activity is served from a backend.
    team_player: { unlocked: false },
    top_contributor: { unlocked: false },
    drag_master: {
      unlocked: dragCount >= 20,
      progress: { current: Math.min(dragCount, 20), target: 20 },
    },
    onboarded: { unlocked: hasOnboarded },
  };
}

export function evaluateAchievements(input: EvaluateInput): EvaluatedAchievement[] {
  const unlockMap = computeUnlockMap(input);
  return catalog.map((achievement) => ({
    ...achievement,
    ...(unlockMap[achievement.key] ?? { unlocked: false }),
  }));
}
