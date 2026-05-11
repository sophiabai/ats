import type { RouteObject } from "react-router";
import { routeHandle } from "@/app/route-meta";

export const emailsRoutes: RouteObject[] = [
  {
    path: "emails",
    handle: routeHandle({ title: "Emails" }),
    lazy: () => import("@/features/emails/emails-page"),
  },
];
