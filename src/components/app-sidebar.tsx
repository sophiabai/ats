"use client"

import * as React from "react"
import {
  BarChart3,
  Briefcase,
  ClipboardList,
  FileText,
  Inbox,
  Search,
  Send,
  SquareKanban,
  TrendingUp,
  UserSearch,
  Users,
  Vote,
} from "lucide-react"
import logoUrl from "@/assets/Logo.svg"

import { NavMain, type NavMainItem } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { useChatBarStore } from "@/stores/chat-bar-store"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: logoUrl,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: logoUrl,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: logoUrl,
      plan: "Free",
    },
  ],
  quickAccess: [
    {
      title: "Inbox",
      url: "#",
      icon: Inbox,
    },
    {
      title: "Search",
      url: "#",
      icon: Search,
    },
    {
      title: "Outreach",
      url: "#",
      icon: Send,
    },
    {
      title: "My Interviews",
      url: "#",
      icon: ClipboardList,
    },
  ],
  recruiting: [
    {
      name: "Job Requisitions",
      url: "/requisitions",
      icon: Briefcase,
    },
    {
      name: "Candidates",
      url: "#",
      icon: Users,
      items: [
        { title: "All candidates", url: "/candidates" },
        { title: "Design Engineering", url: "#" },
        { title: "Product Designer", url: "#" },
        { title: "Product Managers", url: "#" },
      ],
    },
    {
      name: "Headcount Planning",
      url: "/headcount-planning",
      icon: TrendingUp,
      items: [
        { title: "My team", url: "/headcount-planning/my-team" },
        { title: "Roster", url: "/headcount-planning/roster" },
        { title: "Plan", url: "/headcount-planning/plan" },
        { title: "Budget", url: "/headcount-planning/budget" },
        { title: "Scenarios", url: "/headcount-planning/scenarios" },
        { title: "Approvals", url: "/headcount-planning/approvals" },
        { title: "Settings", url: "/headcount-planning/settings" },
      ],
    },
    {
      name: "Analytics",
      url: "#",
      icon: BarChart3,
    },
  ],
  recruitingOverflow: [
    {
      name: "My Referral",
      url: "#",
      icon: UserSearch,
    },
    {
      name: "Internal Job Board",
      url: "/job-board",
      icon: SquareKanban,
    },
    {
      name: "Template and Defaults",
      url: "#",
      icon: FileText,
    },
    {
      name: "Candidate Surveys",
      url: "#",
      icon: Vote,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { setOpen } = useChatBarStore()

  const quickAccess: NavMainItem[] = data.quickAccess.map((item) =>
    item.title === "Search" ? { ...item, onClick: () => setOpen(true) } : item
  )

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain label="Quick Access" items={quickAccess} />
        <NavProjects
          label="Recruiting"
          items={data.recruiting}
          overflow={data.recruitingOverflow}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
