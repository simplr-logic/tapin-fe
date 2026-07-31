"use client";

import { Globe, KeyRound, Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { CompanyDomain } from "@/types/company";

export function CompanyDomainsTab({ companyId }: { companyId: string }) {
  const [domains, setDomains] = useState<CompanyDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newlyIssuedToken, setNewlyIssuedToken] = useState<{ id: string; token: string } | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;
    fetch(`/companies/${companyId}/admin/domains`)
      .then((res) => (res.ok ? res.json() : { domains: [] }))
      .then((body: { domains: CompanyDomain[] }) => {
        if (!cancelled) setDomains(body.domains);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setAdding(true);
    const res = await fetch(`/companies/${companyId}/admin/domains`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: newDomain.trim() }),
    });
    setAdding(false);

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
      setError(body?.error?.message ?? "Couldn't add that domain.");
      return;
    }

    const body = (await res.json()) as { domain: CompanyDomain };
    setDomains((prev) => [body.domain, ...prev]);
    if (body.domain.verify_token) {
      setNewlyIssuedToken({ id: body.domain.id, token: body.domain.verify_token });
    }
    setNewDomain("");
  }

  return (
    <div className="bg-card rounded-lg border border-garden-border shadow-card overflow-hidden">
      <form
        onSubmit={handleAdd}
        className="px-5 py-4 border-b border-garden-border flex items-center gap-2 flex-wrap"
      >
        <Input
          value={newDomain}
          onChange={(e) => setNewDomain(e.target.value)}
          placeholder="acme.com"
          required
          className="max-w-xs"
        />
        <Button type="submit" disabled={adding || !newDomain.trim()} className="gap-1.5 text-xs">
          <Plus className="w-3.5 h-3.5" />
          {adding ? "Adding…" : "Add domain"}
        </Button>
        {error && <p className="text-xs text-error basis-full">{error}</p>}
      </form>

      {newlyIssuedToken && (
        <div className="mx-5 mt-4 rounded-md bg-warning/8 border border-warning/25 px-3 py-2.5 flex items-start gap-2">
          <KeyRound className="w-3.5 h-3.5 text-warning mt-0.5 shrink-0" />
          <p className="text-xs text-ink">
            Add a TXT record with value{" "}
            <code className="text-[11px] bg-surface-2 px-1 py-0.5 rounded">
              {newlyIssuedToken.token}
            </code>{" "}
            to verify this domain. This token is only shown once.
          </p>
        </div>
      )}

      {loading ? (
        <div className="px-5 py-10 text-center text-xs text-ink-subtle">Loading…</div>
      ) : domains.length === 0 ? (
        <div className="px-5 py-10 text-center text-xs text-ink-subtle">
          No domains claimed yet.
        </div>
      ) : (
        <div className="divide-y divide-garden-border">
          {domains.map((d) => (
            <div key={d.id} className="px-5 py-3.5 flex items-center gap-4">
              <Globe className="w-4 h-4 text-ink-subtle shrink-0" />
              <p className="text-sm text-ink flex-1 truncate">{d.domain}</p>
              <span
                className={[
                  "text-[9px] font-semibold tracking-wide rounded-full px-1.5 py-0.5 border shrink-0",
                  d.verified
                    ? "text-success bg-success/8 border-success/25"
                    : "text-warning bg-warning/8 border-warning/25",
                ].join(" ")}
              >
                {d.verified ? "Verified" : "Pending"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
