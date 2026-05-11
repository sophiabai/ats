import { redirect, type RouteObject } from "react-router";
import { routeHandle } from "@/app/route-meta";

// `/inbox` is the canonical inbox URL; `/` redirects so existing bookmarks
// for the root continue to land on the inbox.
export const inboxRoutes: RouteObject[] = [
  {
    index: true,
    loader: () => redirect("/inbox"),
  },
  {
    path: "inbox",
    handle: routeHandle({ title: "Inbox" }),
    lazy: () => import("@/features/inbox/inbox-page"),
  },
];
