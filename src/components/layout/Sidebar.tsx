"use client";

import {
  Building2,
  ChevronDown,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Lock,
  Timer,
  UserCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWelcomePending } from "@/hooks/useWelcomeGate";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/timesheets", label: "Timesheets", icon: FileText },
  { href: "/pomodoro", label: "Pomodoro", icon: Timer },
  { href: "/profile", label: "Profile", icon: UserCircle },
];

// Reachable while welcome setup is still pending — everything else is
// visually disabled here (see AppShell.tsx for the matching route-level
// redirect guard, since a disabled nav item alone doesn't stop a direct
// URL visit).
const UNGATED_HREFS = new Set(["/dashboard", "/profile"]);

export default function Sidebar({
  open,
  onClose,
  ownedCompanies = [],
}: {
  open: boolean;
  onClose: () => void;
  ownedCompanies?: { slug: string; name: string }[];
}) {
  const pathname = usePathname();
  const welcomePending = useWelcomePending();
  const activeCompany = ownedCompanies.find((c) => {
    const href = `/companies/${c.slug}`;
    return pathname === href || pathname.startsWith(`${href}/`);
  });
  const companyMenuActive = Boolean(activeCompany);
  const companyMenuLabel =
    activeCompany?.name ??
    (ownedCompanies.length === 1 ? ownedCompanies[0].name : "Your companies");

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={onClose} />}
      <aside
        className={[
          "flex flex-col bg-card border-r border-garden-border w-64",
          "fixed top-0 bottom-0 left-0 z-40 transition-transform duration-200 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:static lg:translate-x-0 lg:shrink-0",
        ].join(" ")}
      >
        <nav className="flex-1 p-2 space-y-0.5 pt-3">
          {ownedCompanies.length > 0 && !welcomePending && (
            <div className="pb-2 mb-2 border-b border-garden-border">
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={[
                    "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors outline-none",
                    companyMenuActive
                      ? "bg-primary/8 text-primary"
                      : "text-ink-muted hover:bg-surface-2 hover:text-ink",
                  ].join(" ")}
                >
                  <Building2
                    className={[
                      "w-4 h-4 shrink-0",
                      companyMenuActive ? "text-primary" : "text-ink-subtle",
                    ].join(" ")}
                  />
                  <span className="truncate flex-1 text-left">{companyMenuLabel}</span>
                  <ChevronDown className="w-3.5 h-3.5 shrink-0 text-ink-subtle transition-transform group-data-[state=open]:rotate-180" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" sideOffset={4} className="w-56 min-w-56">
                  <DropdownMenuGroup>
                    {ownedCompanies.length > 1 && (
                      <DropdownMenuLabel>Your companies</DropdownMenuLabel>
                    )}
                    {ownedCompanies.map((c) => (
                      <DropdownMenuItem
                        key={c.slug}
                        onClick={onClose}
                        render={<Link href={`/companies/${c.slug}`} />}
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span className="truncate">{c.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            const disabled = welcomePending && !UNGATED_HREFS.has(item.href);

            if (disabled) {
              return (
                <div
                  key={item.href}
                  title="Finish setup first"
                  aria-disabled="true"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-subtle/50 cursor-not-allowed"
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                  <Lock className="w-3 h-3 shrink-0 ml-auto" />
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={[
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/8 text-primary"
                    : "text-ink-muted hover:bg-surface-2 hover:text-ink",
                ].join(" ")}
              >
                <Icon
                  className={[
                    "w-4 h-4 shrink-0",
                    isActive ? "text-primary" : "text-ink-subtle",
                  ].join(" ")}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-3 border-t border-garden-border">
          <p className="text-[10px] text-ink-subtle/60 font-medium tracking-wide">v0.1.0 · Demo</p>
        </div>
      </aside>
    </>
  );
}
