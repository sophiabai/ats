"use client"

import * as React from "react"
import {
  BarChart3,
  Briefcase,
  ClipboardList,
  FileText,
  Inbox,
  Send,
  SquareKanban,
  TrendingUp,
  UserSearch,
  Users,
  Vote,
} from "lucide-react"
import logoUrl from "@/assets/Logo.svg"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
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
      isActive: true,
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
      isActive: true,
      items: [
        { title: "All candidates", url: "/candidates" },
        { title: "Design Engineering", url: "#" },
        { title: "Product Designer", url: "#" },
        { title: "Product Managers", url: "#" },
      ],
    },
    {
      name: "Headcount Planning",
      url: "#",
      icon: TrendingUp,
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
      url: "#",
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
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain label="Quick Access" items={data.quickAccess} />
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
