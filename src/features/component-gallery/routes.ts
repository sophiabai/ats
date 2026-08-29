import type { RouteObject } from "react-router";

// Component gallery — every primitive in components/ui/, outside the app shell.
export const componentGalleryRoutes: RouteObject[] = [
  {
    path: "components",
    HydrateFallback: () => null,
    lazy: () => import("@/features/component-gallery/component-gallery-page"),
  },
];
