import { employees } from "./data";
import type { Employee } from "./types";

export interface Office {
  name: string;
  address: string;
}

const OFFICES: Office[] = [
  { name: "New York office", address: "150 Greenwich Street, 59th Floor, New York, NY 10007" },
  { name: "San Francisco office", address: "525 Market Street, 30th Floor, San Francisco, CA 94105" },
  { name: "Austin office", address: "98 San Jacinto Blvd, Suite 1400, Austin, TX 78701" },
  { name: "London office", address: "1 Finsbury Avenue, London EC2M 2PF, United Kingdom" },
  { name: "Remote", address: "Distributed team — works remotely" },
];

const TITLE_TEAM_SUFFIX = /\s*(Lead|Manager|Head|Director|VP|Sr\.|Senior).*$/i;

export interface EmployeeProfile {
  employee: Employee;
  manager: Employee | null;
  departmentPath: string[];
  workEmail: string;
  phone: string;
  startDate: string;
  startDateLabel: string;
  office: Office;
  githubUsername: string;
  employmentType: string;
  employmentStatus: "Active" | "On leave";
}

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function slug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function deriveEmail(employee: Employee): string {
  const [first, ...rest] = employee.name.split(/\s+/);
  const last = rest.join("") || first;
  return `${first.charAt(0).toLowerCase()}${slug(last).replace(/-/g, "")}@acme.com`;
}

function derivePhone(employee: Employee): string {
  const h = hash(employee.id + employee.name);
  const area = 200 + (h % 700);
  const prefix = 200 + ((h >> 4) % 700);
  const line = 1000 + ((h >> 8) % 9000);
  return `+1 (${area}) ${prefix}-${String(line).padStart(4, "0")}`;
}

function deriveStartDate(employee: Employee): { iso: string; label: string } {
  const h = hash("start" + employee.id);
  const year = 2018 + (h % 7);
  const month = 1 + ((h >> 3) % 12);
  const day = 1 + ((h >> 6) % 28);
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return { iso: `${year}-${mm}-${dd}`, label: `${mm}/${dd}/${year}` };
}

function deriveOffice(employee: Employee): Office {
  return OFFICES[hash("office" + employee.id) % OFFICES.length];
}

function deriveGithub(employee: Employee): string {
  return slug(employee.name);
}

function deriveDepartmentPath(employee: Employee, byId: Map<string, Employee>): string[] {
  const path: string[] = [employee.department];
  const parent = employee.parentId ? byId.get(employee.parentId) : null;
  if (!parent || parent.department !== employee.department) return path;

  const parentTitle = parent.title.replace(TITLE_TEAM_SUFFIX, "").trim();
  if (!parentTitle) return path;
  if (parentTitle.toLowerCase() === employee.department.toLowerCase()) return path;
  if (/^(VP|CTO|CPO|CEO|COO|CFO|Chief)/i.test(parent.title)) return path;

  return [employee.department, parentTitle];
}

function deriveEmploymentType(employee: Employee): string {
  if (/intern/i.test(employee.title)) return "Salaried, intern";
  if (/contract/i.test(employee.title)) return "Contractor";
  return "Salaried, full-time";
}

const employeesById = new Map(employees.map((e) => [e.id, e]));

export function getEmployeeProfile(employee: Employee): EmployeeProfile {
  const manager = employee.parentId ? employeesById.get(employee.parentId) ?? null : null;
  const start = deriveStartDate(employee);

  return {
    employee,
    manager,
    departmentPath: deriveDepartmentPath(employee, employeesById),
    workEmail: deriveEmail(employee),
    phone: derivePhone(employee),
    startDate: start.iso,
    startDateLabel: start.label,
    office: deriveOffice(employee),
    githubUsername: deriveGithub(employee),
    employmentType: deriveEmploymentType(employee),
    employmentStatus: "Active",
  };
}
