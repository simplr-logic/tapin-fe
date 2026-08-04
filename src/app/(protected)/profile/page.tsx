import { ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";

import { AchievementsGrid } from "@/components/profile/AchievementsGrid";
import { AppearanceSettings } from "@/components/profile/AppearanceSettings";
import { EmailsManagement } from "@/components/profile/EmailsManagement";
import { ProfileHeaderCard } from "@/components/profile/ProfileHeaderCard";
import { SessionsList } from "@/components/profile/SessionsList";
import { getMe } from "@/lib/gateway";

export default async function ProfilePage() {
  const me = await getMe();
  if (!me) {
    redirect("/login");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-ink-muted text-xs font-medium tracking-wide">
        <ShieldCheck className="w-3.5 h-3.5" />
        Profile
      </div>

      <div className="max-w-2xl mx-auto space-y-4 pb-6">
        <ProfileHeaderCard />
        <EmailsManagement />

        <AppearanceSettings />

        <AchievementsGrid hasOnboarded={!me.needs_onboarding} />
        <SessionsList />
      </div>
    </div>
  );
}
