import { Award, CheckCircle2, Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ACHIEVEMENT_ICONS } from "@/config/achievementIcons";
import { cn } from "@/lib/utils";

import type { EvaluatedAchievement } from "@/types/achievements";

export function AchievementDetailDialog({
  achievement,
  onOpenChange,
}: {
  achievement: EvaluatedAchievement | null;
  onOpenChange: (open: boolean) => void;
}) {
  const Icon = achievement ? (ACHIEVEMENT_ICONS[achievement.key] ?? Award) : Award;

  return (
    <Dialog open={achievement !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        {achievement && (
          <>
            <DialogHeader className="items-center text-center">
              <div
                className={cn(
                  "flex h-16 w-16 items-center justify-center rounded-full",
                  achievement.unlocked
                    ? "bg-kale/10 text-kale ring-1 ring-kale/20"
                    : "bg-surface-3 text-ink-subtle opacity-60"
                )}
              >
                <Icon className="h-7 w-7" />
              </div>
              <DialogTitle>{achievement.title}</DialogTitle>
              <Badge
                variant="secondary"
                className={cn(
                  "gap-1",
                  achievement.unlocked ? "bg-kale/10 text-kale" : "bg-surface-2 text-ink-subtle"
                )}
              >
                {achievement.unlocked ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" />
                    Unlocked
                  </>
                ) : (
                  <>
                    <Lock className="h-3 w-3" />
                    Locked
                  </>
                )}
              </Badge>
            </DialogHeader>

            <p className="text-center text-sm text-ink-muted">{achievement.description}</p>

            {!achievement.unlocked && achievement.progress && (
              <div className="space-y-1.5">
                <div className="h-1.5 w-full rounded-full bg-surface-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-kale transition-all"
                    style={{
                      width: `${Math.min(100, (achievement.progress.current / achievement.progress.target) * 100)}%`,
                    }}
                  />
                </div>
                <p className="text-center text-[10px] font-semibold text-ink-subtle tabular-nums">
                  {achievement.progress.current} / {achievement.progress.target}
                </p>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
