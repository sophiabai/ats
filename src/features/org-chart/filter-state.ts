import type { Employee, OrgChartView } from "./types";

// Sentinel used by multi-select lists when the user explicitly wants to match
// employees with an empty value for that field.
export const EMPTY_VALUE = "__empty__";

export type QuickDateKind =
  | "today"
  | "yesterday"
  | "tomorrow"
  | "current_week"
  | "current_month";

export type DateOperator = "before" | "after" | "between";

export type DateFilter =
  | { kind: QuickDateKind }
  | { kind: "before"; date: string } // ISO yyyy-mm-dd
  | { kind: "after"; date: string }
  | { kind: "between"; from: string; to: string };

// Backwards-compat alias for any existing imports.
export type DateFilterKind = QuickDateKind | DateOperator;

export interface CompensationFilter {
  period: "per hour" | "per year";
  currency: string;
  greaterThan: number | null;
  lessThan: number | null;
  includeBonus: boolean;
  includeCommission: boolean;
  emptyValues: boolean;
  notEmpty: boolean;
}

export interface OrgChartFilters {
  departments: string[];
  jobFamilies: string[];
  teams: string[];
  levels: string[];
  // location stores values shaped like "Country" or "Country > Region" so a
  // user selecting just a country matches everyone in it.
  locations: string[];
  employmentStatuses: string[];
  employmentTypes: string[];
  legalEntities: string[];
  managers: string[]; // employee ids
  startDate: DateFilter | null;
  endDate: DateFilter | null;
  compensation: CompensationFilter | null;
}

export const EMPTY_FILTERS: OrgChartFilters = {
  departments: [],
  jobFamilies: [],
  teams: [],
  levels: [],
  locations: [],
  employmentStatuses: [],
  employmentTypes: [],
  legalEntities: [],
  managers: [],
  startDate: null,
  endDate: null,
  compensation: null,
};

export type FilterCategoryId =
  | "compensation"
  | "department"
  | "jobFamily"
  | "team"
  | "level"
  | "location"
  | "employmentStatus"
  | "employmentType"
  | "legalEntity"
  | "startDate"
  | "endDate"
  | "manager";

export interface FilterCategoryConfig {
  id: FilterCategoryId;
  label: string;
  views: OrgChartView[];
}

// Defines which categories show up in the left rail and in which view modes.
// The Employee view intentionally only exposes filters backed by data that an
// individual employee would reasonably have access to.
export const FILTER_CATEGORIES: FilterCategoryConfig[] = [
  { id: "compensation", label: "Compensation", views: ["hr"] },
  { id: "department", label: "Department", views: ["hr", "employee"] },
  { id: "jobFamily", label: "Job family", views: ["hr"] },
  { id: "team", label: "Team", views: ["hr"] },
  { id: "level", label: "Level", views: ["hr"] },
  { id: "location", label: "Location", views: ["hr"] },
  { id: "employmentStatus", label: "Employment status", views: ["hr"] },
  { id: "employmentType", label: "Employment type", views: ["hr"] },
  { id: "legalEntity", label: "Legal entity", views: ["hr"] },
  { id: "startDate", label: "Start date", views: ["hr"] },
  { id: "endDate", label: "End date", views: ["hr"] },
  { id: "manager", label: "Manager", views: ["hr", "employee"] },
];

export function categoriesForView(
  view: OrgChartView
): FilterCategoryConfig[] {
  return FILTER_CATEGORIES.filter((c) => c.views.includes(view));
}

export function countActiveFilters(f: OrgChartFilters): number {
  let n = 0;
  n += f.departments.length;
  n += f.jobFamilies.length;
  n += f.teams.length;
  n += f.levels.length;
  n += f.locations.length;
  n += f.employmentStatuses.length;
  n += f.employmentTypes.length;
  n += f.legalEntities.length;
  n += f.managers.length;
  if (f.startDate) n += 1;
  if (f.endDate) n += 1;
  if (f.compensation) n += 1;
  return n;
}

