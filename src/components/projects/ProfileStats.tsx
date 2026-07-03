"use client";

import { FolderKanban, Clock, TrendingUp } from "lucide-react";
import { useProjects } from "@/components/providers/ProjectsProvider";

export function ProfileStats() {
  const { projects } = useProjects();
  const totalLogged = projects.reduce((sum, p) => sum + p.loggedMinutes / 60, 0);
  const totalTarget = projects.reduce((sum, p) => sum + p.targetHours, 0);
  const pct = totalTarget > 0 ? Math.round((totalLogged / totalTarget) * 100) : 0;

  const stats = [
    { icon: FolderKanban, label: "Active Projects", value: String(projects.length) },
    { icon: Clock, label: "Logged This Week", value: `${totalLogged.toFixed(1)}h` },
    { icon: TrendingUp, label: "Of Weekly Target", value: `${pct}%` },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-white rounded-lg border border-garden-border shadow-card p-4"
        >
          <s.icon className="w-4 h-4 text-ink-subtle mb-2" />
          <p className="text-lg font-semibold text-ink tracking-tight">{s.value}</p>
          <p className="text-[10px] text-ink-subtle uppercase tracking-wide mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
