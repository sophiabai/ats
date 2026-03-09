import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type KeyboardEvent,
} from "react"
import { useNavigate } from "react-router"
import {
  Briefcase,
  Mic,
  Minimize2,
  Paperclip,
  Sparkles,
  SquarePen,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChatInput } from "@/features/chat/components/chat-input"
import { MessageBubble } from "@/features/chat/components/message-bubble"
import { MessageSkeleton } from "@/features/chat/components/message-skeleton"
import { useChat } from "@/features/chat/api/use-chat"
import { useChatStore } from "@/features/chat/stores/chat-store"
import { useGlobalSearch } from "@/hooks/use-global-search"
import { useChatBarStore } from "@/stores/chat-bar-store"
import { cn } from "@/lib/utils"

const quickActions = [
  "Summarize candidates",
  "Draft outreach email",
  "Compare applicants",
]

const ACTION_PATTERNS = [
  /^(schedule|send|email|evaluate|assess|move|reject|approve|compare|summarize|draft)/i,
  /^(what|how|why|who|which|can you|please|help)/i,
  /^(find me|show me|get me|look up)/i,
]

function isAICommand(input: string): boolean {
  return ACTION_PATTERNS.some((p) => p.test(input.trim()))
}

interface DropdownItem {
  id: string
  type: "candidate" | "requisition" | "ai" | "action"
  label: string
  sublabel?: string
  badge?: string
  to?: string
}

const GROUP_LABELS: Record<string, string> = {
  candidate: "Candidates",
  requisition: "Requisitions",
  ai: "AI actions",
  action: "Actions",
}

