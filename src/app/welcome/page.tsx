import { redirect } from "next/navigation";

import WelcomeChooserFlow from "@/components/welcome/WelcomeChooserFlow";
import { getMe } from "@/lib/gateway";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get started",
  robots: { index: false, follow: false },
};

export default async function WelcomePage() {
  const me = await getMe();
  if (!me) {
    redirect("/login");
  }

  return <WelcomeChooserFlow suggestedDisplayName={me.suggested_display_name} />;
}
