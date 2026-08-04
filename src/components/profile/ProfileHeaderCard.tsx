"use client";

import { CalendarClock, Clock, Globe, Mail } from "lucide-react";

import { MediaUploadZone } from "@/components/profile/MediaUploadZone";
import { ProfileDetailsEditor } from "@/components/profile/ProfileDetailsEditor";
import { useKlongSession } from "@/components/providers/SessionProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { displayName, primaryEmail } from "@/types/session";

// `SessionProvider` ((protected)/layout.tsx) already seeds the same Person
// this component would otherwise need as a prop, so it reads/writes
// directly through useKlongSession() instead of keeping its own local copy
// — that also means EmailsManagement.tsx (same person, different card)
// stays in sync automatically, no prop plumbing between them needed.
export function ProfileHeaderCard() {
  const { person, setPerson } = useKlongSession();
  const name = displayName(person);
  const email = primaryEmail(person);
  const initials = getInitials(name);
  const memberSince = new Date(person.created_at).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="bg-card rounded-lg border border-garden-border shadow-elevated overflow-hidden">
      <MediaUploadZone
        kind="banner"
        currentImageUrl={person.banner_url}
        className="h-36"
        onUploaded={setPerson}
      >
        {person.banner_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote, user-uploaded object-storage URL, not a static asset next/image can optimize
          <img src={person.banner_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="relative h-full w-full overflow-hidden bg-linear-to-br from-kale via-kale-accent to-link">
            <div className="absolute -top-16 -right-10 h-56 w-56 rounded-full bg-link/40 blur-3xl" />
            <div className="absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute top-1/2 left-1/4 h-28 w-28 -translate-y-1/2 rounded-full bg-white/15 blur-xl" />
            <div className="absolute -bottom-10 right-6 h-24 w-24 rounded-full bg-kale-accent/50 blur-2xl" />
            <div className="absolute top-4 right-1/3 h-16 w-16 rounded-full bg-white/25 blur-md" />
            {/* Giant circle outlines clipped by the banner's overflow-hidden — only
                the curved slice inside the box shows, reading as flowing wave
                strokes without an svg/graphic element. Sized/positioned so the
                arc actually crosses the visible band, not just grazes a corner. */}
            <div className="absolute -left-10 -top-40 h-80 w-80 rounded-full border-2 border-white/35" />
            <div className="absolute -right-16 -bottom-44 h-72 w-72 rounded-full border-2 border-white/25" />
          </div>
        )}
      </MediaUploadZone>

      <div className="px-6 pb-6">
        <MediaUploadZone
          kind="avatar"
          rounded
          currentImageUrl={person.avatar_url}
          className="-mt-16 w-28 h-28"
          onUploaded={setPerson}
        >
          <Avatar className="h-full w-full border-[3px] border-kale ring-4 ring-card shadow-elevated dark:border-link">
            {person.avatar_url && <AvatarImage src={person.avatar_url} alt="" />}
            <AvatarFallback className="bg-kale text-2xl font-semibold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </MediaUploadZone>

        <div className="mt-4 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-2xl font-bold text-ink tracking-tight truncate">{name}</p>
              {person.handle && <p className="text-sm text-link truncate">@{person.handle}</p>}
            </div>
            <ProfileDetailsEditor person={person} onUpdated={setPerson} />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {email && (
              <span className="inline-flex items-center gap-1.5 text-sm text-ink-muted">
                <Mail className="w-3.5 h-3.5 text-ink-subtle" />
                {email}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-sm text-ink-muted">
              <CalendarClock className="w-3.5 h-3.5 text-ink-subtle" />
              Member since {memberSince}
            </span>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-sm text-ink-muted">
              <Clock className="w-3.5 h-3.5 text-ink-subtle" />
              {person.timezone || "Not set"}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-ink-muted">
              <Globe className="w-3.5 h-3.5 text-ink-subtle" />
              {person.locale || "Not set"}
            </span>
          </div>

          {person.bio && <p className="mt-2 text-sm text-ink-muted">{person.bio}</p>}

          {/* Achievements & levels (gamification_enabled) status is deliberately
              hidden for now — toggle exists in the edit dialog's data plumbing
              but no UI surface uses it yet. Re-enable this line once that's
              actually wired up end-to-end. */}
        </div>
      </div>
    </div>
  );
}
