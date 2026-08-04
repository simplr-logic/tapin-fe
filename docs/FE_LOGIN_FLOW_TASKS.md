# Login & Account-Linking Flow — Frontend Tasks

Source: `Klong_Login_Flow.docx` (v1 draft) vs current state of `tapin-fe`.
Companion doc: `simplr.klong-be/LOGIN_FLOW_TASKS.md` (backend tasks).

## Status Summary

Everything auth-related in `tapin-fe` is currently **mock**: single hardcoded demo
account, password-based NextAuth Credentials provider, no magic link, no email
management, no invite/domain-claim UI, no session list. All of it needs to be
rebuilt against the real `identity`/`employment` gRPC-backed gateway once that
backend work lands.

Files that own the current mock and will change: `src/auth.ts`,
`src/app/login/page.tsx`, `src/app/api/auth/[...nextauth]/route.ts`,
`src/data/demo-user.json`.

---

## Phase 1 — Replace mock auth with real magic-link flow (doc §4, §9.1, §10.1)

1. Swap `Credentials` provider in `src/auth.ts` for a flow that: (a) calls
   `POST /auth/magic-link` with the entered email, (b) shows a "check your inbox"
   state instead of a password field, (c) on click-through, the backend's
   `GET /auth/callback` sets the session cookie and redirects back — NextAuth
   itself no longer owns credential verification, it just needs to read the
   Klong session cookie/token the gateway issues.
2. Rework `src/app/login/page.tsx`: remove password `Input`, remove demo-mode
   banner, add magic-link request form (email only) + "link sent" confirmation
   state. Still gated by `AUTH_SECRET`/env for local dev conventions in
   `src/config/env.ts`.
3. Session shape changes: gateway's `GET /auth/session` returns `personId`,
   `primaryEmail`, `emails[]`, `employments[]`, not the current single
   `demo-user.json` shape — update `src/types/next-auth.d.ts` and every place
   that reads `session.user` (`Header.tsx`, `profile/page.tsx`,
   `(protected)/layout.tsx`).
4. Decide session token transport: doc §10.1 — web gets `HttpOnly` cookie
   (gateway sets it), so NextAuth's JWT strategy either goes away entirely (defer
   to gateway-set cookie) or wraps the opaque `sessionToken` instead of minting
   its own JWT. This is an architecture call, not just a UI change — confirm
   before building.

## Phase 2 — Personal-email nudge banner (doc §5.4)

5. Persistent (non-blocking) banner after Path B account creation/link:
   "Add a personal email so you never lose access…" — shown until a second
   email exists. Add to `(protected)/layout.tsx` so it's visible app-wide, not
   a one-time dismissible toast.
6. Escalation styling as an offboarding date approaches (needs `employments[]`
   end-date data from `GET /me` or `GET /employments` — backend-dependent).

## Phase 3 — Email management UI (doc §6, §9.2/§10.2) — ✅ Done (2026-08-01)

Built as `src/components/profile/EmailsManagement.tsx` on `/profile`, right
below `ProfileHeaderCard`. The actual contract turned out slightly different
from the original plan above (corrected here for the record — verified
directly against `gateway/internal/handlers/emails.go` /
`email_link.go` in `simplr.klong-be`):

- No separate `GET /emails` list endpoint — the email list is just
  `person.emails[]`, already present on `GET /me` (and therefore already in
  `SessionProvider`'s state — no extra fetch needed).
- "Set primary" is `POST /me/emails/:id/primary` (not `PATCH /emails/:id/primary`).
- "Remove" is `DELETE /me/emails/:id` (not `DELETE /emails/:id`) — backend
  rejects removing the primary email itself, so the remove button is simply
  disabled on the primary row rather than needing 409 handling.
- "Add email" (`POST /emails/link/initiate`) needs **no callback page**
  client-side — the gateway embeds the linking token into the magic link's
  own redirect URL, so clicking it lands on `GET /emails/link/callback`
  (proxied same-origin, same as the login callback) and the gateway
  redirects the browser straight back into the app after linking. The FE
  only shows a "check your inbox" state after `initiate` succeeds; there's
  nothing to build for the click-through itself.
- `ProfileHeaderCard` was refactored to read/write `Person` through
  `useKlongSession()` directly instead of local state, so it and
  `EmailsManagement` share one source of truth and stay in sync
  automatically (e.g. the "N emails" badge updates the moment an email is
  added/removed, no prop plumbing between the two components).

## Phase 4 — Company invite acceptance (doc §5.2, §9.3/§10.3)

11. New standalone route, e.g. `src/app/invite/[token]/page.tsx` (outside
    `(protected)`, like `/login`) — landing page for the invite link. Calls
    `GET /invites/:token` to show company name + invited email.
12. Fork UI per doc §5.2:
    - **Case 3a** (already logged in): "You're signed in as [Name] — link this
      work email to your existing account?" confirm dialog →
      `POST /invites/:token/resolve` with `action: link_current_session` (or
      equivalent — confirm exact contract with backend once RPCs are built).
    - **Case 3b** (logged out / cold): "Do you already have a Klong account?"
      Yes → prompt for existing email, verify via magic link, then
      `POST /invites/:token/resolve` with `existingEmail` +
      `supabaseVerificationToken`. No → straight signup, new Person created
      with work email as primary.
13. Domain-claim prompt (doc §4): when a logged-in person's email domain
    matches a verified `CompanyDomain`, show "Link your account to [Company]?"
    — triggered by `POST /domain-claims/propose` (likely checked on login or
    dashboard load), accept via `POST /domain-claims/:id/accept`.

## Phase 5 — Session management UI (doc §9.1/§10.1)

14. "Where you're logged in" screen/section: `GET /me/sessions` → list of
    devices (`deviceLabel`, `lastSeenAt`, `current` flag).
15. Revoke one device → `DELETE /me/sessions/:tokenId`.
16. "Log out everywhere" → `DELETE /me/sessions` (clears cookie client-side
    too).

## Phase 6 — Lower priority / blocked on backend

17. Cross-employer work breakdown view (doc §9.5, `GET /me/work-breakdown`) —
    doc itself marks this out of scope for the current backend pass, so no FE
    work until that endpoint exists.
18. Merge-duplicate-accounts self-serve tool (doc §8) — "not yet committed for
    v1," no FE scoping until product decides.

---

## Notes for whoever picks this up

- All new interactive controls must use shadcn primitives per `CLAUDE.md`
  (`Dialog` for confirms, `DropdownMenu` for row actions, no native
  `<input type="email">` etc.).
- `src/proxy.ts` already gates every route except `/login` and `/api/*` — the
  new `/invite/[token]` route needs an explicit allow alongside `/login`.
- Nothing here can really start until the backend's `identity` magic-link
  surface is confirmed stable and `employment`'s invite/domain-claim RPCs
  exist (see `simplr.klong-be/LOGIN_FLOW_TASKS.md` Phases 1–3) — Phase 1
  above (real magic-link swap) is the only piece identity already supports
  end-to-end today.
