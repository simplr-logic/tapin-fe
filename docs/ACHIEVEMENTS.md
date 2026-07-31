# Achievements / Badges — Spec

Status: **proposal, not built**. Companion split same as `FE_LOGIN_FLOW_TASKS.md` —
backend section is a request against `simplr.klong-be` (or a new
`achievements` service), frontend section is what `tapin-fe` needs once that
exists.

Today all project/timesheet data is client-side only (`ProjectsProvider`
in-memory, `TimesheetProvider` in `localStorage` — see `CLAUDE.md`
"State management"). Achievements need durable, cross-device, server-computed
state, so this is the first feature in the app (besides auth) that needs a
real backend resource.

---

## 1. Backend Requirements

### 1.1 Why server-side, not client-computed

Achievement unlock conditions read across history (streaks, cumulative
hours, on-time submission rate). Computing that client-side from
`localStorage` breaks the moment a user opens a second device, clears
storage, or the org wants leaderboards ("Top Contributor"). Needs a source
of truth tied to `personId`, same as `identity` owns email/session state.

### 1.2 Data model

```
Achievement (static catalog, seeded/config-driven, not user data)
  id            string   e.g. "streak_7_day"
  key           string   stable slug, used by FE to look up icon/copy
  title         string
  description   string
  tier          enum     bronze | silver | gold (optional, omit if not tiered)
  category      enum     streak | volume | project | compliance | social | meta

PersonAchievement (unlock record)
  personId      string   FK -> identity person
  achievementId string
  unlockedAt    timestamp
  progress      jsonb    optional — current/target for in-progress display, e.g. {"current": 4, "target": 7}
```

Catalog (`Achievement`) can live as static config (JSON/YAML in the gateway
repo) rather than a DB table — it doesn't change per-tenant. Only
`PersonAchievement` needs a table.

### 1.3 Endpoints (gateway, same rewrite-proxy pattern as `/auth`, `/me`)

| Method                                                          | Path                                                                                           | Purpose |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------- |
| `GET /achievements`                                             | Full catalog (all definitions, id/title/description/tier/category) — cacheable, rarely changes |
| `GET /me/achievements`                                          | This person's unlocked achievements + in-progress ones with `progress`                         |
| `POST /me/achievements/evaluate` _(internal or cron-triggered)_ | Re-run unlock rules against current data, insert new `PersonAchievement` rows                  |

No client-writable "unlock" endpoint — unlocks are server-decided only
(never trust client to say "I earned this," same principle as
`CLAUDE.md` §5 "never trust client-side user IDs").

### 1.4 Evaluation triggers

Two viable approaches, pick one:

