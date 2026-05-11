import * as React from "react";
import { Network, Search, Settings, Share2, Users } from "lucide-react";

import { NavMain, type NavMainItem } from "@/components/nav-main";
import { SiteSidebar } from "@/components/site-sidebar";
import type { Sidebar } from "@/components/ui/sidebar";
import { useChatBarStore } from "@/stores/chat-bar-store";

export function OrgChartSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const setOpen = useChatBarStore((s) => s.setOpen);
  const setDocked = useChatBarStore((s) => s.setDocked);

  const quickAccess: NavMainItem[] = [
    { title: "Org chart", url: "/org-chart", icon: Network },
    { title: "People", url: "#", icon: Users },
    {
      title: "Search",
      url: "#",
      icon: Search,
      onClick: () => {
        setDocked(false);
        setOpen(true);
      },
    },
    { title: "Shared views", url: "#", icon: Share2 },
    { title: "Settings", url: "#", icon: Settings },
  ];

  return (
    <SiteSidebar {...props}>
      <NavMain items={quickAccess} />
    </SiteSidebar>
  );
}
