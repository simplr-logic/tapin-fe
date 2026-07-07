/**
 * App-wide tunable constants — behavior knobs that aren't secrets and don't
 * vary by environment, but are worth naming and keeping in one place instead
 * of scattered magic numbers.
 */

export const APP_NAME = "TapIn";

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
export const MAX_TILE_RATIO = 1.8;

export type PeriodView = "week" | "month" | "year";

// There's no real backend/history yet, so Month/Year views are mocked by
// scaling the current week's logged/target hours by a period factor — same
// renderer, projected data. Only "week" is live/editable; Month and Year are
// read-only (see WeeklyRoster's `locked` handling).
export const PERIOD_SCALE: Record<PeriodView, number> = {
  week: 1,
  month: 52 / 12,
  year: 52,
};
