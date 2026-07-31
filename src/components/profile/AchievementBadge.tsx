import { Award } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ACHIEVEMENT_ICONS } from "@/config/achievementIcons";
import { cn } from "@/lib/utils";

import type { EvaluatedAchievement } from "@/types/achievements";

export function AchievementBadge({
  achievement,
  onClick,
}: {
  achievement: EvaluatedAchievement;
  onClick: () => void;
}) {
  const Icon = ACHIEVEMENT_ICONS[achievement.key] ?? Award;
  const { unlocked, progress, title } = achievement;

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      title={title}
      className={cn(
        "h-auto flex-col gap-1.5 rounded-lg border p-3 text-center",
        unlocked
          ? "bg-card border-garden-border shadow-card ring-1 ring-kale/20 hover:bg-surface-2"
          : "bg-surface-2 border-garden-border hover:bg-surface-3"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full",
          unlocked ? "bg-kale/10 text-kale" : "bg-surface-3 text-ink-subtle opacity-40"
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p
        className={cn(
          "flex min-h-8 items-center text-[11px] font-semibold leading-tight whitespace-normal",
          unlocked ? "text-ink" : "text-ink-subtle"
        )}
      >
        {title}
      </p>
      {/* Reserved even when empty so every card in the grid is the same
          height — some achievements track progress, some don't. */}
      <p className="h-3 text-[9px] text-ink-subtle tabular-nums">
        {!unlocked && progress ? `${progress.current}/${progress.target}` : ""}
      </p>
    </Button>
  );
}
