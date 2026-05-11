import type { RouteObject } from "react-router";
import { routeHandle } from "@/app/route-meta";

export const assessmentRoutes: RouteObject[] = [
  {
    path: "assessments",
    handle: routeHandle({ title: "Assessments" }),
    lazy: () => import("@/features/assessment/assessments-page"),
  },
];
