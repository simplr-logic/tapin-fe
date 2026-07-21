# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + App Router.
Folder: `C:\Users\jackh\Desktop\klong`

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

Copy `.env.example` to `.env.local`. `GATEWAY_URL` is required — points at the
running `simplr.klong-be` gateway (defaults to `http://localhost:8080`), used
by both `next.config.ts`'s rewrites and server-side gateway calls
(`src/lib/gateway.ts`, see `src/config/env.ts`).

The gateway itself needs `identity` + Redis (+ Supabase CLI) running, and its
`MAGIC_LINK_REDIRECT_URL` / `EMAIL_LINK_REDIRECT_URL` must point at this app
(`http://localhost:3000/auth/callback`, `.../emails/link/callback`) — not at
the gateway's own port — so the session cookie lands same-origin through the
rewrite proxy. See `simplr.klong-be/deploy/.env.example`.

## Design System — Zendesk Garden

All UI follows the Zendesk Garden design language: calm, low-contrast, deep Kale
green (`#03363D`) chrome, restrained functional color, System font stack, 4-8px
radius. Single source of truth for colors is `src/config/theme.ts` (`gardenColors`
object), mirrored as CSS custom properties in `src/app/globals.css`'s `@theme`
block. Prefer the Tailwind class for static styling; use `gardenColors.*` only
when a color must be computed at runtime.

| Token                                                  | Value                                         | Use                              |
| ------------------------------------------------------ | --------------------------------------------- | -------------------------------- |
| `bg-canvas`                                            | `#F8F9F9`                                     | app background                   |
| `bg-surface-2` / `bg-surface-3`                        | `#F1F3F5` / `#E9EBED`                         | hover fills, insets              |
| `border-garden-border` / `border-garden-border-strong` | `#D8DCDE` / `#C2C8CC`                         | dividers, inputs                 |
| `bg-kale` / `bg-kale-hover` / `bg-kale-accent`         | `#03363D` / `#022A2F` / `#17494D`             | chrome, primary actions          |
| `text-link` / `text-link-hover`                        | `#1F73B7` / `#144A75`                         | hyperlinks                       |
| `text-ink` / `text-ink-muted` / `text-ink-subtle`      | `#2F3941` / `#68737D` / `#87929D`             | text hierarchy                   |
| success / warning / error / open                       | `#038153` / `#AD5918` / `#CC3340` / `#E34F32` | status only, never brand         |
| `shadow-card` / `shadow-elevated`                      | —                                             | utility classes in `globals.css` |

Rules:

- **Kale is chrome-only** — the top app bar and primary buttons. Never use it for
  ticket/status color.
- **Functional status colors are the only place** red/orange/green appear, and
  always pair with a text label — never color alone.
- **Radius**: `rounded-md` (6px) for controls, `rounded-lg` (8px) for cards —
  `--radius` is set to 8px so Tailwind's `-lg/-md/-sm` scale maps directly to
  Garden's. Don't use `rounded-xl`/`2xl`/`3xl` (too large for this system).
- **Off-palette colors**: if you need a shade not in the table above, check it's
  actually a Garden-defined tint (e.g. `bg-[#CC3340]/8` for a light error tint)
  rather than inventing a new hex. Every hex literal in the codebase should trace
  back to the table above.
- Font is the OS system stack (`system-ui, -apple-system, ...`), not a webfont —
  zero load cost, matches Garden's "System font" spec. Don't add `next/font`.
- Focus ring is global (`:focus-visible` in `globals.css`, 3px link-blue) — don't
  override per-component unless there's a real contrast problem.

Reference: full Garden spec was supplied as design context early in this
project's history (colors, typography, spacing, motion, accessibility notes) —
if it's not in this file, check `git log` for the original design-context prompt
before inventing new patterns.

## Architecture

**Source root:** `src/`

### Route structure (`src/app/`)

- `layout.tsx` — root layout; wraps `ProjectsProvider` → `TimesheetProvider` (no auth provider here — session is fetched per-request inside `(protected)/layout.tsx`, not globally)
- `(protected)/` — route group for authenticated shell; `layout.tsx` is an async Server Component that calls `getMe()`, redirects to `/login` if unauthenticated, and seeds `SessionProvider` before rendering `Header` + `Sidebar` + `MobileNav` + `<main>`
  - `page.tsx` — dashboard (3 panels: DailyAttendance, TimesheetSubmission, WeeklyRoster)
  - `projects/page.tsx` — project management table (`ProjectsTable`)
  - `timesheets/page.tsx` — timesheet history
  - `profile/page.tsx` — user profile / stats
- `login/page.tsx` — magic-link request form (email only, no password)
- `not-found.tsx` — custom 404, no app shell

### Auth (`src/lib/gateway.ts`, `src/proxy.ts`, `src/components/providers/SessionProvider.tsx`)

Real auth via the Klong gateway (`simplr.klong-be`) — Supabase magic link,
opaque session cookie, no NextAuth, no passwords.

- **Login**: `login/page.tsx` `POST`s to `/auth/magic-link` (same-origin, rewritten to the gateway — see `next.config.ts`). User clicks the emailed link → lands on `GET /auth/callback` (also rewritten) → gateway verifies, sets the `klong_session` HttpOnly cookie, redirects back into the app.
- **Route protection**: `src/proxy.ts` (Next 16 renamed "middleware" → "proxy") is a cheap cookie-presence check only — redirects to `/login?callbackUrl=<path>` if the `klong_session` cookie is missing. It does **not** validate the session (no network call in proxy); that's the layout's job.
- **Session resolution**: `(protected)/layout.tsx` calls `getMe()` (`src/lib/gateway.ts`, `react cache()`-deduped, forwards the request's cookies to gateway `GET /me`) — a null result (expired/invalid cookie) redirects to `/login` there. The result seeds `SessionProvider` (`src/components/providers/SessionProvider.tsx`), consumed client-side via `useKlongSession()` (used by `Header.tsx`).
- **Logout**: `useLogout()` (`src/hooks/useLogout.ts`) `POST`s `/me/logout` (same-origin rewrite) so the gateway's cookie-clearing `Set-Cookie` applies directly to the browser, then routes to `/login`.
- Session/person response shapes are typed in `src/types/session.ts` (mirrors gateway's `meResponse`/`personResponse` — see `simplr.klong-be/gateway/internal/handlers/person_json.go`).
- `callbackUrl` preservation on redirect-to-login is best-effort only — the gateway's post-login redirect target is currently a fixed configured path (`POST_LOGIN_REDIRECT_PATH`), not per-request, so deep-link return isn't wired end-to-end yet.
- Company-invite acceptance, domain-claim prompts, email management (add/remove/set-primary), and session-list UI are **not built yet** — see `FE_LOGIN_FLOW_TASKS.md` for the full backlog against `Klong_Login_Flow.docx`.

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

- `ProjectFormDialog.tsx` — create/edit dialog; uses `DatePickerInput` for start/end dates.
- `DatePickerInput.tsx` — reusable Calendar+Popover date picker styled as shadcn Input.
- `MonthlyTargetsEditor.tsx` — per-month target hours editor; shown only when both dates are set; always shows ≥ 1 row; uses shadcn `Select` for month and shadcn `Input` with inset suffix for hours.

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
