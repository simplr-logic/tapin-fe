import type { NextConfig } from "next";

// Server-only — proxy target for the Klong gateway. Same-origin rewrites
// (not client-side cross-origin fetches) so the gateway's HttpOnly session
// cookie lands on this app's own domain, exactly like it will in production
// through a reverse proxy in front of both apps.
const GATEWAY_URL = process.env.GATEWAY_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/auth/:path*", destination: `${GATEWAY_URL}/auth/:path*` },
      { source: "/me/:path*", destination: `${GATEWAY_URL}/me/:path*` },
      { source: "/emails/:path*", destination: `${GATEWAY_URL}/emails/:path*` },
      // /companies proxying is handled in src/proxy.ts (middleware) instead —
      // it collides with real app pages (/companies, /companies/[slug]) in a
      // way a declarative afterFiles rewrite can't resolve consistently.
    ];
  },
};

export default nextConfig;
