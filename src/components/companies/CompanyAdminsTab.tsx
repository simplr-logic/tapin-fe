"use client";

import { ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

import type { CompanyAdmin } from "@/types/company";

export function CompanyAdminsTab({ companyId }: { companyId: string }) {
  const [admins, setAdmins] = useState<CompanyAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/companies/${companyId}/admin/admins`)
      .then((res) => (res.ok ? res.json() : { admins: [] }))
      .then((body: { admins: CompanyAdmin[] }) => {
        if (!cancelled) setAdmins(body.admins);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  async function handleRevoke(personId: string) {
    if (!window.confirm("Revoke all admin roles for this person?")) return;
    setRevokingId(personId);
    const res = await fetch(`/companies/${companyId}/admin/admins/${personId}`, {
      method: "DELETE",
    });
    setRevokingId(null);
    if (!res.ok) return;
    setAdmins((prev) => prev.filter((a) => a.person_id !== personId));
  }

  return (
    <div className="bg-card rounded-lg border border-garden-border shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-garden-border flex items-center gap-2 text-ink-muted text-xs font-medium tracking-wide uppercase">
        <ShieldCheck className="w-3.5 h-3.5" />
        Admins
      </div>

      {loading ? (
        <div className="px-5 py-10 text-center text-xs text-ink-subtle">Loading…</div>
      ) : admins.length === 0 ? (
        <div className="px-5 py-10 text-center text-xs text-ink-subtle">No admins yet.</div>
      ) : (
        <div className="divide-y divide-garden-border">
          {admins.map((a) => (
            <div key={a.person_id} className="px-5 py-3.5 flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink truncate">{a.person_id}</p>
                <p className="text-[11px] text-ink-muted truncate">{a.roles.join(", ")}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleRevoke(a.person_id)}
                disabled={revokingId === a.person_id}
                title="Revoke admin"
                className="text-error bg-card hover:bg-error/8 hover:border-error/30 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
