import { useState, useRef } from "react"
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Pencil,
  X,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Interviewer = {
  name: string
  initials: string
  location: string
  timezone: string
  timezoneFull: string
  utcOffset: number
  businessStart?: number
  businessEnd?: number
  avatar?: string
}

type CalendarEvent = {
  title: string
  startHour: number
  durationHours: number
  type: "interview" | "busy" | "conflict"
}

type InterviewSlot = {
  time: string
  title: string
  participants: { name: string; avatar?: string; conflict?: boolean }[]
  room: string
}

type ScheduleDateOption = {
  date: string
  dateShort: string
  interviews: InterviewSlot[]
  calendarEvents: Record<string, CalendarEvent[]>
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SLOT_HEIGHT = 56
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7, 8]
const BASE_UTC_OFFSET = -7 // PT (calendar base timezone)

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const BUSINESS_START = 9
const BUSINESS_END = 17

const INTERVIEWERS: Interviewer[] = [
  { name: "Candidate (Andy…)", initials: "AS", location: "San Francisco", timezone: "PDT", timezoneFull: "PDT America/Los Angeles", utcOffset: -7 },
  { name: "Leslie Alexander", initials: "LA", location: "San Francisco", timezone: "PDT", timezoneFull: "PDT America/Los Angeles", utcOffset: -7 },
  { name: "Javier Ramirez", initials: "JR", location: "San Francisco", timezone: "PDT", timezoneFull: "PDT America/Los Angeles", utcOffset: -7 },
  { name: "Jerome Bell", initials: "JB", location: "Bangalore", timezone: "IST", timezoneFull: "IST Asia/Kolkata", utcOffset: 5.5, businessStart: 12, businessEnd: 24 },
  { name: "Marvin McKinney", initials: "MM", location: "Bangalore", timezone: "IST", timezoneFull: "IST Asia/Kolkata", utcOffset: 5.5, businessStart: 12, businessEnd: 24 },
]

