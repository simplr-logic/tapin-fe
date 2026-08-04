"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useWelcomePending } from "@/hooks/useWelcomeGate";

import Header from "./Header";
import Sidebar from "./Sidebar";

const UNGATED_PATHS = new Set(["/dashboard", "/profile"]);

export default function AppShell({
  children,
  ownedCompanies = [],
}: {
  children: React.ReactNode;
  ownedCompanies?: { slug: string; name: string }[];
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const welcomePending = useWelcomePending();
  const pathname = usePathname();
  const router = useRouter();

  // Nav-item disabling in Sidebar is cosmetic — this is the actual gate,
  // catching direct URL visits to a page that shouldn't be reachable until
  // welcome/company setup is done (src/hooks/useWelcomeGate.ts).
  useEffect(() => {
    if (welcomePending && !UNGATED_PATHS.has(pathname)) {
      router.replace("/dashboard");
    }
  }, [welcomePending, pathname, router]);

  return (
    <>
      <Header onMenuToggle={() => setSidebarOpen((o) => !o)} />
      <div className="flex flex-1 lg:min-h-0">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          ownedCompanies={ownedCompanies}
        />
        <main className="flex-1 min-w-0 overflow-y-auto bg-canvas">
          {pathname === "/pomodoro" ? (
            // Pomodoro's ambient theme background needs to fill this whole
            // region edge-to-edge — the padded/max-width wrapper every other
            // page gets would box it in, so it opts out here instead of
            // faking full-bleed with `position: fixed` + z-index games.
            children
          ) : (
            <div className="p-2 lg:p-4 max-w-[1500px] mx-auto w-full lg:h-full">{children}</div>
          )}
        </main>
      </div>
    </>
  );
}
