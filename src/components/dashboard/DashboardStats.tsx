"use client";

import { Clock, Flame, FolderKanban, TrendingUp, Trophy } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { sumLogs, useProjects } from "@/components/providers/ProjectsProvider";
import { getComplianceBgClass, getComplianceColorClass } from "@/config/theme";
import { useAchievements } from "@/hooks/useAchievements";
import { cn } from "@/lib/utils";

const HOURS_PER_LEVEL = 25;

function levelFromHours(totalHours: number) {
  const level = Math.floor(totalHours / HOURS_PER_LEVEL) + 1;
  const intoLevel = totalHours % HOURS_PER_LEVEL;
  const pct = Math.min(100, Math.round((intoLevel / HOURS_PER_LEVEL) * 100));
  return { level, pct, remaining: Math.max(0, Math.ceil(HOURS_PER_LEVEL - intoLevel)) };
}

export function DashboardStats({ hasOnboarded }: { hasOnboarded: boolean }) {
  const { projects, streak } = useProjects();
  const achievements = useAchievements(hasOnboarded);

  const { today, weekAgo } = useMemo(() => {
    const now = new Date();
    return {
      today: now.toLocaleDateString("en-CA"),
      weekAgo: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toLocaleDateString("en-CA"),
    };
  }, []);

  const weekLogged = projects.reduce((sum, p) => sum + sumLogs(p.logs, weekAgo, today) / 60, 0);
  const weekTarget = projects.reduce((sum, p) => sum + p.targetHours, 0);
  const weekPct = weekTarget > 0 ? Math.round((weekLogged / weekTarget) * 100) : 0;
  const totalHours = projects.reduce((sum, p) => sum + sumLogs(p.logs) / 60, 0);
  const { level, pct: xpPct, remaining } = levelFromHours(totalHours);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const pctBg = getComplianceBgClass(weekPct);
  const pctText = getComplianceColorClass(weekPct);

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-lg border border-garden-border shadow-elevated bg-linear-to-r from-kale via-kale-accent to-link/70 px-5 py-5 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/40 text-base font-bold tabular-nums">
              Lv {level}
            </div>
            <div className="min-w-[160px]">
              <p className="text-[10px] font-semibold tracking-wide text-white/70">
                {remaining}h to level {level + 1}
              </p>
              <div className="mt-1.5 h-1.5 w-40 max-w-full rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-white/90 transition-all"
                  style={{ width: `${xpPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 ring-1 ring-white/25">
              <Flame className="h-3.5 w-3.5" />
              <span className="text-sm font-semibold tabular-nums">{streak}</span>
              <span className="text-[10px] text-white/75">day streak</span>
            </div>
            <Link
              href="/profile"
              className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 ring-1 ring-white/25 hover:bg-white/25 transition-colors"
            >
              <Trophy className="h-3.5 w-3.5" />
              <span className="text-sm font-semibold tabular-nums">{unlockedCount}</span>
              <span className="text-[10px] text-white/75">/ {achievements.length} badges</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatTile
          icon={FolderKanban}
          label="Active Projects"
          value={String(projects.length)}
          accentClass="bg-link/10 text-link"
        />
        <StatTile
          icon={Clock}
          label="Logged This Week"
          value={`${weekLogged.toFixed(1)}h`}
          accentClass="bg-kale/10 text-kale"
        />
        <StatTile
          icon={TrendingUp}
          label="Of Weekly Target"
          value={`${weekPct}%`}
          accentClass={cn(pctBg + "/10", pctText)}
          progress={Math.min(100, weekPct)}
          progressBgClass={pctBg}
        />
      </div>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  accentClass,
  progress,
  progressBgClass,
}: {
  icon: typeof FolderKanban;
  label: string;
  value: string;
  accentClass: string;
  progress?: number;
  progressBgClass?: string;
}) {
  return (
    <div className="bg-card rounded-lg border border-garden-border shadow-card p-4">
      <div
        className={cn(
          "mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full",
          accentClass
        )}
      >
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-lg font-semibold text-ink tracking-tight">{value}</p>
      <p className="text-[10px] text-ink-subtle tracking-wide mt-0.5">{label}</p>
      {progress !== undefined && (
        <div className="mt-2 h-1 w-full rounded-full bg-surface-2 overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", progressBgClass)}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
