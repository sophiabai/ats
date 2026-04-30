import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type {
  CalendarEvent,
  Interviewer,
  ScheduleDateOption,
} from "./scheduling-types";

const SLOT_HEIGHT = 56;
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7, 8];
const BASE_UTC_OFFSET = -7;
const BUSINESS_START = 9;
const BUSINESS_END = 17;

const HATCH_BG =
  "repeating-linear-gradient(135deg, transparent, transparent 4px, rgba(0,0,0,0.07) 4px, rgba(0,0,0,0.07) 5px)";

function hourToSlotIndex(hour: number): number {
  if (hour >= HOURS[0]) return hour - HOURS[0];
  return hour + 24 - HOURS[0];
}

function getNonBusinessRegions(
  utcOffset: number,
  bizStart = BUSINESS_START,
  bizEnd = BUSINESS_END,
): { topPx: number; heightPx: number }[] {
  const diff = utcOffset - BASE_UTC_OFFSET;
  const displayedHours = HOURS.slice(0, -1);
  const regions: { topPx: number; heightPx: number }[] = [];
  let regionStart: number | null = null;

  for (let i = 0; i < displayedHours.length; i++) {
    const h = displayedHours[i];
    const localH = (((h + diff) % 24) + 24) % 24;
    const isNonBusiness =
      bizEnd <= 24
        ? localH < bizStart || localH >= bizEnd
        : localH < bizStart && localH >= bizEnd % 24;

    if (isNonBusiness && regionStart === null) {
      regionStart = i;
    } else if (!isNonBusiness && regionStart !== null) {
      regions.push({
        topPx: regionStart * SLOT_HEIGHT,
        heightPx: (i - regionStart) * SLOT_HEIGHT,
      });
      regionStart = null;
    }
  }
  if (regionStart !== null) {
    regions.push({
      topPx: regionStart * SLOT_HEIGHT,
      heightPx: (displayedHours.length - regionStart) * SLOT_HEIGHT,
    });
  }
  return regions;
}

function EventBlock({ event }: { event: CalendarEvent }) {
  const topPx = hourToSlotIndex(event.startHour) * SLOT_HEIGHT;
  const heightPx = event.durationHours * SLOT_HEIGHT;
  return (
    <div
      className={cn(
        "absolute inset-x-px z-10 flex items-center overflow-hidden rounded-md border px-1.5",
        event.type === "interview"
          ? "border-blue-300 bg-blue-500/20"
          : event.type === "conflict"
            ? "border-destructive/30 bg-destructive/10"
            : "border-transparent bg-muted",
      )}
      style={{ top: topPx + 1, height: heightPx - 2 }}
    >
      <span
        className={cn(
          "block truncate text-xs leading-tight",
          event.type === "interview"
            ? "font-medium text-blue-900"
            : event.type === "conflict"
              ? "font-medium text-destructive"
              : "text-muted-foreground",
        )}
      >
        {event.title}
      </span>
    </div>
  );
}

