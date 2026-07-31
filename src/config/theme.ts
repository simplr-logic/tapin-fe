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
  yellow: "#CA8A04",
  error: "#CC3340",
  open: "#E34F32",
} as const;

/**
 * Shared 3-tier status color used anywhere a percentage-of-target needs a
 * single representative color (project rows, timesheet summaries, ...).
 * The richer 5-tier tint+border treemap styling in WeeklyRoster is a
 * different, denser visual system and intentionally doesn't use this.
 *
 * Returns Tailwind classes (not raw hex) so callers stay dark-mode-aware —
 * see `getHeatStyle` in `roster/utils.ts` for the same pattern.
 */
export function getComplianceColorClass(pct: number): string {
  if (pct >= 115) return "text-error";
  if (pct >= 100) return "text-success";
  return "text-yellow";
}

export function getComplianceBgClass(pct: number): string {
  if (pct >= 115) return "bg-error";
  if (pct >= 100) return "bg-success";
  return "bg-yellow";
}

/**
 * Theme presets — each is a full replacement set for the --garden-* /
 * shadcn CSS variables (see src/app/globals.css `[data-palette="…"]`
 * blocks), keyed by the same id this app writes to `<html data-palette>`.
 * Status colors (success/warning/error/open) intentionally do NOT vary by
 * palette — only canvas/surface/border/chrome/link/ink shift. "Garden" is
 * the default and has no override block (its values live in :root/.dark).
 */
export type PaletteId =
  "garden" | "midnight" | "slate-amber" | "sepia" | "orchid" | "high-contrast";

export interface PaletteMeta {
  id: PaletteId;
  label: string;
  description: string;
  /** Light-mode preview swatch — used by the picker UI only. */
  swatch: { canvas: string; chrome: string; link: string };
}

export const PALETTES: PaletteMeta[] = [
  {
    id: "garden",
    label: "Garden",
    description: "Default Zendesk Garden look.",
    swatch: { canvas: "#F8F9F9", chrome: "#03363D", link: "#1F73B7" },
  },
  {
    id: "midnight",
    label: "Midnight",
    description: "Deep teal, dark-first identity.",
    swatch: { canvas: "#F4FAFA", chrome: "#0E3A3F", link: "#0F766E" },
  },
  {
    id: "slate-amber",
    label: "Slate & Amber",
    description: "Cool neutral slate with a warm amber accent.",
    swatch: { canvas: "#F5F6F8", chrome: "#1E293B", link: "#B45309" },
  },
  {
    id: "sepia",
    label: "Sepia",
    description: "Warm, paper-like tones for long reading sessions.",
    swatch: { canvas: "#F5EFE6", chrome: "#4A3728", link: "#6E4A26" },
  },
  {
    id: "orchid",
    label: "Orchid",
    description: "Elegant plum and purple accent.",
    swatch: { canvas: "#F8F5FA", chrome: "#3B2354", link: "#9333EA" },
  },
  {
    id: "high-contrast",
    label: "High Contrast",
    description: "Maximum contrast, accessibility-first.",
    swatch: { canvas: "#FFFFFF", chrome: "#000000", link: "#0645AD" },
  },
];

export type FontFamilyId = "sans" | "serif" | "mono" | "rounded";

export interface FontFamilyMeta {
  id: FontFamilyId;
  label: string;
  stack: string;
}

/** All stacks are OS-native — no next/font, no webfont network request. */
export const FONT_FAMILIES: FontFamilyMeta[] = [
  {
    id: "sans",
    label: "System Sans",
    stack: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  {
    id: "serif",
    label: "System Serif",
    stack: 'ui-serif, Georgia, Cambria, "Times New Roman", serif',
  },
  {
    id: "mono",
    label: "System Mono",
    stack: 'ui-monospace, "SF Mono", "Roboto Mono", Menlo, Consolas, monospace',
  },
  {
    id: "rounded",
    label: "System Rounded",
    // ui-rounded/SF Pro Rounded only resolve on Apple platforms — Trebuchet
    // MS/Verdana give Windows/Linux a genuinely different (humanist,
    // rounder-terminal) look instead of silently collapsing to System Sans.
    stack: 'ui-rounded, "SF Pro Rounded", "Trebuchet MS", Verdana, sans-serif',
  },
];

export type FontSizeId = "compact" | "comfortable" | "large";

export const FONT_SIZES: { id: FontSizeId; label: string }[] = [
  { id: "compact", label: "Compact" },
  { id: "comfortable", label: "Comfortable" },
  { id: "large", label: "Large" },
];
