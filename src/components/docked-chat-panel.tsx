import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import { useNavigate } from "react-router"
import { X } from "lucide-react"

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
import { useChatBarStore } from "@/stores/chat-bar-store"
import {
  EMAIL_INTENT_RE,
  useEmailIntent,
} from "@/features/chat/hooks/use-email-intent"

const CREATE_REQ_RE = /^\/?\s*create\s+(?:a\s+)?req(?:uisition)?\s*/i
const SKIP_PHRASES = /^(empty|skip|blank|i'll fill it in|fill it myself)/i

export function DockedChatPanel() {
  const { setDocked } = useChatBarStore()

  const { messages, addMessage } = useChatStore()
  const chat = useChat()
  const parseReq = useParseRequisition()
  const { handleEmailIntent, isPending: isDraftingEmail } = useEmailIntent()
  const navigate = useNavigate()
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const reqModeRef = useRef(false)
  const [value, setValue] = useState("")
  const [activeCommand, setActiveCommand] = useState<string | null>(null)
  const [reqDialogOpen, setReqDialogOpen] = useState(false)
  const [reqInitialData, setReqInitialData] = useState<Partial<FormState> | undefined>()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, chat.isPending])

  useEffect(() => {
    requestAnimationFrame(() => inputRef.current?.focus())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
          content:
            "Sorry, I couldn't parse that into a requisition. Could you try describing the role again?",
        })
      },
    })
  }

  function handleSend(content: string) {
    if (chat.isPending || parseReq.isPending || isDraftingEmail) return

    if (activeCommand === "Create req") {
      const trimmed = content.trim()
      setValue("")
      setActiveCommand(null)
      reqModeRef.current = true

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

    if (CREATE_REQ_RE.test(trimmed)) {
      setActiveCommand("Create req")
      return
    }

    if (EMAIL_INTENT_RE.test(trimmed)) {
      void handleEmailIntent(trimmed)
      return
    }

    const updatedMessages = [...messages, userMessage]
    chat.mutate(updatedMessages, {
      onSuccess: (data) => {
        addMessage({ role: "assistant", content: data.content })
      },
    })
  }

  function handleInputKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Escape") {
      e.preventDefault()
      if (value) {
        setValue("")
      } else {
        setDocked(false)
      }
    }
  }

  return (
    <>
      <div className="flex h-full w-[380px] shrink-0 flex-col border-l bg-background">
        <div className="flex shrink-0 items-center justify-between px-4 py-3">
          <span className="text-sm font-normal text-foreground">Chat</span>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setDocked(false)}
            title="Close"
          >
            <X className="size-3.5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
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
              {(chat.isPending || parseReq.isPending || isDraftingEmail) && (
                <MessageSkeleton />
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {chat.isError && (
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
            disabled={chat.isPending || parseReq.isPending || isDraftingEmail}
            inputRef={inputRef}
            onKeyDown={handleInputKeyDown}
            activeCommand={activeCommand}
            onClearCommand={() => setActiveCommand(null)}
          />
        </div>
      </div>

      <CreateRequisitionDialog
        open={reqDialogOpen}
        onOpenChange={setReqDialogOpen}
        initialData={reqInitialData}
        autoGenerate
        onCreated={(id) => {
          navigate(`/requisitions/${id}`)
        }}
      />
    </>
  )
}
