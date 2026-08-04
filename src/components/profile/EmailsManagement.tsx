"use client";

import { AlertTriangle, Mail, Plus, Star, Trash2 } from "lucide-react";
import { useState } from "react";

import { CollapsibleCard } from "@/components/profile/CollapsibleCard";
import { useKlongSession } from "@/components/providers/SessionProvider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  EmailManagementError,
  initiateEmailLink,
  setPrimaryEmail,
  unlinkEmail,
} from "@/lib/emailManagement";

import type { PersonEmail } from "@/types/session";

export function EmailsManagement() {
  const { person, setPerson } = useKlongSession();
  const [adding, setAdding] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingRemove, setPendingRemove] = useState<PersonEmail | null>(null);

  function resetAddForm() {
    setAdding(false);
    setNewEmail("");
    setSentTo(null);
    setAddError(null);
  }

  async function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAddError(null);
    setAddLoading(true);
    try {
      await initiateEmailLink(newEmail.trim());
      setSentTo(newEmail.trim());
    } catch (err) {
      setAddError(err instanceof EmailManagementError ? err.message : "Something went wrong.");
    } finally {
      setAddLoading(false);
    }
  }

  async function handleSetPrimary(id: string) {
    setBusyId(id);
    try {
      setPerson(await setPrimaryEmail(id));
    } catch {
      // Errored — leave the list as-is, nothing to roll back client-side.
    } finally {
      setBusyId(null);
    }
  }

  async function handleRemove(target: PersonEmail) {
    setPendingRemove(null);
    setBusyId(target.id);
    try {
      setPerson(await unlinkEmail(target.id));
    } catch {
      // Errored — leave the list as-is.
    } finally {
      setBusyId(null);
    }
  }

  return (
    <CollapsibleCard
      title={
        <>
          <Mail className="w-3.5 h-3.5" />
          Emails
        </>
      }
      rightContent={
        !adding && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAdding(true)}
            className="h-auto gap-1 px-2.5 py-1 text-[11px] font-medium"
          >
            <Plus className="w-3 h-3" />
            Add email
          </Button>
        )
      }
    >
      <div className="divide-y divide-garden-border">
        {person.emails.map((e) => (
          <div key={e.id} className="px-5 py-3.5 flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-ink truncate">{e.email}</p>
                {e.is_primary && (
                  <span className="flex items-center gap-1 text-[9px] font-semibold tracking-wide text-success bg-success/8 border border-success/25 rounded-full px-1.5 py-0.5 shrink-0">
                    <Star className="w-2.5 h-2.5" />
                    Primary
                  </span>
                )}
              </div>
              <p className="text-[11px] text-ink-muted truncate">
                Added {new Date(e.created_at).toLocaleDateString("en-US")}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {!e.is_primary && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSetPrimary(e.id)}
                  disabled={busyId === e.id}
                  className="h-auto px-2.5 py-1 text-[11px] font-medium text-ink-muted hover:text-ink"
                >
                  Set primary
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setPendingRemove(e)}
                disabled={e.is_primary || busyId === e.id}
                title={e.is_primary ? "Primary email can't be removed" : "Remove email"}
                className="text-error bg-card hover:bg-error/8 hover:border-error/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {adding && (
        <div className="px-5 py-4 border-t border-garden-border">
          {sentTo ? (
            <div className="text-center space-y-2">
              <p className="text-xs text-ink-muted">
                Check <span className="font-medium text-ink">{sentTo}</span> for a verification
                link.
              </p>
              <Button
                type="button"
                variant="link"
                onClick={resetAddForm}
                className="h-auto p-0 text-[11px] text-link hover:text-link-hover font-medium"
              >
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleAddSubmit} className="space-y-2.5">
              {addError && (
                <div className="flex items-start gap-2 rounded-md bg-error/8 border border-error/25 px-3 py-2.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-error mt-0.5 shrink-0" />
                  <p className="text-xs text-error">{addError}</p>
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  type="email"
                  required
                  autoFocus
                  value={newEmail}
                  onChange={(ev) => setNewEmail(ev.target.value)}
                  placeholder="you@company.com"
                  className="flex-1"
                />
                <Button type="submit" disabled={addLoading} size="sm" className="h-9 px-3">
                  {addLoading ? "Sending…" : "Send link"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetAddForm}
                  disabled={addLoading}
                  className="h-9 px-3"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      <Dialog
        open={pendingRemove !== null}
        onOpenChange={(open) => !open && setPendingRemove(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove this email?</DialogTitle>
            <DialogDescription>
              {pendingRemove?.email} will no longer be linked to your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPendingRemove(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => pendingRemove && handleRemove(pendingRemove)}
              className="bg-error hover:bg-error/90 text-white"
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CollapsibleCard>
  );
}
