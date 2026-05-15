import { useState, type ReactNode } from "react"
import {
  ChevronDown,
  Cloud,
  ExternalLink,
  ImageIcon,
  Link2,
  Lock,
  Minus,
  MoreHorizontal,
  Paperclip,
  PenLine,
  Smile,
  Sparkles,
  SquarePen,
  Trash2,
  Type,
  UserPlus,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

function FieldRow({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex min-h-11 items-center gap-3 border-b border-border px-3 py-1.5",
        className,
      )}
    >
      <span className="w-14 shrink-0 text-sm text-muted-foreground">
        {label}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

const DECORATION_ACTIONS: {
  icon: typeof Sparkles
  label: string
  message: string
}[] = [
  { icon: Sparkles, label: "Assist", message: "Assist is a demo" },
  { icon: Type, label: "Formatting", message: "Formatting is a demo" },
  {
    icon: PenLine,
    label: "Compose tools",
    message: "Compose tools is a demo",
  },
  {
    icon: Paperclip,
    label: "Attach files",
    message: "Attachments are a demo",
  },
  { icon: Link2, label: "Insert link", message: "Insert link is a demo" },
  { icon: Smile, label: "Emoji", message: "Emoji is a demo" },
  { icon: Cloud, label: "Insert from drive", message: "Drive is a demo" },
  { icon: ImageIcon, label: "Insert photo", message: "Photos are a demo" },
  {
    icon: Lock,
    label: "Confidential mode",
    message: "Confidential mode is a demo",
  },
  {
    icon: SquarePen,
    label: "Signatures",
    message: "Signatures are fixed in this demo",
  },
  {
    icon: MoreHorizontal,
    label: "More options",
    message: "More options is a demo",
  },
]

export type GmailStyleEmailComposerProps = {
  className?: string
  title?: string
  /** Minimize, pop-out, and close in the title bar */
  showWindowControls?: boolean
  onMinimize?: () => void
  onPopOut?: () => void
  onClose?: () => void
  /** Rendered under the title bar (e.g. template picker) */
  headerAccessory?: ReactNode
  /**
   * Custom “To” row. When set, the built-in To/Cc/Bcc/recipient controls are omitted
   * (scheduling composer uses a recipient chip row instead).
   */
  toArea?: ReactNode
  /** Simple To field; ignored when `toArea` is set */
  toValue?: string
  onToChange?: (value: string) => void
  showCcBcc?: boolean
  /** Subject row */
  showSubject?: boolean
  subject?: string
  onSubjectChange?: (value: string) => void
  /** Main body (textarea, rich editor column, etc.) */
  children: ReactNode
  /**
   * Replaces the default bottom strip (Send, decoration toolbar, discard).
   * Use for scheduling flows where send lives in a parent dialog footer.
   */
  footerSlot?: ReactNode
  showSend?: boolean
  showSendOptions?: boolean
  onSend?: () => void
  sendOptions?: { label: string; onSelect: () => void }[]
  showDecorationToolbar?: boolean
  showDiscard?: boolean
  onDiscard?: () => void
  /** When using the default discard button, reset simple fields to these values */
  discardReset?: {
    to?: string
    subject?: string
    onResetBody?: () => void
  }
}

export function GmailStyleEmailComposer({
  className,
  title = "New message",
  showWindowControls = true,
  onMinimize,
  onPopOut,
  onClose,
  headerAccessory,
  toArea,
  toValue = "",
  onToChange,
  showCcBcc = true,
  showSubject = true,
  subject = "",
  onSubjectChange,
  children,
  footerSlot,
  showSend = true,
  showSendOptions = true,
  onSend,
  sendOptions = [
    {
      label: "Schedule send",
      onSelect: () =>
        toast.message("Schedule send is not wired in the demo"),
    },
    {
      label: "Send later",
      onSelect: () => toast.message("Send later is not wired in the demo"),
    },
  ],
  showDecorationToolbar = true,
  showDiscard = true,
  onDiscard,
  discardReset,
}: GmailStyleEmailComposerProps) {
  const [showCc, setShowCc] = useState(false)
  const [showBcc, setShowBcc] = useState(false)
  const [cc, setCc] = useState("")
  const [bcc, setBcc] = useState("")

  const handleMinimize = () => {
    if (onMinimize) onMinimize()
    else toast.message("Minimize is a demo control")
  }
  const handlePopOut = () => {
    if (onPopOut) onPopOut()
    else toast.message("Pop-out is a demo control")
  }

  const defaultSend = () => {
    if (onSend) onSend()
    else toast.success("Send is a demo — message not delivered")
  }

  const defaultDiscard = () => {
    if (onDiscard) {
      onDiscard()
      return
    }
    onToChange?.(discardReset?.to ?? "")
    onSubjectChange?.(discardReset?.subject ?? "")
    setCc("")
    setBcc("")
    setShowCc(false)
    setShowBcc(false)
    discardReset?.onResetBody?.()
    toast.message("Draft discarded")
  }

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xl",
        className,
      )}
      role="group"
      aria-label={title}
    >
      {showWindowControls && (
        <header className="flex h-10 shrink-0 items-center justify-between border-b border-border bg-muted/50 px-2 pl-3">
          <span className="text-sm font-medium">{title}</span>
          <div className="flex items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full text-muted-foreground"
                  onClick={handleMinimize}
                >
                  <Minus className="size-4" />
                  <span className="sr-only">Minimize</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Minimize</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full text-muted-foreground"
                  onClick={handlePopOut}
                >
                  <ExternalLink className="size-4" />
                  <span className="sr-only">Pop out</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Pop out</TooltipContent>
            </Tooltip>
            {onClose && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="rounded-full text-muted-foreground"
                    onClick={onClose}
                  >
                    <X className="size-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Close</TooltipContent>
              </Tooltip>
            )}
          </div>
        </header>
      )}

      {headerAccessory ? (
        <div className="border-b border-border bg-muted/20 px-3 py-2">
          {headerAccessory}
        </div>
      ) : null}

      {toArea ? (
        <div className="border-b border-border">{toArea}</div>
      ) : (
        <>
          <FieldRow label="To">
            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={toValue}
                onChange={(e) => onToChange?.(e.target.value)}
                placeholder="Recipients"
                className="h-8 min-w-[12rem] flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
              {showCcBcc && (
                <div className="ml-auto flex items-center gap-1">
                  {!showCc && (
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="h-7 px-2 text-xs text-muted-foreground"
                      onClick={() => setShowCc(true)}
                    >
                      Cc
                    </Button>
                  )}
                  {!showBcc && (
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="h-7 px-2 text-xs text-muted-foreground"
                      onClick={() => setShowBcc(true)}
                    >
                      Bcc
                    </Button>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground"
                        onClick={() =>
                          toast.message("Contacts picker is a demo")
                        }
                      >
                        <UserPlus className="size-4" />
                        <span className="sr-only">Add recipients</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add recipients</TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>
          </FieldRow>
          {showCc && (
            <FieldRow label="Cc">
              <Input
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                placeholder="Cc"
                className="h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
            </FieldRow>
          )}
          {showBcc && (
            <FieldRow label="Bcc">
              <Input
                value={bcc}
                onChange={(e) => setBcc(e.target.value)}
                placeholder="Bcc"
                className="h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
            </FieldRow>
          )}
        </>
      )}

      {showSubject && onSubjectChange && (
        <FieldRow label="Subject">
          <Input
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            placeholder="Subject"
            className="h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
        </FieldRow>
      )}

      <div className="flex min-h-0 flex-1 flex-col">{children}</div>

      {footerSlot ? (
        footerSlot
      ) : (
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/15 px-2 py-2">
          <div className="flex flex-wrap items-center gap-2">
            {showSend && (
              <div className="inline-flex rounded-md shadow-xs">
                <Button
                  type="button"
                  className="rounded-r-none pr-5"
                  onClick={defaultSend}
                >
                  Send
                </Button>
                {showSendOptions && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="default"
                        className="rounded-l-none border-l border-primary-foreground/25 px-2"
                        aria-label="Send options"
                      >
                        <ChevronDown className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {sendOptions.map((opt) => (
                        <DropdownMenuItem
                          key={opt.label}
                          onClick={opt.onSelect}
                        >
                          {opt.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )}

            {showSend && showDecorationToolbar && (
              <Separator
                orientation="vertical"
                className="hidden h-6 sm:block"
              />
            )}

            {showDecorationToolbar && (
              <div className="flex flex-wrap items-center gap-0.5">
                {DECORATION_ACTIONS.map(({ icon: Icon, label, message }) => (
                  <Tooltip key={label}>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground"
                        onClick={() => toast.message(message)}
                      >
                        <Icon className="size-4" />
                        <span className="sr-only">{label}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{label}</TooltipContent>
                  </Tooltip>
                ))}
              </div>
            )}
          </div>

          {showDiscard && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground"
                  onClick={defaultDiscard}
                >
                  <Trash2 className="size-4" />
                  <span className="sr-only">Discard draft</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Discard draft</TooltipContent>
            </Tooltip>
          )}
        </footer>
      )}
    </div>
  )
}
