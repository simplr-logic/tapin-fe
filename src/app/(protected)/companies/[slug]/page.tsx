import { notFound } from "next/navigation";

import { CompanyDetail } from "@/components/companies/CompanyDetail";
import { getCompanies } from "@/lib/gateway";

export default async function CompanyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const companies = await getCompanies();
  const personCompany = companies.find((pc) => pc.company.slug === slug);
  if (!personCompany) notFound();

  return <CompanyDetail initial={personCompany} />;
}
