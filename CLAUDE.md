# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

You are an expert Next.js Senior Engineer. When generating, refactoring, or reviewing code for this Next.js project, you must strictly follow these instructions:

### 1. Architecture & Framework Rules

- Use the App Router (app/ directory) exclusively. Never use the legacy pages/ directory.
- By default, components are Server Components. Explicitly add 'use client' at the very top only when using React hooks (useState, useEffect), browser APIs, or event listeners.
- Implement Server Actions for data mutations (POST, PUT, DELETE) instead of standalone API route handlers whenever possible.
- Keep components small and specialized. Extract heavy client interaction or state into standalone client components.

### 2. Data Fetching & Performance

- Perform data prefetching directly inside Server Components using async/await.
- Query databases or backend services directly within Server Components to eliminate unnecessary internal API round-trips.
- Wrap heavy asynchronous data blocks or component trees with React <Suspense> boundaries to enable streaming UI.
- Use visibility-based lazy loading and dynamic imports ('next/dynamic') for bulky client-side components to lower the Initial JavaScript Bundle.

### 3. TypeScript & Type Safety

- Enable strict type checking. Never use 'any'. Explicitly type all function parameters, component props, and Server Action payloads.
- Use Zod or a similar validation library to strictly parse and validate incoming data at the boundaries (e.g., API payloads, form submissions, environment variables).

### 4. Styling & UI Components

- Use Tailwind CSS with clean utility class structures.
- Prefer UI component scaffolding (such as shadcn/ui) that provides copy-pasteable, accessible primitives over heavy, black-box component libraries.
- Strictly separate desktop and mobile layout considerations—think through responsive design constraints explicitly before rendering code.

### 5. Security & State Management

- Secure all data mutations by validating user sessions inside Server Actions or route handlers. Never trust client-side user IDs.
- Prevent accidental data leakage by keeping sensitive environment variables restricted to server-side code execution.

### 6. File Size

- **Hard limit: 300 lines per file.** ESLint enforces this via `max-lines`. If a file approaches the limit, split it — extract sub-components, move helpers to a `utils/` module, or break a large provider into smaller hooks.

Before you write any code, explain your implementation plan step-by-step using a brief markdown checklist. Do not truncate code blocks or use placeholders like "// implement later". Provide complete, copy-pasteable files.

---

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # ESLint
npm run format     # Prettier (write)
npm run format:check  # Prettier (check only)
```

Pre-commit hooks run ESLint + Prettier automatically via husky + lint-staged.

## Local Setup

Copy `.env.example` to `.env.local`. `AUTH_SECRET` is required — generate with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Demo login defaults: `demo@tapin.app` / `demo1234`.

## Architecture

**Source root:** `src/`

### Route structure (`src/app/`)

- `layout.tsx` — root layout; wraps entire app in `AuthProvider` → `ProjectsProvider` → `TimesheetProvider`
- `(protected)/` — route group for authenticated shell; `layout.tsx` renders `Header` + `Sidebar` + `MobileNav` + `<main>`
  - `page.tsx` — dashboard (3 panels: DailyAttendance, TimesheetSubmission, WeeklyRoster)
  - `projects/page.tsx` — project management table
  - `timesheets/page.tsx` — timesheet history
  - `profile/page.tsx` — user profile / stats
- `login/page.tsx` — credential login form
- `api/auth/[...nextauth]/` — NextAuth route handler

### Auth (`src/auth.ts`)

Mock credential-only auth via `next-auth@v5` (beta). Single demo account; no real backend. To wire up a real backend, replace the `authorize` function — session shape, middleware, and downstream consumers are already correct.

### State management — client-side only (no backend yet)

All data lives in React state or `localStorage`; there is no API layer:

| Provider            | Location                                         | Persistence                                                                                                             |
| ------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `ProjectsProvider`  | `src/components/providers/ProjectsProvider.tsx`  | React `useState` (resets on refresh); seeds from `src/data/projects.json` + `src/data/ledger.json`                      |
| `TimesheetProvider` | `src/components/providers/TimesheetProvider.tsx` | `localStorage` via `useSyncExternalStore`; cross-tab sync via `storage` event + custom `tapin:timesheets-updated` event |
| `AuthProvider`      | wraps NextAuth `SessionProvider`                 | JWT cookie                                                                                                              |

### Key domain types (all in `ProjectsProvider.tsx`)

- `Project` — id, title, company, assignee, loggedMinutes, targetHours, icon, locked
- `LedgerEntry` — denormalized audit entry (captures title/company/icon at write time so history is immutable)
- `TimesheetRecord` — weekly signed-off snapshot stored in localStorage

### WeeklyRoster (`src/components/dashboard/WeeklyRoster.tsx`)

Largest component (~1750 lines, `'use client'`). Key internals:

- **Treemap layout** — binary-split algorithm (`buildTreeStructure` / `layoutTree`). Slot topology freezes on entry set change; only weights update live to avoid tile jumping.
- **Drag-and-drop** — `@dnd-kit/core`. Grid view swaps slot assignments; progress view splices list order. PointerSensor uses 8px activation distance so tap-to-log and drag-to-swap don't conflict.
- **Period locking** — week with submitted timesheet, or any Month/Year granularity, is read-only. Month/Year data is a projection (current week × `PERIOD_SCALE` factor), not real history.

### Design system

Zendesk Garden color tokens. Single source of truth: `src/config/theme.ts` (`gardenColors` object) mirrored as CSS custom properties in `src/app/globals.css` `@theme` block. Use Tailwind classes (`bg-kale`, `text-error`, `border-success/30`) for static styling; use `gardenColors.*` only for runtime-computed `style=` props.

### Seed data (`src/data/`)

- `projects.json` — initial project list
- `ledger.json` — initial ledger entries
- `attendance.json` — static daily attendance display data
- `compliance.json` — static compliance stats for profile page
- `demo-user.json` — demo user object returned by mock auth

### Constants (`src/config/constants.ts`)

- `TAP_MINUTES` — maps `TapUnit` ("30m" | "1h" | "2h") to minute values
- `MAX_LEDGER_ENTRIES` — rolling in-memory ledger cap
- `MAX_TILE_RATIO` — treemap tile size bounds (1 to 1.8×)
- `PERIOD_SCALE` — multipliers for month/year projections
