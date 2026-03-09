import { Link, Outlet, useLocation } from "react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { ChatBar } from "@/components/chat-bar";
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

export interface BreadcrumbState {
  breadcrumb?: Array<{ title: string; href: string }>;
  pageTitle?: string;
}

const SECTION_TITLES: Record<string, string> = {
  requisitions: "Requisitions",
  candidates: "Candidates",
  applications: "Applications",
  interviews: "Interviews",
  assessments: "Assessments",
  emails: "Emails",
};

interface Crumb {
  title: string;
  href: string;
}

function useBreadcrumbs(): { crumbs: Crumb[]; page: string } {
  const { pathname, state } = useLocation() as {
    pathname: string;
    state: BreadcrumbState | null;
  };
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return { crumbs: [], page: "Home" };
  }

  const pageLabel = state?.pageTitle ?? "Details";

  if (state?.breadcrumb && state.breadcrumb.length > 0) {
    return {
      crumbs: state.breadcrumb,
      page: pageLabel,
    };
  }

  const sectionKey = segments[0];
  const sectionTitle = SECTION_TITLES[sectionKey] ?? sectionKey;

  if (segments.length === 1) {
    return { crumbs: [], page: sectionTitle };
  }

  return {
    crumbs: [{ title: sectionTitle, href: `/${sectionKey}` }],
    page: pageLabel,
  };
}

export function RootLayout() {
  const { crumbs, page } = useBreadcrumbs();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="relative min-w-0 max-h-svh overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <Link to="/">Recruiting</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {crumbs.map((crumb) => (
                  <span key={crumb.href} className="contents">
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink asChild>
                        <Link to={crumb.href}>{crumb.title}</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  </span>
                ))}
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{page}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex w-full flex-1 flex-col gap-6 overflow-y-auto px-17 pb-12 pt-6">
          <Outlet />
        </div>
        <ChatBar />
      </SidebarInset>
    </SidebarProvider>
  );
}
