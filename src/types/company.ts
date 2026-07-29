// Shapes returned by the Klong gateway's company/admin-console endpoints.
// Mirrors gateway/internal/handlers/company_json.go response types.

export interface Company {
  id: string;
  name: string;
  slug: string;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  country?: string;
  website_url?: string;
  logo_url?: string;
  industry?: string;
  company_size?: string;
  timezone?: string;
  currency?: string;
  legal_name?: string;
}

export interface PersonEmployment {
  id: string;
  employment_type: string;
  status: string;
  roles: string[];
}

export interface PersonCompany {
  company: Company;
  admin_roles: string[];
  employment?: PersonEmployment;
}

export interface CompanyDomain {
  id: string;
  company_id: string;
  domain: string;
  verified: boolean;
  verify_token?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyEmployment {
  id: string;
  company_id: string;
  person_id: string;
  employment_type: string;
  status: string;
  roles: string[];
  start_date: string;
  end_date?: string;
  frozen_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyAdmin {
  person_id: string;
  roles: string[];
  granted_at: string;
}

export function isCompanyAdmin(pc: Pick<PersonCompany, "admin_roles">): boolean {
  return pc.admin_roles.length > 0;
}
