import {
  Bell,
  FlaskConical,
  LogOut,
  Monitor,
  Moon,
  Sparkles,
  Sun,
} from "lucide-react"
import logoUrl from "@/assets/Logo.svg"
import { ChatBar } from "@/components/chat-bar"
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
  name: "Sophia Bai",
  email: "sophia@example.com",
  avatar: "/avatars/sophia.jpg",
}

const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
]

export function TopNav() {
  const { toggleDocked } = useChatBarStore()
  const { theme, setTheme } = useThemeStore()

  return (
    <header className="relative flex h-(--top-nav-height) shrink-0 items-center justify-between bg-top-nav px-5">
      <img src={logoUrl} alt="Logo" className="h-6 w-auto brightness-0 dark:brightness-100" />

      <ChatBar />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-9 text-top-nav-foreground hover:bg-top-nav-muted"
          >
            <Bell className="size-4" />
            <span className="sr-only">Notifications</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-9 text-top-nav-foreground hover:bg-top-nav-muted"
            onClick={() => toggleDocked()}
          >
            <Sparkles className="size-4" />
            <span className="sr-only">AI</span>
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="size-8 shrink-0 rounded-full ring-2 ring-white focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
              <Avatar className="size-full">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-[10px]">SB</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-56 rounded-lg" align="end" sideOffset={8}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">SB</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
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
            <DropdownMenuItem onClick={() => window.open("/proto-hub", "_blank")}>
              <FlaskConical />
              Proto hub
            </DropdownMenuItem>
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
