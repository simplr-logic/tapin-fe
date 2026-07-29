import { redirect } from "next/navigation";

import WelcomeCompanyFlow from "@/components/welcome/WelcomeCompanyFlow";
import { getMe } from "@/lib/gateway";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Set up your company",
  robots: { index: false, follow: false },
};

export default async function WelcomeCompanyPage() {
  const me = await getMe();
  if (!me) {
    redirect("/login");
  }

  return <WelcomeCompanyFlow suggestedDisplayName={me.suggested_display_name} />;
}
