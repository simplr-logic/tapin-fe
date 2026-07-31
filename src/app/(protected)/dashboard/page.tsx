import { redirect } from "next/navigation";

import { DashboardGate } from "@/components/dashboard/DashboardGate";
import { getMe } from "@/lib/gateway";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // is_new_account is only ever present as a one-time query param on the
  // post-login redirect (gateway's RedirectAfterLoginWithOnboarding /
  // RedirectAfterInviteAccept) — it's not part of /me, since it's only
  // meaningful at the moment of that specific login. It's propagated
  // through /onboarding (see onboarding/page.tsx) back to this same query
  // param so it survives the redirect below, and DashboardGate uses it to
  // seed the client-side "welcome pending" gate (src/hooks/useWelcomeGate.ts)
  // — there's no persistent backend flag for "finished welcome" the way
  // there is for onboarding, so this is the only signal we get.
  const params = await searchParams;
  const isNewAccount = params.is_new_account === "1" || params.is_new_account === "true";

  // needs_onboarding is a persistent DB flag — also true for a
  // pre-provisioned/invited person's first real login. Onboarding always
  // runs before the welcome/company chooser, regardless of is_new_account.
  const me = await getMe();
  if (me?.needs_onboarding) {
    redirect(`/onboarding${isNewAccount ? "?is_new_account=1" : ""}`);
  }

  return (
    <DashboardGate
      isNewAccount={isNewAccount}
      hasOnboarded={!me?.needs_onboarding}
      suggestedDisplayName={me?.suggested_display_name}
    />
  );
}
