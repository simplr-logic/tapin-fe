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

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={onClose} />}
      <aside
        className={[
          "flex flex-col bg-white border-r border-garden-border w-64",
          "fixed top-0 bottom-0 left-0 z-40 transition-transform duration-200 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:static lg:translate-x-0 lg:shrink-0",
        ].join(" ")}
      >
        <nav className="flex-1 p-2 space-y-0.5 pt-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
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
        <div className="px-4 py-3 border-t border-garden-border">
          <p className="text-[10px] text-ink-subtle/60 font-medium tracking-wide uppercase">
            v0.1.0 · Demo
          </p>
        </div>
      </aside>
    </>
  );
}
