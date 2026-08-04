"use client";

import { Trophy } from "lucide-react";
import { useMemo, useState } from "react";

import { AchievementBadge } from "@/components/profile/AchievementBadge";
import { AchievementDetailDialog } from "@/components/profile/AchievementDetailDialog";
import { CollapsibleCard } from "@/components/profile/CollapsibleCard";
import { useAchievements } from "@/hooks/useAchievements";

import type { EvaluatedAchievement } from "@/types/achievements";

export function AchievementsGrid({ hasOnboarded }: { hasOnboarded: boolean }) {
  const achievements = useAchievements(hasOnboarded);
  const [selected, setSelected] = useState<EvaluatedAchievement | null>(null);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  // Unlocked badges sort to the front; stable within each group so the
  // catalog's own ordering (roughly volume -> streak -> project -> ...)
  // still holds inside "unlocked" and "locked".
  const sorted = useMemo(
    () => [...achievements].sort((a, b) => Number(b.unlocked) - Number(a.unlocked)),
    [achievements]
  );

  return (
    <CollapsibleCard
      title={
        <>
          <Trophy className="w-3.5 h-3.5" />
          Achievements
        </>
      }
      rightContent={
        <span className="text-[10px] font-semibold text-ink-subtle tabular-nums">
          {unlockedCount}/{achievements.length}
        </span>
      }
    >
      <div className="p-5 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
        {sorted.map((achievement) => (
          <AchievementBadge
            key={achievement.id}
            achievement={achievement}
            onClick={() => setSelected(achievement)}
          />
        ))}
      </div>

      <AchievementDetailDialog
        achievement={selected}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </CollapsibleCard>
  );
}