- **Event-driven**: whatever service owns timesheet/log writes (currently
  none — this data isn't in a backend yet) fires evaluation after each
  write. Requires the project/timesheet data to move server-side first —
  bigger dependency.
- **Scheduled sweep**: nightly job scans recent activity, evaluates rules,
  inserts new unlocks. Works even while project/timesheet data stays
  client-only, IF client periodically syncs logs to backend for evaluation
  purposes (a new sync endpoint, separate concern from full data migration).

Given `ProjectsProvider`/`TimesheetProvider` are still client-only today,
**this feature has a hard prerequisite**: at minimum a write path for logged
hours needs to reach the backend before achievements can be computed
server-side. Flag this dependency before scoping a build.

### 1.5 Rule examples (maps to brainstormed badges)

| key               | rule                                               |
| ----------------- | -------------------------------------------------- |
| `first_tap`       | first ledger entry ever written                    |
| `streak_7_day`    | logged time on 7 consecutive calendar days         |
| `century_club`    | 100 cumulative ledger entries                      |
| `on_time_quarter` | 0 late timesheet submissions in a rolling 3 months |
| `project_closer`  | project marked complete on/before `endDate`        |

---

## 2. Frontend Mapping

### 2.1 New files

| File                                          | Purpose                                                                                                                                                                                                      |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/types/achievements.ts`                   | `Achievement`, `PersonAchievement`, `AchievementProgress` types (mirror gateway JSON, same convention as `src/types/session.ts`)                                                                             |
| `src/lib/gateway.ts`                          | add `getAchievements()`, `getMyAchievements()` — `react cache()`-deduped, same pattern as `getMe()`                                                                                                          |
| `src/components/profile/AchievementsGrid.tsx` | badge grid, client or server component depending on whether unlock state needs client interactivity (tooltip on hover = client)                                                                              |
| `src/components/profile/AchievementBadge.tsx` | single badge tile: icon, title, locked/unlocked state, progress ring if in-progress                                                                                                                          |
| `src/components/profile/AchievementToast.tsx` | client component — fires a toast/celebration when a **new** unlock is detected (compare `GET /me/achievements` response against last-seen ids in `localStorage`, Discord-style "Achievement Unlocked" popup) |

### 2.2 Where it renders

- `(protected)/profile/page.tsx` — add `<AchievementsGrid />` below existing
  `<ProfileStats />` (`src/app/(protected)/profile/page.tsx:89`). Fetch
  `getMyAchievements()` server-side in the page like `getMe()` already is,
  pass down as props — don't add a client fetch/useEffect for this (project
  convention: fetch in Server Components).
- Optional: small badge-count chip near the profile header avatar
  (`profile/page.tsx:36-44`, next to the existing "N emails" pill) — e.g.
  "12 badges" linking down to the grid.
- Optional: `Header.tsx` — tiny trophy icon + unread-unlock dot, same shelf
  as session/user menu, if we want unlocks visible outside `/profile`.

### 2.3 Visual spec (Garden system — no new colors)

- Badge tile: `rounded-lg` card, `border-garden-border`, `shadow-card` —
  same primitives as existing `ProfileStats` tiles
  (`src/components/projects/ProfileStats.tsx:29`).
- **Locked** state: icon rendered at reduced opacity (`opacity-40`),
  grayscale filter, `bg-surface-2`. No functional color (red/green) — locked
  isn't an error state, it's neutral, per Garden rule "functional colors are
  the only place red/orange/green appear."
- **Unlocked** state: full-color icon, `bg-card`, subtle `ring-1
ring-kale/20` — kale is chrome-only per design system, so keep this
  restrained (thin ring, not a fill).
- **Tier** (if used): differentiate bronze/silver/gold by icon backing
  shape/border weight, not by inventing gold/silver/bronze hex colors —
  stick to the existing neutral + kale palette (e.g. tier shown as 1/2/3
  small dots under the badge, not a colored background).
- Progress-in-flight badges (e.g. streak at 4/7 days): thin radial progress
  ring in `text-link`, consistent with how `RosterActionBar` shows hour
  progress today.
- Grid: `grid-cols-3 sm:grid-cols-4 md:grid-cols-6` responsive, matches
  `ProfileStats`'s `grid-cols-3` sibling pattern.
- Unlock celebration toast: small card sliding in from a corner, kale
  accent bar + badge icon + title, auto-dismiss ~4s — reuse whatever toast
  primitive exists, or add `sonner`/similar if none does yet (check
  `src/components/ui/` first per shadcn-mandatory rule before hand-rolling).

### 2.4 Component/prop sketch

```ts
// src/types/achievements.ts
export type AchievementCategory =
  "streak" | "volume" | "project" | "compliance" | "social" | "meta";
export type AchievementTier = "bronze" | "silver" | "gold";

export interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  category: AchievementCategory;
  tier?: AchievementTier;
  iconKey: string; // maps to a graphic — see §3
}

export interface PersonAchievement {
  achievementId: string;
  unlockedAt: string | null; // null = not yet unlocked
  progress?: { current: number; target: number };
}
```

`AchievementsGrid` takes `catalog: Achievement[]` + `unlocked:
PersonAchievement[]`, joins by `achievementId`, renders locked vs unlocked
tiles.

---

## 3. Graphics — what to source

Recommend one square icon/illustration per achievement `key`, not per tier
(reuse the same art at 3 tint levels for bronze/silver/gold — don't source
3x the art).

**Format**: SVG preferred (crisp at badge size, recolorable if we ever want
a locked-state desaturation via CSS `filter: grayscale()` instead of a
separate gray asset). PNG with transparency acceptable fallback.

**Size**: source at 256×256 or larger, square, centered subject, transparent
background — will be displayed at ~40–48px in the grid, so needs to hold up
small.

**Style**: flat/line-art icon, NOT photographic — must sit on a plain card
next to Lucide icons already used everywhere else in this app
(`ProfileStats`, `profile/page.tsx` use `lucide-react` throughout). If you
can find a matching icon set (flaticon/lucide-adjacent style) that's more
consistent than mixed illustration styles. Single or two-tone line art
reads better against the Garden palette than full-color mascot art.

**List, mapped to §1.5 rule keys**:

| iconKey                | suggested subject                               |
| ---------------------- | ----------------------------------------------- |
| `first_tap`            | a single tap/fingerprint or checkmark-in-circle |
| `streak_7_day`         | flame                                           |
| `streak_perfect_month` | calendar with checkmarks                        |
| `early_bird`           | sunrise / bird                                  |
| `night_owl`            | crescent moon / owl                             |
| `century_club`         | "100" badge / medal                             |
| `1000_hours`           | mountain peak or hourglass                      |
| `overachiever`         | upward chart arrow                              |
| `project_starter`      | seedling / plus-folder                          |
| `juggler`              | stacked folders                                 |
| `project_closer`       | padlock / checkered flag                        |
| `on_time_quarter`      | shield with check                               |
| `audit_ready`          | clipboard with check                            |
| `compliance_star`      | star                                            |
| `team_player`          | two people / handshake                          |
| `top_contributor`      | trophy                                          |
| `drag_master`          | grip/drag-handle icon                           |
| `onboarded`            | door / welcome mat                              |

Don't source colored gold/silver/bronze medal variants — tier is expressed
in UI via ring/dot per §2.3, not via differently-colored source art.
