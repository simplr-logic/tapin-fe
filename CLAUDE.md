# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + App Router.

Time tracker / attendance ledger. Auth is backed by the real Klong gateway
(`simplr.klong-be`) — Supabase magic-link login via `identity`, no passwords,
no NextAuth — see Auth section below.

> **Non-negotiable for all UI work**: every surface must (1) use a shadcn/ui
> primitive from `src/components/ui/` for any interactive control — button,
> input, textarea, select, dialog, dropdown, popover, calendar, slider, avatar
> — never a hand-rolled native `<input>`/custom modal when a shadcn primitive
> exists (`npx shadcn@latest add <name>` if it's missing), and (2) follow the
> Zendesk Garden design system below (colors, radius, shadows, type). This
> applies to every new component and every edit to an existing one, not just
> the ones a task happens to call out explicitly.

You are an expert Next.js Senior Engineer. When generating, refactoring, or
reviewing code for this project, strictly follow the rules below.

## Stack

| Layer       | Tech                                                             |
| ----------- | ---------------------------------------------------------------- |
| Framework   | Next.js 16 (App Router)                                          |
| Language    | TypeScript 5 (strict)                                            |
| Styling     | Tailwind CSS 4 + shadcn/ui (base-ui)                             |
| Auth        | Klong gateway session cookie (magic link, via `simplr.klong-be`) |
| Drag & drop | @dnd-kit/core                                                    |
| Formatting  | Prettier + eslint-config-prettier                                |
| Git hooks   | Husky + lint-staged (pre-commit)                                 |
| Linting     | ESLint 9 + eslint-config-next                                    |
| Package mgr | npm                                                              |

### 1. Architecture & Framework Rules

- Use the App Router (`app/` directory) exclusively. Never use the legacy `pages/` directory.
- By default, components are Server Components. Explicitly add `'use client'` at the very top only when using React hooks (`useState`, `useEffect`), browser APIs, or event listeners.
- Implement Server Actions for data mutations (POST, PUT, DELETE) instead of standalone API route handlers whenever possible.
- Keep components small and specialized. Extract heavy client interaction or state into standalone client components.

### 2. Data Fetching & Performance

- Perform data prefetching directly inside Server Components using `async`/`await`.
- Query databases or backend services directly within Server Components to eliminate unnecessary internal API round-trips.
- Wrap heavy asynchronous data blocks or component trees with React `<Suspense>` boundaries to enable streaming UI.
- Use visibility-based lazy loading and dynamic imports (`next/dynamic`) for bulky client-side components to lower the initial JS bundle.

### 3. TypeScript & Type Safety

- Enable strict type checking. Never use `any`. Explicitly type all function parameters, component props, and Server Action payloads.
- Use Zod or a similar validation library to strictly parse and validate incoming data at the boundaries (API payloads, form submissions, environment variables).

### 4. Styling & UI Components

- Use Tailwind CSS with clean utility class structures.
- **Always use shadcn components** from `src/components/ui/` for all UI primitives. Never use raw HTML `<input>`, `<button>`, `<select>`, or `<textarea>` for standalone interactive controls — wrap them in the appropriate shadcn component.
- Available shadcn components (all built on **base-ui**, not Radix): `avatar`, `badge`, `button`, `calendar`, `card`, `dialog`, `dropdown-menu`, `input`, `label`, `popover`, `select`, `separator`, `slider`, `textarea`.
- For date picking: use `DatePickerInput` (`src/components/projects/DatePickerInput.tsx`) — a Calendar+Popover trigger styled to match the shadcn `Input`.
- For month selection: use the shadcn `Select` with generated month option lists.
- The design system uses **Zendesk Garden color tokens** as Tailwind classes (`bg-kale`, `text-error`, `border-success/30`). Use `gardenColors.*` from `src/config/theme.ts` only for runtime-computed `style=` props.
- Strictly separate desktop and mobile layout considerations.

### 5. Security & State Management

- Secure all data mutations by validating user sessions inside Server Actions or route handlers. Never trust client-side user IDs.
- Prevent accidental data leakage by keeping sensitive environment variables restricted to server-side code execution.

### 6. File Size

- **Hard limit: 300 lines per file.** ESLint enforces this via `max-lines`. If a file approaches the limit, split it — extract sub-components, move helpers to a `utils/` module, or break a large provider into smaller hooks.

---

## Commands

```bash
npm run dev           # dev server → http://localhost:3000
npm run build         # production build
npm run start         # serve production build
npm run lint          # ESLint
npm run format        # prettier --write .
npm run format:check  # prettier --check .
```

Pre-commit hook (`.husky/pre-commit`) runs `lint-staged`: ESLint --fix + Prettier
on staged files. Don't bypass with `--no-verify`.

## Local Setup

Copy `deploy/.env.example` to `deploy/.env`. `GATEWAY_URL` is required — points
at the running `simplr.klong-be` gateway (defaults to `http://localhost:8080`),
used by both `next.config.ts`'s rewrites and server-side gateway calls
(`src/lib/gateway.ts`, see `src/config/env.ts`). `npm run dev` / `npm run start`
load `deploy/.env` via `dotenv-cli` — this is not the Next.js default
`.env.local` at the project root.

The gateway itself needs `identity` + Redis (+ Supabase CLI) running, and its
`MAGIC_LINK_REDIRECT_URL` / `EMAIL_LINK_REDIRECT_URL` must point at this app
(`http://localhost:3000/auth/callback`, `.../emails/link/callback`) — not at
the gateway's own port — so the session cookie lands same-origin through the
rewrite proxy. See `simplr.klong-be/deploy/.env.example`.

## Design System — Zendesk Garden + Theme Presets

All UI follows the Zendesk Garden design language: calm, low-contrast chrome,
restrained functional color, System font stacks, 4-8px radius. **Garden is the
default and reference palette** — deep Kale green (`#03363D`) chrome. As of the
appearance-settings feature, the app also ships 5 additional sanctioned color
themes and 4 font-family options, all user-selectable from `profile` →
Appearance, all still governed by the same rules below (functional status
colors only, no webfonts, radius scale, etc). This is a deliberate extension
of the design system, not an exception to it — every new hex below is a
sanctioned addition to the single source of truth, not a one-off.

**Single source of truth**: `src/config/theme.ts` — `gardenColors` (Garden's
own values, for runtime color logic), plus `PALETTES`, `FONT_FAMILIES`, and
`FONT_SIZES` (metadata for the picker UI: id, label, description/stack,
swatch). The actual CSS values for every non-Garden palette live in
`src/app/globals.css` as `[data-palette="…"]` / `[data-palette="…"].dark`
blocks — mirror both if a value changes.

**Mechanism**: colors are indirected through `--garden-*` CSS custom
properties (`:root`/`.dark` = Garden's values), which `@theme inline` maps to
the Tailwind utilities (`bg-canvas`, `text-ink`, `border-garden-border`, …).
Each non-Garden theme overrides those same variable names — plus the
shadcn-consumed tokens (`--background`, `--card`, `--primary`, `--ring`, …) so
`Button`/`Dialog`/`Select`/etc. stay in sync — under a `[data-palette]`
attribute selector on `<html>`, set by `useAppearance()`
(`src/hooks/useAppearance.ts`) and persisted to `localStorage`
(`tapin:palette`/`tapin:font`/`tapin:font-size`). A tiny inline script in
`src/app/layout.tsx`'s `<head>` applies the stored attributes before paint
(same reasoning as next-themes' own script for the `.dark` class) to avoid a
flash of the default theme. Font family/size are a **separate axis** from
palette (`[data-font]`, `[data-font-size]`, overriding `--font-sans-stack` /
`--font-scale`) — any palette can be combined with any font.

**Status colors do not vary by theme.** Every palette shares the same
success/warning/error/open hues (see table below) — only
canvas/surface/border/chrome/link/ink shift per theme. This keeps "functional
color is the only place red/orange/green appear" true regardless of which
theme is active.

### Garden (default)

| Token                                                  | Value                                         | Use                                                     |
| ------------------------------------------------------ | --------------------------------------------- | ------------------------------------------------------- |
| `bg-canvas`                                            | `#F8F9F9`                                     | app background                                          |
| `bg-surface-2` / `bg-surface-3`                        | `#F1F3F5` / `#E9EBED`                         | hover fills, insets                                     |
| `border-garden-border` / `border-garden-border-strong` | `#D8DCDE` / `#C2C8CC`                         | dividers, inputs                                        |
| `bg-kale` / `bg-kale-hover` / `bg-kale-accent`         | `#03363D` / `#022A2F` / `#17494D`             | chrome, primary actions                                 |
| `text-link` / `text-link-hover`                        | `#1F73B7` / `#144A75`                         | hyperlinks                                              |
| `text-ink` / `text-ink-muted` / `text-ink-subtle`      | `#2F3941` / `#68737D` / `#87929D`             | text hierarchy                                          |
| success / warning / error / open                       | `#038153` / `#AD5918` / `#CC3340` / `#E34F32` | status only, never brand — **fixed across every theme** |
| `shadow-card` / `shadow-elevated`                      | —                                             | utility classes in `globals.css`                        |

### Additional theme presets (`data-palette` values)

Light-mode canvas/chrome/link shown; each also has a full dark-mode variant
in `globals.css`. Full var sets (including `--garden-surface-*`,
`--garden-border*`, `--garden-*-hover`, `--garden-ink-muted/subtle`, and the
shadcn token mirrors) are in `globals.css` — this table is the at-a-glance
reference, not the complete spec.

| `data-palette` value | Label         | Canvas    | Chrome (Kale slot) | Link      |
| -------------------- | ------------- | --------- | ------------------ | --------- |
| `midnight`           | Midnight      | `#F4FAFA` | `#0E3A3F`          | `#0F766E` |
| `slate-amber`        | Slate & Amber | `#F5F6F8` | `#1E293B`          | `#B45309` |
| `sepia`              | Sepia         | `#F5EFE6` | `#4A3728`          | `#6E4A26` |
| `orchid`             | Orchid        | `#F8F5FA` | `#3B2354`          | `#9333EA` |
| `high-contrast`      | High Contrast | `#FFFFFF` | `#000000`          | `#0645AD` |

**High Contrast is the one deliberate exception** to "chrome stays the same
hex across light/dark within a theme": its whole purpose is maximum contrast
against the _current_ canvas, so its chrome inverts white-on-black in dark
mode instead of staying fixed. Every other theme keeps one chrome hex across
both modes, same as Garden does today.

### Font options (`data-font` values)

All stacks are **OS-native** — no `next/font`, no webfont network request,
zero load cost preserved. This is the one part of the original "font is the
fixed OS system stack" rule that's relaxed: the app now offers a _choice of_
native stacks rather than a single hardcoded one.

| `data-font` value | Label          | Stack                                                                          |
| ----------------- | -------------- | ------------------------------------------------------------------------------ |
| `sans` (default)  | System Sans    | `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` |
| `serif`           | System Serif   | `ui-serif, Georgia, Cambria, "Times New Roman", serif`                         |
| `mono`            | System Mono    | `ui-monospace, "SF Mono", "Roboto Mono", Menlo, Consolas, monospace`           |
| `rounded`         | System Rounded | `ui-rounded, "SF Pro Rounded", "Trebuchet MS", Verdana, sans-serif`            |

`ui-rounded`/`SF Pro Rounded` only resolve on Apple platforms — the
`"Trebuchet MS", Verdana` fallback exists specifically so Windows/Linux users
see a visibly different, rounder-terminal font instead of silently landing
on the exact same rendered glyphs as `sans`.

`data-font-size` (`compact` / `comfortable` [default] / `large`) scales
`--font-scale` (0.9375 / 1 / 1.125), applied as `html { font-size: calc(16px *
var(--font-scale)) }` — an app-wide density knob independent of typeface.

Rules:

- **Kale is chrome-only** — the top app bar and primary buttons. Never use it for
  ticket/status color. (Applies per-theme: use that theme's chrome slot, never
  hardcode Garden's `#03363D` in a new component.)
- **Functional status colors are the only place** red/orange/green appear, and
  always pair with a text label — never color alone. Always use the
  `success`/`warning`/`error`/`open`/`yellow` tokens (fixed across themes),
  never a theme's chrome or link color for status.
- **Radius**: `rounded-md` (6px) for controls, `rounded-lg` (8px) for cards —
  `--radius` is set to 8px so Tailwind's `-lg/-md/-sm` scale maps directly to
  Garden's. Don't use `rounded-xl`/`2xl`/`3xl` (too large for this system).
  Unchanged by theme/font selection.
- **Off-palette colors**: if you need a shade not in the tables above, check
  it's actually a defined tint of the _active_ palette (e.g. `bg-error/8` for
  a light error tint — works in every theme since error is fixed) rather than
  inventing a new hex. Every hex literal in the codebase should trace back to
  `gardenColors`/`PALETTES` in `src/config/theme.ts`. Adding a genuinely new
  color still means adding a new sanctioned palette (or a token to an
  existing one) here first — never a one-off inline hex in a component.
- Fonts are OS-native stacks only (see table above) — zero load cost. Don't
  add `next/font` or a webfont `<link>`/`@font-face`.
- Focus ring is global (`:focus-visible` in `globals.css`, uses the active
  theme's link color) — don't override per-component unless there's a real
  contrast problem.

Reference: full Garden spec was supplied as design context early in this
project's history (colors, typography, spacing, motion, accessibility notes) —
if it's not in this file, check `git log` for the original design-context prompt
before inventing new patterns.

## Architecture

**Source root:** `src/`

### Route structure (`src/app/`)

- `layout.tsx` — root layout; wraps `ProjectsProvider` → `TimesheetProvider` (no auth provider here — session is fetched per-request inside `(protected)/layout.tsx`, not globally); also runs the appearance-attribute boot `<Script>` — see Design System above
- `(protected)/` — route group for authenticated shell; `layout.tsx` is an async Server Component that calls `getMe()`, redirects to `/login` if unauthenticated, and seeds `SessionProvider` before rendering `AppShell` (`Header` + `Sidebar` + `<main>`)
  - `dashboard/page.tsx` — gamified stats hub (`DashboardGate` → `DashboardStats`: level/streak/achievement-count banner + 3 stat tiles). This is **also** where the post-onboarding welcome/company-setup flow renders inline when pending — see "Onboarding & welcome flow" below. Not the roster — that moved to `/projects`.
  - `projects/page.tsx` — the roster/allocation view (`DashboardShell` → `WeeklyRoster`, tap-logging, treemap grid) — this used to be the root dashboard; see "WeeklyRoster" below
  - `projects/list/page.tsx` — project management table (`ProjectsTable`)
  - `projects/[id]/page.tsx` — project detail/edit page (`ProjectDetailView`) — replaced the old edit-dialog pattern; see "Project form" below
  - `timesheets/page.tsx` — timesheet history
  - `profile/page.tsx` — `ProfileHeaderCard` (avatar/banner, upload-on-hover) + `AppearanceSettings` + `AchievementsGrid` + `SessionsList`
  - `pomodoro/page.tsx`, `companies/page.tsx`, `companies/[slug]/page.tsx` — see their own component folders
- `onboarding/page.tsx` — short name-confirm + practice-tap intro (`OnboardingIntroFlow`), always runs first for any account with `needs_onboarding: true`, regardless of new-vs-invited
- `login/page.tsx` — magic-link request form (email only, no password)
- `not-found.tsx` — custom 404, no app shell
- There is **no** `/welcome` or `/welcome/company` route anymore — that flow is embedded directly in `/dashboard` (`WelcomeChooserFlow`, `CompanySetupForm`), not a separate page. Don't recreate those routes; extend the embedded components instead.

### Auth (`src/lib/gateway.ts`, `src/proxy.ts`, `src/components/providers/SessionProvider.tsx`)

Real auth via the Klong gateway (`simplr.klong-be`) — Supabase magic link,
opaque session cookie, no NextAuth, no passwords.

- **Login**: `login/page.tsx` `POST`s to `/auth/magic-link` (same-origin, rewritten to the gateway — see `next.config.ts`). User clicks the emailed link → lands on `GET /auth/callback` (also rewritten) → gateway verifies, sets the `klong_session` HttpOnly cookie, redirects back into the app.
- **Route protection**: `src/proxy.ts` (Next 16 renamed "middleware" → "proxy") is a cheap cookie-presence check only — redirects to `/login?callbackUrl=<path>` if the `klong_session` cookie is missing. It does **not** validate the session (no network call in proxy); that's the layout's job.
- **Session resolution**: `(protected)/layout.tsx` calls `getMe()` (`src/lib/gateway.ts`, `react cache()`-deduped, forwards the request's cookies to gateway `GET /me`) — a null result (expired/invalid cookie) redirects to `/login` there. The result seeds `SessionProvider` (`src/components/providers/SessionProvider.tsx`), consumed client-side via `useKlongSession()` (used by `Header.tsx`).
- **Logout**: `useLogout()` (`src/hooks/useLogout.ts`) `POST`s `/me/logout` (same-origin rewrite) so the gateway's cookie-clearing `Set-Cookie` applies directly to the browser, then routes to `/login`.
- Session/person response shapes are typed in `src/types/session.ts` (mirrors gateway's `meResponse`/`personResponse` — see `simplr.klong-be/gateway/internal/handlers/person_json.go`).
- `callbackUrl` preservation on redirect-to-login is best-effort only — the gateway's post-login redirect target is currently a fixed configured path (`POST_LOGIN_REDIRECT_PATH`), not per-request, so deep-link return isn't wired end-to-end yet.
- Company-invite acceptance, domain-claim prompts, and email management (add/remove/set-primary) are **not built yet** — see `docs/FE_LOGIN_FLOW_TASKS.md` for the full backlog against `Klong_Login_Flow.docx`. Session-list UI **is** built (`SessionsList.tsx`, `GET/DELETE /me/sessions`). Company _creation_ (as part of onboarding) is also built — see "Onboarding & welcome flow" below.
- **Avatar/banner upload** is real, not mocked — `POST /me/media/uploads` (presigned PUT) → `PUT` to storage → `POST /me/media/uploads/confirm`. See "Person media upload" below.

### State management — client-side only (no backend yet, except auth)

Project/timesheet data lives in React state or `localStorage`; there is no API layer for it yet (auth is the exception — see above):

| Provider            | Location                                         | Persistence                                                                                                             |
| ------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `ProjectsProvider`  | `src/components/providers/ProjectsProvider.tsx`  | React `useState` (resets on refresh); seeds from `src/data/projects.json` + `src/data/ledger.json`                      |
| `TimesheetProvider` | `src/components/providers/TimesheetProvider.tsx` | `localStorage` via `useSyncExternalStore`; cross-tab sync via `storage` event + custom `tapin:timesheets-updated` event |
| `SessionProvider`   | `src/components/providers/SessionProvider.tsx`   | Seeded server-side per request from gateway `GET /me`; `klong_session` HttpOnly cookie is the actual source of truth    |

`useProjects()` from `providers/ProjectsProvider` is the single source of truth
for project data (dashboard tap-logging and the `/projects` management page
both read/write through it) — don't reintroduce local `useState` copies of
project data in a page/component.

### Key domain types (`src/components/providers/ProjectsProvider.tsx`)

- `Project` — `id`, `title`, `company`, `assignee`, `logs: Record<string, number>` (ISO date → minutes), `targetHours` (weekly, computed from monthly average), `icon`, `locked`, `startDate?`, `endDate?`, `monthlyTargets?: MonthlyTarget[]`
- `MonthlyTarget` — `{ month: string ("YYYY-MM"), hours: number }`
- `LedgerEntry` — denormalized audit entry (captures title/company/icon at write time so history is immutable)
- `TimesheetRecord` — monthly signed-off snapshot stored in localStorage
- `sumLogs(logs, start?, end?)` — helper to sum a project's logs within an optional ISO date range
- Types are co-located with the component/module that owns them; shared types go in `src/types/`.

### WeeklyRoster (`src/components/dashboard/WeeklyRoster.tsx`)

Central orchestrator for the allocation view. Key internals:

- **Period views** — day / week / month / year. Week always snaps to Monday via `weekStart()` in `utils.ts`. Month/Year data is a projection (`targetHours × TARGET_SCALE`), not real history.
- **RosterControls** — top bar: title row + controls row (period picker, date picker, Today, Grid/Progress toggle, TAP selector).
- **RosterActionBar** — hours summary + Log Leave + New Project buttons.
- **Treemap layout** — binary-split algorithm (`buildTreeStructure` / `layoutTree`). Topology always built with equal weights (balanced tree); `layoutTree` handles proportional sizing via live `weightBySlot`. Both the "don't jitter while tapping" and "don't reshuffle the whole grid when swapping two tiles" behaviors are load-bearing design decisions with comments in `WeeklyRoster.tsx` — read those before changing the layout algorithm.
- **Drag-and-drop** — `@dnd-kit/core` (`useDraggable`/`useDroppable`/`DndContext`), not native HTML5 DnD. Grid view swaps slot assignments; progress view splices list order. `PointerSensor` uses an 8px activation `distance` so tap-to-log and drag-to-swap don't conflict.
- **DisplayProject** — `Project & { loggedMinutes: number }` — period-scoped type used throughout roster components.
- **Day view editing** — tapping in day view logs to `selectedDate`, not today.
- Rendered via `next/dynamic(..., { ssr: false })` (`WeeklyRosterClient.tsx`) —
  dnd-kit assigns ids client-side in a way that doesn't line up with SSR'd HTML,
  causing a hydration mismatch otherwise. Any other dnd-kit-heavy component
  should follow the same pattern.

### Project form (`src/components/projects/`)

- `ProjectFormFields.tsx` — the actual form (title, company, dates, monthly targets, icon); shared by both create and edit so field logic lives in one place.
- `ProjectFormDialog.tsx` — **create only** — a shadcn `Dialog` wrapping `ProjectFormFields`. Editing an existing project is a full page (`projects/[id]/page.tsx` → `ProjectDetailView.tsx`), not a dialog — don't reintroduce an edit modal.
- `DatePickerInput.tsx` — reusable Calendar+Popover date picker styled as shadcn Input.
- `MonthlyTargetsEditor.tsx` — per-month target hours editor; shown only when both dates are set; always shows ≥ 1 row; uses shadcn `Select` for month and shadcn `Input` with inset suffix for hours.
- Shared helpers `formatHours()` and `PROJECT_ICONS` live in `src/components/dashboard/roster/utils.ts` / `roster/constants.ts` — import them, don't redefine locally (this was duplicated 2-3x across `ProjectsTable`/`ProjectDetailView` before being consolidated).

### Appearance settings (`src/components/profile/AppearanceSettings.tsx`, `src/hooks/useAppearance.ts`)

User-facing feature on `profile/page.tsx` — not just the CSS mechanism
documented under "Design System" above, the actual settings surface:

- **Mode** — existing Light/Dark/System (`ThemeToggleGroup`, `next-themes`),
  unchanged.
- **Theme** — swatch picker across the 6 `PALETTES` (`src/config/theme.ts`);
  each swatch is a two-tone circle (chrome/link) on that theme's canvas
  color, with a checkmark on the active one.
- **Font** — segmented control across the 4 `FONT_FAMILIES`; each button
  renders its own label ("Aa") in that font's actual stack via inline
  `style={{ fontFamily }}`, so the picker itself previews the choice.
- **Size** — segmented Compact/Comfortable/Large, scales the whole app via
  `--font-scale` (see Design System above).

State lives in `useAppearance()` (`src/hooks/useAppearance.ts`) — a
`useSyncExternalStore` hook (same pattern as `TimesheetProvider`, per the
"external/ticking values" convention below) reading/writing
`data-palette`/`data-font`/`data-font-size` attributes on `<html>` directly,
persisted to `localStorage` (`tapin:palette`/`tapin:font`/`tapin:font-size`).
No provider/context needed — any component can call `useAppearance()`
directly. Like all client-side state in this app except auth, the choice is
**per-device only**, not synced to a backend/account (see "State management"
below).

### Achievements (`src/lib/achievements.ts`, `src/hooks/useAchievements.ts`, `src/components/profile/Achievement*`)

Client-computed, like everything else non-auth — there's no backend achievements endpoint (see `docs/ACHIEVEMENTS.md` for the full proposal, incl. a real-backend design if that's ever built).

- `src/data/achievements.json` — the static catalog (18 entries: id, key, title, description, category).
- `src/lib/achievements.ts` — `evaluateAchievements()`, a pure function deriving unlocked/locked + progress for every catalog entry from `ProjectsProvider`/`TimesheetProvider` state + `compliance.json`. No side effects, easy to unit-test if that's ever added.
- `src/hooks/useAchievements.ts` — wires the providers (+ a drag-count localStorage counter from `src/lib/achievementEvents.ts`, for the one achievement that needs an event outside normal provider state) into `evaluateAchievements()`.
- `src/config/achievementIcons.ts` — placeholder `lucide-react` icons keyed by achievement `key`; swap for sourced graphics per `docs/ACHIEVEMENTS.md` §3 without touching any other file.
- `AchievementsGrid.tsx` — unlocked achievements sort to the front (stable within each group); click any badge → `AchievementDetailDialog` (icon, unlocked/locked `Badge`, description, progress bar if in-progress).
- `AchievementBadge.tsx` reserves fixed-height slots for the title and progress line — achievement titles vary a lot in length ("Juggler" vs "Top Contributor") and not every achievement has a progress line, so without a reserved height the grid renders with jagged row heights.

### Onboarding & welcome flow (`src/hooks/useWelcomeGate.ts`, `src/components/welcome/`, `src/components/dashboard/DashboardGate.tsx`)

Two independent signals, checked in that order:

1. **`needs_onboarding`** (persistent backend flag on `Person`) — always gates first, regardless of new-vs-invited. `dashboard/page.tsx` redirects to `/onboarding` (`OnboardingIntroFlow` — name confirm + practice-tap) before anything else if this is true.
2. **`is_new_account`** (one-time query param on the post-login redirect, _not_ part of `/me` — only meaningful at that specific login) — propagated through `/onboarding?is_new_account=1` back to `/dashboard?is_new_account=1`. `DashboardGate` uses it to seed a **client-side-only** "welcome pending" flag (`useWelcomeGate.ts`, `localStorage: tapin:welcome-pending`) — there's no backend field for "has this person finished company setup," so this is the only signal available. Existing accounts never see `is_new_account` again, so nobody gets retroactively gated.

While pending, `DashboardGate` renders `WelcomeChooserFlow` **in place of** `DashboardStats` — not a redirect to a separate route (there is no `/welcome` route; see Route structure above). Every other protected page is blocked while pending: `AppShell.tsx` redirects back to `/dashboard` for any path outside `{/dashboard, /profile}`, and `Sidebar.tsx` visually disables the other nav items (lock icon) — both keyed off the same `useWelcomePending()` hook.

`WelcomeChooserFlow` is a full screen-swap per choice (picking "company" replaces the whole card, not appended below the choice grid):

- **invite** — informational text only, no unlock.
- **solo** — confirm text + `UnlockAppButton`.
- **company** — `CompanySetupForm`, its own 2-step stepper (Details → Confirm), **not** a `Dialog` — same in-place screen-swap technique, not a modal. Confirm step does the real `POST /companies`, then goes straight to unlock (no separate "your company is ready" screen).

Both solo and company success funnel into the **same** `WelcomeUnlockOverlay` — a fullscreen kale flood-and-reveal (`clip-path: circle()` expand → hold → fade), mounted by `DashboardGate` _outside_ the pending-conditional branch so it survives the pending→content swap. `completeWelcome()` fires mid-animation while the overlay is still fully opaque, so the dashboard swap happens unseen behind it. If you touch this: the overlay's timer effect must read `onDone` through a ref, not as a direct dependency — `completeWelcome()` re-renders the parent mid-timeline, and a live dependency there restarts the whole animation from scratch (this was a real shipped bug).

Neither the solo nor company screen asks for a display name — `OnboardingIntroFlow` already collected and saved it via `POST /me/onboarding/complete` before either of these ever renders.

### Person media upload (`src/lib/mediaUpload.ts`, `src/lib/cropImage.ts`, `src/components/profile/MediaUploadZone.tsx`, `ImageCropDialog.tsx`, `ProfileHeaderCard.tsx`)

Real, gateway-backed — not mocked, unlike most other app state. Hover the avatar or banner on `/profile` → camera icon overlay → pick a file → crop → upload.

- **Crop step**: `react-easy-crop` inside a shadcn `Dialog` (`ImageCropDialog.tsx`) — avatar crops to a circle at 1:1, banner to a 4:1 rectangle, both matching how each is actually displayed. `cropImage.ts` renders the selected region to a canvas and reads it back as a `Blob`, which gets wrapped into a `File` and uploaded — the crop happens client-side, entirely before any network call.
- **Upload flow** (`mediaUpload.ts`, `uploadPersonMedia(kind, file)`) — the real 3-step presigned flow against `simplr.klong-be`'s media system: `POST /me/media/uploads` (initiate) → `PUT` bytes directly to the presigned storage URL → `POST /me/media/uploads/confirm` (returns the updated `Person` with the new `avatar_url`/`banner_url` already set). Client-side validates type (jpeg/png/webp) and size (avatar 2MB, banner 5MB) first, mirroring the backend's own limits — fails fast instead of round-tripping. On a non-2xx response, the real backend error message is read from the gateway's `{error:{code,message}}` body (`errorMessage()` helper) rather than shown a generic string.
- **`MediaUploadZone.tsx`** — the reusable hover-overlay (Camera icon, dims + spinner while uploading) wrapping either visual; owns the picked-file → crop-dialog → upload sequence.
- **`ProfileHeaderCard.tsx`** — client component owning the current `Person` (seeded from the server-fetched value); on successful upload updates its own state **and** calls `SessionProvider`'s `setPerson()` so `Header.tsx`'s avatar updates immediately too, without a full page reload.
- **Backend gotcha worth knowing if this breaks again**: the presigned PUT URL's SigV4 signature can bind `Content-Length` to an _exact_ byte count, not a ceiling — if the backend ever signs with a fixed max-size constant instead of the client's actual declared size, every upload that isn't precisely that many bytes gets a 403 from storage. Real bug, hit and fixed in `identity/internal/media/service.go` / `employment/internal/media/service.go` in the backend repo — not something client-side code can work around.

### Seed data (`src/data/`)

- `projects.json` — initial project list; includes `startDate`, `endDate`, `monthlyTargets`
- `ledger.json` — initial ledger entries
- `attendance.json` — static daily attendance display data
- `compliance.json` — static compliance stats for profile page

### Constants (`src/config/constants.ts`)

- `TAP_MINUTES` — maps `TapUnit` ("30m" | "1h" | "2h") to minute values
- `MAX_LEDGER_ENTRIES` — rolling in-memory ledger cap
- `MAX_TILE_RATIO` — treemap tile size bounds
- `TARGET_SCALE` — period multipliers for month/year projections (day: 0.2, week: 1, month: 4.33, year: 52)

## Conventions

- **Components**: PascalCase filename, grouped by feature under `src/components/`
  (`layout/`, `dashboard/`, `projects/`, `providers/`, `ui/`) — put new features
  in a matching new folder rather than dumping everything flat.
- **Server vs Client**: default to Server Components; add `"use client"` only
  when needed (event handlers, hooks, browser APIs). Route-group `layout.tsx`
  files can stay server components even when their children (Header, Sidebar)
  are client components.
- **Routing**: file-based in `src/app/` — the `(protected)` route group is for
  pages that need the authenticated shell (Header+Sidebar+MobileNav); pages
  outside it (like `/login`) render standalone.
- **shadcn primitives are mandatory, not a preference**: before writing any
  interactive control (button, text/number/date input, textarea, select,
  dialog, dropdown, popover, calendar, slider, avatar, ...), check
  `src/components/ui/` first. If it's not there, `npx shadcn@latest add <name>`
  before hand-rolling it — they land already wired to the Garden CSS variables
  in `globals.css`, no extra theming needed. A native `<input type="date">` or
  a raw `<div>`-based modal is a bug, not a style choice (see
  `SpecialDayDialog.tsx` for the corrected Calendar+Popover date picker vs. the
  native date input it replaced).
- **Styling**: Tailwind utility classes; no CSS modules unless scoping is
  genuinely needed.
- **Imports**: use `@/*` alias (maps to `src/*`)
- **Data fetching**: fetch in Server Components; use `async/await` directly —
  no useEffect for data.
- **External/ticking values** (clocks, anything that changes outside React's
  render cycle): use `useSyncExternalStore`, not `useEffect` + `setState` — see
  `LiveClock.tsx`. The latter trips `react-hooks/set-state-in-effect` and is the
  wrong tool for this class of problem anyway.
- **No barrel files** (`index.ts` re-exports) unless the module surface is
  stable and large.

## Adding Dependencies

```bash
npm install <package>          # runtime dep
npm install -D <package>       # dev dep
```

## Notes

- Node: v26.5.0 (nvm). `lint-staged` pinned to `15.5.2` — can bump to latest now that Node is current.
- `AGENTS.md` in root is auto-generated by create-next-app — safe to ignore.
- Tailwind 4 uses `@tailwindcss/postcss` — no `tailwind.config.js` required by
  default; add one only for theme customization.
- `components.json` — shadcn config, `style: base-nova`, `baseColor: neutral`.
- `react-easy-crop` — the one non-shadcn UI dependency in the app, used only by `ImageCropDialog.tsx` (see "Person media upload"). Everything else interactive should still go through `src/components/ui/` first.
