import { useState } from "react"
import { Link } from "react-router"
import {
  BarChart3,
  ChevronRight,
  CircleDollarSign,
  Clock,
  CreditCard,
  Database,
  GraduationCap,
  Heart,
  LayoutGrid,
  Monitor,
  RefreshCw,
  ScanFace,
  Settings,
  Smile,
  Trophy,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

interface AppItem {
  label: string
  icon: LucideIcon
  url: string
}

interface AppCategory {
  id: string
  label: string
  icon: LucideIcon
  items: AppItem[]
  separatorAfter?: boolean
}

const CATEGORIES: AppCategory[] = [
  {
    id: "hr",
    label: "HR",
    icon: Users,
    items: [{ label: "HR overview", icon: Users, url: "#" }],
  },
  {
    id: "payroll",
    label: "Payroll",
    icon: CircleDollarSign,
    items: [{ label: "Payroll overview", icon: CircleDollarSign, url: "#" }],
  },
  {
    id: "benefits",
    label: "Benefits",
    icon: Heart,
    items: [{ label: "Benefits overview", icon: Heart, url: "#" }],
  },
  {
    id: "time",
    label: "Time",
    icon: Clock,
    items: [{ label: "Time overview", icon: Clock, url: "#" }],
    separatorAfter: true,
  },
  {
    id: "talent",
    label: "Talent",
    icon: Trophy,
    items: [
      { label: "Talent overview", icon: Trophy, url: "#" },
      { label: "Recruiting", icon: ScanFace, url: "/" },
      { label: "Headcount planning", icon: Users, url: "/headcount-planning" },
      { label: "Review cycles", icon: RefreshCw, url: "#" },
      { label: "Learning management", icon: GraduationCap, url: "#" },
      { label: "Surveys", icon: Smile, url: "#" },
      { label: "Compensation bands", icon: BarChart3, url: "#" },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    icon: CreditCard,
    items: [{ label: "Finance overview", icon: CreditCard, url: "#" }],
  },
  {
    id: "it",
    label: "IT",
    icon: Monitor,
    items: [{ label: "IT overview", icon: Monitor, url: "#" }],
    separatorAfter: true,
  },
  {
    id: "data",
    label: "Data",
    icon: Database,
    items: [{ label: "Data overview", icon: Database, url: "#" }],
    separatorAfter: true,
  },
  {
    id: "platform",
    label: "Platform",
    icon: Wrench,
    items: [{ label: "Platform overview", icon: Wrench, url: "#" }],
    separatorAfter: true,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    items: [{ label: "Settings overview", icon: Settings, url: "#" }],
  },
]

export function NavAllApps() {
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState<string>("talent")

  const active = CATEGORIES.find((c) => c.id === activeId) ?? CATEGORIES[0]

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <SidebarMenuButton tooltip="All apps" isActive={open}>
                <LayoutGrid />
                <span>All apps</span>
              </SidebarMenuButton>
            </PopoverTrigger>
            <PopoverContent
              side="right"
              align="start"
              sideOffset={12}
              className="grid w-[600px] grid-cols-[220px_1fr] overflow-hidden rounded-xl p-0"
            >
              <div className="border-r border-border bg-muted/40 p-1.5">
                {CATEGORIES.map((category) => {
                  const isActive = category.id === activeId
                  const Icon = category.icon
                  return (
                    <div key={category.id}>
                      <button
                        type="button"
                        onMouseEnter={() => setActiveId(category.id)}
                        onFocus={() => setActiveId(category.id)}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground/80 hover:bg-accent/60 hover:text-foreground",
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <Icon className="size-4 text-muted-foreground" />
                          {category.label}
                        </span>
                        <ChevronRight className="size-3.5 text-muted-foreground" />
                      </button>
                      {category.separatorAfter && (
                        <div className="my-1.5 h-px bg-border" aria-hidden />
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="p-1.5">
                <div className="px-2 pt-1.5 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                  {active.label}
                </div>
                <div className="flex flex-col">
                  {active.items.map((item, idx) => {
                    const ItemIcon = item.icon
                    return (
                      <Link
                        key={item.label}
                        to={item.url}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                          idx === 0
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground/80 hover:bg-accent/60 hover:text-foreground",
                        )}
                      >
                        <ItemIcon className="size-4 text-muted-foreground" />
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
