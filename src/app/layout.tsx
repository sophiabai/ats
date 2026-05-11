import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { Link, Outlet, useLocation, useMatches } from "react-router";
import type { RouteHandle, RouteCrumb } from "@/app/route-meta";
import { CommandBar } from "@/components/command-bar";
import {
  HeaderActionsProvider,
  useHeaderActionsRefCallback,
} from "@/components/header-actions-portal";
import { VariantDropdown } from "@/components/custom/variant-dropdown";
import { DockedCandidatePanel } from "@/components/docked-candidate-panel";
import { DockedChatPanel } from "@/components/docked-chat-panel";
import { EmployeeProfilePanel } from "@/features/org-chart/components/employee-profile-panel";
import { useInboxDetailStore } from "@/stores/inbox-detail-store";
import { useOrgChartDetailStore } from "@/stores/org-chart-detail-store";
import { Button } from "@/components/ui/button";
import { useChatBarStore } from "@/stores/chat-bar-store";
import { useThemeUrlSync } from "@/hooks/use-theme-url-sync";
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
import { Toaster } from "@/components/ui/sonner";
import { usePageTitleStore } from "@/stores/page-title-store";

// State shape passed via `<Link state={...}>` to override the static
// route-handle crumbs with navigation-context crumbs (e.g. arriving at a
// candidate detail page from "Requisition X" vs. from the candidates list).
export interface BreadcrumbState {
  breadcrumb?: RouteCrumb[];
  pageTitle?: string;
}

function useBreadcrumbs(): { crumbs: RouteCrumb[]; page: string } {
  const { state } = useLocation() as { state: BreadcrumbState | null };
  const matches = useMatches();
  const dynamicTitle = usePageTitleStore((s) => s.pageTitle);

  // The leaf route owns its breadcrumb metadata via the route's `handle`.
  const leaf = matches[matches.length - 1];
  const handle = (leaf?.handle ?? {}) as RouteHandle;

  // Per-navigation override always wins (e.g. arriving at a detail page via
  // a contextual link that wants its own crumb chain).
  if (state?.breadcrumb && state.breadcrumb.length > 0) {
    return {
      crumbs: state.breadcrumb,
      page: state.pageTitle ?? dynamicTitle ?? handle.title ?? "Details",
    };
  }

  return {
    crumbs: handle.parents ?? [],
    page: handle.title ?? state?.pageTitle ?? dynamicTitle ?? "Details",
  };
}

// `sidebar` is required: each app's route subtree wraps `RootLayout` with its
// own sidebar so the layout never has to know which app it's rendering.
export function RootLayout({ sidebar }: { sidebar: ReactNode }) {
  const { crumbs, page } = useBreadcrumbs();
  const docked = useChatBarStore((s) => s.docked);
  const toggleDocked = useChatBarStore((s) => s.toggleDocked);
  const candidatePanelOpen = useInboxDetailStore((s) => !!s.candidateId);
  const employeePanelOpen = useOrgChartDetailStore((s) => !!s.employeeId);
  const [headerActionsEl, setHeaderActionsEl] = useHeaderActionsRefCallback();

  useThemeUrlSync();

  return (
    <HeaderActionsProvider value={headerActionsEl}>
    <div className="flex h-svh flex-col">
      <SidebarProvider className="min-h-0 flex-1 overflow-hidden">
        {sidebar}
        <SidebarInset className="relative min-w-0 min-h-0 overflow-hidden bg-white dark:bg-stone-950">
          <header className="flex h-16 shrink-0 items-center gap-2 pr-12 transition-[width,height] ease-in-out-quart group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
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
            </div>
            <div className="w-4 shrink-0" />
            <div
              ref={setHeaderActionsEl}
              className="ml-auto flex items-center gap-2"
            />
            <div className="flex items-center gap-2 pl-2">
              <div className="-translate-y-[1px]">
                <VariantDropdown />
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleDocked}
                title="AI"
              >
                <Sparkles className="size-4" />
                <span className="sr-only">AI</span>
              </Button>
            </div>
          </header>
          <div className="flex w-full flex-1 flex-col gap-6 overflow-y-auto px-12 pt-6">
            <Outlet />
          </div>
        </SidebarInset>
        {candidatePanelOpen && <DockedCandidatePanel />}
        {employeePanelOpen && <EmployeeProfilePanel />}
        {docked && <DockedChatPanel />}
      </SidebarProvider>
      <CommandBar />
      <Toaster position="bottom-center" />
    </div>
    </HeaderActionsProvider>
  );
}
