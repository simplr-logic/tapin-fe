"use client";

import { ChevronRight } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function CollapsibleCard({
  title,
  rightContent,
  defaultOpen = true,
  children,
}: {
  title: React.ReactNode;
  rightContent?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Collapsible
      defaultOpen={defaultOpen}
      className="bg-card rounded-lg border border-garden-border shadow-card overflow-hidden"
    >
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-garden-border">
        <CollapsibleTrigger className="group flex min-w-0 flex-1 items-center gap-2 text-ink-muted text-xs font-medium tracking-wide outline-none">
          <ChevronRight className="w-3.5 h-3.5 shrink-0 transition-transform group-data-[panel-open]:rotate-90" />
          {title}
        </CollapsibleTrigger>
        {rightContent}
      </div>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
}
