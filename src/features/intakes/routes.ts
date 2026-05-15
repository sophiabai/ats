import type { RouteObject } from "react-router";
import { routeHandle } from "@/app/route-meta";

const REQUISITIONS_PARENT = { title: "Requisitions", href: "/requisitions" };

export const intakesRoutes: RouteObject[] = [
  {
    path: "intakes/new",
    handle: routeHandle({
      title: "New intake",
      parents: [REQUISITIONS_PARENT],
    }),
    lazy: () => import("@/features/intakes/intake-new-page"),
  },
  {
    path: "intakes/:intakeId",
    handle: routeHandle({ parents: [REQUISITIONS_PARENT] }),
    lazy: () => import("@/features/intakes/intake-detail-page"),
  },
];
