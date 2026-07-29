"use client";

import { Building2, Plus, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { CreateCompanyDialog } from "./CreateCompanyDialog";

import type { Company, PersonCompany } from "@/types/company";

function CompanyRow({ company, admin_roles, employment }: PersonCompany) {
  return (
    <Link
      href={`/companies/${company.slug}`}
      className="px-5 py-3.5 flex items-center gap-4 hover:bg-surface-2/60 transition-colors"
    >
      <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0 bg-surface-2 border border-garden-border">
        <Building2 className="w-4 h-4 text-ink-muted" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink truncate">{company.name}</p>
        <p className="text-[11px] text-ink-muted truncate">klong.app/{company.slug}</p>
      </div>

      <div className="hidden sm:flex items-center gap-1.5 shrink-0">
        {admin_roles.length > 0 && (
          <span className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide text-primary bg-primary/8 border border-primary/20 rounded-full px-1.5 py-0.5">
            <ShieldCheck className="w-2.5 h-2.5" />
            {admin_roles.join(", ")}
          </span>
        )}
        {employment && (
          <span className="text-[9px] font-semibold uppercase tracking-wide text-ink-subtle bg-surface-2 border border-garden-border-strong rounded-full px-1.5 py-0.5">
            {employment.status}
          </span>
        )}
      </div>
    </Link>
  );
}

export function CompaniesList({ initialCompanies }: { initialCompanies: PersonCompany[] }) {
  const [companies, setCompanies] = useState(initialCompanies);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  function handleCreated(company: Company) {
    setCompanies((prev) => [{ company, admin_roles: ["owner"] }, ...prev]);
  }

  const owned = companies.filter((pc) => pc.admin_roles.includes("owner"));
  const other = companies.filter((pc) => !pc.admin_roles.includes("owner"));

  return (
    <div className="bg-card rounded-lg border border-garden-border shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-garden-border flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-ink-muted text-xs font-medium tracking-wide uppercase">
          <Building2 className="w-3.5 h-3.5" />
          Companies
          <span className="text-[10px] font-semibold text-ink-muted bg-surface-2 px-2 py-0.5 rounded-full normal-case tracking-normal">
            {companies.length}
          </span>
        </div>
        <Button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="h-auto gap-1.5 text-xs px-3 py-1.5 font-medium shadow-card"
        >
          <Plus className="w-3.5 h-3.5" />
          New Company
        </Button>
      </div>

      {companies.length === 0 ? (
        <div className="px-5 py-10 text-center text-xs text-ink-subtle">
          No companies yet.{" "}
          <Button
            type="button"
            variant="link"
            onClick={() => setIsCreateOpen(true)}
            className="h-auto p-0 text-xs font-semibold text-link"
          >
            Create one
          </Button>{" "}
          to get started.
        </div>
      ) : (
        <>
          {owned.length > 0 && (
            <div>
              <p className="px-5 pt-3.5 pb-1 text-[10px] font-semibold text-ink-subtle uppercase tracking-wide">
                Owned by you
                <span className="ml-1.5 text-ink-subtle/70">({owned.length})</span>
              </p>
              <div className="divide-y divide-garden-border">
                {owned.map((pc) => (
                  <CompanyRow key={pc.company.id} {...pc} />
                ))}
              </div>
            </div>
          )}

          {other.length > 0 && (
            <div>
              <p className="px-5 pt-3.5 pb-1 text-[10px] font-semibold text-ink-subtle uppercase tracking-wide border-t border-garden-border">
                Other companies
                <span className="ml-1.5 text-ink-subtle/70">({other.length})</span>
              </p>
              <div className="divide-y divide-garden-border">
                {other.map((pc) => (
                  <CompanyRow key={pc.company.id} {...pc} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <CreateCompanyDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={handleCreated}
      />
    </div>
  );
}
