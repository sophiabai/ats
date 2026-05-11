import { Bell } from "lucide-react"

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavNotifications() {
  return (
    <SidebarGroup className="pt-0">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Notifications">
            <Bell />
            <span>Notifications</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
