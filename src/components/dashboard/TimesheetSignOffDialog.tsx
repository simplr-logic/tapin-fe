"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { ScrollText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function SignOffForm({
  totalHours,
  onOpenChange,
  onVerify,
}: {
  totalHours: number;
  onOpenChange: (open: boolean) => void;
  onVerify: (signature: string) => void;
}) {
  const { data: session } = useSession();
  const expectedName = session?.user?.name?.trim() ?? "";
  const [signature, setSignature] = useState("");
  const [touched, setTouched] = useState(false);

  const trimmed = signature.trim();
  const matches = expectedName === "" || trimmed.toLowerCase() === expectedName.toLowerCase();
  const canVerify = trimmed.length > 0 && matches;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!canVerify) return;
    onVerify(trimmed);
    onOpenChange(false);
  }

  return (
    <>
      <DialogHeader>
        <span className="text-[10px] font-semibold text-link uppercase tracking-wide">
          Ledger Self-Certification
        </span>
        <DialogTitle>Timesheet Sign-Off</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-ink-muted leading-relaxed">
          By providing my electronic signature below, I hereby certify that the hours registered
          this week accurately represent my attendance and project work allocations.
        </p>

        <div className="rounded-md bg-surface-2 border border-garden-border px-3.5 py-2.5 flex items-center gap-2.5">
          <ScrollText className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
          <span className="text-xs text-ink-muted">Total Certified:</span>
          <span className="text-sm font-semibold text-ink">{totalHours.toFixed(1)} hours</span>
        </div>

        <div>
          <Label className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide mb-1">
            Please type full name as signature
          </Label>
          <Input
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder={expectedName ? `e.g. ${expectedName}` : "e.g. Jamie Rivera"}
            autoFocus
          />
          {touched && trimmed.length > 0 && !matches && (
            <p className="flex items-center gap-1.5 text-[10px] text-error mt-1.5">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              Signature must match your account name ({expectedName}).
            </p>
          )}
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
          <Button type="submit" disabled={!canVerify} className="flex-1 h-9 text-xs font-semibold">
            Verify Now
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
          <SignOffForm totalHours={totalHours} onOpenChange={onOpenChange} onVerify={onVerify} />
        )}
      </DialogContent>
    </Dialog>
  );
}
