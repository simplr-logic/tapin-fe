"use client";

import { LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/config/constants";
import { useLogout } from "@/hooks/useLogout";

import { ThemeToggleButton } from "./ThemeToggleButton";

// Mirrors Header.tsx's kale chrome bar, trimmed for pre-/mid-auth pages
// (login, onboarding) that don't get the full app shell: no sidebar toggle,
// no nav, just identity + the controls those pages actually need — theme,
// and (once signed in) a way out.
export function AuthHeader({
  logoHref = "/",
  showLogout = false,
}: {
  logoHref?: string;
  showLogout?: boolean;
}) {
  const { loading, logout } = useLogout();

  return (
    <header className="bg-kale sticky top-0 z-20 border-b border-white/8">
      <div className="px-4 md:px-6 h-12 flex items-center justify-between gap-4">
        <Link
          href={logoHref}
          className="flex items-center gap-2.5 rounded-md px-1.5 py-1 -ml-1.5 hover:bg-white/10 transition-colors"
        >
          <Image src="/logo.svg" alt="Klong" width={32} height={32} className="object-contain" />
          <span className="font-semibold text-white tracking-tight text-sm">{APP_NAME}</span>
        </Link>

        <div className="flex items-center gap-1">
          <ThemeToggleButton className="text-white/70 hover:bg-white/10 hover:text-white/70" />
          {showLogout && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={logout}
              disabled={loading}
              className="h-auto gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white/70"
            >
              <LogOut className="w-3.5 h-3.5" />
              {loading ? "Logging out…" : "Log out"}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
