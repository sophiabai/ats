import { createBrowserRouter, type RouteObject } from "react-router";
import { RootLayout } from "@/app/layout";

const routes: RouteObject[] = [
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
    ],
  },
];

export function createRouter() {
  return createBrowserRouter(routes);
}
