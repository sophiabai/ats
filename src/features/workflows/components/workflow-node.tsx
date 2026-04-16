import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Hand, Sparkles, Waypoints } from "lucide-react"
import { cn } from "@/lib/utils"
import type { WorkflowNodeData } from "../types"

const TYPE_STYLES = {
  action: {
    icon: Sparkles,
    border: "border-blue-200 dark:border-blue-800",
    iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400",
  },
  decision: {
    icon: Waypoints,
    border: "border-amber-200 dark:border-amber-800",
    iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400",
  },
  manual: {
    icon: Hand,
    border: "border-stone-200 dark:border-stone-700",
    iconBg: "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400",
  },
}

export function WorkflowNode({ data }: NodeProps) {
  const nodeData = data as unknown as WorkflowNodeData
  const style = TYPE_STYLES[nodeData.stepType] ?? TYPE_STYLES.action
  const Icon = style.icon

  return (
    <div
      className={cn(
        "min-w-[180px] max-w-[220px] rounded-xl border bg-card px-4 py-3 shadow-sm",
        style.border,
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-border" />
      <div className="flex items-start gap-2.5">
        <div className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg", style.iconBg)}>
          <Icon className="size-3.5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium leading-tight">{nodeData.label}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{nodeData.subtitle}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-border" />
    </div>
  )
}
