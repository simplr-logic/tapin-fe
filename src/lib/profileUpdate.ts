import type { Person } from "@/types/session";

export class ProfileUpdateError extends Error {}

interface ApiErrorBody {
  error?: { code?: string; message?: string };
}

async function errorMessage(res: Response, fallback: string): Promise<string> {
  const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
  return body?.error?.message ?? fallback;
}

// Mirrors the identity-facing subset of the gateway's updateMeRequest
// (person_json.go) — appearance_* fields are deliberately excluded here,
// they're a separate localStorage-synced concern (see useAppearance.ts).
export interface UpdateMeFields {
  display_name?: string;
  bio?: string;
  timezone?: string;
  locale?: string;
  handle?: string;
  gamification_enabled?: boolean;
}

// POST /me — partial update, only send the fields being changed (all of
// updateMeRequest's fields are pointer/optional server-side).
export async function updateMe(fields: UpdateMeFields): Promise<Person> {
  const res = await fetch("/me", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  });
  if (!res.ok) {
    throw new ProfileUpdateError(await errorMessage(res, "Couldn't save your profile. Try again."));
  }
  const body = (await res.json()) as { person: Person };
  return body.person;
}

export async function updateBio(bio: string): Promise<Person> {
  return updateMe({ bio });
}
