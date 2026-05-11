import type { RouteObject } from "react-router";
import { routeHandle } from "@/app/route-meta";

export const interviewsRoutes: RouteObject[] = [
  {
    path: "interviews",
    handle: routeHandle({ title: "Interviews" }),
    lazy: () => import("@/features/interviews/interviews-page"),
  },
];
