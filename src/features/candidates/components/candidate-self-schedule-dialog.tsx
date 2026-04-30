import { useCallback, useMemo, useState } from "react";
import { CalendarDays, List, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  DEFAULT_SCHEDULE_DETAILS,
  ScheduleDetailsForm,
  type ScheduleDetailsFormValues,
} from "@/features/candidates/components/scheduling/schedule-details-form";
import {
  InterviewPlanCardList,
  type InterviewPlanSession,
} from "@/features/candidates/components/scheduling/interview-plan-card";
import { CandidateDateSlotPicker } from "@/features/candidates/components/scheduling/candidate-date-slot-picker";
import { SchedulingOptionCard } from "@/features/candidates/components/scheduling/scheduling-option-card";
import { InterviewerCalendarGrid } from "@/features/candidates/components/scheduling/interviewer-calendar-grid";
import {
  DEMO_INTERVIEWERS,
  DEMO_SCHEDULE_DATES,
  parseTimeToHour,
  shortDate,
} from "@/features/candidates/components/scheduling/scheduling-demo-data";
import type {
  CalendarEvent,
  ScheduleDateOption,
} from "@/features/candidates/components/scheduling/scheduling-types";

const DAY_LONG = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Parses slot labels like "9:00 am", "10:30 am", "1:00 pm" → numeric hour.
function parseSlotTimeToHour(time: string): number | null {
  const m = time.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (!m) return null;
  let h = parseInt(m[1]);
  const min = m[2] ? parseInt(m[2]) : 0;
  const period = m[3].toLowerCase();
  if (period === "pm" && h !== 12) h += 12;
  if (period === "am" && h === 12) h = 0;
  return h + min / 60;
}

function formatHourLabel(h: number): string {
  const hour = Math.floor(h);
  const min = Math.round((h - hour) * 60);
  const period = hour < 12 ? "am" : "pm";
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return min > 0
    ? `${h12}:${String(min).padStart(2, "0")}${period}`
    : `${h12}:00${period}`;
}

/**
 * Synthesises a ScheduleDateOption for the (date, startHour) the candidate
 * previews. Takes the demo template as a starting point and shifts every
 * interview time + interview-type calendar event by the delta so the first
 * session starts at `startHour` on the candidate's chosen `date`.
 */
