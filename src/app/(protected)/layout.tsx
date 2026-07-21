import { redirect } from "next/navigation";

import AppShell from "@/components/layout/AppShell";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { getMe } from "@/lib/gateway";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const me = await getMe();
  if (!me) {
    redirect("/login");
  }

  return (
    <SessionProvider person={me.person}>
      <div className="flex flex-col min-h-dvh lg:h-screen lg:overflow-hidden">
        <AppShell>{children}</AppShell>
      </div>
    </SessionProvider>
  );
}
