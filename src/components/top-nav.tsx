import {
  BadgeCheck,
  Bell,
  CreditCard,
  LogOut,
  Monitor,
  Moon,
  Search,
  Sparkles,
  Sun,
} from "lucide-react"
import logoUrl from "@/assets/Logo.svg"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useChatBarStore } from "@/stores/chat-bar-store"
import { useThemeStore, type Theme } from "@/stores/theme-store"

const user = {
  name: "shadcn",
  email: "m@example.com",
  avatar: "/avatars/shadcn.jpg",
}

const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
]

export function TopNav() {
  const { setOpen: openSearch, setDocked, toggleDocked } = useChatBarStore()
  const { theme, setTheme } = useThemeStore()

  return (
    <header className="relative flex h-(--top-nav-height) shrink-0 items-center justify-between bg-top-nav px-5">
      <img src={logoUrl} alt="Logo" className="h-6 w-auto" />

      <button
        type="button"
        onClick={() => { setDocked(false); openSearch(true) }}
        className="absolute left-1/2 top-1/2 flex h-9 w-80 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center gap-1.5 rounded-lg bg-top-nav-muted px-3 shadow-sm"
      >
        <Search className="size-4 shrink-0 text-top-nav-foreground/70" />
        <span className="sr-only">Search</span>
      </button>

      <div className="flex items-center gap-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="size-9 text-top-nav-foreground hover:bg-top-nav-muted"
            onClick={() => toggleDocked()}
          >
            <Sparkles className="size-4" />
            <span className="sr-only">AI</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-9 text-top-nav-foreground hover:bg-top-nav-muted"
          >
            <Bell className="size-4" />
            <span className="sr-only">Notifications</span>
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="size-[38px] shrink-0 overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
              <Avatar className="size-full rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg text-xs">CN</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-56 rounded-lg" align="end" sideOffset={8}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                Theme
              </DropdownMenuLabel>
              {themeOptions.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={theme === opt.value ? "font-medium text-foreground" : "text-muted-foreground"}
                >
                  <opt.icon />
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
