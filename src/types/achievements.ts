export type AchievementCategory =
  "streak" | "volume" | "project" | "compliance" | "social" | "meta";

export interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  category: AchievementCategory;
}

export interface AchievementProgress {
  current: number;
  target: number;
}

export interface EvaluatedAchievement extends Achievement {
  unlocked: boolean;
  progress?: AchievementProgress;
}
