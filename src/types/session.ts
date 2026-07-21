// Shapes returned by the Klong gateway's session/profile endpoints.
// Mirrors gateway/internal/handlers/{me,person_json}.go response types.

export interface PersonEmail {
  id: string;
  email: string;
  is_primary: boolean;
  added_via_domain_claim: boolean;
  verified_at: string;
  created_at: string;
}

export interface Person {
  id: string;
  created_at: string;
  updated_at: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  timezone: string | null;
  locale: string | null;
  handle: string | null;
  gamification_enabled: boolean;
  emails: PersonEmail[];
}

export interface MeResponse {
  person: Person;
}

export function primaryEmail(person: Person): string | null {
  return person.emails.find((e) => e.is_primary)?.email ?? person.emails[0]?.email ?? null;
}

export function displayName(person: Person): string {
  return person.display_name ?? primaryEmail(person) ?? "Guest";
}
