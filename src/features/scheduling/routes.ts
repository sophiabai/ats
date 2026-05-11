import type { RouteObject } from "react-router";

// Public scheduling links sent to candidates by email; no app shell.
export const schedulingRoutes: RouteObject[] = [
  {
    path: "candidate-email",
    HydrateFallback: () => null,
    lazy: () => import("@/features/scheduling/candidate-availability-page"),
  },
  {
    path: "candidate-email/:slug",
    HydrateFallback: () => null,
    lazy: () => import("@/features/scheduling/candidate-availability-page"),
  },
  {
    path: "candidate-availability-acme-ai",
    HydrateFallback: () => null,
    lazy: () => import("@/features/scheduling/candidate-availability-acme-ai-page"),
  },
  {
    path: "candidate-schedule-acme-ai",
    HydrateFallback: () => null,
    lazy: () => import("@/features/scheduling/candidate-schedule-acme-ai-page"),
  },
];
