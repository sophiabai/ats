import { createBrowserRouter, type RouteObject } from "react-router";

import { RootLayout } from "@/app/layout";
import { AppSidebar } from "@/components/app-sidebar";
import { OrgChartSidebar } from "@/components/org-chart-sidebar";

import { agentsRoutes } from "@/features/agents/routes";
import { applicationsRoutes } from "@/features/applications/routes";
import { assessmentRoutes } from "@/features/assessment/routes";
import { candidatesRoutes } from "@/features/candidates/routes";
import { docsRoutes } from "@/features/docs/routes";
import { emailsRoutes } from "@/features/emails/routes";
import { headcountPlanningRoutes } from "@/features/headcount-planning/routes";
import { inboxRoutes } from "@/features/inbox/routes";
import { interviewsRoutes } from "@/features/interviews/routes";
import {
  jobBoardRoutes,
  publicJobBoardRoutes,
} from "@/features/job-board/routes";
import { orgChartRoutes } from "@/features/org-chart/routes";
import { protoHubRoutes } from "@/features/proto-hub/routes";
import { requisitionsRoutes } from "@/features/requisitions/routes";
import { schedulingRoutes } from "@/features/scheduling/routes";
import { workflowsRoutes } from "@/features/workflows/routes";

// Routes that render inside the recruiting app shell.
const recruitingRoutes: RouteObject[] = [
  ...inboxRoutes,
  ...requisitionsRoutes,
  ...candidatesRoutes,
  ...applicationsRoutes,
  ...interviewsRoutes,
  ...assessmentRoutes,
  ...emailsRoutes,
  ...headcountPlanningRoutes,
  ...agentsRoutes,
  ...workflowsRoutes,
  ...jobBoardRoutes,
];

// Routes outside any app shell (public pages, prototypes).
const publicRoutes: RouteObject[] = [
  ...docsRoutes,
  ...protoHubRoutes,
  ...schedulingRoutes,
  ...publicJobBoardRoutes,
];

const routes: RouteObject[] = [
  ...publicRoutes,
  {
    path: "/",
    element: <RootLayout sidebar={<AppSidebar />} />,
    HydrateFallback: () => null,
    children: recruitingRoutes,
  },
  {
    element: <RootLayout sidebar={<OrgChartSidebar />} />,
    HydrateFallback: () => null,
    children: orgChartRoutes,
  },
];

export function createRouter() {
  return createBrowserRouter(routes);
}
