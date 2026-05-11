import type { RouteObject } from "react-router";
import { routeHandle } from "@/app/route-meta";

const WORKFLOWS_PARENT = { title: "Workflows", href: "/workflows" };

export const workflowsRoutes: RouteObject[] = [
  {
    path: "workflows",
    handle: routeHandle({ title: "Workflows" }),
    lazy: () => import("@/features/workflows/workflows-page"),
  },
  {
    path: "workflows/review",
    handle: routeHandle({ title: "Create SOP", parents: [WORKFLOWS_PARENT] }),
    lazy: () => import("@/features/workflows/sop-review-page"),
  },
  {
    path: "workflows/builder",
    handle: routeHandle({ title: "Workflow builder", parents: [WORKFLOWS_PARENT] }),
    lazy: () => import("@/features/workflows/workflow-builder-page"),
  },
];
