"use client";

import { Check, Palette } from "lucide-react";

import { ThemeToggleGroup } from "@/components/layout/ThemeToggleGroup";
import { Button } from "@/components/ui/button";
import { FONT_FAMILIES, FONT_SIZES, PALETTES } from "@/config/theme";
import { useAppearance } from "@/hooks/useAppearance";
import { cn } from "@/lib/utils";

export function AppearanceSettings() {
  const { palette, setPalette, fontFamily, setFontFamily, fontSize, setFontSize } = useAppearance();

  return (
    <div className="bg-card rounded-lg border border-garden-border shadow-card p-5 space-y-5">
      <div>
        <p className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Palette className="w-3.5 h-3.5 text-ink-subtle" />
          Appearance
        </p>
        <p className="mt-0.5 text-xs text-ink-subtle">Choose how Klong looks on this device.</p>
      </div>

      <div>
        <p className="text-[10px] font-semibold text-ink-subtle tracking-wide mb-1.5">Mode</p>
        <ThemeToggleGroup />
      </div>

      <div>
        <p className="text-[10px] font-semibold text-ink-subtle tracking-wide mb-1.5">Theme</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {PALETTES.map((p) => {
            const active = palette === p.id;
            return (
              <Button
                key={p.id}
                type="button"
                variant="ghost"
                onClick={() => setPalette(p.id)}
                title={p.description}
                aria-pressed={active}
                className={cn(
                  "h-auto flex-col gap-1.5 rounded-md border px-2 py-2",
                  active
                    ? "border-link bg-link/5 ring-1 ring-link/30 hover:bg-link/5"
                    : "border-garden-border hover:bg-surface-2"
                )}
              >
                <span
                  className="relative flex h-7 w-7 items-center justify-center rounded-full border border-garden-border-strong overflow-hidden shrink-0"
                  style={{ backgroundColor: p.swatch.canvas }}
                >
                  <span
                    className="absolute inset-0 opacity-90"
                    style={{
                      background: `linear-gradient(135deg, ${p.swatch.chrome} 50%, ${p.swatch.link} 50%)`,
                    }}
                  />
                  {active && <Check className="relative w-3.5 h-3.5 text-white drop-shadow" />}
                </span>
                <span className="flex min-h-6 items-center text-[9px] font-medium text-ink-muted text-center leading-tight whitespace-normal">
                  {p.label}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] font-semibold text-ink-subtle tracking-wide mb-1.5">Font</p>
          <div className="flex items-center rounded-md border border-garden-border bg-surface-2 p-0.5">
            {FONT_FAMILIES.map((f) => {
              const active = fontFamily === f.id;
              return (
                <Button
                  key={f.id}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFontFamily(f.id)}
                  title={f.label}
                  aria-pressed={active}
                  style={{ fontFamily: f.stack }}
                  className={cn(
                    "h-auto flex-1 rounded-md px-2.5 py-1 text-xs font-medium",
                    active
                      ? "bg-card shadow-card text-ink border border-garden-border hover:bg-card"
                      : "text-ink-subtle hover:text-ink-muted"
                  )}
                >
                  Aa
                </Button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-semibold text-ink-subtle tracking-wide mb-1.5">Size</p>
          <div className="flex items-center rounded-md border border-garden-border bg-surface-2 p-0.5">
            {FONT_SIZES.map((s) => {
              const active = fontSize === s.id;
              return (
                <Button
                  key={s.id}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFontSize(s.id)}
                  aria-pressed={active}
                  className={cn(
                    "h-auto flex-1 rounded-md px-2.5 py-1 text-xs font-medium",
                    active
                      ? "bg-card shadow-card text-ink border border-garden-border hover:bg-card"
                      : "text-ink-subtle hover:text-ink-muted"
                  )}
                >
                  {s.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
