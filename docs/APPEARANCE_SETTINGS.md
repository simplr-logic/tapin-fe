# Appearance Settings — Themes & Fonts (proposal)

Status: **discussion draft, nothing built yet**. Written for review before any
code changes — see open questions at the bottom.

## 1. Current state

`profile/page.tsx` → "Appearance" card → `ThemeToggleGroup.tsx`
(`src/components/layout/ThemeToggleGroup.tsx`). That's the only appearance
control in the app today: **Light / Dark / System**, via `next-themes`.

Mechanism (`src/app/globals.css`):

- All colors are indirected through `--garden-*` CSS variables (e.g.
  `--garden-canvas`, `--garden-kale`), which the Tailwind `@theme inline`
  block maps to utility classes (`bg-canvas`, `text-ink`, etc.).
- `:root` defines the light values, `.dark` (toggled by `next-themes` via a
  class on `<html>`) redefines the same variable names for dark mode.
- Font is hardcoded in `@theme inline`: `--font-sans: system-ui,
-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` — no
  `next/font`, no webfont network request.

## 2. The constraint this runs into

`CLAUDE.md` (checked into the repo, marked non-negotiable) currently says:

> Single source of truth for colors is `src/config/theme.ts`... Every hex
> literal in the codebase should trace back to the table above.
>
> Font is the OS system stack... zero load cost... Don't add `next/font`.

Adding multiple color themes and swappable fonts is a real scope expansion
against that rule, not a small tweak. Two ways to reconcile, pick one before
I write code:

- **(a) Extend the rule**: treat the palettes/fonts below as formally
  documented additions to the design system (new rows in `CLAUDE.md`'s
  color table, explicitly sanctioned), so "every hex traces back to the
  table" stays true — the table just grows.
- **(b) Narrow the ask**: keep exactly one Garden palette, but add
  lower-risk knobs — e.g. a **High Contrast** mode and a **font-size**
  scale — instead of full alternate palettes/typefaces.

Everything below is written assuming **(a)**, since that's what "a few
different themes, and font options" sounds like — flag if you meant (b).

## 3. Proposed color themes

Each theme is a full replacement set for the same `--garden-*` variable
names used today, so the mechanism (CSS variables → Tailwind utilities) does
**not** change — only the values do. Kale stays the fixed chrome/brand mark
in every theme (per the existing "Kale is chrome-only" rule) unless noted.

| Theme                         | Feel                                                                | Canvas    | Chrome (Kale slot)     | Link                  | Ink       |
| ----------------------------- | ------------------------------------------------------------------- | --------- | ---------------------- | --------------------- | --------- |
| **Garden** (current, default) | Calm, low-contrast, official Zendesk look                           | `#F8F9F9` | `#03363D`              | `#1F73B7`             | `#2F3941` |
| **Midnight**                  | Deep, focused, dark-first (not just "dark mode" — its own identity) | `#0B1416` | `#0E3A3F` (teal-black) | `#4FD1C5` (cyan-teal) | `#E7F1F0` |
| **Slate & Amber**             | Cool neutral workspace, warm accent for contrast                    | `#F5F6F8` | `#1E293B` (slate)      | `#D97706` (amber)     | `#1E2530` |
| **Sepia**                     | Warm, paper-like, easy on the eyes for long sessions                | `#F5EFE6` | `#4A3728` (warm brown) | `#8B5E34`             | `#3A2E22` |
| **High Contrast**             | Accessibility-first, WCAG AAA target                                | `#FFFFFF` | `#000000`              | `#0645AD`             | `#000000` |

Status colors (success/warning/error/open) stay the same _hues_ across
themes — only lightness/saturation adjusts per theme so they still read
correctly against each new canvas. They remain the **only** place
red/orange/green appear, unchanged from the current rule.

Each theme needs a light **and** dark variant (10 palettes total, not 5) if
themes stack with the existing Light/Dark toggle rather than replacing it —
see the architecture question in §5.

## 4. Proposed font options

All candidates are **OS-native stacks only** — no `next/font`, no webfont
download, zero load cost preserved:

| Option                            | Stack                                                                          | Feel                                                                                             |
| --------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| **System Sans** (current default) | `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` | Neutral, matches OS chrome                                                                       |
| **System Serif**                  | `ui-serif, Georgia, Cambria, "Times New Roman", serif`                         | Editorial, readable for long text (timesheets, ledgers)                                          |
| **System Mono**                   | `ui-monospace, "SF Mono", "Roboto Mono", Menlo, Consolas, monospace`           | Tabular/ledger feel — arguably fits a "Certified Ledger" time tracker                            |
| **System Rounded**                | `ui-rounded, "SF Pro Rounded", system-ui, sans-serif`                          | Softer, friendlier — falls back to System Sans on non-Apple OSes (rounded stack isn't universal) |

Plus an independent **size scale** (Compact / Comfortable / Large) — a
`--font-scale` multiplier applied at the root, cheap and accessibility-useful
regardless of which typeface is picked.

## 5. Open questions before I build anything

1. **(a) or (b) above** — extend the design system, or keep to a narrower
   high-contrast + font-size-only version?
2. **Do themes replace or stack with Light/Dark?** I.e. is "Midnight" its
   own fixed look, or does every theme need its own light _and_ dark
   variant (Slate & Amber Light, Slate & Amber Dark, ...)? Stacking is more
   flexible but doubles the palette work above.
3. **Persistence**: same as today (`next-themes`, `localStorage`, no
   backend) — theme/font choice stays local-device-only, doesn't sync
   across devices for the same person? (Matches how everything except auth
   works right now — see `CLAUDE.md` "State management".)
4. **Where do these live in code?** — `src/config/theme.ts` currently
   exports one `gardenColors` object; multiple themes means either an array
   of palettes there, or a new `src/config/themes/` directory, one file per
   palette. Preference?
5. **Scope check**: is 5 color themes × font stacks × size scale the right
   size, or trim the list before I build the settings UI?
