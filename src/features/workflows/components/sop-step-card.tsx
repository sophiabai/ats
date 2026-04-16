import { useState, useRef, useEffect } from "react"
import { Hand, Sparkles, Trash2, Waypoints } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { SopStep, SopBranch } from "../types"

const TYPE_CONFIG = {
  action: {
    icon: Sparkles,
    label: "ACTION",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
  },
  decision: {
    icon: Waypoints,
    label: "DECISION",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
  },
  manual: {
    icon: Hand,
    label: "MANUAL STEP",
    color: "text-stone-500 dark:text-stone-400",
    bg: "bg-stone-100 dark:bg-stone-800/40",
  },
}

interface SopStepCardProps {
  step: SopStep
  onUpdate: (patch: Partial<SopStep>) => void
  onRemove: () => void
}

function EditableText({
  value,
  onChange,
  className,
}: {
  value: string
  onChange: (value: string) => void
  className?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus()
      ref.current.style.height = "auto"
      ref.current.style.height = `${ref.current.scrollHeight}px`
    }
  }, [editing])

  function commit() {
    setEditing(false)
    const trimmed = draft.trim()
    if (trimmed && trimmed !== value) onChange(trimmed)
    else setDraft(value)
  }

  if (editing) {
    return (
      <textarea
        ref={ref}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value)
          e.target.style.height = "auto"
          e.target.style.height = `${e.target.scrollHeight}px`
        }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            commit()
          }
          if (e.key === "Escape") {
            setDraft(value)
            setEditing(false)
          }
        }}
        className={cn(
          "w-full resize-none rounded-md border bg-transparent px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-ring/50",
          className,
        )}
      />
    )
  }

  return (
    <p
      onClick={() => {
        setDraft(value)
        setEditing(true)
      }}
      className={cn(
        "cursor-text rounded-md px-2 py-1 text-sm transition-colors hover:bg-accent",
        className,
      )}
    >
      {value}
    </p>
  )
}

function BranchCard({
  branch,
  typeColor,
  onUpdate,
}: {
  branch: SopBranch
  typeColor: string
  onUpdate: (patch: Partial<SopBranch>) => void
}) {
  return (
    <div className="ml-6 mt-3 rounded-lg border-l-3 border-l-amber-400 bg-amber-50/50 px-4 py-3 dark:border-l-amber-500 dark:bg-amber-950/20">
      <p className={cn("mb-1 text-xs font-semibold", typeColor)}>
        <Waypoints className="mr-1 inline size-3" />
        {branch.label}
      </p>
      <EditableText
        value={branch.description}
        onChange={(description) => onUpdate({ description })}
        className="text-muted-foreground"
      />
    </div>
  )
}

export function SopStepCard({ step, onUpdate, onRemove }: SopStepCardProps) {
  const config = TYPE_CONFIG[step.type]
  const Icon = config.icon

  return (
    <div className="group relative rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">
          Step {step.stepNumber}
        </span>
        <Button
          variant="ghost"
          size="icon-xs"
          className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
          onClick={onRemove}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
      <div className="mb-2">
        <span className={cn("flex items-center gap-1 text-xs font-semibold tracking-wide", config.color)}>
          <Icon className="size-3.5" />
          {config.label}
        </span>
      </div>

      <EditableText
        value={step.description}
        onChange={(description) => onUpdate({ description })}
      />

      {step.branches?.map((branch, idx) => (
        <BranchCard
          key={idx}
          branch={branch}
          typeColor={config.color}
          onUpdate={(patch) => {
            const newBranches = [...(step.branches ?? [])]
            newBranches[idx] = { ...newBranches[idx], ...patch }
            onUpdate({ branches: newBranches })
          }}
        />
      ))}
    </div>
  )
}
