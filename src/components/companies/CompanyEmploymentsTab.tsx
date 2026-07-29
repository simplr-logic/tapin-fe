"use client";

import { Users, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

import type { CompanyEmployment } from "@/types/company";

export function CompanyEmploymentsTab({ companyId }: { companyId: string }) {
  const [employments, setEmployments] = useState<CompanyEmployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [endingId, setEndingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/companies/${companyId}/admin/employments?page_size=100`)
      .then((res) => (res.ok ? res.json() : { employments: [] }))
      .then((body: { employments: CompanyEmployment[] }) => {
        if (!cancelled) setEmployments(body.employments);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  async function handleEnd(employmentId: string) {
    if (!window.confirm("End this employment? This cannot be undone.")) return;
    setEndingId(employmentId);
    const res = await fetch(`/companies/${companyId}/admin/employments/${employmentId}`, {
      method: "DELETE",
    });
    setEndingId(null);
    if (!res.ok) return;
    const body = (await res.json()) as { employment: CompanyEmployment };
    setEmployments((prev) => prev.map((e) => (e.id === employmentId ? body.employment : e)));
  }

  return (
    <div className="bg-card rounded-lg border border-garden-border shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-garden-border flex items-center gap-2 text-ink-muted text-xs font-medium tracking-wide uppercase">
        <Users className="w-3.5 h-3.5" />
        Employments
      </div>

      {loading ? (
        <div className="px-5 py-10 text-center text-xs text-ink-subtle">Loading…</div>
      ) : employments.length === 0 ? (
        <div className="px-5 py-10 text-center text-xs text-ink-subtle">No employments yet.</div>
      ) : (
        <div className="divide-y divide-garden-border">
          {employments.map((e) => (
            <div key={e.id} className="px-5 py-3.5 flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink truncate">{e.person_id}</p>
                <p className="text-[11px] text-ink-muted truncate">
                  {e.employment_type} · {e.roles.join(", ") || "no roles"}
                </p>
              </div>
              <span
                className={[
                  "text-[9px] font-semibold uppercase tracking-wide rounded-full px-1.5 py-0.5 border shrink-0",
                  e.status === "active"
                    ? "text-success bg-success/8 border-success/25"
                    : e.status === "frozen"
                      ? "text-warning bg-warning/8 border-warning/25"
                      : "text-ink-subtle bg-surface-2 border-garden-border-strong",
                ].join(" ")}
              >
                {e.status}
              </span>
              {!e.end_date && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleEnd(e.id)}
                  disabled={endingId === e.id}
                  title="End employment"
                  className="text-error bg-card hover:bg-error/8 hover:border-error/30 shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
