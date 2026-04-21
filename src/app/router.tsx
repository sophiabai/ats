import { createBrowserRouter, type RouteObject } from "react-router";
import { RootLayout } from "@/app/layout";

const routes: RouteObject[] = [
  {
    path: "pipeline-automation",
    lazy: () =>
      import("@/features/docs/pipeline-automation-page"),
  },
  {
    path: "careers",
    lazy: () =>
      import("@/features/job-board/public-job-board-page"),
  },
  {
    path: "careers/:postId",
    lazy: () =>
      import("@/features/job-board/public-job-post-detail-page"),
  },
  {
    path: "/",
    element: <RootLayout />,
    HydrateFallback: () => null,
    children: [
      {
        index: true,
        lazy: () => import("@/features/home/home-page"),
      },
      {
        path: "requisitions",
        lazy: () => import("@/features/requisitions/requisitions-page"),
      },
      {
        path: "requisitions/:reqId",
        lazy: () => import("@/features/requisitions/requisition-detail-page"),
      },
      {
        path: "candidates",
        lazy: () => import("@/features/candidates/candidates-page"),
      },
      {
        path: "candidates/pools/:poolId",
        lazy: () => import("@/features/candidates/candidate-pool-page"),
      },
      {
        path: "candidates/:candidateId",
        lazy: () => import("@/features/candidates/candidate-detail-page"),
      },
      {
        path: "applications",
        lazy: () => import("@/features/applications/applications-page"),
      },
      {
        path: "interviews",
        lazy: () => import("@/features/interviews/interviews-page"),
      },
      {
        path: "assessments",
        lazy: () => import("@/features/assessment/assessments-page"),
      },
      {
        path: "emails",
        lazy: () => import("@/features/emails/emails-page"),
      },
      {
        path: "headcount-planning",
        lazy: () =>
          import(
            "@/features/headcount-planning/headcount-planning-page"
          ),
      },
      {
        path: "headcount-planning/my-team",
        lazy: () =>
          import("@/features/headcount-planning/my-team-page"),
      },
      {
        path: "headcount-planning/roster",
        lazy: () =>
          import("@/features/headcount-planning/roster-page"),
      },
      {
        path: "headcount-planning/plan",
        lazy: () =>
          import("@/features/headcount-planning/plan-page"),
      },
      {
        path: "headcount-planning/past-plans",
        lazy: () =>
          import("@/features/headcount-planning/past-plans-page"),
      },
      {
        path: "headcount-planning/budget",
        lazy: () =>
          import("@/features/headcount-planning/budget-page"),
      },
      {
        path: "headcount-planning/scenarios",
        lazy: () =>
          import("@/features/headcount-planning/scenarios-page"),
      },
      {
        path: "headcount-planning/approvals",
        lazy: () =>
          import(
            "@/features/headcount-planning/approval-requests-page"
          ),
      },
      {
        path: "headcount-planning/settings",
        lazy: () =>
          import("@/features/headcount-planning/settings-page"),
      },
      {
        path: "inbox",
        lazy: () => import("@/features/inbox/inbox-page"),
      },
      {
        path: "agents",
        lazy: () => import("@/features/agents/agents-page"),
      },
      {
        path: "workflows",
        lazy: () => import("@/features/workflows/workflows-page"),
      },
      {
        path: "workflows/review",
        lazy: () => import("@/features/workflows/sop-review-page"),
      },
      {
        path: "workflows/builder",
        lazy: () => import("@/features/workflows/workflow-builder-page"),
      },
      {
        path: "job-board",
        lazy: () => import("@/features/job-board/job-board-page"),
      },
      {
        path: "job-board/:postId",
        lazy: () =>
          import("@/features/job-board/job-post-detail-page"),
      },
    ],
  },
];

export function createRouter() {
  return createBrowserRouter(routes);
}
