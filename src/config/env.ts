/**
 * Typed access to environment-driven configuration. Add new server secrets
 * or per-environment values here rather than reading `process.env` inline —
 * keeps them documented in one place and gives local dev a sane fallback.
 */
export const env = {
  gatewayUrl: process.env.GATEWAY_URL ?? "http://localhost:8080",
  /** Canonical public site URL for SEO metadata, sitemap, and JSON-LD. */
  siteUrl: process.env.SITE_URL?.trim(),
} as const;
