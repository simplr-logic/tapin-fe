"use client";

import { FileText, FolderKanban, LayoutDashboard, UserCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/timesheets", label: "Timesheets", icon: FileText },
  { href: "/profile", label: "Profile", icon: UserCircle },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-72 shrink-0 flex-col bg-white border-r border-garden-border">
      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5 pt-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-kale/8 text-kale"
                  : "text-ink-muted hover:bg-surface-2 hover:text-ink",
              ].join(" ")}
            >
              <Icon
                className={["w-4 h-4 shrink-0", isActive ? "text-kale" : "text-ink-subtle"].join(
                  " "
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer label */}
      <div className="px-4 py-3 border-t border-garden-border">
        <p className="text-[10px] text-ink-subtle/60 font-medium tracking-wide uppercase">
          v0.1.0 · Demo
        </p>
      </div>
    </aside>
  );
}
