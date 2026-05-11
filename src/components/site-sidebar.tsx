import * as React from "react"

import logoUrl from "@/assets/Logo.svg"
import { NavAllApps } from "@/components/nav-all-apps"
import { NavNotifications } from "@/components/nav-notifications"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { CURRENT_USER } from "@/lib/constants"

// Site-level shell shared by every app's sidebar. Renders the company logo,
// All apps, notifications, and the current user; the active app's nav goes
// in `children`.
export function SiteSidebar({
  children,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="items-start px-5 pt-5 pb-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:pt-4 group-data-[collapsible=icon]:pb-6">
        <img
          src={logoUrl}
          alt="Logo"
          className="h-6 w-auto brightness-0 dark:brightness-100 [.rippling_&]:brightness-100 group-data-[collapsible=icon]:h-4"
        />
      </SidebarHeader>
      <SidebarContent className="pt-2">
        <NavAllApps />
        <NavNotifications />
        {children}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={CURRENT_USER} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
