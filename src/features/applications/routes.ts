import type { RouteObject } from "react-router";
import { routeHandle } from "@/app/route-meta";

export const applicationsRoutes: RouteObject[] = [
  {
    path: "applications",
    handle: routeHandle({ title: "Applications" }),
    lazy: () => import("@/features/applications/applications-page"),
  },
];
