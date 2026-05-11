import type { RouteObject } from "react-router";
import { routeHandle } from "@/app/route-meta";

export const orgChartRoutes: RouteObject[] = [
  {
    path: "/org-chart",
    handle: routeHandle({ title: "Org chart" }),
    lazy: () => import("@/features/org-chart/org-chart-page"),
  },
];
