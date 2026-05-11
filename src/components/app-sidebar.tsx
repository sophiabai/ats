import * as React from "react";
import {
  BarChart3,
  Bot,
  ClipboardList,
  FileText,
  Inbox,
  Search,
  Send,
  SquareKanban,
  UserSearch,
  Vote,
  Workflow,
} from "lucide-react";

import { NavMain, type NavMainItem } from "@/components/nav-main";
import { NavProjects, type NavProjectsItem } from "@/components/nav-projects";
import { SiteSidebar } from "@/components/site-sidebar";
import type { Sidebar } from "@/components/ui/sidebar";
import { useCandidatesNavItem } from "@/features/candidates/nav";
import { headcountNavItem } from "@/features/headcount-planning/nav";
import { useRequisitionsNavItem } from "@/features/requisitions/nav";
import { useChatBarStore } from "@/stores/chat-bar-store";

const recruitingOverflow: NavProjectsItem[] = [
  { name: "Workflows", url: "/workflows", icon: Workflow },
  { name: "My referral", url: "#", icon: UserSearch },
  { name: "Internal job board", url: "/job-board", icon: SquareKanban },
  { name: "Templates and defaults", url: "#", icon: FileText },
  { name: "Candidate surveys", url: "#", icon: Vote },
];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const setOpen = useChatBarStore((s) => s.setOpen);
  const setDocked = useChatBarStore((s) => s.setDocked);

  const requisitionsNavItem = useRequisitionsNavItem();
  const candidatesNavItem = useCandidatesNavItem();

  const quickAccess: NavMainItem[] = [
    { title: "Inbox", url: "/inbox", icon: Inbox },
    {
      title: "Search",
      url: "#",
      icon: Search,
      onClick: () => {
        setDocked(false);
        setOpen(true);
      },
    },
    { title: "Outreach", url: "#", icon: Send },
    { title: "My interviews", url: "#", icon: ClipboardList },
  ];

  const recruiting: NavProjectsItem[] = [
    requisitionsNavItem,
    candidatesNavItem,
    headcountNavItem,
    { name: "Agents", url: "/agents", icon: Bot },
    { name: "Analytics", url: "#", icon: BarChart3 },
  ];

  return (
    <SiteSidebar {...props}>
      <NavMain items={quickAccess} />
      <NavProjects items={recruiting} overflow={recruitingOverflow} />
    </SiteSidebar>
  );
}
