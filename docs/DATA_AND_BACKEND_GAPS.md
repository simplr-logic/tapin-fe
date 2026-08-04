# Data Sources & Backend Gaps

Snapshot as of 2026-07-31. Everything below was verified against the actual
code (grep for `localStorage`, `fetch(`, and `src/data/*.json` imports), not
inferred — see file paths for where to double-check if this goes stale.

Companion doc: `docs/FE_LOGIN_FLOW_TASKS.md` (the auth/login backlog this
doesn't repeat).

---

## 1. What's already real (backend-backed)

For contrast — this is everything currently wired to `simplr.klong-be`,
confirmed by every `fetch()`/`gateway.ts` call in `src/`:

| Endpoint                                                                             | Used from                                                                                                  |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `GET /me`                                                                            | `src/lib/gateway.ts` (`getMe`, server-side, every protected page)                                          |
| `POST /auth/magic-link`                                                              | `login/page.tsx`, `SignUpBar.tsx`                                                                          |
| `POST /me/logout`                                                                    | `useLogout.ts`                                                                                             |
| `POST /me/onboarding/complete`                                                       | `OnboardingIntroFlow.tsx` only (called once — the welcome flow no longer collects/re-sends a display name) |
| `GET /me/sessions`, `DELETE /me/sessions/:id`                                        | `SessionsList.tsx`                                                                                         |
| `POST /me/media/uploads`, `POST /me/media/uploads/confirm`                           | `src/lib/mediaUpload.ts` (avatar/banner upload)                                                            |
| `POST /emails/link/initiate`, `DELETE /me/emails/:id`, `POST /me/emails/:id/primary` | `src/lib/emailManagement.ts` (add/remove/set-primary email, `EmailsManagement.tsx`)                        |
| `POST /me` (partial — `bio` only)                                                    | `src/lib/profileUpdate.ts` (`updateBio`, `BioEditor.tsx`)                                                  |
| `GET /companies`                                                                     | `src/lib/gateway.ts` (`getCompanies`, server-side)                                                         |
| `POST /companies`                                                                    | `CreateCompanyDialog.tsx`, `CompanySetupForm.tsx`                                                          |
| `PATCH /companies/:id/admin/details`                                                 | `CompanyOverviewTab.tsx`                                                                                   |
| `GET/POST/DELETE /companies/:id/admin/employments[/:id]`                             | `CompanyEmploymentsTab.tsx`                                                                                |
| `GET/POST/DELETE /companies/:id/admin/domains`                                       | `CompanyDomainsTab.tsx`                                                                                    |
| `GET/POST/DELETE /companies/:id/admin/admins[/:id]`                                  | `CompanyAdminsTab.tsx`                                                                                     |

Note: `POST /me/onboarding/complete` gets called up to 3x across a single
signup (once for real by `OnboardingIntroFlow`, then redundantly again by
whichever welcome path the user picks) — harmless since the backend treats
it as idempotent, but worth knowing if you're tracing request logs.

---

## 2. localStorage — everything persisted client-side

| Key                                                | Written by                | What it holds                                                                                                                                  | Backend equivalent?                                                                 |
| -------------------------------------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `tapin:projects`                                   | `ProjectsProvider.tsx`    | The **entire project list** (title, company, logs, targets, dates) — the core app data                                                         | ❌ none — see §3                                                                    |
| `tapin:streak-breaks`                              | `ProjectsProvider.tsx`    | Sealed "no-log" dates so retroactive entries can't heal a streak gap                                                                           | ❌ none                                                                             |
| `tapin.timesheets`                                 | `TimesheetProvider.tsx`   | Monthly signed-off timesheet snapshots (submission history)                                                                                    | ❌ none                                                                             |
| `tapin:welcome-pending`                            | `useWelcomeGate.ts`       | Whether the post-signup company/solo choice is still pending (see `CLAUDE.md` "Onboarding & welcome flow")                                     | ❌ intentionally client-only — no backend field for "finished welcome setup" exists |
| `tapin:drag-count`                                 | `achievementEvents.ts`    | Roster grid-swap count, for the "Drag Master" achievement                                                                                      | ❌ none (achievements have no backend at all — §4)                                  |
| `tapin:pomodoro-config`                            | `pomodoro/configStore.ts` | Pomodoro durations/settings                                                                                                                    | ❌ none (arguably fine to stay local-only — personal device setting)                |
| `tapin:palette` / `tapin:font` / `tapin:font-size` | `useAppearance.ts`        | Theme/font/size choice                                                                                                                         | ❌ none — per-device only, see `CLAUDE.md` "Appearance settings"                    |
| `klong-landing-tap-sound`                          | `landing-motion.ts`       | Whether the pre-auth landing-page tap-demo sound is on                                                                                         | N/A — pre-auth marketing page, not app data                                         |
| `tapin.dailylogs`                                  | `src/lib/dailyLogs.ts`    | **Dead code** — `readDailyLogs`/`addDailyMinutes` are defined but never called anywhere. Safe to delete along with `src/data/daily-logs.json`. | —                                                                                   |

## 3. Mock/seed JSON data (`src/data/`)

| File                | Used by                                                                                                         | Status                                                                                                                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `projects.json`     | `ProjectsProvider.tsx` — initial seed, then localStorage takes over                                             | Seed only, real data lives in localStorage after first load                                                                                                                                          |
| `ledger.json`       | `ProjectsProvider.tsx` — initial ledger seed                                                                    | Same — seed only                                                                                                                                                                                     |
| `compliance.json`   | `src/lib/achievements.ts` only (feeds the `on_time_quarter`/`audit_ready`/`compliance_star` achievement checks) | **Fully static** — the 91%/100% numbers never change, there's no real compliance calculation anywhere. No longer rendered directly on the profile page (that UI was replaced by `AchievementsGrid`). |
| `countries.json`    | `CountryCombobox.tsx`, `CompanyDetailsFields.tsx`                                                               | Legitimately static reference data (country/currency/timezone list) — not a gap                                                                                                                      |
| `achievements.json` | `src/lib/achievements.ts` — the achievement catalog                                                             | Static by design (see `docs/ACHIEVEMENTS.md`) — not a gap unless achievements move server-side                                                                                                       |
| `attendance.json`   | **Nothing imports this** — dead file                                                                            | Unused, safe to delete                                                                                                                                                                               |
| `daily-logs.json`   | **Nothing imports this** — dead file (see §2)                                                                   | Unused, safe to delete                                                                                                                                                                               |

## 4. In-memory only (not even localStorage — lost on every refresh)

| State                                | Location                                  | Notes                                                                                                                            |
| ------------------------------------ | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Special days (holiday/leave entries) | `useSpecialDays.ts` — plain `useState`    | The whole Log Off-Day feature resets on page refresh. This is the most surprising gap — it looks persistent in the UI but isn't. |
| Project comments                     | `ProjectsProvider.tsx`'s `comments` state | Also plain `useState`, not localStorage — comments vanish on refresh even though projects/logs survive                           |
| Pomodoro task list                   | `PomodoroTaskList.tsx`                    | Tasks (not settings — settings do persist, see §2) are pure component state                                                      |

---

## 5. Missing backend endpoints (ranked by impact)

1. **Projects + time logs** (`ProjectsProvider`) — the core product. No `GET/POST/PATCH/DELETE /projects`, no log-write endpoint. Everything users actually track lives only in their own browser's localStorage — no cross-device sync, no durability beyond one browser profile, no server-side reporting possible. This is the single biggest gap and almost certainly the next thing worth backing with real endpoints if this app is going anywhere near production.
2. **Timesheet submissions** (`TimesheetProvider`) — no `POST /timesheets/submit`, no history endpoint. Sign-off is currently theater — nothing is actually being certified anywhere durable.
3. **Special days / leave** (`useSpecialDays.ts`) — not even localStorage-backed yet (§4), so this is both a missing-backend gap and a "should at least persist locally first" gap.
4. **Achievements** (`src/lib/achievements.ts`) — fully proposed already in `docs/ACHIEVEMENTS.md` (`GET /achievements`, `GET /me/achievements`, evaluation trigger design). Blocked on #1 above, since most unlock rules read project/log history.
5. **Compliance stats** (`compliance.json`) — no real on-time-submission calculation exists anywhere; the profile page shows permanently static numbers. Depends on #2 existing first.
6. **Appearance preferences** — low priority, but if cross-device sync is ever wanted, would need a `preferences` field (or similar) on `Person`.

## 6. Existing endpoints that need enhancement

1. **Post-login redirect target** — `POST_LOGIN_REDIRECT_PATH` on the gateway is a single fixed configured path, not per-request. `callbackUrl` preservation on redirect-to-login is therefore best-effort only client-side (see `CLAUDE.md` Auth section) — deep-link return (e.g. "log in, then land back on the exact page you tried to visit") isn't wired end-to-end. Needs the gateway's magic-link flow to accept and honor a redirect target per request.
2. **`POST /me/media/uploads`** — recently shipped a real bug (see `identity/internal/media/service.go` / `employment/internal/media/service.go`): the presigned PUT's `Content-Length` signature was bound to the kind's max-size constant instead of the client's declared size, causing every upload to 403. Fixed this session — flagging here so it's verified working end-to-end against a real deployment, not just local MinIO.
3. **Email management** (add/remove/set-primary) and **company-invite acceptance / domain-claim** — already tracked in `docs/FE_LOGIN_FLOW_TASKS.md`, not repeated here.
