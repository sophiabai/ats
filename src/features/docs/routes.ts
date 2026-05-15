import type { RouteObject } from "react-router";

export const docsRoutes: RouteObject[] = [
  {
    path: "document-templates",
    HydrateFallback: () => null,
    lazy: () => import("@/features/docs/document-templates-page"),
  },
  {
    path: "docs",
    HydrateFallback: () => null,
    lazy: () => import("@/features/docs/document-packet-page"),
  },
  {
    path: "pipeline-automation",
    HydrateFallback: () => null,
    lazy: () => import("@/features/docs/pipeline-automation-page"),
  },
];