export function ChatBar() {
  const { open, setOpen, toggle } = useChatBarStore()
  const [expanded, setExpanded] = useState(false)
  const [value, setValue] = useState("")
  const { messages, addMessage, clearMessages } = useChatStore()
  const chat = useChat()
  const navigate = useNavigate()
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { data: searchResults } = useGlobalSearch(value)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const dropdownItems = useMemo(() => {
    const items: DropdownItem[] = []
    const query = value.trim()

    // Slash commands: show actions when input starts with /
    if (query.startsWith("/")) {
      const filter = query.slice(1).toLowerCase()
      for (const action of quickActions) {
        if (!filter || action.toLowerCase().includes(filter)) {
          items.push({
            id: `action-${action}`,
            type: "action",
            label: action,
          })
        }
      }
      return items
    }

    if (query.length < 2) return items

    for (const c of searchResults?.candidates ?? []) {
      items.push({
        id: `candidate-${c.id}`,
        type: "candidate",
        label: `${c.first_name} ${c.last_name}`,
        sublabel: [c.headline, c.current_company]
          .filter(Boolean)
          .join(" · "),
        to: `/candidates/${c.id}`,
      })
    }

    for (const r of searchResults?.requisitions ?? []) {
      items.push({
        id: `req-${r.id}`,
        type: "requisition",
        label: r.title,
        sublabel: r.department ?? undefined,
        badge: r.status,
        to: `/requisitions/${r.id}`,
      })
    }

    if (isAICommand(query)) {
      items.push({
        id: "ai-action",
        type: "ai",
        label: `Ask AI: ${query}`,
        sublabel: "Send to recruiting assistant",
      })
    }

    return items
  }, [searchResults, value])

  const showDropdown = dropdownItems.length > 0

  // Cmd+K global shortcut
  useEffect(() => {
    function onKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggle()
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [toggle])

  // Focus input when opened
  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus())
  }, [open])

  // Reset state when closed
  useEffect(() => {
    if (!open) {
      setExpanded(false)
      setValue("")
    }
  }, [open])

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(-1)
  }, [value])

  // Auto-scroll to latest message
  useEffect(() => {
    if (expanded) bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, chat.isPending, expanded])

  // Click outside to close
  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (
        open &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    },
    [open, setOpen],
  )

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [handleClickOutside])

  function handleSend(content: string) {
    if (!content.trim() || chat.isPending) return
    const userMessage = { role: "user" as const, content: content.trim() }
    addMessage(userMessage)
    setValue("")
    if (!expanded) setExpanded(true)

    const updatedMessages = [...messages, userMessage]
    chat.mutate(updatedMessages, {
      onSuccess: (data) => {
        addMessage({ role: "assistant", content: data.content })
      },
    })
  }

  function handleNavigate(to: string) {
    setValue("")
    setOpen(false)
    if (to !== "#") navigate(to)
  }

  function handleItemSelect(item: DropdownItem) {
    if (item.to) {
      handleNavigate(item.to)
    } else if (item.type === "action") {
      handleSend(item.label)
    } else if (item.type === "ai") {
      handleSend(value)
    }
  }

  function handleInputKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (showDropdown) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, dropdownItems.length - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, -1))
      } else if (e.key === "Enter" && !e.shiftKey && selectedIndex >= 0) {
        e.preventDefault()
        handleItemSelect(dropdownItems[selectedIndex])
      } else if (e.key === "Escape") {
        e.preventDefault()
        setValue("")
      }
    } else if (e.key === "Escape") {
      e.preventDefault()
      if (value) {
        setValue("")
      } else {
        setOpen(false)
      }
    }
  }

  if (!open) {
    return (
      <div className="absolute inset-x-4 bottom-4 z-50 mx-auto max-w-[600px] sm:bottom-6">
        <div
          className="flex cursor-text items-center gap-2 rounded-full border bg-background px-5 py-4 shadow-lg transition-shadow hover:shadow-xl"
          onClick={() => setOpen(true)}
        >
          <span className="flex-1 text-sm text-muted-foreground">
            Search, ask, or type / for actions
          </span>
          <Paperclip className="size-4 text-muted-foreground" />
          <Mic className="size-4 text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-x-4 bottom-4 z-50 mx-auto flex max-w-[600px] flex-col sm:bottom-6"
    >
      {/* Messages panel */}
      {expanded && (
        <div className="mb-1.5 max-h-[50vh] overflow-y-auto rounded-2xl border bg-popover px-5 py-4 shadow-lg">
          {messages.length === 0 && !chat.isPending ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Send a message to start a conversation.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map((msg, idx) => (
                <MessageBubble key={idx} message={msg} />
              ))}
              {chat.isPending && <MessageSkeleton />}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      )}

      {/* Search / navigation dropdown */}
      {showDropdown && (
        <div className="mb-1.5 max-h-[300px] overflow-y-auto rounded-2xl border bg-popover p-1 shadow-lg">
          {dropdownItems.map((item, idx) => {
            const showHeading =
              idx === 0 || dropdownItems[idx - 1].type !== item.type
            const Icon =
              item.type === "candidate"
                ? Users
                : item.type === "requisition"
                  ? Briefcase
                  : Sparkles
            return (
              <div key={item.id}>
                {showHeading && (
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    {GROUP_LABELS[item.type]}
                  </div>
                )}
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
                    idx === selectedIndex
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50",
                  )}
                  onClick={() => handleItemSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  {item.type === "action" ? (
                    <span className="flex size-5 shrink-0 items-center justify-center rounded bg-muted text-xs font-semibold text-muted-foreground">
                      /
                    </span>
                  ) : (
                    <Icon
                      className={cn(
                        "size-4 shrink-0",
                        item.type === "ai"
                          ? "text-berry-400"
                          : "text-muted-foreground",
                      )}
                    />
                  )}
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-medium">{item.label}</span>
                      {item.sublabel && (
                        <span className="truncate text-xs text-muted-foreground">
                          {item.sublabel}
                        </span>
                      )}
                    </div>
                    {item.badge && (
                      <Badge
                        variant="outline"
                        className="ml-auto shrink-0 capitalize"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                </button>
              </div>
            )
          })}
        </div>
      )}

      {(messages.length > 0 || expanded) && (
        <div className="flex shrink-0 items-center justify-end px-1 pb-1">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={() => {
                clearMessages()
                setValue("")
                setExpanded(false)
              }}
            >
              <SquarePen className="size-3.5" />
              New chat
            </Button>
          )}
          {expanded && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setExpanded(false)}
            >
              <Minimize2 className="size-3.5" />
            </Button>
          )}
        </div>
      )}

      {chat.isError && (
        <p className="px-4 py-2 text-center text-sm text-destructive">
          Failed to get a response. Try again.
        </p>
      )}

      {/* Input */}
      <ChatInput
        variant="bar"
        value={value}
        onChange={setValue}
        onSend={handleSend}
        disabled={chat.isPending}
        inputRef={inputRef}
        onKeyDown={handleInputKeyDown}
      />
    </div>
  )
}
