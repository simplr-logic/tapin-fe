"use client";

import { CalendarClock, IdCard, Mail } from "lucide-react";
import { useState } from "react";

import { MediaUploadZone } from "@/components/profile/MediaUploadZone";
import { useKlongSession } from "@/components/providers/SessionProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { displayName, primaryEmail } from "@/types/session";

import type { Person } from "@/types/session";

// Seeded from the server-fetched Person (see profile/page.tsx), but avatar/
// banner uploads happen client-side against the real gateway
// (/me/media/uploads[/confirm] — see src/lib/mediaUpload.ts), so this needs
// its own state to reflect the new image immediately. setPerson also syncs
// SessionProvider so Header.tsx's avatar updates without a full reload.
export function ProfileHeaderCard({ person: initialPerson }: { person: Person }) {
  const [person, setPersonLocal] = useState(initialPerson);
  const { setPerson: setSessionPerson } = useKlongSession();
  const name = displayName(person);
  const email = primaryEmail(person);
  const initials = getInitials(name);

  function handleUploaded(updated: Person) {
    setPersonLocal(updated);
    setSessionPerson(updated);
  }

  return (
    <div className="bg-card rounded-lg border border-garden-border shadow-elevated overflow-hidden">
      <MediaUploadZone kind="banner" className="h-20" onUploaded={handleUploaded}>
        {person.banner_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote, user-uploaded object-storage URL, not a static asset next/image can optimize
          <img src={person.banner_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-linear-to-r from-kale via-kale-accent to-link/70" />
        )}
      </MediaUploadZone>

      <div className="px-5 pb-5 flex items-center gap-4">
        <MediaUploadZone
          kind="avatar"
          rounded
          className="-mt-10 w-20 h-20 shrink-0"
          onUploaded={handleUploaded}
        >
          <Avatar className="h-full w-full ring-4 ring-white shadow-elevated">
            {person.avatar_url && <AvatarImage src={person.avatar_url} alt="" />}
            <AvatarFallback className="bg-kale text-xl font-semibold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </MediaUploadZone>
        <div className="min-w-0">
          <p className="text-base font-semibold text-ink truncate">{name}</p>
          <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-link/10 text-link border border-link/25">
            {person.emails.length} email{person.emails.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="border-t border-garden-border grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-garden-border">
        <div className="px-5 py-3.5 flex items-center gap-2.5">
          <Mail className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] text-ink-subtle tracking-wide">Email</p>
            <p className="text-xs text-ink truncate">{email ?? "—"}</p>
          </div>
        </div>
        <div className="px-5 py-3.5 flex items-center gap-2.5">
          <IdCard className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] text-ink-subtle tracking-wide">Person ID</p>
            <p className="text-xs text-ink font-semibold truncate">{person.id}</p>
          </div>
        </div>
        <div className="px-5 py-3.5 flex items-center gap-2.5">
          <CalendarClock className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] text-ink-subtle tracking-wide">Member since</p>
            <p className="text-xs text-ink truncate">
              {new Date(person.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