function matchesList(values: string[], actual: string | null | undefined) {
  if (values.length === 0) return true;
  if (actual == null || actual === "") return values.includes(EMPTY_VALUE);
  return values.includes(actual);
}

function matchesLocation(values: string[], e: Employee): boolean {
  if (values.length === 0) return true;
  // Match if ANY selected token covers this employee. A selected "United
  // States" matches all US employees regardless of region; "United States >
  // California" only matches Californians.
  return values.some((v) => {
    if (v === EMPTY_VALUE) return !e.country;
    if (!v.includes(" > ")) return e.country === v;
    return `${e.country} > ${e.region}` === v;
  });
}

function matchesDepartments(values: string[], e: Employee): boolean {
  if (values.length === 0) return true;
  // Same hierarchical shape as locations: a selected parent dept (e.g.
  // "Product") matches everyone in it; "Product > Product Design" only
  // matches that sub-department.
  return values.some((v) => {
    if (v === EMPTY_VALUE) return !e.department;
    if (!v.includes(" > ")) return e.department === v;
    return `${e.department} > ${e.subDepartment}` === v;
  });
}

function quickRange(kind: QuickDateKind): [Date, Date] {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  switch (kind) {
    case "today":
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return [start, end];
    case "yesterday":
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      return [start, end];
    case "tomorrow":
      start.setDate(start.getDate() + 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() + 1);
      end.setHours(23, 59, 59, 999);
      return [start, end];
    case "current_week": {
      const day = start.getDay(); // 0 = Sun
      start.setDate(start.getDate() - day);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return [start, end];
    }
    case "current_month":
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      return [start, end];
  }
}

function startOfDay(iso: string): number {
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
function endOfDay(iso: string): number {
  const d = new Date(iso);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

function matchesDate(filter: DateFilter | null, iso: string | null): boolean {
  if (!filter) return true;
  if (!iso) return false;
  const t = new Date(iso).getTime();

  switch (filter.kind) {
    case "before":
      return t < startOfDay(filter.date);
    case "after":
      return t > endOfDay(filter.date);
    case "between":
      return t >= startOfDay(filter.from) && t <= endOfDay(filter.to);
    default: {
      const [start, end] = quickRange(filter.kind);
      return t >= start.getTime() && t <= end.getTime();
    }
  }
}

function matchesCompensation(
  c: CompensationFilter | null,
  e: Employee
): boolean {
  if (!c) return true;
  if (c.emptyValues && e.salaryAmount === 0) return true;
  if (c.notEmpty && e.salaryAmount > 0) return true;
  if (c.period !== e.salaryPeriod) return false;
  if (c.currency && c.currency !== e.salaryCurrency) return false;
  if (c.greaterThan != null && !(e.salaryAmount > c.greaterThan)) return false;
  if (c.lessThan != null && !(e.salaryAmount < c.lessThan)) return false;
  if (c.includeBonus && !e.hasBonus) return false;
  if (c.includeCommission && !e.hasCommission) return false;
  return true;
}

export function matchesFilters(e: Employee, f: OrgChartFilters): boolean {
  if (!matchesDepartments(f.departments, e)) return false;
  if (!matchesList(f.jobFamilies, e.jobFamily)) return false;
  if (!matchesList(f.teams, e.team)) return false;
  if (!matchesList(f.levels, e.level)) return false;
  if (!matchesLocation(f.locations, e)) return false;
  if (!matchesList(f.employmentStatuses, e.employmentStatus)) return false;
  if (!matchesList(f.employmentTypes, e.employmentType)) return false;
  if (!matchesList(f.legalEntities, e.legalEntity)) return false;
  if (f.managers.length > 0 && !f.managers.includes(e.parentId)) return false;
  if (!matchesDate(f.startDate, e.startDate)) return false;
  if (!matchesDate(f.endDate, e.endDate)) return false;
  if (!matchesCompensation(f.compensation, e)) return false;
  return true;
}
