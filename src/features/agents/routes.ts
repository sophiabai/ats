import type { RouteObject } from "react-router";
import { routeHandle } from "@/app/route-meta";

export const agentsRoutes: RouteObject[] = [
  {
    path: "agents",
    handle: routeHandle({ title: "Agents" }),
    lazy: () => import("@/features/agents/agents-page"),
  },
];
