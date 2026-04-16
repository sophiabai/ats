import { useState, useRef, useEffect } from "react"
import { ChevronRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatInput } from "@/features/chat/components/chat-input"
import { cn } from "@/lib/utils"

interface CopilotMessage {
  role: "copilot" | "user"
  content: string
}

const INITIAL_MESSAGE: CopilotMessage = {
  role: "copilot",
  content:
    "I've generated your workflow from the SOP. You can ask me to make changes — like adding steps, modifying conditions, or rewiring connections.",
}

interface CopilotPanelProps {
  collapsed: boolean
  onToggle: () => void
}

export function CopilotPanel({ collapsed, onToggle }: CopilotPanelProps) {
  const [messages, setMessages] = useState<CopilotMessage[]>([INITIAL_MESSAGE])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function handleSend(content: string) {
    setMessages((prev) => [
      ...prev,
      { role: "user", content },
      { role: "copilot", content: "I'll make that change to your workflow. (Copilot actions coming in a future update.)" },
    ])
  }

  return (
    <div
      className={cn(
        "flex h-full shrink-0 flex-col border-l bg-background transition-[width] duration-200 ease-out",
        collapsed ? "w-12" : "w-[320px]",
      )}
    >
      <div className="flex shrink-0 items-center gap-2 border-b px-3 py-3">
        <Button variant="ghost" size="icon-xs" onClick={onToggle}>
          <ChevronRight
            className={cn(
              "size-4 transition-transform duration-200",
              !collapsed && "rotate-180",
            )}
          />
        </Button>
        {!collapsed && (
          <div className="flex items-center gap-1.5">
            <Sparkles className="size-4 text-brand" />
            <span className="text-sm font-medium">AI Copilot</span>
          </div>
        )}
      </div>

      {!collapsed && (
        <>
          <div className="flex-1 overflow-y-auto px-3 py-3">
            <div className="flex flex-col gap-3">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm",
                    msg.role === "copilot"
                      ? "bg-accent text-accent-foreground"
                      : "ml-auto bg-primary text-primary-foreground",
                  )}
                >
                  {msg.role === "copilot" && (
                    <p className="mb-1 flex items-center gap-1 text-xs font-medium text-brand">
                      <Sparkles className="size-3" />
                      Copilot
                    </p>
                  )}
                  <p>{msg.content}</p>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          </div>
          <div className="shrink-0 p-3">
            <ChatInput onSend={handleSend} />
          </div>
        </>
      )}
    </div>
  )
}
