import { Building2, ChevronDown } from "lucide-react";
import Image from "next/image";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { APP_NAME } from "@/config/constants";

const MOCK_NAV_ITEMS = ["Dashboard", "Projects", "Timesheets"];

// Mirrors Header.tsx's kale chrome bar and Sidebar.tsx's owned-company
// dropdown trigger — a live look at where the company name actually shows
// up in the app, updating as the user types (same idea as Slack's
// workspace-name preview during setup).
export function CompanyNamePreview({ name }: { name: string }) {
  const displayName = name.trim() || "Your company";

  return (
    <div className="rounded-lg border border-garden-border overflow-hidden shadow-card">
      <div className="bg-kale flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-1.5">
          <Image src="/logo.svg" alt="" width={16} height={16} className="object-contain" />
          <span className="text-[11px] font-semibold text-white tracking-tight">{APP_NAME}</span>
        </div>
        <Avatar size="sm">
          <AvatarFallback className="bg-white/20 text-white text-[8px] font-bold ring-1 ring-white/25">
            ?
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="bg-card p-2 space-y-1">
        <div className="flex items-center gap-2 rounded-md bg-primary/8 px-2 py-1.5">
          <Building2 className="w-3 h-3 text-primary shrink-0" />
          <span className="text-[11px] font-medium text-primary truncate">{displayName}</span>
          <ChevronDown className="w-2.5 h-2.5 text-ink-subtle ml-auto shrink-0" />
        </div>
        {MOCK_NAV_ITEMS.map((label) => (
          <div key={label} className="flex items-center gap-2 px-2 py-1">
            <div className="w-3 h-3 rounded-sm bg-surface-3 shrink-0" />
            <span className="text-[10px] text-ink-subtle">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
