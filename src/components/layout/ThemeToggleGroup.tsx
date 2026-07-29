"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

// Labeled Light/Dark/System control — a more discoverable, screen-reader
// and keyboard friendly complement to the quick icon-only toggle in the
// header. Same segmented-control look as the period picker in
// DailyAttendance.tsx.
export function ThemeToggleGroup({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <div
      role="group"
      aria-label="Theme"
      className={cn(
        "inline-flex items-center rounded-md border border-garden-border bg-surface-2 p-0.5",
        className
      )}
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = mounted && theme === value;
        return (
          <Button
            key={value}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setTheme(value)}
            aria-pressed={active}
            className={cn(
              "h-auto flex-1 justify-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium",
              active
                ? "bg-card shadow-card text-ink border border-garden-border hover:bg-card"
                : "text-ink-subtle hover:text-ink-muted"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </Button>
        );
      })}
    </div>
  );
}
