import {
  CalendarCheck,
  ClipboardCheck,
  DoorOpen,
  Fingerprint,
  Flag,
  Flame,
  Layers,
  Medal,
  Moon,
  Mountain,
  Move,
  ShieldCheck,
  Sprout,
  Star,
  Sunrise,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

// Placeholder icon set — swap for sourced badge graphics per
// docs/ACHIEVEMENTS.md §3 without touching evaluation logic or components.
export const ACHIEVEMENT_ICONS: Record<string, LucideIcon> = {
  first_tap: Fingerprint,
  streak_7_day: Flame,
  streak_perfect_month: CalendarCheck,
  early_bird: Sunrise,
  night_owl: Moon,
  century_club: Medal,
  "1000_hours": Mountain,
  overachiever: TrendingUp,
  project_starter: Sprout,
  juggler: Layers,
  project_closer: Flag,
  on_time_quarter: ShieldCheck,
  audit_ready: ClipboardCheck,
  compliance_star: Star,
  team_player: Users,
  top_contributor: Trophy,
  drag_master: Move,
  onboarded: DoorOpen,
};
