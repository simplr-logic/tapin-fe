import { redirect } from "next/navigation";

import DashboardShell from "@/components/dashboard/DashboardShell";
import { getMe } from "@/lib/gateway";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // is_new_account is only ever present as a one-time query param on the
  // post-login redirect (gateway's RedirectAfterLoginWithOnboarding /
  // RedirectAfterInviteAccept) — it's not part of /me, since it's only
  // meaningful at the moment of that specific login. A truly new signup
  // gets the full invite/company/solo chooser at /welcome.
  const params = await searchParams;
  const isNewAccount = params.is_new_account === "1" || params.is_new_account === "true";
  if (isNewAccount) {
    redirect("/welcome");
  }

  // needs_onboarding, by contrast, is a persistent DB flag — also true for
  // a pre-provisioned/invited person's first real login (their person row
  // already existed, so is_new_account is false above). They already told
  // us their answer by using an invite link, so re-showing the full
  // chooser would be wrong — they just need the short name-confirm +
  // practice-tap flow at /onboarding instead.
  const me = await getMe();
  if (me?.needs_onboarding) {
    redirect("/onboarding");
  }

  return <DashboardShell />;
}
