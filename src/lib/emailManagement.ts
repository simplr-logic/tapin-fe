import type { Person } from "@/types/session";

export class EmailManagementError extends Error {}

interface ApiErrorBody {
  error?: { code?: string; message?: string };
}

async function errorMessage(res: Response, fallback: string): Promise<string> {
  const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
  return body?.error?.message ?? fallback;
}

// POST /emails/link/initiate — sends a Supabase magic link to the new
// address. The web add-email flow needs nothing further client-side: the
// gateway embeds the returned linking_token into the email's redirect URL
// itself, so clicking the link lands back on GET /emails/link/callback
// (same-origin via the /emails/:path* rewrite, same pattern as auth login)
// which links the email and 302s the browser straight back into the app —
// no callback page or token handling needed here, unlike the mobile-only
// POST /emails/link/callback variant.
export async function initiateEmailLink(email: string): Promise<void> {
  const res = await fetch("/emails/link/initiate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    throw new EmailManagementError(await errorMessage(res, "Couldn't send the link. Try again."));
  }
}

export async function unlinkEmail(id: string): Promise<Person> {
  const res = await fetch(`/me/emails/${id}`, { method: "DELETE" });
  if (!res.ok) {
    throw new EmailManagementError(await errorMessage(res, "Couldn't remove that email."));
  }
  const body = (await res.json()) as { person: Person };
  return body.person;
}

export async function setPrimaryEmail(id: string): Promise<Person> {
  const res = await fetch(`/me/emails/${id}/primary`, { method: "POST" });
  if (!res.ok) {
    throw new EmailManagementError(await errorMessage(res, "Couldn't set that as primary."));
  }
  const body = (await res.json()) as { person: Person };
  return body.person;
}
