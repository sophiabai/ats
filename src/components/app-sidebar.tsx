"use client"

import * as React from "react"
import {
  BarChart3,
  Bot,
  Briefcase,
  ClipboardList,
  FileText,
  Folder,
  Inbox,
  Search,
  Send,
  SquareKanban,
  TrendingUp,
  UserSearch,
  Users,
  Vote,
  Workflow,
} from "lucide-react"
import { NavMain, type NavMainItem } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { useChatBarStore } from "@/stores/chat-bar-store"
import { useStarredRequisitionsStore } from "@/stores/starred-requisitions-store"
import { useCandidatePools } from "@/features/candidates/api/use-candidate-pools"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar"
import { formatReqTitle } from "@/lib/utils"

const data = {
  quickAccess: [
    {
      title: "Inbox",
      url: "/inbox",
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
  recruitingOverflow: [
    {
      name: "Workflows",
      url: "/workflows",
      icon: Workflow,
    },
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
  const { setOpen, setDocked } = useChatBarStore()
  const starred = useStarredRequisitionsStore((s) => s.starred)
  const { data: pools } = useCandidatePools()

  const quickAccess: NavMainItem[] = data.quickAccess.map((item) =>
    item.title === "Search" ? { ...item, onClick: () => { setDocked(false); setOpen(true) } } : item
  )

  const poolSubItems = [
    { title: "All candidates", url: "/candidates" },
    ...(pools ?? []).map((p) => ({
      title: p.name,
      url: `/candidates/pools/${p.id}`,
      icon: Folder,
    })),
  ]

  const recruiting = [
    {
      name: "Job Requisitions",
      url: "/requisitions",
      icon: Briefcase,
      ...(starred.length > 0 && {
        items: [
          { title: "All requisitions", url: "/requisitions" },
          ...starred.map((r) => ({ title: formatReqTitle(r.req_number, r.title), url: `/requisitions/${r.id}` })),
        ],
      }),
    },
    {
      name: "Candidates",
      url: "#",
      icon: Users,
      items: poolSubItems,
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
      name: "Agents",
      url: "/agents",
      icon: Bot,
    },
    {
      name: "Analytics",
      url: "#",
      icon: BarChart3,
    },
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent className="pt-2">
        <NavMain label="Quick Access" items={quickAccess} />
        <NavProjects
          label="Recruiting"
          items={recruiting}
          overflow={data.recruitingOverflow}
        />
      </SidebarContent>
      <SidebarFooter />
      <SidebarRail />
    </Sidebar>
  )
}
