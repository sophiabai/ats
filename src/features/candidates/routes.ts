import type { RouteObject } from "react-router";
import { routeHandle } from "@/app/route-meta";

const CANDIDATES_PARENT = { title: "Candidates", href: "/candidates" };

export const candidatesRoutes: RouteObject[] = [
  {
    path: "candidates",
    handle: routeHandle({ title: "Candidates" }),
    lazy: () => import("@/features/candidates/candidates-page"),
  },
  {
    path: "candidates/pools/:poolId",
    handle: routeHandle({ parents: [CANDIDATES_PARENT] }),
    lazy: () => import("@/features/candidates/candidate-pool-page"),
  },
  {
    path: "candidates/:candidateId",
    handle: routeHandle({ parents: [CANDIDATES_PARENT] }),
    lazy: () => import("@/features/candidates/candidate-detail-page"),
  },
];
