import { CompaniesList } from "@/components/companies/CompaniesList";
import { getCompanies } from "@/lib/gateway";

export default async function CompaniesPage() {
  const companies = await getCompanies();
  return <CompaniesList initialCompanies={companies} />;
}
