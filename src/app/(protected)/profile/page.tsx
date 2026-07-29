import { CalendarClock, IdCard, Mail, Palette, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";

import { ThemeToggleGroup } from "@/components/layout/ThemeToggleGroup";
import { SessionsList } from "@/components/profile/SessionsList";
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

      <div className="max-w-2xl mx-auto space-y-4">
        <div className="bg-card rounded-lg border border-garden-border shadow-elevated overflow-hidden">
          <div className="h-20 bg-linear-to-r from-kale via-kale-accent to-link/70" />
          <div className="px-5 pb-5 flex items-center gap-4">
            <div className="w-20 h-20 -mt-10 rounded-full bg-kale ring-4 ring-white flex items-center justify-center text-white text-xl font-semibold shrink-0 shadow-elevated">
              {initials}
            </div>
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
                <p className="text-[10px] text-ink-subtle uppercase tracking-wide">Email</p>
                <p className="text-xs text-ink truncate">{email ?? "—"}</p>
              </div>
            </div>
            <div className="px-5 py-3.5 flex items-center gap-2.5">
              <IdCard className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-ink-subtle uppercase tracking-wide">Person ID</p>
                <p className="text-xs text-ink font-semibold truncate">{person.id}</p>
              </div>
            </div>
            <div className="px-5 py-3.5 flex items-center gap-2.5">
              <CalendarClock className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-ink-subtle uppercase tracking-wide">Member since</p>
                <p className="text-xs text-ink truncate">
                  {new Date(person.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-garden-border shadow-card p-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Palette className="w-3.5 h-3.5 text-ink-subtle" />
                Appearance
              </p>
              <p className="mt-0.5 text-xs text-ink-subtle">
                Choose how Klong looks on this device.
              </p>
            </div>
            <ThemeToggleGroup />
          </div>
        </div>

        <ProfileStats />
        <SessionsList />
      </div>
    </div>
  );
}
