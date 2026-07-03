"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, FolderKanban, History } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutGrid },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/timesheets", label: "Timesheets", icon: History },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden sm:flex w-56 shrink-0 flex-col bg-white border-r border-garden-border py-4 px-3 gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors border-l-2",
              isActive
                ? "bg-surface-2 text-ink border-kale"
                : "text-ink-muted border-transparent hover:bg-surface-2/60 hover:text-ink",
            ].join(" ")}
          >
            <Icon className="w-4 h-4" />
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}
