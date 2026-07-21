# Klong

Time tracker and attendance ledger. Log hours against projects, track weekly
allocations, and submit monthly timesheets.

Auth is backed by the real Klong gateway ([`simplr.klong-be`](https://github.com/simplr-logic/simplr.klong-be))
— Supabase magic-link login, no passwords, no NextAuth.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript 5**
- **Tailwind CSS 4** + **shadcn/ui** (base-ui) — Zendesk Garden design system
- **Klong gateway session cookie** — magic-link auth via `simplr.klong-be`
- **@dnd-kit/core** — drag-and-drop roster grid
- Node, npm

## Getting started

Requires a running [`simplr.klong-be`](https://github.com/simplr-logic/simplr.klong-be)
gateway — see that repo's README for prerequisites (Go, Supabase CLI, Redis).

```bash
cp deploy/.env.example deploy/.env
# GATEWAY_URL defaults to http://localhost:8080 — point it at your running gateway

npm install
npm run dev        # http://localhost:3000
```

`npm run dev` / `npm run start` load environment variables from `deploy/.env`
(via `dotenv-cli`) — not the Next.js default `.env.local` at the project root.

Sign in via `/login` with any email — the gateway emails a one-time magic
link (check Mailpit at `http://127.0.0.1:54324` in local dev).

## Commands

```bash
npm run dev              # dev server (loads deploy/.env)
npm run build             # production build
npm run start             # serve production build (loads deploy/.env)
npm run lint               # ESLint
npm run format             # Prettier --write
npm run format:check       # Prettier --check
```

Pre-commit hook (Husky + lint-staged) runs ESLint --fix and Prettier on
staged files automatically.

## Features

- **Dashboard** — daily attendance, weekly roster (grid + progress views), activity log
- **Projects** — create/edit projects with monthly hour targets and date ranges
- **Roster** — treemap tile layout; tap to log hours; drag to reorder; adjust/unlog hours
- **Pomodoro** — focus timer with configurable durations, session tracking, task list, and auto-worklog on session complete
- **Timesheets** — monthly sign-off with locked historical view
- **Worklog** — per-project notes log, separate from hour adjustments

## Data

Project/timesheet data is client-side only (React context + `localStorage`)
— there is no backend for it yet. Auth is the exception: sessions are real,
backed by the Klong gateway.

## Docs

- [`CLAUDE.md`](CLAUDE.md) — full architecture, conventions, and auth-flow reference
- [`docs/`](docs/README.md) — library/logic reference and backlog docs
- [`deploy/`](deploy/README.md) — local environment config
