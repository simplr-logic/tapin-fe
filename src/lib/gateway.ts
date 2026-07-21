// Server-only helpers for calling the Klong gateway with the caller's
// forwarded session cookie. Client code should hit the same-origin rewrite
// paths (/auth/*, /me/*, /emails/*) directly via fetch instead.
import { cookies } from "next/headers";
import { cache } from "react";

import { env } from "@/config/env";

import type { MeResponse } from "@/types/session";

// Cached per request — safe to call getMe() from multiple server components
// in the same render without duplicating the network call.
export const getMe = cache(async (): Promise<MeResponse | null> => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  if (!cookieHeader) return null;

  const res = await fetch(`${env.gatewayUrl}/me`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as MeResponse;
});