const SCHEDULE_DATES: ScheduleDateOption[] = [
  {
    date: "Monday, May 5, 2025",
    dateShort: "Mon, May 5",
    interviews: [
      {
        time: "9:00am – 10:00am",
        title: "System Design",
        participants: [{ name: "Jerome Bell" }, { name: "Marvin McKinney" }],
        room: "SF-15-Bruce(6) [Zoom]",
      },
      {
        time: "10:00am – 10:45am",
        title: "Algorithms and Data Structures",
        participants: [{ name: "Javier Ramirez" }],
        room: "SF-15-Bruce(6) [Zoom]",
      },
      {
        time: "10:45am – 11:00am",
        title: "Break",
        participants: [],
        room: "SF-15-Bruce(6) [Zoom]",
      },
      {
        time: "11:00am – 11:30am",
        title: "Culture Fit",
        participants: [{ name: "Cameron Williamson" }],
        room: "SF-15-Bruce(6) [Zoom]",
      },
      {
        time: "11:30am – 12:00pm",
        title: "Hiring Manager Close-up",
        participants: [{ name: "Leslie Alexander" }],
        room: "SF-15-Bruce(6) [Zoom]",
      },
    ],
    calendarEvents: {
      "Candidate (Andy…)": [
        { title: "9am, System Design", startHour: 9, durationHours: 1, type: "interview" },
        { title: "10am, Algorithms…", startHour: 10, durationHours: 0.75, type: "interview" },
        { title: "Break", startHour: 10.75, durationHours: 0.25, type: "interview" },
        { title: "11am, Culture Fit", startHour: 11, durationHours: 0.5, type: "interview" },
        { title: "11:30, Hiring Mgr", startHour: 11.5, durationHours: 0.5, type: "interview" },
      ],
      "Leslie Alexander": [
        { title: "Team Meeting", startHour: 8, durationHours: 0.5, type: "busy" },
        { title: "Focus Group", startHour: 8.5, durationHours: 0.5, type: "busy" },
        { title: "Product Demo", startHour: 10, durationHours: 0.5, type: "busy" },
        { title: "11:30, Hiring Mgr", startHour: 11.5, durationHours: 0.5, type: "interview" },
        { title: "Planning Session", startHour: 12.5, durationHours: 0.5, type: "busy" },
        { title: "1:1 weekly", startHour: 13, durationHours: 0.5, type: "busy" },
        { title: "Interview", startHour: 14, durationHours: 0.5, type: "busy" },
        { title: "Client Call", startHour: 14.5, durationHours: 0.5, type: "busy" },
      ],
      "Javier Ramirez": [
        { title: "User Interview", startHour: 8, durationHours: 0.75, type: "busy" },
        { title: "10am, Algorithms", startHour: 10, durationHours: 0.75, type: "interview" },
        { title: "Design Review", startHour: 11, durationHours: 0.5, type: "busy" },
        { title: "Product Demo", startHour: 12, durationHours: 0.5, type: "busy" },
      ],
      "Jerome Bell": [
        { title: "9am, System Design", startHour: 9, durationHours: 1, type: "interview" },
        { title: "Client Meeting", startHour: 10.5, durationHours: 0.5, type: "busy" },
        { title: "Team Sync", startHour: 12, durationHours: 0.5, type: "busy" },
      ],
      "Marvin McKinney": [
        { title: "9am, System Design", startHour: 9, durationHours: 1, type: "interview" },
        { title: "Morning Sync", startHour: 11, durationHours: 0.5, type: "busy" },
        { title: "All Hands", startHour: 14, durationHours: 1, type: "busy" },
      ],
    },
  },
  {
    date: "Tuesday, May 6, 2025",
    dateShort: "Tue, May 6",
    interviews: [
      {
        time: "9:00am – 10:00am",
        title: "System Design",
        participants: [{ name: "Jerome Bell" }, { name: "Marvin McKinney" }],
        room: "SF-15-Bruce(6) [Zoom]",
      },
      {
        time: "10:00am – 10:45am",
        title: "Algorithms and Data Structures",
        participants: [{ name: "Javier Ramirez", conflict: true }],
        room: "SF-15-Bruce(6) [Zoom]",
      },
      {
        time: "10:45am – 11:00am",
        title: "Break",
        participants: [],
        room: "SF-12-Reed(4) [Zoom]",
      },
      {
        time: "11:00am – 11:30am",
        title: "Culture Fit",
        participants: [{ name: "Cameron Williamson" }],
        room: "SF-12-Reed(4) [Zoom]",
      },
      {
        time: "11:30am – 12:00pm",
        title: "Hiring Manager Close-up",
        participants: [{ name: "Leslie Alexander" }],
        room: "SF-12-Reed(4) [Zoom]",
      },
    ],
    calendarEvents: {
      "Candidate (Andy…)": [
        { title: "9am, System Design", startHour: 9, durationHours: 1, type: "interview" },
        { title: "10am, Algorithms…", startHour: 10, durationHours: 0.75, type: "interview" },
        { title: "Break", startHour: 10.75, durationHours: 0.25, type: "interview" },
        { title: "11am, Culture Fit", startHour: 11, durationHours: 0.5, type: "interview" },
        { title: "11:30, Hiring Mgr", startHour: 11.5, durationHours: 0.5, type: "interview" },
      ],
      "Leslie Alexander": [
        { title: "Standup", startHour: 8.5, durationHours: 0.25, type: "busy" },
        { title: "Design Sync", startHour: 10, durationHours: 0.5, type: "busy" },
        { title: "11:30, Hiring Mgr", startHour: 11.5, durationHours: 0.5, type: "interview" },
        { title: "Lunch w/ Team", startHour: 12, durationHours: 1, type: "busy" },
        { title: "Sprint Planning", startHour: 14, durationHours: 1, type: "busy" },
      ],
      "Javier Ramirez": [
        { title: "Eng Sync", startHour: 9.5, durationHours: 1, type: "busy" },
        { title: "10am, Algorithms", startHour: 10, durationHours: 0.75, type: "conflict" },
        { title: "Code Review", startHour: 11, durationHours: 1, type: "busy" },
        { title: "Lunch", startHour: 12, durationHours: 0.5, type: "busy" },
        { title: "1:1 with Manager", startHour: 14, durationHours: 0.5, type: "busy" },
      ],
      "Jerome Bell": [
        { title: "9am, System Design", startHour: 9, durationHours: 1, type: "interview" },
        { title: "Team Lunch", startHour: 12, durationHours: 1, type: "busy" },
        { title: "Architecture Review", startHour: 15, durationHours: 1.5, type: "busy" },
      ],
      "Marvin McKinney": [
        { title: "9am, System Design", startHour: 9, durationHours: 1, type: "interview" },
        { title: "Product Sync", startHour: 10.5, durationHours: 0.5, type: "busy" },
        { title: "All Hands", startHour: 14, durationHours: 1, type: "busy" },
        { title: "Retro", startHour: 16, durationHours: 1, type: "busy" },
      ],
    },
  },
  {
    date: "Wednesday, May 7, 2025",
    dateShort: "Wed, May 7",
    interviews: [
      {
        time: "1:00pm – 2:00pm",
        title: "System Design",
        participants: [{ name: "Jerome Bell" }, { name: "Marvin McKinney" }],
        room: "SF-15-Bruce(6) [Zoom]",
      },
      {
        time: "2:00pm – 2:45pm",
        title: "Algorithms and Data Structures",
        participants: [{ name: "Javier Ramirez" }],
        room: "SF-15-Bruce(6) [Zoom]",
      },
      {
        time: "2:45pm – 3:00pm",
        title: "Break",
        participants: [],
        room: "SF-15-Bruce(6) [Zoom]",
      },
      {
        time: "3:00pm – 3:30pm",
        title: "Culture Fit",
        participants: [{ name: "Cameron Williamson" }],
        room: "SF-15-Bruce(6) [Zoom]",
      },
      {
        time: "3:30pm – 4:00pm",
        title: "Hiring Manager Close-up",
        participants: [{ name: "Leslie Alexander" }],
        room: "SF-15-Bruce(6) [Zoom]",
      },
    ],
    calendarEvents: {
      "Candidate (Andy…)": [
        { title: "1pm, System Design", startHour: 13, durationHours: 1, type: "interview" },
        { title: "2pm, Algorithms…", startHour: 14, durationHours: 0.75, type: "interview" },
        { title: "Break", startHour: 14.75, durationHours: 0.25, type: "interview" },
        { title: "3pm, Culture Fit", startHour: 15, durationHours: 0.5, type: "interview" },
        { title: "3:30, Hiring Mgr", startHour: 15.5, durationHours: 0.5, type: "interview" },
      ],
      "Leslie Alexander": [
        { title: "Standup", startHour: 8.5, durationHours: 0.25, type: "busy" },
        { title: "Design Review", startHour: 9, durationHours: 1, type: "busy" },
        { title: "3:30, Hiring Mgr", startHour: 15.5, durationHours: 0.5, type: "interview" },
        { title: "Backlog Grooming", startHour: 16, durationHours: 1, type: "busy" },
      ],
      "Javier Ramirez": [
        { title: "Feature Demo", startHour: 10, durationHours: 1, type: "busy" },
        { title: "Lunch", startHour: 12, durationHours: 0.5, type: "busy" },
        { title: "2pm, Algorithms", startHour: 14, durationHours: 0.75, type: "interview" },
        { title: "Bug Bash", startHour: 16, durationHours: 1, type: "busy" },
      ],
      "Jerome Bell": [
        { title: "1pm, System Design", startHour: 13, durationHours: 1, type: "interview" },
        { title: "API Review", startHour: 9.5, durationHours: 1, type: "busy" },
        { title: "Perf Review", startHour: 11, durationHours: 1, type: "busy" },
      ],
      "Marvin McKinney": [
        { title: "1pm, System Design", startHour: 13, durationHours: 1, type: "interview" },
        { title: "Morning Sync", startHour: 9, durationHours: 0.5, type: "busy" },
        { title: "Investor Update", startHour: 10, durationHours: 1.5, type: "busy" },
        { title: "Lunch", startHour: 12, durationHours: 0.5, type: "busy" },
      ],
    },
  },
  {
    date: "Thursday, May 8, 2025",
    dateShort: "Thu, May 8",
    interviews: [
      {
        time: "10:00am – 11:00am",
        title: "System Design",
        participants: [{ name: "Jerome Bell" }, { name: "Marvin McKinney" }],
        room: "SF-12-Reed(4) [Zoom]",
      },
      {
        time: "11:00am – 11:45am",
        title: "Algorithms and Data Structures",
        participants: [{ name: "Javier Ramirez" }],
        room: "SF-12-Reed(4) [Zoom]",
      },
      {
        time: "11:45am – 12:00pm",
        title: "Break",
        participants: [],
        room: "SF-12-Reed(4) [Zoom]",
      },
      {
        time: "12:00pm – 12:30pm",
        title: "Culture Fit",
        participants: [{ name: "Cameron Williamson" }],
        room: "SF-12-Reed(4) [Zoom]",
      },
      {
        time: "12:30pm – 1:00pm",
        title: "Hiring Manager Close-up",
        participants: [{ name: "Leslie Alexander" }],
        room: "SF-12-Reed(4) [Zoom]",
      },
    ],
    calendarEvents: {
      "Candidate (Andy…)": [
        { title: "10am, System Design", startHour: 10, durationHours: 1, type: "interview" },
        { title: "11am, Algorithms…", startHour: 11, durationHours: 0.75, type: "interview" },
        { title: "Break", startHour: 11.75, durationHours: 0.25, type: "interview" },
        { title: "12pm, Culture Fit", startHour: 12, durationHours: 0.5, type: "interview" },
        { title: "12:30, Hiring Mgr", startHour: 12.5, durationHours: 0.5, type: "interview" },
      ],
      "Leslie Alexander": [
        { title: "Standup", startHour: 8.5, durationHours: 0.25, type: "busy" },
        { title: "Perf Reviews", startHour: 9, durationHours: 1, type: "busy" },
        { title: "12:30, Hiring Mgr", startHour: 12.5, durationHours: 0.5, type: "interview" },
        { title: "Board Prep", startHour: 14, durationHours: 2, type: "busy" },
      ],
      "Javier Ramirez": [
        { title: "Focus Time", startHour: 8, durationHours: 2, type: "busy" },
        { title: "11am, Algorithms", startHour: 11, durationHours: 0.75, type: "interview" },
        { title: "Lunch", startHour: 12, durationHours: 0.5, type: "busy" },
        { title: "Release Planning", startHour: 15, durationHours: 1, type: "busy" },
      ],
      "Jerome Bell": [
        { title: "10am, System Design", startHour: 10, durationHours: 1, type: "interview" },
        { title: "Cross-team Sync", startHour: 11.5, durationHours: 0.5, type: "busy" },
        { title: "Incident Review", startHour: 14, durationHours: 1, type: "busy" },
      ],
      "Marvin McKinney": [
        { title: "10am, System Design", startHour: 10, durationHours: 1, type: "interview" },
        { title: "Exec Standup", startHour: 8, durationHours: 0.5, type: "busy" },
        { title: "Strategy Session", startHour: 12, durationHours: 1.5, type: "busy" },
        { title: "Travel Prep", startHour: 15, durationHours: 1, type: "busy" },
      ],
    },
  },
  {
    date: "Friday, May 9, 2025",
    dateShort: "Fri, May 9",
    interviews: [
      {
        time: "2:00pm – 3:00pm",
        title: "System Design",
        participants: [{ name: "Jerome Bell" }, { name: "Marvin McKinney" }],
        room: "SF-15-Bruce(6) [Zoom]",
      },
      {
        time: "3:00pm – 3:45pm",
        title: "Algorithms and Data Structures",
        participants: [{ name: "Javier Ramirez" }],
        room: "SF-15-Bruce(6) [Zoom]",
      },
      {
        time: "3:45pm – 4:00pm",
        title: "Break",
        participants: [],
        room: "SF-15-Bruce(6) [Zoom]",
      },
      {
        time: "4:00pm – 4:30pm",
        title: "Culture Fit",
        participants: [{ name: "Cameron Williamson" }],
        room: "SF-15-Bruce(6) [Zoom]",
      },
      {
        time: "4:30pm – 5:00pm",
        title: "Hiring Manager Close-up",
        participants: [{ name: "Leslie Alexander" }],
        room: "SF-15-Bruce(6) [Zoom]",
      },
    ],
    calendarEvents: {
      "Candidate (Andy…)": [
        { title: "2pm, System Design", startHour: 14, durationHours: 1, type: "interview" },
        { title: "3pm, Algorithms…", startHour: 15, durationHours: 0.75, type: "interview" },
        { title: "Break", startHour: 15.75, durationHours: 0.25, type: "interview" },
        { title: "4pm, Culture Fit", startHour: 16, durationHours: 0.5, type: "interview" },
        { title: "4:30, Hiring Mgr", startHour: 16.5, durationHours: 0.5, type: "interview" },
      ],
      "Leslie Alexander": [
        { title: "Standup", startHour: 8.5, durationHours: 0.25, type: "busy" },
        { title: "All Hands", startHour: 9, durationHours: 1, type: "busy" },
        { title: "Eng Lunch", startHour: 12, durationHours: 1, type: "busy" },
        { title: "4:30, Hiring Mgr", startHour: 16.5, durationHours: 0.5, type: "interview" },
      ],
      "Javier Ramirez": [
        { title: "All Hands", startHour: 9, durationHours: 1, type: "busy" },
        { title: "Retrospective", startHour: 10, durationHours: 1, type: "busy" },
        { title: "3pm, Algorithms", startHour: 15, durationHours: 0.75, type: "interview" },
        { title: "Happy Hour", startHour: 17, durationHours: 1, type: "busy" },
      ],
      "Jerome Bell": [
        { title: "2pm, System Design", startHour: 14, durationHours: 1, type: "interview" },
        { title: "Knowledge Share", startHour: 10, durationHours: 1, type: "busy" },
        { title: "Wrap-up", startHour: 17, durationHours: 0.5, type: "busy" },
      ],
      "Marvin McKinney": [
        { title: "2pm, System Design", startHour: 14, durationHours: 1, type: "interview" },
        { title: "Exec Standup", startHour: 8, durationHours: 0.5, type: "busy" },
        { title: "Board Meeting", startHour: 10, durationHours: 2, type: "busy" },
        { title: "Lunch", startHour: 12, durationHours: 0.5, type: "busy" },
      ],
    },
  },
]

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function hourToSlotIndex(hour: number): number {
  if (hour >= HOURS[0]) return hour - HOURS[0]
  return hour + 24 - HOURS[0]
}

