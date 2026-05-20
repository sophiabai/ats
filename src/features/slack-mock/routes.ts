import type { RouteObject } from "react-router";

export const slackMockRoutes: RouteObject[] = [
  {
    path: "slack-recruiter",
    HydrateFallback: () => null,
    lazy: () => import("@/features/slack-mock/slack-recruiter-page"),
  },
  {
    path: "slack-interviewer",
    HydrateFallback: () => null,
    lazy: () => import("@/features/slack-mock/slack-interviewer-page"),
  },
  {
    path: "slack",
    HydrateFallback: () => null,
    lazy: () => import("@/features/slack-mock/slack-recruiter-page"),
  },
];
