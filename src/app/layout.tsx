import { Link, Outlet, useLocation } from "react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { DockedChatPanel } from "@/components/docked-chat-panel";
import { TopNav } from "@/components/top-nav";
import { VariantDropdown } from "@/components/custom/variant-dropdown";
import { useChatBarStore } from "@/stores/chat-bar-store";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { usePageTitleStore } from "@/stores/page-title-store";

export interface BreadcrumbState {
  breadcrumb?: Array<{ title: string; href: string }>;
  pageTitle?: string;
}

interface Crumb {
  title: string;
  href: string;
}

const SEGMENT_TITLES: Record<string, string> = {
  requisitions: "Requisitions",
  candidates: "Candidates",
  applications: "Applications",
  interviews: "Interviews",
  assessments: "Assessments",
  emails: "Emails",
  "headcount-planning": "Headcount planning",
  inbox: "Inbox",
  agents: "Agents",
  workflows: "Workflows",
  "job-board": "Internal job board",
  "my-team": "My team",
  roster: "Roster",
  plan: "Plan",
  "past-plans": "Past plans",
  budget: "Budget",
  scenarios: "Scenarios",
  approvals: "Approvals",
  settings: "Settings",
};

const ROUTE_OVERRIDES: Record<string, { crumbs: Crumb[]; page: string }> = {
  "headcount-planning/past-plans": {
    crumbs: [
      { title: "Headcount planning", href: "/headcount-planning" },
      { title: "Plan", href: "/headcount-planning/plan" },
    ],
    page: "Past plans",
  },
  "workflows/review": {
    crumbs: [{ title: "Workflows", href: "/workflows" }],
    page: "Create SOP",
  },
  "workflows/builder": {
    crumbs: [{ title: "Workflows", href: "/workflows" }],
    page: "Workflow builder",
  },
};

function useBreadcrumbs(): { crumbs: Crumb[]; page: string } {
  const { pathname, state } = useLocation() as {
    pathname: string;
    state: BreadcrumbState | null;
  };
  const dynamicTitle = usePageTitleStore((s) => s.pageTitle);
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return { crumbs: [], page: "Home" };
  }

  if (state?.breadcrumb && state.breadcrumb.length > 0) {
    return {
      crumbs: state.breadcrumb,
      page: state.pageTitle ?? dynamicTitle ?? "Details",
    };
  }

  const routeKey = segments.join("/");
  if (ROUTE_OVERRIDES[routeKey]) {
    return ROUTE_OVERRIDES[routeKey];
  }

  const crumbs: Crumb[] = [];
  for (let i = 0; i < segments.length - 1; i++) {
    const title = SEGMENT_TITLES[segments[i]];
    if (title) {
      crumbs.push({ title, href: "/" + segments.slice(0, i + 1).join("/") });
    }
  }

  const lastSegment = segments[segments.length - 1];
  const page =
    SEGMENT_TITLES[lastSegment] ?? state?.pageTitle ?? dynamicTitle ?? "Details";

  return { crumbs, page };
}

export function RootLayout() {
  const { crumbs, page } = useBreadcrumbs();
  const docked = useChatBarStore((s) => s.docked);

  return (
    <div className="flex h-svh flex-col">
      <TopNav />
      <SidebarProvider defaultOpen={true} className="min-h-0 flex-1 rounded-t-2xl overflow-hidden shadow-sm">
        <AppSidebar />
        <SidebarInset className="relative min-w-0 min-h-0 overflow-hidden bg-white dark:bg-stone-950">
          <header className="flex h-16 shrink-0 items-center gap-2 px-4 transition-[width,height] ease-in-out-quart group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                {crumbs.map((crumb, i) => (
                  <span key={crumb.href} className="contents">
                    {i > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink asChild>
                        <Link to={crumb.href}>{crumb.title}</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  </span>
                ))}
                {crumbs.length > 0 && (
                  <BreadcrumbSeparator className="hidden md:block" />
                )}
                <BreadcrumbItem>
                  <BreadcrumbPage>{page}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto">
              <VariantDropdown />
            </div>
          </header>
          <div className="flex w-full flex-1 flex-col gap-6 overflow-y-auto px-17 pt-6 pb-20">
            <Outlet />
          </div>
        </SidebarInset>
        {docked && <DockedChatPanel />}
      </SidebarProvider>
    </div>
  );
}
