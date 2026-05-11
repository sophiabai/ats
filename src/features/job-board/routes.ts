import type { RouteObject } from "react-router";
import { routeHandle } from "@/app/route-meta";

const JOB_BOARD_PARENT = { title: "Internal job board", href: "/job-board" };

// Authenticated, internal job board (renders inside the recruiting app shell).
export const jobBoardRoutes: RouteObject[] = [
  {
    path: "job-board",
    handle: routeHandle({ title: "Internal job board" }),
    lazy: () => import("@/features/job-board/job-board-page"),
  },
  {
    path: "job-board/:postId",
    handle: routeHandle({ parents: [JOB_BOARD_PARENT] }),
    lazy: () => import("@/features/job-board/job-post-detail-page"),
  },
];

// Public-facing careers site (no app shell).
export const publicJobBoardRoutes: RouteObject[] = [
  {
    path: "careers",
    HydrateFallback: () => null,
    lazy: () => import("@/features/job-board/public-job-board-page"),
  },
  {
    path: "careers/:postId",
    HydrateFallback: () => null,
    lazy: () => import("@/features/job-board/public-job-post-detail-page"),
  },
];
