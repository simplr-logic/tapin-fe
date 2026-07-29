import { redirect } from "next/navigation";

import OnboardingIntroFlow from "@/components/onboarding/OnboardingIntroFlow";
import { getMe } from "@/lib/gateway";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Welcome",
  robots: { index: false, follow: false },
};

export default async function OnboardingPage() {
  const me = await getMe();
  if (!me) {
    redirect("/login");
  }

  return <OnboardingIntroFlow suggestedDisplayName={me.suggested_display_name} />;
}
