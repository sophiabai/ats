export type EmploymentStatus =
  | "Hired"
  | "Accepted"
  | "Active"
  | "Terminated"
  | "Requested Hires";

export type EmploymentType =
  | "Contractor"
  | "Contractor / 1099"
  | "Full time"
  | "Hourly, full-time"
  | "Hourly, part-time"
  | "Intern"
  | "Salaried, full-time"
  | "Salaried, part-time";

export type Level =
  | "C Level"
  | "VP"
  | "Management-7"
  | "Management-6"
  | "Individual Contributor-7"
  | "Individual Contributor-6"
  | "Individual Contributor-5"
  | "Individual Contributor-3";

export type SalaryPeriod = "per hour" | "per year";

export interface Employee {
  id: string;
  parentId: string;
  name: string;
  title: string;
  department: string;
  /**
   * Leaf-level department under `department`. Often the same string as
   * `department` for top-level / generic roles (e.g. "Sales" → "Sales") but
   * differs for specialized teams ("Product" → "Product Design").
   */
  subDepartment: string;
  imageUrl: string;

  // Extended HR fields. Always present in seed data; surfaced only in HR view.
  jobFamily: string;
  team: string;
  level: Level;
  country: string;
  region: string; // sub-location (state / city)
  employmentStatus: EmploymentStatus;
  employmentType: EmploymentType;
  legalEntity: string;
  startDate: string; // ISO yyyy-mm-dd
  endDate: string | null;
  salaryAmount: number;
  salaryCurrency: string; // "USD" | "CAD" | "GBP" | "INR"
  salaryPeriod: SalaryPeriod;
  hasBonus: boolean;
  hasCommission: boolean;
}

export type OrgChartView = "hr" | "employee";
