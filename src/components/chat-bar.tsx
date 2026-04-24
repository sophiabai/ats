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
  PanelRightDashed,
  Sparkles,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChatInput } from "@/features/chat/components/chat-input"
import { MessageBubble } from "@/features/chat/components/message-bubble"
import { MessageSkeleton } from "@/features/chat/components/message-skeleton"
import { useChat } from "@/features/chat/api/use-chat"
import { useChatStore } from "@/features/chat/stores/chat-store"
import { useParseRequisition } from "@/features/requisitions/api/use-parse-requisition"
import { CreateRequisitionDialog } from "@/features/requisitions/components/create-requisition-dialog"
import type { FormState } from "@/features/requisitions/components/create-requisition-dialog"
import type { ChatMessage, ReqDraftFormData } from "@/types"
import { useGlobalSearch } from "@/hooks/use-global-search"
import { useChatBarStore } from "@/stores/chat-bar-store"
import { cn, formatReqTitle } from "@/lib/utils"

const quickActions = [
  "Create req",
  "Summarize candidates",
  "Draft outreach email",
  "Compare applicants",
]

const CREATE_REQ_RE = /^\/?\s*create\s+(?:a\s+)?req(?:uisition)?\s*/i
const SKIP_PHRASES = /^(empty|skip|blank|i'll fill it in|fill it myself)/i

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
  const { open, setOpen, docked, setDocked } = useChatBarStore()
  const [expanded, setExpanded] = useState(false)
  const [value, setValue] = useState("")
  const { messages, addMessage } = useChatStore()
  const chat = useChat()
  const parseReq = useParseRequisition()
  const navigate = useNavigate()
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const searchQuery = expanded ? "" : value
  const { data: searchResults } = useGlobalSearch(searchQuery)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const reqModeRef = useRef(false)
  const [activeCommand, setActiveCommand] = useState<string | null>(null)
  const [reqDialogOpen, setReqDialogOpen] = useState(false)
  const [reqInitialData, setReqInitialData] = useState<Partial<FormState> | undefined>()

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
        label: formatReqTitle(r.req_number, r.title),
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

  // Cmd+K global shortcut — just focus the input
  useEffect(() => {
    function onKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [value])

  // Auto-scroll to latest message
  useEffect(() => {
    if (expanded) bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, chat.isPending, expanded])

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (reqDialogOpen) return
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setExpanded(false)
        setValue("")
      }
    },
    [reqDialogOpen],
  )

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [handleClickOutside])

  function openReqDialog(formData?: ReqDraftFormData) {
    setReqInitialData(formData ? { ...formData } : undefined)
    setReqDialogOpen(true)
  }

  function handleReqParse(allMessages: ChatMessage[]) {
    parseReq.mutate(allMessages, {
      onSuccess: (result) => {
        addMessage({
          role: "assistant",
          content: result.message,
          metadata: { type: "req_draft", formData: result.formData },
        })
      },
      onError: () => {
        addMessage({
          role: "assistant",
          content: "Sorry, I couldn't parse that into a requisition. Could you try describing the role again?",
        })
      },
    })
  }

  function handleSend(content: string) {
    if (chat.isPending || parseReq.isPending) return

    // Active command chip flow (e.g. "/create req" chip is shown)
    if (activeCommand === "Create req") {
      const trimmed = content.trim()
      setValue("")
      setActiveCommand(null)
      reqModeRef.current = true
      if (!expanded) setExpanded(true)

      if (!trimmed || SKIP_PHRASES.test(trimmed)) {
        reqModeRef.current = false
        addMessage({ role: "user" as const, content: "/create req", command: "Create req" })
        addMessage({
          role: "assistant",
          content: "Opening a blank requisition form for you.",
        })
        openReqDialog()
        return
      }

      const userMessage = { role: "user" as const, content: trimmed, command: "Create req" }
      addMessage(userMessage)
      handleReqParse([userMessage])
      return
    }

    if (!content.trim()) return
    const trimmed = content.trim()
    const userMessage = { role: "user" as const, content: trimmed }
    addMessage(userMessage)
    setValue("")
    if (!expanded) setExpanded(true)

    if (reqModeRef.current) {
      if (SKIP_PHRASES.test(trimmed)) {
        reqModeRef.current = false
        addMessage({
          role: "assistant",
          content: "Opening a blank requisition form for you.",
        })
        openReqDialog()
        return
      }
      const updatedMessages = [...messages, userMessage]
      handleReqParse(updatedMessages)
      return
    }

    const createMatch = CREATE_REQ_RE.test(trimmed)
    if (createMatch) {
      setActiveCommand("Create req")
      return
    }

    const updatedMessages = [...messages, userMessage]
    chat.mutate(updatedMessages, {
      onSuccess: (data) => {
        addMessage({ role: "assistant", content: data.content })
      },
    })
  }

  function handleNavigate(to: string) {
    setValue("")
    setExpanded(false)
    if (to !== "#") navigate(to)
  }

  function handleItemSelect(item: DropdownItem) {
    if (item.to) {
      handleNavigate(item.to)
    } else if (item.type === "action") {
      if (item.label === "Create req") {
        setValue("")
        setActiveCommand("Create req")
      } else {
        handleSend(item.label)
      }
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
        setSelectedIndex((i) => Math.max(i - 1, 0))
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
      } else if (expanded) {
        setExpanded(false)
      } else {
        inputRef.current?.blur()
      }
    }
  }

  const hasOverlay = showDropdown || expanded || chat.isError

  return (
  <>
    <div ref={containerRef} className="relative w-80">
      <ChatInput
        variant="nav"
        value={value}
        onChange={setValue}
        onSend={handleSend}
        disabled={chat.isPending || parseReq.isPending}
        inputRef={inputRef}
        onKeyDown={handleInputKeyDown}
        activeCommand={activeCommand}
        onClearCommand={() => setActiveCommand(null)}
      />

      {hasOverlay && (
        <div className="absolute left-1/2 top-full z-50 mt-2 flex w-[600px] -translate-x-1/2 flex-col">
          {chat.isError && (
            <p className="px-5 py-2 text-center text-sm text-destructive">
              Failed to get a response. Try again.
            </p>
          )}

          {showDropdown && !expanded && (
            <div className="max-h-[300px] overflow-y-auto rounded-xl border bg-popover px-4 py-2 shadow-lg">
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
                      <div className="py-1.5 text-xs font-medium text-muted-foreground">
                        {GROUP_LABELS[item.type]}
                      </div>
                    )}
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-colors",
                        idx === selectedIndex
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent/50",
                      )}
                      onClick={() => handleItemSelect(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                    >
                      {item.type !== "action" && (
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
                          <span className="truncate font-medium">
                            {item.type === "action" ? `/${item.label}` : item.label}
                          </span>
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
                        {idx === selectedIndex && (
                          <kbd className="ml-auto shrink-0 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                            Enter
                          </kbd>
                        )}
                      </div>
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {expanded && !docked && (
            <div className="flex max-h-[50vh] flex-col rounded-xl border bg-popover shadow-lg">
              <div className="flex shrink-0 items-center justify-end gap-1 border-b px-4 py-4">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => {
                    setExpanded(false)
                    setDocked(true)
                  }}
                  title="Open as side panel"
                >
                  <PanelRightDashed className="size-3.5" />
                </Button>
              </div>
              <div className="overflow-y-auto px-6 py-6">
                {messages.length === 0 && !chat.isPending ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    Send a message to start a conversation.
                  </p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {messages.map((msg, idx) => (
                      <MessageBubble
                        key={idx}
                        message={msg}
                        onOpenReqDraft={openReqDialog}
                      />
                    ))}
                    {(chat.isPending || parseReq.isPending) && <MessageSkeleton />}
                    <div ref={bottomRef} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>

    <CreateRequisitionDialog
      open={reqDialogOpen}
      onOpenChange={setReqDialogOpen}
      initialData={reqInitialData}
      autoGenerate
      onCreated={(id) => {
        setExpanded(false)
        navigate(`/requisitions/${id}`)
      }}
    />
  </>
  )
}
