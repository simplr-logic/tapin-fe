"use client";

import { ArrowLeft, Building2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isCompanyAdmin } from "@/types/company";

import { CompanyAdminsTab } from "./CompanyAdminsTab";
import { CompanyDomainsTab } from "./CompanyDomainsTab";
import { CompanyEmploymentsTab } from "./CompanyEmploymentsTab";
import { CompanyOverviewTab } from "./CompanyOverviewTab";

import type { Company, PersonCompany } from "@/types/company";

export function CompanyDetail({ initial }: { initial: PersonCompany }) {
  const [company, setCompany] = useState<Company>(initial.company);
  const { admin_roles, employment } = initial;
  const isAdmin = isCompanyAdmin(initial);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/companies"
          className="flex items-center justify-center w-8 h-8 rounded-md border border-garden-border bg-card text-ink-muted hover:bg-surface-2 hover:text-ink transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="w-10 h-10 rounded-md flex items-center justify-center shrink-0 bg-surface-2 border border-garden-border">
          <Building2 className="w-4.5 h-4.5 text-ink-muted" />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-ink truncate">{company.name}</h1>
          <p className="text-[11px] text-ink-muted truncate">
            klong.app/{company.slug} · {company.status}
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {isAdmin && <TabsTrigger value="domains">Domains</TabsTrigger>}
          {isAdmin && <TabsTrigger value="employments">Employments</TabsTrigger>}
          {isAdmin && <TabsTrigger value="admins">Admins</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview">
          <CompanyOverviewTab
            company={company}
            employment={employment}
            adminRoles={admin_roles}
            isAdmin={isAdmin}
            onUpdated={setCompany}
          />
        </TabsContent>
        {isAdmin && (
          <TabsContent value="domains">
            <CompanyDomainsTab companyId={company.id} />
          </TabsContent>
        )}
        {isAdmin && (
          <TabsContent value="employments">
            <CompanyEmploymentsTab companyId={company.id} />
          </TabsContent>
        )}
        {isAdmin && (
          <TabsContent value="admins">
            <CompanyAdminsTab companyId={company.id} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