const HATCH_BG =
  "repeating-linear-gradient(135deg, transparent, transparent 4px, rgba(0,0,0,0.07) 4px, rgba(0,0,0,0.07) 5px)"

function getNonBusinessRegions(
  utcOffset: number,
  bizStart = BUSINESS_START,
  bizEnd = BUSINESS_END,
): { topPx: number; heightPx: number }[] {
  const diff = utcOffset - BASE_UTC_OFFSET
  const displayedHours = HOURS.slice(0, -1)
  const regions: { topPx: number; heightPx: number }[] = []
  let regionStart: number | null = null

  for (let i = 0; i < displayedHours.length; i++) {
    const h = displayedHours[i]
    const localH = ((h + diff) % 24 + 24) % 24
    const isNonBusiness = bizEnd <= 24
      ? localH < bizStart || localH >= bizEnd
      : localH < bizStart && localH >= bizEnd % 24

    if (isNonBusiness && regionStart === null) {
      regionStart = i
    } else if (!isNonBusiness && regionStart !== null) {
      regions.push({
        topPx: regionStart * SLOT_HEIGHT,
        heightPx: (i - regionStart) * SLOT_HEIGHT,
      })
      regionStart = null
    }
  }
  if (regionStart !== null) {
    regions.push({
      topPx: regionStart * SLOT_HEIGHT,
      heightPx: (displayedHours.length - regionStart) * SLOT_HEIGHT,
    })
  }
  return regions
}

