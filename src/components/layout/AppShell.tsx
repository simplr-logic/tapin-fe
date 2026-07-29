"use client";

import { useState } from "react";

import Header from "./Header";
import Sidebar from "./Sidebar";

export default function AppShell({
  children,
  ownedCompanies = [],
  isSolo = false,
}: {
  children: React.ReactNode;
  ownedCompanies?: { slug: string; name: string }[];
  isSolo?: boolean;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Header onMenuToggle={() => setSidebarOpen((o) => !o)} />
      <div className="flex flex-1 lg:min-h-0">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          ownedCompanies={ownedCompanies}
          isSolo={isSolo}
        />
        <main className="flex-1 min-w-0 overflow-y-auto bg-canvas">
          <div className="p-2 lg:p-4 max-w-[1500px] mx-auto w-full lg:h-full">{children}</div>
        </main>
      </div>
    </>
  );
}
