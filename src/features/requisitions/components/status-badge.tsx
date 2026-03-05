import { Badge } from "@/components/ui/badge";
import type { ReqStatus, EmploymentType } from "@/types/database";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<ReqStatus, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "bg-muted text-muted-foreground border-border",
  },
  open: {
    label: "Open",
    className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  },
  on_hold: {
    label: "On hold",
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  },
  closed: {
    label: "Closed",
    className: "bg-muted text-muted-foreground",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-destructive/15 text-destructive",
  },
};

const EMPLOYMENT_LABELS: Record<EmploymentType, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  intern: "Intern",
};

export function StatusBadge({ status }: { status: ReqStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={cn(config.className)}>
      {config.label}
    </Badge>
  );
}

export function EmploymentBadge({ type }: { type: EmploymentType }) {
  return <Badge variant="secondary">{EMPLOYMENT_LABELS[type]}</Badge>;
}