function EventBlock({ event }: { event: CalendarEvent }) {
  const topPx = hourToSlotIndex(event.startHour) * SLOT_HEIGHT
  const heightPx = event.durationHours * SLOT_HEIGHT
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
  )
}

function PersonColumn({
  person,
  events,
}: {
  person: Interviewer
  events: CalendarEvent[]
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
                {person.location} · {person.timezone}
              </p>
            </TooltipTrigger>
            <TooltipContent>{person.timezoneFull}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div
        className="relative"
        style={{ height: (HOURS.length - 1) * SLOT_HEIGHT }}
      >
        {getNonBusinessRegions(person.utcOffset, person.businessStart, person.businessEnd).map((region, i) => (
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
  )
}

function TimezoneColumn({
  label,
  fullLabel,
  utcOffset,
}: {
  label: string
  fullLabel: string
  utcOffset: number
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
          const diff = utcOffset - BASE_UTC_OFFSET
          const localH = ((h + diff) % 24 + 24) % 24
          const mins = diff % 1 !== 0 ? Math.round((localH % 1) * 60) : 0
          const hour = Math.floor(localH)
          const suffix = hour < 12 ? "am" : "pm"
          const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
          const formatted =
            mins > 0 ? `${h12}:${String(mins).padStart(2, "0")}${suffix}` : `${h12}${suffix}`
          return (
            <div
              key={i}
              className="flex items-start justify-end pr-1 pt-0.5"
              style={{ height: SLOT_HEIGHT }}
            >
              <span className="text-xs text-muted-foreground">
                {formatted}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function InterviewerCalendarGrid({
  selectedDate,
}: {
  selectedDate: ScheduleDateOption
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-card">
      <div className="flex items-center gap-2 px-4 py-3">
        <span className="flex-1 text-lg font-semibold text-foreground">{selectedDate.date}</span>
        <Select defaultValue="pdt">
          <SelectTrigger className="h-7 w-[212px] text-sm shadow-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pdt">PDT America/Los Angeles</SelectItem>
            <SelectItem value="ist">IST Asia/Kolkata</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center rounded-lg border shadow-xs">
          <Button variant="ghost" size="icon" className="size-7 rounded-r-none border-r">
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-7 rounded-l-none">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div ref={scrollRef} className="flex flex-1 overflow-auto">
        <TimezoneColumn label="IST" fullLabel="IST Asia/Kolkata" utcOffset={5.5} />
        <TimezoneColumn label="PDT" fullLabel="PDT America/Los Angeles" utcOffset={-7} />

        {[...INTERVIEWERS].sort((a, b) => {
          const isACandidate = a.name.startsWith("Candidate")
          const isBCandidate = b.name.startsWith("Candidate")
          if (isACandidate) return -1
          if (isBCandidate) return 1
          const aFirst = (selectedDate.calendarEvents[a.name] ?? [])
            .filter(e => e.type === "interview")
            .reduce((min, e) => Math.min(min, e.startHour), Infinity)
          const bFirst = (selectedDate.calendarEvents[b.name] ?? [])
            .filter(e => e.type === "interview")
            .reduce((min, e) => Math.min(min, e.startHour), Infinity)
          return aFirst - bFirst
        }).map((person) => (
          <PersonColumn
            key={person.name}
            person={person}
            events={selectedDate.calendarEvents[person.name] ?? []}
          />
        ))}
      </div>
    </div>
  )
}

function ParticipantBadge({
  name,
  conflict,
}: {
  name: string
  conflict?: boolean
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "gap-1 text-[11px] font-medium",
        conflict && "border-destructive/20 bg-destructive/10 text-destructive",
      )}
    >
      <Avatar className="size-3">
        <AvatarFallback className="text-[6px]">{initials(name)}</AvatarFallback>
      </Avatar>
      {name}
      {conflict && " (Conflict)"}
    </Badge>
  )
}

function RoomBadge({ room }: { room: string }) {
  return (
    <Badge variant="secondary" className="gap-1 text-[11px] font-medium">
      <svg
        className="size-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
      {room}
    </Badge>
  )
}

function ScheduleDateCard({
  option,
  selected,
  onSelect,
}: {
  option: ScheduleDateOption
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full rounded-xl border bg-card p-4 text-left shadow-sm transition-shadow",
        selected ? "border-ring shadow-md" : "border-border hover:shadow-md",
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-base font-semibold">{option.date}</p>
        {selected ? (
          <Badge variant="secondary" className="gap-1">
            <Check className="size-3.5" />
            Selected
          </Badge>
        ) : (
          <Button
            size="sm"
            className="h-6 text-xs"
            onClick={(e) => {
              e.stopPropagation()
              onSelect()
            }}
          >
            Select
          </Button>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {option.interviews.map((interview, i) => (
          <div key={i} className="flex gap-2">
            <span className="w-20 shrink-0 text-sm font-semibold leading-5">
              {interview.time}
            </span>
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-semibold">{interview.title}</p>
              <div className="flex flex-wrap gap-1">
                {interview.participants.map((p) => (
                  <ParticipantBadge
                    key={p.name}
                    name={p.name}
                    conflict={p.conflict}
                  />
                ))}
                <RoomBadge room={interview.room} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Confirm details panel (Step 2)
// ---------------------------------------------------------------------------

function InterviewSessionExpanded({
  interview,
  dateShort,
}: {
  interview: InterviewSlot
  dateShort: string
}) {
  const timeMatch = interview.time.match(/^(\d{1,2}:\d{2})(am|pm)/i)
  const timeValue = timeMatch ? timeMatch[1] : "08:00"
  const timePeriod = timeMatch ? timeMatch[2].toUpperCase() : "AM"

  return (
    <div className="flex flex-col gap-4">
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
          <div className="flex h-9 items-center gap-2 rounded-lg border border-input bg-background px-4 shadow-xs">
            <Clock className="size-4 text-muted-foreground" />
            <span className="text-sm">{timeValue}</span>
            <span className="text-sm underline">{timePeriod}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <span className="px-1 text-sm font-medium">Duration</span>
          <Select>
            <SelectTrigger className="w-full rounded-lg">
              <SelectValue placeholder="Select item" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 min</SelectItem>
              <SelectItem value="45">45 min</SelectItem>
              <SelectItem value="60">60 min</SelectItem>
              <SelectItem value="90">90 min</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <span className="px-1 text-sm font-medium">Meeting room</span>
          <Select>
            <SelectTrigger className="w-full rounded-lg">
              <SelectValue placeholder="Select item" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sf15">SF-15-Bruce(6) [Zoom]</SelectItem>
              <SelectItem value="sf12">SF-12-Reed(4) [Zoom]</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="px-1 text-sm font-medium">Interviewer</span>
        <Select>
          <SelectTrigger className="w-full rounded-lg">
            <SelectValue placeholder="Select item" />
          </SelectTrigger>
          <SelectContent>
            {interview.participants.map((p) => (
              <SelectItem key={p.name} value={p.name}>
                {p.name}
              </SelectItem>
            ))}
            <SelectItem value="cameron">Cameron Williamson</SelectItem>
          </SelectContent>
        </Select>
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
  )
}

function InterviewSessionCollapsed({
  interview,
}: {
  interview: InterviewSlot
}) {
  const participantLabel =
    interview.participants.length === 0
      ? "No interviewer"
      : interview.participants.length === 1
        ? interview.participants[0].name
        : `${interview.participants[0].name} +${interview.participants.length - 1}`

  const durationMatch = interview.time.match(
    /(\d{1,2}:\d{2})(am|pm)\s*[–-]\s*(\d{1,2}:\d{2})(am|pm)/i,
  )
  let durationLabel = ""
  if (durationMatch) {
    const parseTime = (h: string, p: string) => {
      const [hh, mm] = h.split(":").map(Number)
      const hour = p.toLowerCase() === "pm" && hh !== 12 ? hh + 12 : p.toLowerCase() === "am" && hh === 12 ? 0 : hh
      return hour * 60 + mm
    }
    const startMin = parseTime(durationMatch[1], durationMatch[2])
    const endMin = parseTime(durationMatch[3], durationMatch[4])
    const diff = endMin - startMin
    durationLabel = diff >= 60 ? `${Math.floor(diff / 60)}h ${diff % 60 > 0 ? `${diff % 60}m` : ""}`.trim() : `${diff} min`
  }

  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-sm text-muted-foreground">
        {`May 5, 2025 ${interview.time.split("–")[0].trim()}       ${durationLabel}       ${participantLabel}`}
      </p>
    </div>
  )
}

function ConfirmDetailsPanel({
  selectedDate,
}: {
  selectedDate: ScheduleDateOption
}) {
  const [expandedSessions, setExpandedSessions] = useState<Set<number>>(
    () => new Set([0, 1]),
  )

  function toggleSession(idx: number) {
    setExpandedSessions((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const dateShort = selectedDate.dateShort.includes("/")
    ? selectedDate.dateShort
    : (() => {
        const parts = selectedDate.date.match(
          /\w+,\s+(\w+)\s+(\d+),\s+(\d+)/,
        )
        if (!parts) return "05 / 05 / 2025"
        const monthMap: Record<string, string> = {
          January: "01", February: "02", March: "03", April: "04",
          May: "05", June: "06", July: "07", August: "08",
          September: "09", October: "10", November: "11", December: "12",
        }
        return `${monthMap[parts[1]] ?? "01"} / ${parts[2].padStart(2, "0")} / ${parts[3]}`
      })()

  return (
    <div className="flex w-[500px] shrink-0 flex-col gap-6 overflow-y-auto bg-muted px-8 py-6">
      <h3 className="text-lg font-semibold">Step 2 of 3: Confirm details</h3>

      <div className="flex flex-col gap-1">
        <span className="px-1 text-sm font-medium">Add to calendar</span>
        <Select defaultValue="recruiting">
          <SelectTrigger className="w-full rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recruiting">Recruiting</SelectItem>
            <SelectItem value="personal">Personal</SelectItem>
            <SelectItem value="team">Team</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-3">
        {selectedDate.interviews.map((interview, i) => {
          const isExpanded = expandedSessions.has(i)
          return (
            <Collapsible
              key={i}
              open={isExpanded}
              onOpenChange={() => toggleSession(i)}
            >
              <div className="rounded-2xl border border-border bg-card">
                <CollapsibleTrigger className="flex w-full items-center justify-between px-5 py-4">
                  {isExpanded ? (
                    <span className="text-sm font-medium">
                      {interview.time.split("–")[0].trim()} {interview.title}
                    </span>
                  ) : (
                    <div className="flex flex-1 flex-col items-start gap-0.5">
                      <span className="text-sm font-medium">
                        {interview.title}
                      </span>
                      <InterviewSessionCollapsed interview={interview} />
                    </div>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-5 pb-5">
                    <InterviewSessionExpanded
                      interview={interview}
                      dateShort={dateShort}
                    />
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main dialog
// ---------------------------------------------------------------------------

export function ScheduleInterviewDialog({
  open,
  onOpenChange,
  candidateName,
  reqTitle,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidateName: string
  reqTitle: string
}) {
  const [selectedDateIdx, setSelectedDateIdx] = useState(0)
  const [step, setStep] = useState(1)
  const selectedDate = SCHEDULE_DATES[selectedDateIdx]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[calc(100vh-40px)] w-[calc(100vw-40px)] max-w-none sm:max-w-none flex-col gap-0 overflow-hidden p-0"
      >
      <TooltipProvider delayDuration={200}>
        <DialogTitle className="sr-only">Schedule interview</DialogTitle>
        <DialogDescription className="sr-only">
          Find a time to schedule an interview
        </DialogDescription>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-8 py-4">
          <h2 className="text-lg font-semibold">
            Scheduling interview for {candidateName} — {reqTitle}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden border-b border-border">
          {step === 1 && (
            <div className="flex w-[460px] shrink-0 flex-col gap-5 overflow-y-auto bg-muted px-8 py-5">
              <h3 className="text-lg font-semibold">Step 1 of 3: Find a time</h3>

              <div className="flex items-center justify-between">
                <Badge variant="outline" className="gap-1 text-xs font-normal">
                  Sort by: Best fit
                  <ChevronDown className="size-3" />
                </Badge>
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  Preference
                </Button>
              </div>

              <div className="space-y-3">
                {SCHEDULE_DATES.map((option, i) => (
                  <ScheduleDateCard
                    key={i}
                    option={option}
                    selected={selectedDateIdx === i}
                    onSelect={() => setSelectedDateIdx(i)}
                  />
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <ConfirmDetailsPanel selectedDate={selectedDate} />
          )}

          {/* Right panel — calendar grid */}
          <InterviewerCalendarGrid selectedDate={selectedDate} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 py-3">
          {step === 1 ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={() => setStep(2)}>
                Next: Confirm details
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button>Next</Button>
            </>
          )}
        </div>
      </TooltipProvider>
      </DialogContent>
    </Dialog>
  )
}
