import { useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Pencil,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type InterviewPlanParticipant = {
  name: string;
  avatar?: string;
  conflict?: boolean;
};

export type InterviewPlanSession = {
  title: string;
  startHour: number;
  durationMinutes: number;
  room: string;
  participants: InterviewPlanParticipant[];
};

const TIME_OPTIONS = (() => {
  const opts: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 15, 30, 45]) {
      const hour = h + m / 60;
      opts.push({ value: String(hour), label: formatHour(hour) });
    }
  }
  return opts;
})();

const ROOM_OPTIONS = [
  { value: "SF-15-Bruce(6) [Zoom]", label: "SF-15-Bruce(6) [Zoom]" },
  { value: "SF-12-Reed(4) [Zoom]", label: "SF-12-Reed(4) [Zoom]" },
];

const ALL_INTERVIEWERS = [
  "Leslie Alexander",
  "Javier Ramirez",
  "Jerome Bell",
  "Marvin McKinney",
  "Cameron Williamson",
];

function formatHour(h: number): string {
  const hour = Math.floor(h);
  const min = Math.round((h - hour) * 60);
  const period = hour < 12 ? "AM" : "PM";
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return min > 0 ? `${h12}:${String(min).padStart(2, "0")} ${period}` : `${h12}:00 ${period}`;
}

export function formatHourShort(h: number): string {
  const hour = Math.floor(h);
  const min = Math.round((h - hour) * 60);
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return min > 0 ? `${h12}:${String(min).padStart(2, "0")}` : `${h12}:00`;
}

// ---------------------------------------------------------------------------
// Expanded view — full editable form
// ---------------------------------------------------------------------------

