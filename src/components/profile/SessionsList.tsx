"use client";

import { LogOut, Monitor, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { CollapsibleCard } from "@/components/profile/CollapsibleCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { SessionInfo } from "@/types/session";

function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function parseDevice(ua?: string): { label: string; mobile: boolean } {
  if (!ua) return { label: "Unknown device", mobile: false };

  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /Chrome\//.test(ua)
      ? "Chrome"
      : /Firefox\//.test(ua)
        ? "Firefox"
        : /Safari\//.test(ua)
          ? "Safari"
          : null;
  const os = /Windows/.test(ua)
    ? "Windows"
    : /Mac OS X/.test(ua)
      ? "macOS"
      : /Android/.test(ua)
        ? "Android"
        : /iPhone|iPad/.test(ua)
          ? "iOS"
          : /Linux/.test(ua)
            ? "Linux"
            : null;
  const mobile = /Mobile|Android|iPhone/.test(ua);

  if (!browser && !os) return { label: ua, mobile };
  return { label: [browser, os].filter(Boolean).join(" on "), mobile };
}

export function SessionsList() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [pendingRevoke, setPendingRevoke] = useState<SessionInfo | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/me/sessions")
      .then((res) => (res.ok ? res.json() : { sessions: [] }))
      .then((body: { sessions: SessionInfo[] }) => {
        if (!cancelled) setSessions(body.sessions);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleRevoke(session: SessionInfo) {
    setPendingRevoke(null);
    setRevokingId(session.id);
    const res = await fetch(`/me/sessions/${session.id}`, { method: "DELETE" });
    if (!res.ok) {
      setRevokingId(null);
      return;
    }
    if (session.is_current) {
      router.push("/login");
      router.refresh();
      return;
    }
    setRevokingId(null);
    setSessions((prev) => prev.filter((s) => s.id !== session.id));
  }

  return (
    <CollapsibleCard
      title={
        <>
          <Monitor className="w-3.5 h-3.5" />
          Active sessions
        </>
      }
    >
      {loading ? (
        <div className="px-5 py-10 text-center text-xs text-ink-subtle">Loading…</div>
      ) : sessions.length === 0 ? (
        <div className="px-5 py-10 text-center text-xs text-ink-subtle">No active sessions.</div>
      ) : (
        <div className="divide-y divide-garden-border">
          {sessions.map((s) => {
            const device = parseDevice(s.device_label);
            const DeviceIcon = device.mobile ? Smartphone : Monitor;
            return (
              <div key={s.id} className="px-5 py-3.5 flex items-center gap-4">
                <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0 bg-surface-2 border border-garden-border">
                  <DeviceIcon className="w-4 h-4 text-ink-muted" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-ink truncate">{device.label}</p>
                    {s.is_current && (
                      <span className="text-[9px] font-semibold tracking-wide text-success bg-success/8 border border-success/25 rounded-full px-1.5 py-0.5 shrink-0">
                        This device
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-ink-muted truncate">
                    {s.last_seen_ip ?? s.login_ip ?? "Unknown IP"} · last active{" "}
                    {formatRelative(s.last_seen_at)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setPendingRevoke(s)}
                  disabled={revokingId === s.id}
                  title="Log out this device"
                  className="text-error bg-card hover:bg-error/8 hover:border-error/30 shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <Dialog
        open={pendingRevoke !== null}
        onOpenChange={(open) => !open && setPendingRevoke(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log out this device?</DialogTitle>
            <DialogDescription>
              {pendingRevoke?.is_current
                ? "You'll be signed out here immediately and need to log in again."
                : `This will end the session on ${pendingRevoke ? parseDevice(pendingRevoke.device_label).label : "that device"}.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPendingRevoke(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => pendingRevoke && handleRevoke(pendingRevoke)}
              className="bg-error hover:bg-error/90 text-white"
            >
              Log out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CollapsibleCard>
  );
}
