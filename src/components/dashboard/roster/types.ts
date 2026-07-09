import type { Project } from "@/components/providers/ProjectsProvider";

export type GridKey = `p-${number}` | "s-agg";
export type ViewMode = "grid" | "progress";

// Project with period-scoped loggedMinutes computed by WeeklyRoster (not stored on Project)
export type DisplayProject = Project & { loggedMinutes: number };
