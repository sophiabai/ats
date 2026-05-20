import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ChatHistoryPopover } from "@/features/chat/components/chat-history-popover"
import { ChatInput } from "@/features/chat/components/chat-input"
import { MessageBubble } from "@/features/chat/components/message-bubble"
import { MessageSkeleton } from "@/features/chat/components/message-skeleton"
import { useChatStore } from "@/features/chat/stores/chat-store"
import { useChatBarStore } from "@/stores/chat-bar-store"
import { useSchedulingAgent } from "@/features/scheduling-agent"

export function DockedChatPanel() {
  const { setDocked } = useChatBarStore()
  const { messages, addMessage } = useChatStore()
  const agent = useSchedulingAgent()
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [value, setValue] = useState("")

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, agent.isPending])

  useEffect(() => {
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [])

  function handleSend(content: string) {
    if (agent.isPending) return
    const trimmed = content.trim()
    if (!trimmed) return
    addMessage({ role: "user", content: trimmed })
    setValue("")
    void agent.run(trimmed)
  }

  function handleInputKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Escape") {
      e.preventDefault()
      if (value) setValue("")
      else setDocked(false)
    }
  }

  return (
    <div className="flex h-full w-[380px] shrink-0 flex-col border-l bg-background">
      <div className="flex shrink-0 items-center justify-between px-4 py-3">
        <span className="text-sm font-normal text-foreground">Recruiting coordination agent</span>
        <div className="flex items-center gap-1">
          <ChatHistoryPopover />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setDocked(false)}
            title="Close"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && !agent.isPending ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Send a message to start a conversation.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((msg, idx) => (
              <MessageBubble key={idx} message={msg} />
            ))}
            {agent.isPending && <MessageSkeleton />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {agent.isError && (
        <p className="px-4 py-2 text-center text-sm text-destructive">
          Failed to get a response. Try again.
        </p>
      )}

      <div className="shrink-0 p-3">
        <ChatInput
          variant="bar"
          value={value}
          onChange={setValue}
          onSend={handleSend}
          disabled={agent.isPending}
          inputRef={inputRef}
          onKeyDown={handleInputKeyDown}
        />
      </div>
    </div>
  )
}
