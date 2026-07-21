# Klong

Time tracker and attendance ledger. Log hours against projects, track weekly allocations, and submit monthly timesheets.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript 5**
- **Tailwind CSS 4** + **shadcn/ui** (base-ui) — Zendesk Garden design system
- **NextAuth v5** — mock credential auth (single demo account, no backend)
- **@dnd-kit/core** — drag-and-drop roster grid
- Node 26, npm

## Getting started

```bash
cp .env.example .env.local
# Generate AUTH_SECRET:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

npm install
npm run dev        # http://localhost:3000
```

Demo login: `demo@tapin.app` / `demo1234`

## Commands

```bash
npm run dev          # dev server
npm run build        # production build
npm run lint         # ESLint
npm run format       # Prettier
```

## Features

- **Dashboard** — daily attendance, weekly roster (grid + progress views), activity log
- **Projects** — create/edit projects with monthly hour targets and date ranges
- **Roster** — treemap tile layout; tap to log hours; drag to reorder; adjust/unlog hours
- **Pomodoro** — focus timer with configurable durations, session tracking, task list, and auto-worklog on session complete
- **Timesheets** — monthly sign-off with locked historical view
- **Worklog** — per-project notes log, separate from hour adjustments

## Data

All state is client-side only (React context + localStorage). No API or database. To wire a real backend, replace `authorize()` in `src/auth.ts` and the provider implementations in `src/components/providers/`.
