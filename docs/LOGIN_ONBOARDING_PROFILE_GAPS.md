# Login → Onboarding → Welcome → Profile — Flow Gaps

Snapshot as of 2026-08-01. Verified against the actual code (not inferred) —
see file paths to re-check if this goes stale. Companion docs:
`docs/DATA_AND_BACKEND_GAPS.md` (the broader localStorage/mock-data/missing-endpoint
audit), `docs/FE_LOGIN_FLOW_TASKS.md` (the pre-existing auth backlog against
`Klong_Login_Flow.docx` — invite acceptance, domain-claim, email management).

---

## 0. Missing fields & endpoints — exact

The headline finding: **the backend already has almost everything below.**
This is a "FE never wired it up" gap, not a "backend doesn't have it" gap —
verified directly against `gateway/internal/handlers/person_json.go`
(`personResponse`/`updateMeRequest`) and `gateway/internal/router.go` in
`simplr.klong-be`, not inferred.

### Fields `GET /me` already returns that the FE ignores

| Field                   | Backend has it | FE reads it | FE writes it                                                                                           |
| ----------------------- | :------------: | :---------: | ------------------------------------------------------------------------------------------------------ |
| `bio`                   |       ✅       |     ❌      | ❌                                                                                                     |
| `timezone`              |       ✅       |     ❌      | ❌                                                                                                     |
| `locale`                |       ✅       |     ❌      | ❌                                                                                                     |
| `handle`                |       ✅       |     ❌      | ❌                                                                                                     |
| `gamification_enabled`  |       ✅       |     ❌      | ❌ (exists specifically to let a user opt out of achievements — our achievements code never checks it) |
| `updated_at`            |       ✅       |     ❌      | n/a                                                                                                    |
| `appearance_mode`       |       ✅       |     ❌      | ❌ — FE tracks mode in `localStorage`/`next-themes` only                                               |
| `appearance_theme`      |       ✅       |     ❌      | ❌ — FE tracks theme in `localStorage` only                                                            |
| `appearance_font_scale` |       ✅       |     ❌      | ❌ — FE tracks font in `localStorage` only                                                             |
| `appearance_ui_size`    |       ✅       |     ❌      | ❌ — FE tracks size in `localStorage` only                                                             |

The `appearance_*` group is the biggest surprise: the backend's enum values
(`garden,midnight,slate_amber,sepia,orchid,high_contrast`) map 1:1 onto our
6 `PALETTES` in `src/config/theme.ts`. This was built (both sides,
independently) as a cross-device-synced feature and the FE half of that
sync was never connected — `useAppearance.ts` is `localStorage`-only.

### Endpoints that exist on the backend and are never called from `src/`

| Endpoint                                                                               | Purpose                                                                                                                         | FE status                                                                                                                                                              |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /me`                                                                             | Update `display_name`/`bio`/`timezone`/`locale`/`handle`/`gamification_enabled`/all 4 `appearance_*` fields (`updateMeRequest`) | ✅ Partially called — `bio` only, via `BioEditor.tsx` (2026-08-02). `display_name`/`timezone`/`locale`/`handle`/`gamification_enabled`/`appearance_*` still unwritten. |
| `POST /emails/link/initiate`                                                           | Start add-email flow (sends magic link to the new address)                                                                      | ✅ Called — `EmailsManagement.tsx` (2026-08-01)                                                                                                                        |
| `GET /emails/link/callback`, `POST /emails/link/callback`, `POST /emails/link/confirm` | Add-email magic-link click-through + finalize                                                                                   | N/A client-side — the web flow needs no FE handling here, see below                                                                                                    |
| `DELETE /me/emails/:id`                                                                | Remove an email                                                                                                                 | ✅ Called — `EmailsManagement.tsx` (2026-08-01)                                                                                                                        |
| `POST /me/emails/:id/primary`                                                          | Set primary email                                                                                                               | ✅ Called — `EmailsManagement.tsx` (2026-08-01)                                                                                                                        |
| `POST /companies/:id/admin/invites`, `GET .../invites`, `POST .../invites/:id/resend`  | Company invite create/list/resend                                                                                               | Never called                                                                                                                                                           |
| `GET /invites/callback`, `POST /invites/callback`                                      | Invite-acceptance click-through (recipient side)                                                                                | Never called                                                                                                                                                           |

**Email management is now built** (`src/components/profile/EmailsManagement.tsx`,
`src/lib/emailManagement.ts`) — add/remove/set-primary all wired to the real
endpoints above. One contract detail worth flagging: the web add-email flow
needs **no callback page** — the gateway embeds the linking token into the
magic link's own redirect URL, so clicking it lands on the gateway's
`GET /emails/link/callback` (proxied same-origin) which links the email and
302s the browser straight back into the app. The FE only shows a "check your
inbox" state after `initiate` succeeds. `POST /emails/link/confirm` and the
`POST` variant of the callback exist only for native mobile clients handling
a deep link, not relevant to this web app. `ProfileHeaderCard` was also
refactored to read/write `Person` through `useKlongSession()` directly
(instead of local state seeded from a prop) so it stays in sync with
`EmailsManagement` automatically.

### Actually missing from the backend

Nothing found. Every endpoint this flow needs already exists.

---

## 1. Login (`src/app/login/page.tsx`)

- **No direct "resend link"** — after requesting a magic link, the only
  recovery affordance is "Use a different email," which resets the form and
  requires retyping the address to send again. Minor friction, not a real
  gap, but worth knowing if support ever gets a "I didn't get the email,
  how do I get another" question.

## 2. Onboarding (`src/components/onboarding/OnboardingIntroFlow.tsx`) — real bug

`needs_onboarding` (persistent backend flag) always gates first, before the
welcome flow — see `CLAUDE.md` "Onboarding & welcome flow." `handleTap()`
is what fires on the practice-tap:

```js
await fetch("/me/onboarding/complete", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ display_name: name.trim() || "there" }),
});
// no res.ok check at all

