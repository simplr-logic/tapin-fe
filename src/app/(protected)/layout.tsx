import { redirect } from "next/navigation";

import AppShell from "@/components/layout/AppShell";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { getCompanies, getMe } from "@/lib/gateway";
import { isCompanyAdmin } from "@/types/company";

import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const me = await getMe();
  if (!me) {
    redirect("/login");
  }

  const companies = await getCompanies();
  const ownedCompanies = companies
    .filter((pc) => isCompanyAdmin(pc) && pc.admin_roles.includes("owner"))
    .map((pc) => ({ slug: pc.company.slug, name: pc.company.name }));
  const isSolo = companies.length === 0;

  return (
    <SessionProvider person={me.person}>
      <div className="flex flex-col min-h-dvh lg:h-screen lg:overflow-hidden">
        <AppShell ownedCompanies={ownedCompanies} isSolo={isSolo}>
          {children}
        </AppShell>
      </div>
    </SessionProvider>
  );
}
