"use client";

import { ScrollText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function SignOffForm({
  totalHours,
  onOpenChange,
  onSubmit,
}: {
  totalHours: number;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit();
    onOpenChange(false);
  }

  return (
    <>
      <DialogHeader>
        <span className="text-[10px] font-semibold text-link uppercase tracking-wide">
          Timesheet Submission
        </span>
        <DialogTitle>Submit Timesheet</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-ink-muted leading-relaxed">
          Confirm that the hours registered this month accurately represent your attendance and
          project work allocations.
        </p>

        <div className="rounded-md bg-surface-2 border border-garden-border px-3.5 py-2.5 flex items-center gap-2.5">
          <ScrollText className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
          <span className="text-xs text-ink-muted">Total Hours:</span>
          <span className="text-sm font-semibold text-ink">{totalHours.toFixed(1)} hours</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-9 text-xs font-semibold"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1 h-9 text-xs font-semibold">
            Confirm &amp; Submit
          </Button>
        </div>
      </form>
    </>
  );
}

export function TimesheetSignOffDialog({
  open,
  onOpenChange,
  totalHours,
  onVerify,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalHours: number;
  onVerify: (signature: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open && (
          <SignOffForm
            totalHours={totalHours}
            onOpenChange={onOpenChange}
            onSubmit={() => onVerify("")}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
