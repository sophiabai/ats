import type { RouteObject } from "react-router";

export const protoHubRoutes: RouteObject[] = [
  {
    path: "proto-hub",
    HydrateFallback: () => null,
    lazy: () => import("@/features/proto-hub/proto-hub-page"),
  },
];
