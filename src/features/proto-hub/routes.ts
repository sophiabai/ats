import type { RouteObject } from "react-router";

export const protoHubRoutes: RouteObject[] = [
  {
    path: "proto-hub",
    HydrateFallback: () => null,
    lazy: () => import("@/features/proto-hub/proto-hub-page"),
  },
  {
    path: "proto-hub/email-composer",
    HydrateFallback: () => null,
    lazy: () => import("@/features/proto-hub/email-composer-page"),
  },
  {
    path: "proto-hub/job-board-integration",
    HydrateFallback: () => null,
    lazy: () => import("@/features/proto-hub/job-board-integration-page"),
  },
  {
    path: "proto-hub/candidate-profile",
    HydrateFallback: () => null,
    lazy: () => import("@/features/proto-hub/candidate-profile-page"),
  },
];
