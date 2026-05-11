export interface RouteCrumb {
  title: string;
  href: string;
}

// Metadata each route can declare via React Router's `handle` field.
// `useBreadcrumbs` (in layout.tsx) reads this from the matched leaf route to
// render the header crumbs and page title.
export interface RouteHandle {
  /** Title shown as the current page (the last crumb). */
  title?: string;
  /** Ancestor crumbs leading up to this page, in order. */
  parents?: RouteCrumb[];
}

// Identity helper that gives the route handle inferred typing without losing
// excess-property checks.
export function routeHandle(handle: RouteHandle): RouteHandle {
  return handle;
}
