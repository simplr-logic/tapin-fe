/**
 * App-wide tunable constants — behavior knobs that aren't secrets and don't
 * vary by environment, but are worth naming and keeping in one place instead
 * of scattered magic numbers.
 */

export const APP_NAME = "Klong";

export type TapUnit = "30m" | "1h" | "2h";

// 30m for quick corrections, 1h for a standard block, 2h for a quarter of an
// 8h day — covers the common logging granularities without cluttering the
// control.
export const TAP_MINUTES: Record<TapUnit, number> = {
  "30m": 30,
  "1h": 60,
  "2h": 120,
};

// Caps the in-memory roster ledger so it can't grow unbounded over a long
// session.
export const MAX_LEDGER_ENTRIES = 10;

// Weekly Roster grid tile weights are scaled into [1, MAX_TILE_RATIO] before
// being fed to the treemap layout — real proportional-area tiles (like a
// crypto market-cap heatmap), but bounded so the biggest tile is never more
// than this many times the smallest. Keeps the "size ~ hours" signal without
// letting one tile dominate or a new/small item shrink to nothing.
export const MAX_TILE_RATIO = 3;

export type PeriodView = "day" | "week" | "month" | "year";

// There's no real backend/history yet, so Day/Month/Year views are mocked by
// scaling the current week's logged/target hours by a period factor — same
// renderer, projected data. Only "week" is live/editable; all others are
// read-only (see WeeklyRoster's `locked` handling).
export const PERIOD_SCALE: Record<PeriodView, number> = {
  day: 1 / 5, // 1 workday out of 5 per week — 40h week → 8h/day
  week: 1,
  month: 52 / 12,
  year: 52,
};

export const TARGET_SCALE: Record<PeriodView, number> = {
  day: 0.2,
  week: 1,
  month: 4.33,
  year: 52,
};

// Pomodoro timer defaults — edit these to change durations and UX behavior.
export const POMODORO_CONFIG = {
  // Durations
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsPerLongBreak: 4, // work sessions before a long break
  // Flow
  autoStart: false, // auto-start next phase when one ends
  // UX feedback
  soundOnComplete: true, // play a beep when a phase ends
  tickSound: false, // play a subtle click each second
  notifyOnComplete: true, // browser push notification on phase end
  showInTabTitle: true, // show "25:00 · Focus" in the browser tab
};
