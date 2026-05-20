import { Check, Loader2, X, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ToolCallLogEntry } from "@/features/scheduling-agent/types";

interface ToolCallCardProps {
  entries: ToolCallLogEntry[];
}

export function ToolCallCard({ entries }: ToolCallCardProps) {
  return (
    <div className="mt-2 space-y-1 rounded-lg border bg-muted/40 px-3 py-2">
      {entries.map((entry) => (
        <ToolCallRow key={entry.id} entry={entry} />
      ))}
    </div>
  );
}

function ToolCallRow({ entry }: { entry: ToolCallLogEntry }) {
  const label =
    entry.summary ?? humanizeName(entry.name) + describeArgs(entry.arguments);

  return (
    <div className="flex items-center gap-2 text-xs">
      <StatusIcon status={entry.status} />
      <Wrench className="size-3 text-muted-foreground" />
      <span
        className={cn(
          "text-muted-foreground",
          entry.status === "error" && "text-destructive",
        )}
      >
        {label}
      </span>
      {entry.error && (
        <span className="text-destructive">— {entry.error}</span>
      )}
    </div>
  );
}

function StatusIcon({ status }: { status: ToolCallLogEntry["status"] }) {
  if (status === "pending")
    return <Loader2 className="size-3 animate-spin text-muted-foreground" />;
  if (status === "success")
    return <Check className="size-3 text-emerald-600" />;
  return <X className="size-3 text-destructive" />;
}

function humanizeName(name: string): string {
  return name.replace(/_/g, " ");
}

function describeArgs(args: Record<string, unknown>): string {
  const keys = Object.keys(args);
  if (keys.length === 0) return "";
  const first = args[keys[0]];
  if (typeof first === "string") return ` — ${first}`;
  return "";
}
