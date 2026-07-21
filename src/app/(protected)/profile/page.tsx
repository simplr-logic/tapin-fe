import { CalendarClock, IdCard, Mail, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";

import { LogoutForm } from "@/components/profile/LogoutForm";
import { ProfileStats } from "@/components/projects/ProfileStats";
import { getMe } from "@/lib/gateway";
import { displayName, primaryEmail } from "@/types/session";

export default async function ProfilePage() {
  const me = await getMe();
  if (!me) {
    redirect("/login");
  }
  const person = me.person;
  const name = displayName(person);
  const email = primaryEmail(person);
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-ink-muted text-xs font-medium tracking-wide uppercase">
        <ShieldCheck className="w-3.5 h-3.5" />
        Profile
      </div>

      <div className="max-w-2xl space-y-4">
        <div className="bg-white rounded-lg border border-garden-border shadow-card overflow-hidden">
          <div className="p-5 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-kale flex items-center justify-center text-white text-lg font-semibold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold text-ink truncate">{name}</p>
              <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-link/10 text-link border border-link/25">
                {person.emails.length} email{person.emails.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          <div className="border-t border-garden-border divide-y divide-garden-border">
            <div className="px-5 py-3 flex items-center gap-3">
              <Mail className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
              <span className="text-xs text-ink-muted w-24 shrink-0">Email</span>
              <span className="text-xs text-ink">{email ?? "—"}</span>
            </div>
            <div className="px-5 py-3 flex items-center gap-3">
              <IdCard className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
              <span className="text-xs text-ink-muted w-24 shrink-0">Person ID</span>
              <span className="text-xs text-ink font-semibold">{person.id}</span>
            </div>
            <div className="px-5 py-3 flex items-center gap-3">
              <CalendarClock className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
              <span className="text-xs text-ink-muted w-24 shrink-0">Member since</span>
              <span className="text-xs text-ink">
                {new Date(person.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <ProfileStats />

        <div className="bg-white rounded-lg border border-garden-border shadow-card p-5 space-y-3">
          <div>
            <p className="text-xs font-semibold text-ink">Session</p>
            <p className="text-[11px] text-ink-subtle mt-0.5">
              Signed in via magic link — backed by the Klong gateway/identity service.
            </p>
          </div>
          <LogoutForm />
        </div>
      </div>
    </div>
  );
}