function PersonColumn({
  person,
  events,
}: {
  person: Interviewer;
  events: CalendarEvent[];
}) {
  return (
    <div className="relative flex min-w-[140px] flex-1 flex-col border-r border-border last:border-r-0">
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-2">
        <Avatar className="size-6">
          {person.avatar && <AvatarImage src={person.avatar} />}
          <AvatarFallback className="text-[10px]">
            {person.initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium">{person.name}</p>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="truncate text-[10px] text-muted-foreground">
                {person.location} &middot; {person.timezone}
              </p>
            </TooltipTrigger>
            <TooltipContent>{person.timezoneFull}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="relative" style={{ height: (HOURS.length - 1) * SLOT_HEIGHT }}>
        {getNonBusinessRegions(
          person.utcOffset,
          person.businessStart,
          person.businessEnd,
        ).map((region, i) => (
          <div
            key={i}
            className="absolute inset-x-0"
            style={{
              top: region.topPx,
              height: region.heightPx,
              backgroundImage: HATCH_BG,
            }}
          />
        ))}
        {HOURS.slice(0, -1).map((_, i) => (
          <div
            key={i}
            className="absolute z-[1] w-full border-b border-border/50"
            style={{ top: (i + 1) * SLOT_HEIGHT }}
          />
        ))}
        {events.map((event, i) => (
          <EventBlock key={i} event={event} />
        ))}
      </div>
    </div>
  );
}

function TimezoneColumn({
  label,
  fullLabel,
  utcOffset,
}: {
  label: string;
  fullLabel: string;
  utcOffset: number;
}) {
  return (
    <div className="flex w-[68px] shrink-0 flex-col border-r border-border">
      <div className="flex h-14 shrink-0 items-end justify-end border-b border-border pb-1 pr-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-default text-xs text-muted-foreground">{label}</span>
          </TooltipTrigger>
          <TooltipContent>{fullLabel}</TooltipContent>
        </Tooltip>
      </div>
      <div style={{ height: (HOURS.length - 1) * SLOT_HEIGHT }}>
        {HOURS.slice(0, -1).map((h, i) => {
          const diff = utcOffset - BASE_UTC_OFFSET;
          const localH = (((h + diff) % 24) + 24) % 24;
          const mins = diff % 1 !== 0 ? Math.round((localH % 1) * 60) : 0;
          const hour = Math.floor(localH);
          const suffix = hour < 12 ? "am" : "pm";
          const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
          const formatted =
            mins > 0 ? `${h12}:${String(mins).padStart(2, "0")}${suffix}` : `${h12}${suffix}`;
          return (
            <div
              key={i}
              className="flex items-start justify-end pr-1 pt-0.5"
              style={{ height: SLOT_HEIGHT }}
            >
              <span className="text-xs text-muted-foreground">{formatted}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function InterviewerCalendarGrid({
  selectedDate,
  interviewers,
  calendarEvents,
  onPrev,
  onNext,
  showHeader = true,
  className,
}: {
  selectedDate: ScheduleDateOption;
  interviewers: Interviewer[];
  calendarEvents?: Record<string, CalendarEvent[]>;
  onPrev?: () => void;
  onNext?: () => void;
  showHeader?: boolean;
  className?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const events = calendarEvents ?? selectedDate.calendarEvents;

  return (
    <div
      className={cn(
        "flex flex-1 flex-col overflow-hidden border-l border-border bg-card",
        className,
      )}
    >
      {showHeader && (
        <div className="flex items-center gap-2 px-4 py-3">
          <span className="flex-1 text-lg font-semibold text-foreground">
            {selectedDate.date}
          </span>
          <Select defaultValue="pdt">
            <SelectTrigger size="sm" className="!h-7 w-[212px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdt">PDT America/Los Angeles</SelectItem>
              <SelectItem value="ist">IST Asia/Kolkata</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center rounded-lg border shadow-xs">
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-r-none border-r"
              onClick={onPrev}
              disabled={!onPrev}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="ghost"
              className="h-7 gap-0.5 rounded-l-none px-2 text-xs"
              onClick={onNext}
              disabled={!onNext}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex flex-1 overflow-auto">
        <TimezoneColumn label="IST" fullLabel="IST Asia/Kolkata" utcOffset={5.5} />
        <TimezoneColumn label="PDT" fullLabel="PDT America/Los Angeles" utcOffset={-7} />

        {[...interviewers]
          .sort((a, b) => {
            const isACandidate = a.name.startsWith("Candidate");
            const isBCandidate = b.name.startsWith("Candidate");
            if (isACandidate) return -1;
            if (isBCandidate) return 1;
            const aFirst = (events[a.name] ?? [])
              .filter((e) => e.type === "interview")
              .reduce((min, e) => Math.min(min, e.startHour), Infinity);
            const bFirst = (events[b.name] ?? [])
              .filter((e) => e.type === "interview")
              .reduce((min, e) => Math.min(min, e.startHour), Infinity);
            return aFirst - bFirst;
          })
          .map((person) => (
            <PersonColumn
              key={person.name}
              person={person}
              events={events[person.name] ?? []}
            />
          ))}
      </div>
    </div>
  );
}
