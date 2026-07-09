"use client";

import { IdCard, LogOut, Timer, User, WifiOff } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

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
import demoUser from "@/data/demo-user.json";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export default function Header() {
  const { data: session } = useSession();
  const user = session?.user;
  const name = user?.name ?? "Guest";
  const isOnline = useOnlineStatus();

  return (
    <header className="bg-kale sticky top-0 z-20">
      <div className="px-6 h-12 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-3 shrink-0 rounded-md -ml-1 px-1 py-1 hover:bg-white/10 transition-colors"
        >
          <div className="w-7 h-7 rounded-md bg-white/10 flex items-center justify-center">
            <Timer className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-white tracking-tight text-sm">{APP_NAME}</span>
        </Link>

        {!isOnline && (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/15 text-white/80 border border-white/20">
            <WifiOff className="w-3 h-3" />
            Offline — changes saved locally
          </span>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md pl-1 pr-2 py-1 hover:bg-white/10 transition-colors outline-none shrink-0">
            <Avatar size="sm">
              <AvatarFallback className="bg-white/15 text-white text-[10px] font-semibold">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:block text-xs font-medium text-white">{name}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8} className="w-56 min-w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-ink">{name}</span>
                  <span className="text-[10px] text-ink-subtle font-normal">
                    {user?.email ?? "—"}
                  </span>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <div className="flex items-center gap-1.5 px-1.5 py-1 text-sm whitespace-nowrap">
              <IdCard className="w-3.5 h-3.5 text-ink-muted shrink-0" />
              <span className="text-ink-muted">Emp ID</span>
              <span className="ml-auto font-semibold text-ink">{demoUser.id}</span>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/profile" />}>
              <User className="w-3.5 h-3.5" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="w-3.5 h-3.5" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
