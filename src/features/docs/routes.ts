import type { RouteObject } from "react-router";

export const docsRoutes: RouteObject[] = [
  {
    path: "pipeline-automation",
    HydrateFallback: () => null,
    lazy: () => import("@/features/docs/pipeline-automation-page"),
  },
];
