import { useState, useRef } from "react"
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Expand,
  X,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Interviewer = {
  name: string
  initials: string
  location: string
  timezone: string
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
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]

function formatHour(h: number) {
  if (h === 0 || h === 12) return "12pm"
  if (h < 12) return `${h}am`
  return `${h - 12}pm`
}

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

const INTERVIEWERS: Interviewer[] = [
  { name: "Candidate (Andy…)", initials: "AS", location: "San Francisco", timezone: "PST" },
  { name: "Leslie Alexander", initials: "LA", location: "San Francisco", timezone: "PST" },
  { name: "Javier Ramirez", initials: "JR", location: "San Francisco", timezone: "PST" },
  { name: "Jerome Bell", initials: "JB", location: "Bangalore", timezone: "IST" },
  { name: "Marvin McKinney", initials: "MM", location: "Bangalore", timezone: "IST" },
]

const SCHEDULE_DATES: ScheduleDateOption[] = [
  {
    date: "Monday, May 5, 2025",
    dateShort: "Mon, May 5",
    interviews: [
      {
        time: "9:00am – 10:00am",
        title: "System Design",
        participants: [{ name: "Leslie Alexander" }, { name: "Javier Ramirez" }],
        room: "SF-15-Bruce(6) [Zoom]",
      },
      {
        time: "10:00am – 10:45am",
        title: "Algorithms and Data Structures",
        participants: [{ name: "Jerome Bell" }],
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
        participants: [{ name: "Marvin McKinney" }],
        room: "SF-15-Bruce(6) [Zoom]",
      },
      {
        time: "11:30am – 12:00pm",
        title: "Hiring Manager Close-up",
        participants: [{ name: "Cameron Williamson" }],
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
        { title: "9am, System Design", startHour: 9, durationHours: 1, type: "interview" },
        { title: "Product Demo", startHour: 11, durationHours: 0.5, type: "busy" },
        { title: "Planning Session", startHour: 12.5, durationHours: 0.5, type: "busy" },
        { title: "1:1 weekly", startHour: 13, durationHours: 0.5, type: "busy" },
        { title: "Interview", startHour: 14, durationHours: 0.5, type: "busy" },
        { title: "Client Call", startHour: 14.5, durationHours: 0.5, type: "busy" },
      ],
      "Javier Ramirez": [
        { title: "User Interview", startHour: 8, durationHours: 0.75, type: "busy" },
        { title: "9am, System Design", startHour: 9, durationHours: 1, type: "interview" },
        { title: "Product Review", startHour: 10, durationHours: 0.5, type: "busy" },
        { title: "Design Review", startHour: 10.5, durationHours: 0.5, type: "busy" },
        { title: "Product Demo", startHour: 11, durationHours: 0.5, type: "busy" },
      ],
      "Jerome Bell": [
        { title: "Workshop", startHour: 8.5, durationHours: 1, type: "busy" },
        { title: "10am, Algorithms", startHour: 10, durationHours: 0.75, type: "interview" },
        { title: "Client Meeting", startHour: 10.75, durationHours: 0.5, type: "busy" },
      ],
      "Marvin McKinney": [
        { title: "11am, Culture Fit", startHour: 11, durationHours: 0.5, type: "interview" },
        { title: "Morning Sync", startHour: 12, durationHours: 0.5, type: "busy" },
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
        participants: [{ name: "Leslie Alexander" }, { name: "Javier Ramirez", conflict: true }],
        room: "SF-15-Bruce(6) [Zoom]",
      },
      {
        time: "10:00am – 10:45am",
        title: "Algorithms and Data Structures",
        participants: [{ name: "Jerome Bell" }],
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
        participants: [{ name: "Marvin McKinney" }],
        room: "SF-12-Reed(4) [Zoom]",
      },
      {
        time: "11:30am – 12:00pm",
        title: "Hiring Manager Close-up",
        participants: [{ name: "Cameron Williamson" }],
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
        { title: "9am, System Design", startHour: 9, durationHours: 1, type: "interview" },
        { title: "Design Sync", startHour: 10.5, durationHours: 0.5, type: "busy" },
        { title: "Lunch w/ Team", startHour: 12, durationHours: 1, type: "busy" },
        { title: "Sprint Planning", startHour: 14, durationHours: 1, type: "busy" },
      ],
      "Javier Ramirez": [
        { title: "9am, System Design", startHour: 9, durationHours: 1, type: "conflict" },
        { title: "Eng Sync", startHour: 9, durationHours: 0.5, type: "busy" },
        { title: "Code Review", startHour: 10, durationHours: 1, type: "busy" },
        { title: "Lunch", startHour: 12, durationHours: 0.5, type: "busy" },
        { title: "1:1 with Manager", startHour: 14, durationHours: 0.5, type: "busy" },
      ],
      "Jerome Bell": [
        { title: "Morning Standup", startHour: 8, durationHours: 0.25, type: "busy" },
        { title: "10am, Algorithms", startHour: 10, durationHours: 0.75, type: "interview" },
        { title: "Team Lunch", startHour: 12, durationHours: 1, type: "busy" },
        { title: "Architecture Review", startHour: 15, durationHours: 1.5, type: "busy" },
      ],
      "Marvin McKinney": [
        { title: "11am, Culture Fit", startHour: 11, durationHours: 0.5, type: "interview" },
        { title: "Product Sync", startHour: 9, durationHours: 0.5, type: "busy" },
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
        participants: [{ name: "Leslie Alexander" }, { name: "Javier Ramirez" }],
        room: "SF-15-Bruce(6) [Zoom]",
      },
      {
        time: "2:00pm – 2:45pm",
        title: "Algorithms and Data Structures",
        participants: [{ name: "Jerome Bell" }],
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
        participants: [{ name: "Marvin McKinney" }],
        room: "SF-15-Bruce(6) [Zoom]",
      },
      {
        time: "3:30pm – 4:00pm",
        title: "Hiring Manager Close-up",
        participants: [{ name: "Cameron Williamson" }],
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
        { title: "1pm, System Design", startHour: 13, durationHours: 1, type: "interview" },
        { title: "Backlog Grooming", startHour: 16, durationHours: 1, type: "busy" },
      ],
      "Javier Ramirez": [
        { title: "Feature Demo", startHour: 10, durationHours: 1, type: "busy" },
        { title: "Lunch", startHour: 12, durationHours: 0.5, type: "busy" },
        { title: "1pm, System Design", startHour: 13, durationHours: 1, type: "interview" },
        { title: "Bug Bash", startHour: 16, durationHours: 1, type: "busy" },
      ],
      "Jerome Bell": [
        { title: "2pm, Algorithms", startHour: 14, durationHours: 0.75, type: "interview" },
        { title: "Morning Standup", startHour: 8, durationHours: 0.25, type: "busy" },
        { title: "API Review", startHour: 9.5, durationHours: 1, type: "busy" },
        { title: "Perf Review", startHour: 11, durationHours: 1, type: "busy" },
      ],
      "Marvin McKinney": [
        { title: "3pm, Culture Fit", startHour: 15, durationHours: 0.5, type: "interview" },
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
        participants: [{ name: "Leslie Alexander" }, { name: "Javier Ramirez" }],
        room: "SF-12-Reed(4) [Zoom]",
      },
      {
        time: "11:00am – 11:45am",
        title: "Algorithms and Data Structures",
        participants: [{ name: "Jerome Bell" }],
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
        participants: [{ name: "Marvin McKinney" }],
        room: "SF-12-Reed(4) [Zoom]",
      },
      {
        time: "12:30pm – 1:00pm",
        title: "Hiring Manager Close-up",
        participants: [{ name: "Cameron Williamson" }],
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
        { title: "10am, System Design", startHour: 10, durationHours: 1, type: "interview" },
        { title: "Board Prep", startHour: 14, durationHours: 2, type: "busy" },
      ],
      "Javier Ramirez": [
        { title: "Focus Time", startHour: 8, durationHours: 2, type: "busy" },
        { title: "10am, System Design", startHour: 10, durationHours: 1, type: "interview" },
        { title: "Lunch", startHour: 12, durationHours: 0.5, type: "busy" },
        { title: "Release Planning", startHour: 15, durationHours: 1, type: "busy" },
      ],
      "Jerome Bell": [
        { title: "11am, Algorithms", startHour: 11, durationHours: 0.75, type: "interview" },
        { title: "Standup", startHour: 8, durationHours: 0.25, type: "busy" },
        { title: "Cross-team Sync", startHour: 9, durationHours: 1, type: "busy" },
        { title: "Incident Review", startHour: 14, durationHours: 1, type: "busy" },
      ],
      "Marvin McKinney": [
        { title: "12pm, Culture Fit", startHour: 12, durationHours: 0.5, type: "interview" },
        { title: "Exec Standup", startHour: 8, durationHours: 0.5, type: "busy" },
        { title: "Strategy Session", startHour: 9, durationHours: 1.5, type: "busy" },
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
        participants: [{ name: "Leslie Alexander" }, { name: "Javier Ramirez" }],
        room: "SF-15-Bruce(6) [Zoom]",
      },
      {
        time: "3:00pm – 3:45pm",
        title: "Algorithms and Data Structures",
        participants: [{ name: "Jerome Bell" }],
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
        participants: [{ name: "Marvin McKinney" }],
        room: "SF-15-Bruce(6) [Zoom]",
      },
      {
        time: "4:30pm – 5:00pm",
        title: "Hiring Manager Close-up",
        participants: [{ name: "Cameron Williamson" }],
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
        { title: "2pm, System Design", startHour: 14, durationHours: 1, type: "interview" },
      ],
      "Javier Ramirez": [
        { title: "All Hands", startHour: 9, durationHours: 1, type: "busy" },
        { title: "Retrospective", startHour: 10, durationHours: 1, type: "busy" },
        { title: "2pm, System Design", startHour: 14, durationHours: 1, type: "interview" },
        { title: "Happy Hour", startHour: 17, durationHours: 1, type: "busy" },
      ],
      "Jerome Bell": [
        { title: "3pm, Algorithms", startHour: 15, durationHours: 0.75, type: "interview" },
        { title: "Standup", startHour: 8, durationHours: 0.25, type: "busy" },
        { title: "Knowledge Share", startHour: 10, durationHours: 1, type: "busy" },
        { title: "Wrap-up", startHour: 17, durationHours: 0.5, type: "busy" },
      ],
      "Marvin McKinney": [
        { title: "4pm, Culture Fit", startHour: 16, durationHours: 0.5, type: "interview" },
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

function EventBlock({ event }: { event: CalendarEvent }) {
  const topPx = (event.startHour - HOURS[0]) * SLOT_HEIGHT
  const heightPx = event.durationHours * SLOT_HEIGHT
  return (
    <div
      className={cn(
        "absolute inset-x-px z-10 overflow-hidden rounded-md border px-1.5 py-1",
        event.type === "interview"
          ? "border-blue-300 bg-blue-500/20"
          : event.type === "conflict"
            ? "border-destructive/30 bg-destructive/10"
            : "border-transparent bg-muted",
      )}
      style={{ top: topPx, height: heightPx }}
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
          <p className="truncate text-[10px] text-muted-foreground">
            {person.location}
          </p>
        </div>
      </div>

      <div
        className="relative"
        style={{ height: (HOURS.length - 1) * SLOT_HEIGHT }}
      >
        {HOURS.slice(0, -1).map((h, i) => (
          <div
            key={h}
            className="absolute w-full border-b border-border/50"
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
  utcOffset,
}: {
  label: string
  utcOffset: number
}) {
  return (
    <div className="flex w-[52px] shrink-0 flex-col border-r border-border">
      <div className="flex h-14 shrink-0 items-end justify-center border-b border-border pb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div style={{ height: (HOURS.length - 1) * SLOT_HEIGHT }}>
        {HOURS.slice(0, -1).map((h) => {
          const localH = ((h + utcOffset) % 24 + 24) % 24
          const mins = utcOffset % 1 !== 0 ? 30 : 0
          const hour = Math.floor(localH)
          const suffix = hour < 12 ? "am" : "pm"
          const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
          const formatted =
            mins > 0 ? `${h12}:${mins}${suffix}` : `${h12}${suffix}`
          return (
            <div
              key={h}
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
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{selectedDate.date}</span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="gap-1 text-xs font-normal">
            PDT America/Los Angeles
            <ChevronDown className="size-3" />
          </Badge>
          <Button variant="ghost" size="icon" className="size-7">
            <Expand className="size-3.5" />
          </Button>
          <div className="flex items-center rounded-md border">
            <Button variant="ghost" size="icon" className="size-7 rounded-r-none border-r">
              <ChevronLeft className="size-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="size-7 rounded-l-none">
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs">
            Today
          </Button>
        </div>
      </div>

      <div ref={scrollRef} className="flex flex-1 overflow-auto">
        <TimezoneColumn label="IST" utcOffset={5.5} />
        <TimezoneColumn label="PT" utcOffset={-7} />

        {INTERVIEWERS.map((person) => (
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
  const selectedDate = SCHEDULE_DATES[selectedDateIdx]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[calc(100vh-40px)] w-[calc(100vw-40px)] max-w-none sm:max-w-none flex-col gap-0 overflow-hidden p-0"
      >
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
          {/* Left panel */}
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

          {/* Right panel — calendar grid */}
          <InterviewerCalendarGrid selectedDate={selectedDate} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 py-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button>Next: Confirm details</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
