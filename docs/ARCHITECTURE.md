# TapIn — Architecture & Logic Reference

## Libraries

### Framework

| Package                 | Purpose                                                         |
| ----------------------- | --------------------------------------------------------------- |
| `next` (15, App Router) | Routing, server components, layout, middleware                  |
| `react` / `react-dom`   | UI rendering, hooks                                             |
| `next-auth` v5 (beta)   | Auth — credential-only mock, JWT session, middleware protection |

### UI & Styling

| Package                   | Purpose                                                             |
| ------------------------- | ------------------------------------------------------------------- |
| `tailwindcss` v4          | Utility-first CSS; Zendesk Garden tokens mapped as CSS custom props |
| `@base-ui/react`          | Headless primitives for all shadcn components (replaces Radix)      |
| `react-day-picker` v9     | Calendar; `DayButton` is fully replaced via the `components` prop   |
| `lucide-react`            | Icon set                                                            |
| `clsx` + `tailwind-merge` | Conditional class merging (`cn()` util)                             |

### Drag & Drop

| Package         | Purpose                                                                                      |
| --------------- | -------------------------------------------------------------------------------------------- |
| `@dnd-kit/core` | Pointer/touch drag for treemap tile swapping (grid view) and list reordering (progress view) |

### State & Persistence

| Package                | Purpose                                           |
| ---------------------- | ------------------------------------------------- |
| `localStorage`         | Projects, streak counter, timesheets — no backend |
| `useSyncExternalStore` | Cross-tab timesheet sync via `storage` event      |

### Dev Tooling

| Package                         | Purpose                                         |
| ------------------------------- | ----------------------------------------------- |
| `eslint` + `eslint-config-next` | Linting; max 300 lines enforced via `max-lines` |
| `eslint-plugin-import`          | Import order + no cycles                        |
| `prettier`                      | Formatting                                      |
| `husky` + `lint-staged`         | Pre-commit: lint + format on staged files       |
| `zod`                           | Runtime env validation (`src/config/env.ts`)    |

---

## Offline Support

### How it works

Projects are the only mutable state that needs offline persistence (timesheets use `localStorage` already; streak has its own key).

**`src/components/providers/ProjectsProvider.tsx`** — the pattern:

```
1. useState initialised with seed JSON (same on server + client → no hydration mismatch)
2. useEffect on mount: read localStorage → setProjects (overrides seed if data exists)
3. setSynced(true)  ← guard flag
4. Second useEffect: whenever projects change AND synced === true → write to localStorage
```

The `synced` guard prevents the save effect from firing before the load effect runs — without it, the seed data would overwrite any saved state on the very first render cycle.

**`src/hooks/useOnlineStatus.ts`** — detects network state:

```ts
navigator.onLine          // initial value
window: "online"  event   // fires when network reconnects
window: "offline" event   // fires when network drops
```

`Header.tsx` consumes `useOnlineStatus()` and shows a banner when offline. No sync queue or retry logic is needed — every tap writes directly to localStorage, so nothing is lost when offline. When the user reconnects, all their locally logged hours are already stored; no merge is required.

---

## Streak Logic

**Goal:** count consecutive working days where the user actively logged hours _today_, from the current session. Retroactively filling in past dates must never affect the streak counter.

**`src/hooks/useStreak.ts`**

Stores a single object in `localStorage` under `tapin:streak`:

```ts
{
  count: number;
  lastDate: string;
} // lastDate is "YYYY-MM-DD"
```

### `logToday()`

Called from `adjustLoggedMinutes` in `ProjectsProvider` only when:

- `deltaMinutes > 0` (logging, not unlogging)
- `targetDate === today` (logging for today, not a backdated fill)

```ts
function logToday() {
  const today = new Date().toLocaleDateString("en-CA");
  setState((prev) => {
    if (prev.lastDate === today) return prev; // already counted
    const prevWork = getPrevWorkingDay(today);
    return {
      count: prev.lastDate === prevWork ? prev.count + 1 : 1, // chain or reset
      lastDate: today,
    };
  });
}
```

### Streak decay

The displayed streak is computed each render — it is **not** stored:

```ts
const streak = state.lastDate === today || state.lastDate === prevWork ? state.count : 0;
```

If the user skips a working day, `lastDate` will be neither today nor yesterday's working day, so `streak` returns 0. The stored `count` is preserved but invisible until the user logs again, at which point it resets to 1 (since `lastDate !== prevWork`).

### Weekend skipping

```ts
function getPrevWorkingDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() - 1);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() - 1);
  return d.toLocaleDateString("en-CA");
}
```

Monday's previous working day is Friday, not Sunday.

---

## State Architecture

```
localStorage
├── tapin:projects   ← all project logs, titles, targets (ProjectsProvider)
├── tapin:timesheets ← monthly sign-off snapshots (TimesheetProvider)
└── tapin:streak     ← { count, lastDate } (useStreak)

React state (in-memory, resets on refresh)
├── comments         ← per-project comment threads
└── ledger           ← recent log activity (rolling, seeded from ledger.json)
```

### Why comments aren't persisted

Comments are ephemeral — they live only in memory and reset on refresh. This is intentional for the current demo scope; adding persistence would follow the same `localStorage` + `synced` guard pattern.

---

## Auth Flow

`next-auth` v5 with a single `Credentials` provider. No real backend.

```
POST /api/auth/[...nextauth] (credential login)
  → authorize(): compare against env.demoUserEmail / env.demoUserPassword
  → if match: return demoUser object
  → if not: return null → signIn error

JWT callback: copies user.role → token.role
Session callback: copies token.role → session.user.role

Middleware (src/proxy.ts):
  → unauthenticated + not /login → redirect /login?callbackUrl=...
  → authenticated + /login → redirect /
```

To swap in a real backend, replace the `authorize()` function body with an API call. Everything else (session shape, middleware, profile menu) stays the same.

---

## Calendar Colour Logic (`DailyAttendance.tsx`)

Daily totals are computed by summing `logs` across all projects per ISO date. Each date is classified:

| Class         | Condition               |
| ------------- | ----------------------- |
| `exceeded`    | ≥ 552 min (115% of 480) |
| `onTarget`    | ≥ 480 min (8 h)         |
| `underTarget` | any log < 480 min       |
| `noLog`       | date has no entry       |
| `today`       | today, no log yet       |
| `disabled`    | future date             |

`react-day-picker` receives these as `modifiers` and the custom `CheckinDayBtn` component reads them to apply colours inline via `style=`.

---

## Treemap Layout

Binary-split algorithm in `src/components/dashboard/roster/treemap.ts`:

1. **Build phase** (`buildTreeStructure`): creates a balanced binary tree with equal weights — topology is stable regardless of project sizes.
2. **Layout phase** (`layoutTree`): walks the tree and assigns `x, y, w, h` proportionally using live `weightBySlot` values (actual logged or target minutes per period).

This separation means drag-and-drop only swaps slot assignments in the tree (cheap), while the layout recalculates on the next render.

Mobile: container uses `aspect-square sm:aspect-[4/3] md:aspect-auto md:h-[440px]` — scales with viewport width on small screens instead of clipping at a fixed height.
