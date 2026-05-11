import { Link, useLocation } from "react-router"
import { ChevronRight, MoreHorizontal, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"

export interface NavProjectsItem {
  name: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  items?: { title: string; url: string; icon?: LucideIcon }[]
}

function isRealUrl(url: string) {
  return url !== "#"
}

export function NavProjects({
  items,
  overflow,
}: {
  items: NavProjectsItem[]
  overflow?: NavProjectsItem[]
}) {
  const { isMobile } = useSidebar()
  const { pathname } = useLocation()

  function isActive(url: string) {
    if (!isRealUrl(url)) return false
    return pathname === url || pathname.startsWith(url + "/")
  }

  function bestSubMatch(subItems: { url: string }[]): string | null {
    let best: string | null = null
    for (const sub of subItems) {
      if (isActive(sub.url) && (!best || sub.url.length > best.length)) {
        best = sub.url
      }
    }
    return best
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarMenu>
        {items.map((item) => {
          const hasSubItems = item.items && item.items.length > 0
          const sectionActive =
            hasSubItems &&
            item.items!.some((sub) => isActive(sub.url))
          const itemActive = !hasSubItems && isActive(item.url)

          const best = hasSubItems ? bestSubMatch(item.items!) : null

          return hasSubItems ? (
            <Collapsible
              key={item.name}
              asChild
              defaultOpen={sectionActive || item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.name}>
                    <item.icon />
                    <span>{item.name}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 ease-out-quint group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items!.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        {isRealUrl(subItem.url) ? (
                          <SidebarMenuSubButton asChild isActive={subItem.url === best}>
                            <Link to={subItem.url}>
                              {subItem.icon && <subItem.icon className="size-3.5" />}
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        ) : (
                          <SidebarMenuSubButton>
                            <span>{subItem.title}</span>
                          </SidebarMenuSubButton>
                        )}
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : isRealUrl(item.url) ? (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild tooltip={item.name} isActive={itemActive}>
                <Link to={item.url}>
                  <item.icon />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton tooltip={item.name}>
                <item.icon />
                <span>{item.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
        {overflow && overflow.length > 0 && (
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="text-sidebar-foreground/70">
                  <MoreHorizontal className="text-sidebar-foreground/70" />
                  <span>More</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                {overflow.map((item) =>
                  isRealUrl(item.url) ? (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link to={item.url}>
                        <item.icon className="text-muted-foreground" />
                        <span>{item.name}</span>
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem key={item.name}>
                      <item.icon className="text-muted-foreground" />
                      <span>{item.name}</span>
                    </DropdownMenuItem>
                  ),
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
