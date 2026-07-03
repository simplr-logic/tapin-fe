/**
 * Typed access to environment-driven configuration. Add new server secrets
 * or per-environment values here rather than reading `process.env` inline —
 * keeps them documented in one place and gives local dev a sane fallback.
 *
 * Server-only (no `NEXT_PUBLIC_` prefix) — these are read in `src/auth.ts`,
 * which only runs server-side. Override via `.env.local`.
 */
export const env = {
  demoUserEmail: process.env.DEMO_USER_EMAIL ?? "demo@tapin.app",
  demoUserPassword: process.env.DEMO_USER_PASSWORD ?? "demo1234",
} as const;
