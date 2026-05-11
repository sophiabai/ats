import type { RouteObject } from "react-router";
import { routeHandle } from "@/app/route-meta";

const REQUISITIONS_PARENT = { title: "Requisitions", href: "/requisitions" };

export const requisitionsRoutes: RouteObject[] = [
  {
    path: "requisitions",
    handle: routeHandle({ title: "Requisitions" }),
    lazy: () => import("@/features/requisitions/requisitions-page"),
  },
  {
    path: "requisitions/:reqId",
    handle: routeHandle({ parents: [REQUISITIONS_PARENT] }),
    lazy: () => import("@/features/requisitions/requisition-detail-page"),
  },
];
