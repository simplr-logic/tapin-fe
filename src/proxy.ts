import { type NextRequest, NextResponse } from "next/server";

// Klong session cookie name — must match gateway's SESSION_COOKIE_NAME
// (defaults to "klong_session"; see simplr.klong-be/deploy/.env).
const SESSION_COOKIE_NAME = "klong_session";

// Fast, network-free redirect gate: cookie presence only. The gateway is the
// source of truth for validity — a stale/expired cookie still gets past here
// and is caught by getMe() in (protected)/layout.tsx, which redirects to
// /login itself.
function isPublicPath(pathname: string): boolean {
  // /login: the request form itself.
  // /auth/*: magic-link request + Supabase PKCE callback, both pre-session.
  // /emails/link/callback: Supabase PKCE callback for linking a second email —
  // reached from an already-authenticated browser but must not bounce through
  // the login redirect if the cookie is momentarily stale mid-flow.
  return (
    pathname === "/login" || pathname.startsWith("/auth/") || pathname === "/emails/link/callback"
  );
}

export default function proxy(req: NextRequest) {
  const isLoggedIn = Boolean(req.cookies.get(SESSION_COOKIE_NAME)?.value);
  const pathname = req.nextUrl.pathname;

  if (!isLoggedIn && !isPublicPath(pathname)) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && pathname === "/login") {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
