import { redirect } from "next/navigation";

import OnboardingIntroFlow from "@/components/onboarding/OnboardingIntroFlow";
import { getMe } from "@/lib/gateway";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Welcome",
  robots: { index: false, follow: false },
};

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const me = await getMe();
  if (!me) {
    redirect("/login");
  }

  const params = await searchParams;
  const isNewAccount = params.is_new_account === "1" || params.is_new_account === "true";

  return (
    <OnboardingIntroFlow
      suggestedDisplayName={me.suggested_display_name}
      isNewAccount={isNewAccount}
    />
  );
}
