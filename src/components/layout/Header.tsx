"use client";

import { ChevronDown, LogOut, Menu, User, WifiOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { useKlongSession } from "@/components/providers/SessionProvider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { APP_NAME } from "@/config/constants";
import { useLogout } from "@/hooks/useLogout";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { displayName, primaryEmail } from "@/types/session";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export default function Header({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const { person } = useKlongSession();
  const { logout } = useLogout();
  const name = displayName(person);
  const email = primaryEmail(person);
  const isOnline = useOnlineStatus();

  return (
    <header className="bg-kale sticky top-0 z-20 border-b border-white/[0.08]">
      <div className="px-4 md:px-6 h-12 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1">
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-1.5 rounded-md text-white/70 hover:bg-white/10 transition-colors -ml-1"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 shrink-0 rounded-md px-1.5 py-1 hover:bg-white/10 transition-colors"
          >
            <Image src="/logo.svg" alt="Klong" width={36} height={36} className="object-contain" />
            <span className="font-semibold text-white tracking-tight text-sm">{APP_NAME}</span>
          </Link>
        </div>

        {!isOnline && (
          <span className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/15">
            <WifiOff className="w-3 h-3" />
            Offline
          </span>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-white/10 transition-colors outline-none shrink-0 group">
            <Avatar size="sm">
              <AvatarFallback className="bg-white/20 text-white text-[10px] font-bold ring-1 ring-white/25">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:block text-xs font-medium text-white/90">{name}</span>
            <ChevronDown className="hidden sm:block w-3 h-3 text-white/40 transition-transform group-data-[state=open]:rotate-180" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" sideOffset={8} className="w-56 min-w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className="flex items-center gap-2.5 py-0.5">
                  <Avatar size="sm">
                    <AvatarFallback className="bg-kale/10 text-kale text-[10px] font-bold">
                      {getInitials(name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-ink truncate">{name}</span>
                    <span className="text-[10px] text-ink-subtle font-normal truncate">
                      {email ?? "—"}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/profile" />}>
              <User className="w-3.5 h-3.5" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={logout}>
              <LogOut className="w-3.5 h-3.5" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
