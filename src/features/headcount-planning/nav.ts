import { TrendingUp } from "lucide-react";

import type { NavProjectsItem } from "@/components/nav-projects";

const BASE = "/headcount-planning";

// Single source of truth for headcount planning sub-nav. The routes file
// reuses these to drive its breadcrumb metadata, so adding a sub-page is a
// one-line change here.
export const headcountSubNav = [
  { title: "My team", url: `${BASE}/my-team` },
  { title: "Roster", url: `${BASE}/roster` },
  { title: "Plan", url: `${BASE}/plan` },
  { title: "Budget", url: `${BASE}/budget` },
  { title: "Scenarios", url: `${BASE}/scenarios` },
  { title: "Approvals", url: `${BASE}/approvals` },
  { title: "Settings", url: `${BASE}/settings` },
];

export const HEADCOUNT_PARENT = { title: "Headcount planning", href: BASE };

export const headcountNavItem: NavProjectsItem = {
  name: "Headcount planning",
  url: BASE,
  icon: TrendingUp,
  items: headcountSubNav,
};
