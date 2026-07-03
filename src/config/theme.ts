/**
 * Zendesk Garden color tokens — single source of truth for JS-side color logic
 * (inline styles, runtime color selection, anywhere a static Tailwind class
 * can't express a data-driven color).
 *
 * These are also registered as Tailwind utilities via the matching
 * `--color-*` custom properties in `src/app/globals.css`'s `@theme` block
 * (e.g. `kale` here ↔ `bg-kale`/`text-kale`/`border-kale`, and every color
 * supports opacity modifiers like `bg-error/8`). Prefer the Tailwind class
 * for static styling and reach for `gardenColors` only when the color has to
 * be computed at runtime. If a value changes, update it in both places.
 */
export const gardenColors = {
  canvas: "#F8F9F9",
  surface2: "#F1F3F5",
  surface3: "#E9EBED",
  gardenBorder: "#D8DCDE",
  gardenBorderStrong: "#C2C8CC",
  kale: "#03363D",
  kaleHover: "#022A2F",
  kaleAccent: "#17494D",
  link: "#1F73B7",
  linkHover: "#144A75",
  ink: "#2F3941",
  inkMuted: "#68737D",
  inkSubtle: "#87929D",
  success: "#038153",
  warning: "#AD5918",
  error: "#CC3340",
  open: "#E34F32",
} as const;

export type GardenColorName = keyof typeof gardenColors;

/**
 * Shared 3-tier status color used anywhere a percentage-of-target needs a
 * single representative color (project rows, timesheet summaries, ...).
 * The richer 5-tier tint+border treemap styling in WeeklyRoster is a
 * different, denser visual system and intentionally doesn't use this.
 */
export function getComplianceColor(pct: number): string {
  if (pct >= 100) return gardenColors.error;
  if (pct >= 85) return gardenColors.warning;
  return gardenColors.success;
}