function deriveScheduleOption(
  date: Date,
  startHour: number,
  template: ScheduleDateOption,
): ScheduleDateOption {
  const firstRaw = template.interviews[0]?.time.split(/[–-]/)[0].trim() ?? "9:00am";
  const templateStart = parseTimeToHour(firstRaw);
  const delta = startHour - templateStart;

  const dateStr = `${DAY_LONG[date.getDay()]}, ${MONTH_LONG[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  const dateShort = `${DAY_SHORT[date.getDay()]}, ${MONTH_LONG[date.getMonth()].slice(0, 3)} ${date.getDate()}`;

  const interviews = template.interviews.map((iv) => {
    const [rawStart, rawEnd] = iv.time.split(/[–-]/).map((s) => s.trim());
    const start = parseTimeToHour(rawStart) + delta;
    const end = parseTimeToHour(rawEnd) + delta;
    return { ...iv, time: `${formatHourLabel(start)} – ${formatHourLabel(end)}` };
  });

  const calendarEvents: Record<string, CalendarEvent[]> = {};
  for (const [name, events] of Object.entries(template.calendarEvents)) {
    calendarEvents[name] = events.map((ev) =>
      ev.type === "interview"
        ? { ...ev, startHour: ev.startHour + delta }
        : ev,
    );
  }

  return { date: dateStr, dateShort, interviews, calendarEvents };
}

function initEditableInterviews(option: ScheduleDateOption): InterviewPlanSession[] {
  return option.interviews.map((iv) => {
    const parts = iv.time.split(/[–-]/);
    const startHour = parseTimeToHour(parts[0].trim());
    const endHour = parseTimeToHour(parts[1].trim());
    const durationMinutes = Math.round((endHour - startHour) * 60);
    return {
      title: iv.title,
      startHour,
      durationMinutes,
      room: iv.room,
      participants: iv.participants,
    };
  });
}

function SectionCard({
  title,
  subtitle,
  toolbar,
  children,
  className,
}: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {(title || toolbar) && (
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            {title && <h3 className="text-lg font-semibold">{title}</h3>}
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {toolbar}
        </div>
      )}
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Top right: Preview as a candidate
// ---------------------------------------------------------------------------

function PreviewAsCandidate({
  onSelectionChange,
}: {
  onSelectionChange: (sel: { date: Date | null; slotId: string | null }) => void;
}) {
  return (
    <SectionCard
      title="Preview as a candidate"
      subtitle={
        <>
          <span className="text-foreground">
            Total day slots: <strong>8</strong>
          </span>
          <span className="ml-6 text-foreground">
            Total time slots: <strong>40</strong>
          </span>
        </>
      }
      toolbar={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon-sm">
            <RefreshCw className="size-3.5" />
          </Button>
          <Select defaultValue="pacific">
            <SelectTrigger size="sm" className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pacific">Pacific Day Time</SelectItem>
              <SelectItem value="eastern">Eastern Day Time</SelectItem>
              <SelectItem value="london">London</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
    >
      <div className="max-w-[440px] overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <CandidateDateSlotPicker
          compactCalendarHeader
          onSelectionChange={onSelectionChange}
          calendarClassName="flex flex-col flex-1 p-3 border-r border-border"
          slotsClassName="flex w-[132px] shrink-0 flex-col p-3"
        />
      </div>
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
// Bottom right: Schedule details (Candidate won't see this)
// ---------------------------------------------------------------------------

function PrivateScheduleDetails({
  option,
}: {
  option: ScheduleDateOption | null;
}) {
  const [view, setView] = useState<"list" | "calendar">("list");

  return (
    <SectionCard
      title="Schedule details (Candidate won’t see this)"
      toolbar={
        <ToggleGroup
          type="single"
          value={view}
          onValueChange={(v) => {
            if (v) setView(v as "list" | "calendar");
          }}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="list" aria-label="List view">
            <List className="size-3.5" />
          </ToggleGroupItem>
          <ToggleGroupItem value="calendar" aria-label="Calendar view">
            <CalendarDays className="size-3.5" />
          </ToggleGroupItem>
        </ToggleGroup>
      }
    >
      {option === null ? (
        <div className="flex h-[240px] items-center justify-center rounded-2xl border border-dashed border-border bg-card text-center text-sm text-muted-foreground">
          Select a date and time above to preview the schedule the candidate
          would land on.
        </div>
      ) : view === "list" ? (
        <SchedulingOptionCard option={option} variant="static" />
      ) : (
        <div className="flex h-[560px] overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <InterviewerCalendarGrid
            selectedDate={option}
            interviewers={DEMO_INTERVIEWERS}
            className="border-l-0"
          />
        </div>
      )}
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
// Main dialog
// ---------------------------------------------------------------------------

export function CandidateSelfScheduleDialog({
  open,
  onOpenChange,
  candidateName,
  reqTitle,
  onSent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateName: string;
  reqTitle: string;
  onSent?: () => void;
}) {
  const [details, setDetails] = useState<ScheduleDetailsFormValues>(DEFAULT_SCHEDULE_DETAILS);

  const [preview, setPreview] = useState<{ date: Date; startHour: number } | null>(null);

  const previewOption = useMemo(
    () =>
      preview
        ? deriveScheduleOption(preview.date, preview.startHour, DEMO_SCHEDULE_DATES[0])
        : null,
    [preview],
  );

  const selectedPreviewDate = DEMO_SCHEDULE_DATES[0];
  const [editedInterviews, setEditedInterviews] = useState<InterviewPlanSession[]>(
    () => initEditableInterviews(selectedPreviewDate),
  );

  const handleUpdateInterview = useCallback(
    (idx: number, patch: Partial<InterviewPlanSession>) => {
      setEditedInterviews((prev) =>
        prev.map((iv, i) => (i === idx ? { ...iv, ...patch } : iv)),
      );
    },
    [],
  );

  const handleReorderInterviews = useCallback(
    (fromIdx: number, toIdx: number) => {
      setEditedInterviews((prev) => {
        if (
          fromIdx === toIdx ||
          fromIdx < 0 ||
          toIdx < 0 ||
          fromIdx >= prev.length ||
          toIdx >= prev.length
        ) {
          return prev;
        }
        const next = prev.slice();
        const [moved] = next.splice(fromIdx, 1);
        next.splice(toIdx, 0, moved);
        return next;
      });
    },
    [],
  );

  const totalInterviewMinutes = useMemo(
    () => editedInterviews.reduce((s, iv) => s + iv.durationMinutes, 0),
    [editedInterviews],
  );
  const durationLabel = useMemo(() => {
    const hours = Math.floor(totalInterviewMinutes / 60);
    const mins = totalInterviewMinutes % 60;
    if (hours === 0) return `${mins} minutes`;
    if (mins === 0) return `${hours} hour${hours > 1 ? "s" : ""}`;
    return `${hours} hour${hours > 1 ? "s" : ""} ${mins} minutes`;
  }, [totalInterviewMinutes]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[calc(100vh-40px)] w-[calc(100vw-40px)] max-w-none sm:max-w-none flex-col gap-0 overflow-hidden p-0"
      >
        <TooltipProvider delayDuration={200}>
          <DialogTitle className="sr-only">Candidate self-schedule</DialogTitle>
          <DialogDescription className="sr-only">
            Configure the self-schedule link the candidate will receive
          </DialogDescription>

          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-border bg-card px-8 py-4">
            <h2 className="text-lg font-semibold">
              Candidate self-schedule for {candidateName}&nbsp;&mdash;&nbsp;{reqTitle}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          {/* Body — split layout: muted left, white right */}
          <div className="flex min-h-0 flex-1 overflow-hidden">
            {/* Left column */}
            <div className="flex w-1/2 min-w-0 flex-col items-center gap-8 overflow-y-auto bg-muted px-8 py-8">
              <SectionCard title="Schedule details" className="w-full max-w-[460px]">
                <ScheduleDetailsForm
                  values={details}
                  onChange={(patch) => setDetails((prev) => ({ ...prev, ...patch }))}
                  showBreakAndLimits
                />
              </SectionCard>

              <SectionCard
                title="Interview plan"
                subtitle={`Interview duration: ${durationLabel}`}
                className="w-full max-w-[460px]"
              >
                <InterviewPlanCardList
                  interviews={editedInterviews}
                  dateShort={shortDate(selectedPreviewDate.date)}
                  onUpdateInterview={handleUpdateInterview}
                  onReorderInterviews={handleReorderInterviews}
                  hideDateTime
                />
              </SectionCard>
            </div>

            {/* Right column */}
            <div className="flex w-1/2 min-w-0 flex-col gap-8 overflow-y-auto border-l border-border bg-card px-8 py-8">
              <PreviewAsCandidate
                onSelectionChange={({ date, slotId }) => {
                  if (!date || !slotId || slotId.startsWith("multi-")) {
                    setPreview(null);
                    return;
                  }
                  const startHour = parseSlotTimeToHour(slotId);
                  if (startHour === null) {
                    setPreview(null);
                    return;
                  }
                  setPreview({ date, startHour });
                }}
              />
              <PrivateScheduleDetails option={previewOption} />
            </div>
          </div>

          {/* Footer */}
          <div className="flex shrink-0 items-center justify-between border-t border-border bg-card px-8 py-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                onSent?.();
                onOpenChange(false);
              }}
            >
              Send self-schedule link
            </Button>
          </div>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  );
}
