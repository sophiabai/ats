import type { RouteObject } from "react-router";
import { routeHandle } from "@/app/route-meta";
import { HEADCOUNT_PARENT } from "@/features/headcount-planning/nav";

export const headcountPlanningRoutes: RouteObject[] = [
  {
    path: "headcount-planning",
    handle: routeHandle({ title: "Headcount planning" }),
    lazy: () => import("@/features/headcount-planning/headcount-planning-page"),
  },
  {
    path: "headcount-planning/my-team",
    handle: routeHandle({ title: "My team", parents: [HEADCOUNT_PARENT] }),
    lazy: () => import("@/features/headcount-planning/my-team-page"),
  },
  {
    path: "headcount-planning/roster",
    handle: routeHandle({ title: "Roster", parents: [HEADCOUNT_PARENT] }),
    lazy: () => import("@/features/headcount-planning/roster-page"),
  },
  {
    path: "headcount-planning/plan",
    handle: routeHandle({ title: "Plan", parents: [HEADCOUNT_PARENT] }),
    lazy: () => import("@/features/headcount-planning/plan-page"),
  },
  {
    path: "headcount-planning/past-plans",
    handle: routeHandle({
      title: "Past plans",
      parents: [HEADCOUNT_PARENT, { title: "Plan", href: "/headcount-planning/plan" }],
    }),
    lazy: () => import("@/features/headcount-planning/past-plans-page"),
  },
  {
    path: "headcount-planning/budget",
    handle: routeHandle({ title: "Budget", parents: [HEADCOUNT_PARENT] }),
    lazy: () => import("@/features/headcount-planning/budget-page"),
  },
  {
    path: "headcount-planning/scenarios",
    handle: routeHandle({ title: "Scenarios", parents: [HEADCOUNT_PARENT] }),
    lazy: () => import("@/features/headcount-planning/scenarios-page"),
  },
  {
    path: "headcount-planning/approvals",
    handle: routeHandle({ title: "Approvals", parents: [HEADCOUNT_PARENT] }),
    lazy: () => import("@/features/headcount-planning/approval-requests-page"),
  },
  {
    path: "headcount-planning/settings",
    handle: routeHandle({ title: "Settings", parents: [HEADCOUNT_PARENT] }),
    lazy: () => import("@/features/headcount-planning/settings-page"),
  },
];