setTimeout(() => router.push(isNewAccount ? "/dashboard?is_new_account=1" : "/dashboard"), 1400);
```

The response is never checked. The success animation plays and the
`router.push` fires unconditionally after 1400ms, regardless of whether the
request actually succeeded.

**Consequence**: if that `POST` fails (network blip, 500, session race,
whatever), `needs_onboarding` stays `true` server-side. `/dashboard/page.tsx`
does a real server-side check on every load (`getMe()`) and — seeing
`needs_onboarding` still `true` — redirects straight back to `/onboarding`.
The user sees the intro screen again with zero explanation, taps again,
and (if the underlying issue persists) loops indefinitely. No error state,
no retry messaging, nothing.

**Fix shape**: check `res.ok` before the `setTimeout`/navigation; on failure,
show an inline error and let them tap again instead of proceeding as if it
worked.

## 3. Welcome (`src/components/welcome/`, embedded in `/dashboard` per `DashboardGate`)

- **Invite path is unbuilt** beyond static "check your email" text
  (`WelcomeChooserFlow.tsx`, `choice === "invite"` branch) — there's no
  actual invite-token acceptance flow (a link like
  `/invite/:token` landing back in-app, validating the token, joining the
  company). This is the pre-existing `docs/FE_LOGIN_FLOW_TASKS.md` backlog
  item, not something new found this pass — flagged here only because it's
  directly in this flow's path.
- **Welcome-pending has no backend signal, by design** (see `CLAUDE.md`) —
  `useWelcomeGate.ts` tracks it purely in `localStorage`
  (`tapin:welcome-pending`), seeded only from the one-time `is_new_account`
  query param. Practical consequence: if someone abandons the flow
  mid-way — closes the tab, clears site data, logs in on a different
  device — they land directly on the real dashboard with no company and
  nothing left to ever re-prompt them. There is no way to re-trigger this
  once the one-time signal is gone, because no backend field records
  "has this person finished welcome setup."

## 4. Profile (`src/app/(protected)/profile/page.tsx`, `ProfileHeaderCard.tsx`)

- **No edit UI for `display_name`, `timezone`, `locale`, or `handle`** —
  nothing in the FE reads or writes any of them past the one-time value
  `OnboardingIntroFlow` captures at signup. `bio` **is** now editable
  (`BioEditor.tsx`, pencil icon next to the bio line on `ProfileHeaderCard`,
  2026-08-02) — avatar, banner, and bio are the only editable profile fields
  today.
- The endpoint for the rest **already exists** — `POST /me` (see §0) accepts
  all five fields plus the 4 `appearance_*` ones in one request; `bio` is
  the only one wired up so far (`src/lib/profileUpdate.ts`, `updateBio()`).
  This isn't a "build a new endpoint" gap, it's a "nothing calls the rest
  of the endpoint that's already there" gap.

Onboarding is otherwise still a one-shot, unrecoverable data-entry moment for
`display_name`/`timezone`/`locale`/`handle` — the fix is just wiring up more
of the same endpoint `updateBio()` already proves out. An edit form on the
profile page (reusing the existing `Input`/`Label` patterns already used
everywhere else, e.g. `CompanySetupForm.tsx`) calling `POST /me` with the
remaining fields would close this — and could pick up the `appearance_*`
sync gap from §0 at the same time, for free, since it's the same request
body.

---

## Summary table

| Step       | Gap                                                                                                                 | Fix needed                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Login      | No direct resend, only "use a different email"                                                                      | Cosmetic                                                       |
| Onboarding | `POST /me/onboarding/complete` failure is silent — can loop forever                                                 | **Real bug** — fix the `res.ok` check                          |
| Welcome    | Invite path has no real accept flow (backend has `/invites/callback` — never called)                                | Wire up existing endpoint                                      |
| Welcome    | No backend "welcome finished" signal — can't recover an abandoned flow                                              | By design, worth reconsidering if this becomes a support issue |
| Profile    | 9 fields (`timezone`/`locale`/`handle`/`gamification_enabled`/4×`appearance_*`/`updated_at`) unread/unwritten by FE | Wire up existing `POST /me` — no new backend work needed       |
| Profile    | ~~Email add/remove/set-primary UI missing~~                                                                         | ✅ Done 2026-08-01 — `EmailsManagement.tsx`                    |
| Profile    | ~~`bio` unread/unwritten by FE~~                                                                                    | ✅ Done 2026-08-02 — `BioEditor.tsx`                           |
