"use client";

import { LogOut } from "lucide-react";

import { useLogout } from "@/hooks/useLogout";

export function LogoutForm() {
  const { loading, logout } = useLogout();
  return (
    <button
      type="button"
      disabled={loading}
      onClick={logout}
      className="h-9 px-4 flex items-center justify-center gap-2 rounded-md bg-white border border-error/40 hover:bg-error/8 text-error text-xs font-semibold uppercase tracking-wide transition-colors disabled:opacity-60"
    >
      <LogOut className="w-3.5 h-3.5" />
      {loading ? "Logging out…" : "Log out"}
    </button>
  );
}
