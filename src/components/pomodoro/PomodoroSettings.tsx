"use client";

import { RotateCcw } from "lucide-react";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

import { configStore } from "./configStore";

import type { PomodoroSettings } from "./configStore";

function NumField({
  label,
  field,
  min,
  max,
  settings,
}: {
  label: string;
  field: keyof PomodoroSettings;
  min: number;
  max: number;
  settings: PomodoroSettings;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Label className="text-sm text-ink-muted flex-1">{label}</Label>
      <Input
        type="number"
        min={min}
        max={max}
        value={settings[field] as number}
        onChange={(e) => {
          const val = Math.min(max, Math.max(min, Number(e.target.value)));
          if (!isNaN(val)) configStore.update({ [field]: val });
        }}
        className="w-20 text-center h-8 text-sm"
      />
    </div>
  );
}

function ToggleField({
  label,
  description,
  field,
  settings,
}: {
  label: string;
  description?: string;
  field: keyof PomodoroSettings;
  settings: PomodoroSettings;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-ink-muted">{label}</p>
        {description && <p className="text-[11px] text-ink-subtle">{description}</p>}
      </div>
      <Switch
        checked={settings[field] as boolean}
        onCheckedChange={(v) => configStore.update({ [field]: v })}
      />
    </div>
  );
}

export function PomodoroSettings({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const settings = useSyncExternalStore(
    configStore.subscribe,
    configStore.getSnapshot,
    configStore.getSnapshot
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Timer Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 pt-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
            Durations (minutes)
          </p>
          <NumField label="Focus" field="workMinutes" min={1} max={120} settings={settings} />
          <NumField
            label="Short break"
            field="shortBreakMinutes"
            min={1}
            max={60}
            settings={settings}
          />
          <NumField
            label="Long break"
            field="longBreakMinutes"
            min={1}
            max={120}
            settings={settings}
          />
          <NumField
            label="Sessions before long break"
            field="sessionsPerLongBreak"
            min={1}
            max={12}
            settings={settings}
          />
        </div>

        <Separator />

        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
            Behavior
          </p>
          <ToggleField
            label="Auto-start next phase"
            description="Immediately starts the next phase when one ends"
            field="autoStart"
            settings={settings}
          />
        </div>

        <Separator />

        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
            Feedback
          </p>
          <ToggleField
            label="Sound on complete"
            description="Plays a beep when a phase ends"
            field="soundOnComplete"
            settings={settings}
          />
          <ToggleField
            label="Tick sound"
            description="Subtle click each second while running"
            field="tickSound"
            settings={settings}
          />
          <ToggleField
            label="Browser notifications"
            description="Push notification when a phase ends"
            field="notifyOnComplete"
            settings={settings}
          />
          <ToggleField
            label="Show in tab title"
            description="Countdown visible in browser tab"
            field="showInTabTitle"
            settings={settings}
          />
        </div>

        <Separator />

        <Button
          variant="outline"
          size="sm"
          onClick={configStore.reset}
          className="w-full gap-2 text-ink-muted"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset to defaults
        </Button>
      </DialogContent>
    </Dialog>
  );
}
