import { ShieldCheck, Mail, IdCard, CalendarClock, LogOut } from "lucide-react";

import { auth, signOut } from "@/auth";
import { ProfileStats } from "@/components/projects/ProfileStats";
import demoUser from "@/data/demo-user.json";

export default async function ProfilePage() {
  const session = await auth();
  const user = session?.user;
  const initials = (user?.name ?? "G")
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
              <p className="text-base font-semibold text-ink truncate">{user?.name ?? "Guest"}</p>
              <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-link/10 text-link border border-link/25">
                {user?.role ?? "—"}
              </span>
            </div>
          </div>

          <div className="border-t border-garden-border divide-y divide-garden-border">
            <div className="px-5 py-3 flex items-center gap-3">
              <Mail className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
              <span className="text-xs text-ink-muted w-24 shrink-0">Email</span>
              <span className="text-xs text-ink">{user?.email ?? "—"}</span>
            </div>
            <div className="px-5 py-3 flex items-center gap-3">
              <IdCard className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
              <span className="text-xs text-ink-muted w-24 shrink-0">Employee ID</span>
              <span className="text-xs text-ink font-semibold">{demoUser.id}</span>
            </div>
            <div className="px-5 py-3 flex items-center gap-3">
              <CalendarClock className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
              <span className="text-xs text-ink-muted w-24 shrink-0">Member since</span>
              <span className="text-xs text-ink">{demoUser.memberSince}</span>
            </div>
          </div>
        </div>

        <ProfileStats />

        <div className="bg-white rounded-lg border border-garden-border shadow-card p-5 space-y-3">
          <div>
            <p className="text-xs font-semibold text-ink">Session</p>
            <p className="text-[11px] text-ink-subtle mt-0.5">
              Mock profile — backed by NextAuth&apos;s demo credentials provider, no real API yet.
            </p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="h-9 px-4 flex items-center justify-center gap-2 rounded-md bg-white border border-error/40 hover:bg-error/8 text-error text-xs font-semibold uppercase tracking-wide transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Log out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
