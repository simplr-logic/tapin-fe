import { type NextRequest, NextResponse } from "next/server";

import { env } from "@/config/env";

// Klong session cookie name — must match gateway's SESSION_COOKIE_NAME
// (defaults to "klong_session"; see simplr.klong-be/deploy/.env).
const SESSION_COOKIE_NAME = "klong_session";

// Fast, network-free redirect gate: cookie presence only. The gateway is the
// source of truth for validity — a stale/expired cookie still gets past here
// and is caught by getMe() in (protected)/layout.tsx, which redirects to
// /login itself.
function isPublicPath(pathname: string): boolean {
  // /: marketing landing page, pre-session.
  // /login: the request form itself.
  // /auth/*: magic-link request + Supabase PKCE callback, both pre-session.
  // /emails/link/callback: Supabase PKCE callback for linking a second email —
  // reached from an already-authenticated browser but must not bounce through
  // the login redirect if the cookie is momentarily stale mid-flow.
  return (
    pathname === "/" ||
    pathname === "/login" ||
    pathname.startsWith("/auth/") ||
    pathname === "/emails/link/callback"
  );
}

export default function proxy(req: NextRequest) {
  const isLoggedIn = Boolean(req.cookies.get(SESSION_COOKIE_NAME)?.value);
  const pathname = req.nextUrl.pathname;

  // /companies and /companies/{slug} are also app pages (list + detail).
  // Next's rewrite precedence is: beforeFiles -> static filesystem routes ->
  // afterFiles rewrites -> dynamic filesystem routes. A *static* route (bare
  // /companies) wins over an afterFiles config rewrite, but a *dynamic* one
  // ([slug]) does not — so a next.config.ts rewrite for "/companies/:path*"
  // would hijack GET /companies/{slug} before the page ever runs, and a
  // filesystem match would swallow POST /companies before it reaches the
  // gateway. Handling all of it here, in middleware (which always wins),
  // sidesteps that inconsistency entirely — see next.config.ts, which no
  // longer rewrites /companies at all.
  const companiesMatch = pathname.match(/^\/companies(?:\/([^/]+)(\/.*)?)?$/);
  if (companiesMatch) {
    const [, , rest] = companiesMatch;
    // No `rest` means this is the bare "/companies" or "/companies/{slug}"
    // page route — only proxy non-GET (create/mutate) requests to it.
    if (rest || req.method !== "GET") {
      const target = new URL(pathname + req.nextUrl.search, env.gatewayUrl);
      return NextResponse.rewrite(target);
    }
  }

  if (!isLoggedIn && !isPublicPath(pathname)) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  // Excludes API routes, Next internals, and any request for a static file in
  // /public (logo.svg, favicon.ico, ...) — those must never bounce through
  // the login redirect.
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
