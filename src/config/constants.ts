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

// A brand-new project starts at 0 logged minutes, which — under pure
// sqrt(minutes) weighting — loses so badly to established projects that it
// can shrink to an illegible sliver in the treemap. Flooring the weight
// keeps a fresh project's tile at least as visible as any lightly-worked
// one, while still leaving real proportionality intact for anything past
// ~1.5h.
export const MIN_TILE_WEIGHT = 10;

// Caps the in-memory roster ledger so it can't grow unbounded over a long
// session.
export const MAX_LEDGER_ENTRIES = 50;