function InterviewPlanCardExpanded({
  interview,
  dateShort,
  onUpdate,
  hideDateTime = false,
  orderIndex,
  totalCount,
  onChangeOrder,
}: {
  interview: InterviewPlanSession;
  dateShort: string;
  onUpdate: (patch: Partial<InterviewPlanSession>) => void;
  hideDateTime?: boolean;
  orderIndex: number;
  totalCount: number;
  onChangeOrder?: (newIndex: number) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {!hideDateTime && (
        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-1">
            <span className="px-1 text-sm font-medium">Date</span>
            <div className="flex h-9 items-center gap-2 rounded-lg border border-input bg-background px-4 shadow-xs">
              <Calendar className="size-4 text-muted-foreground" />
              <span className="text-sm">{dateShort}</span>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <span className="px-1 text-sm font-medium">Time</span>
            <Select
              value={String(interview.startHour)}
              onValueChange={(v) => onUpdate({ startHour: parseFloat(v) })}
            >
              <SelectTrigger className="w-full rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-muted-foreground" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {TIME_OPTIONS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <span className="px-1 text-sm font-medium">Duration</span>
          <Select
            value={String(interview.durationMinutes)}
            onValueChange={(v) => onUpdate({ durationMinutes: parseInt(v) })}
          >
            <SelectTrigger className="w-full rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 min</SelectItem>
              <SelectItem value="30">30 min</SelectItem>
              <SelectItem value="45">45 min</SelectItem>
              <SelectItem value="60">60 min</SelectItem>
              <SelectItem value="90">90 min</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <span className="px-1 text-sm font-medium">Order</span>
          <Select
            value={String(orderIndex)}
            onValueChange={(v) => onChangeOrder?.(parseInt(v))}
            disabled={!onChangeOrder || totalCount <= 1}
          >
            <SelectTrigger className="w-full rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: totalCount }, (_, i) => (
                <SelectItem key={i} value={String(i)}>
                  {i + 1} of {totalCount}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <span className="px-1 text-sm font-medium">Meeting room</span>
          <Select
            value={interview.room}
            onValueChange={(v) => onUpdate({ room: v })}
          >
            <SelectTrigger className="w-full rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROOM_OPTIONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="px-1 text-sm font-medium">Interviewer</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start rounded-lg bg-card font-normal shadow-xs hover:bg-card"
            >
              {interview.participants.length === 0
                ? "Select interviewers"
                : interview.participants.map((p) => p.name).join(", ")}
              <ChevronDown className="ml-auto size-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] p-2"
            align="start"
          >
            {ALL_INTERVIEWERS.map((name) => {
              const checked = interview.participants.some((p) => p.name === name);
              return (
                <label
                  key={name}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(v) => {
                      const next = v
                        ? [...interview.participants, { name }]
                        : interview.participants.filter((p) => p.name !== name);
                      onUpdate({ participants: next });
                    }}
                  />
                  {name}
                </label>
              );
            })}
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-end gap-6">
        <div className="flex flex-col gap-1">
          <span className="px-1 text-sm font-medium">Feedback form</span>
          <div className="flex items-center gap-1">
            <Badge
              variant="secondary"
              className="h-[26px] rounded-md bg-black/10 text-xs font-medium text-primary"
            >
              Default
            </Badge>
            <Button variant="ghost" size="icon" className="size-7">
              <Pencil className="size-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-3 pb-1.5">
          <Checkbox id={`coderpair-${interview.title}`} />
          <label
            htmlFor={`coderpair-${interview.title}`}
            className="text-sm font-medium leading-none"
          >
            Add CoderPair link
          </label>
        </div>
      </div>
    </div>
  );
}

function InterviewPlanCardCollapsed({
  interview,
  dateShort,
  hideDate = false,
}: {
  interview: InterviewPlanSession;
  dateShort: string;
  hideDate?: boolean;
}) {
  const participantLabel =
    interview.participants.length === 0
      ? "No interviewer"
      : interview.participants.map((p) => p.name).join(", ");

  return (
    <p className="text-left text-sm text-muted-foreground">
      {hideDate ? participantLabel : `${dateShort} \u00b7 ${participantLabel}`}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

export function InterviewPlanCard({
  interview,
  dateShort,
  open,
  onOpenChange,
  onUpdate,
  hideDateTime = false,
  orderIndex,
  totalCount,
  onChangeOrder,
}: {
  interview: InterviewPlanSession;
  dateShort: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (patch: Partial<InterviewPlanSession>) => void;
  hideDateTime?: boolean;
  orderIndex: number;
  totalCount: number;
  onChangeOrder?: (newIndex: number) => void;
}) {
  const header = hideDateTime
    ? `${interview.title} (${interview.durationMinutes} min)`
    : `${formatHourShort(interview.startHour)} \u2013 ${interview.title} (${interview.durationMinutes} min)`;

  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <div className="rounded-2xl border border-border bg-card">
        <CollapsibleTrigger className="flex w-full items-center justify-between px-5 py-4">
          {open ? (
            <span className="text-sm font-medium">{header}</span>
          ) : (
            <div className="flex flex-1 flex-col items-start gap-0.5">
              <span className="text-left text-sm font-medium">{header}</span>
              <InterviewPlanCardCollapsed
                interview={interview}
                dateShort={dateShort}
                hideDate={hideDateTime}
              />
            </div>
          )}
          {open ? (
            <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-5 pb-5">
            <InterviewPlanCardExpanded
              interview={interview}
              dateShort={dateShort}
              onUpdate={onUpdate}
              hideDateTime={hideDateTime}
              orderIndex={orderIndex}
              totalCount={totalCount}
              onChangeOrder={onChangeOrder}
            />
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// ---------------------------------------------------------------------------
// List wrapper — manages expand/collapse state for multiple cards
// ---------------------------------------------------------------------------

export function InterviewPlanCardList({
  interviews,
  dateShort,
  onUpdateInterview,
  defaultExpandedIndex = 0,
  hideDateTime = false,
  onReorderInterviews,
}: {
  interviews: InterviewPlanSession[];
  dateShort: string;
  onUpdateInterview: (idx: number, patch: Partial<InterviewPlanSession>) => void;
  defaultExpandedIndex?: number;
  hideDateTime?: boolean;
  onReorderInterviews?: (fromIdx: number, toIdx: number) => void;
}) {
  const [expanded, setExpanded] = useState<Set<number>>(
    () => new Set([defaultExpandedIndex]),
  );

  function toggle(idx: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {interviews.map((interview, i) => (
        <InterviewPlanCard
          key={i}
          interview={interview}
          dateShort={dateShort}
          open={expanded.has(i)}
          onOpenChange={() => toggle(i)}
          onUpdate={(patch) => onUpdateInterview(i, patch)}
          hideDateTime={hideDateTime}
          orderIndex={i}
          totalCount={interviews.length}
          onChangeOrder={
            onReorderInterviews
              ? (to) => onReorderInterviews(i, to)
              : undefined
          }
        />
      ))}
    </div>
  );
}
