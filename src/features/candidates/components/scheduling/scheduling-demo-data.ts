import type { Interviewer, ScheduleDateOption } from "./scheduling-types";

export const DEMO_INTERVIEWERS: Interviewer[] = [
  { name: "Candidate (Andy…)", initials: "AS", location: "San Francisco", timezone: "PDT", timezoneFull: "PDT America/Los Angeles", utcOffset: -7 },
  { name: "Leslie Alexander", initials: "LA", location: "San Francisco", timezone: "PDT", timezoneFull: "PDT America/Los Angeles", utcOffset: -7 },
  { name: "Javier Ramirez", initials: "JR", location: "San Francisco", timezone: "PDT", timezoneFull: "PDT America/Los Angeles", utcOffset: -7 },
  { name: "Jerome Bell", initials: "JB", location: "Bangalore", timezone: "IST", timezoneFull: "IST Asia/Kolkata", utcOffset: 5.5, businessStart: 12, businessEnd: 24 },
  { name: "Marvin McKinney", initials: "MM", location: "Bangalore", timezone: "IST", timezoneFull: "IST Asia/Kolkata", utcOffset: 5.5, businessStart: 12, businessEnd: 24 },
];

export const DEMO_SCHEDULE_DATES: ScheduleDateOption[] = [
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
];

// ---------------------------------------------------------------------------
// Helpers to convert ScheduleDateOption into InterviewPlanSession[]
// ---------------------------------------------------------------------------

export function parseTimeToHour(timeStr: string): number {
  const m = timeStr.match(/(\d{1,2}):(\d{2})(am|pm)/i);
  if (!m) return 9;
  let h = parseInt(m[1]);
  const min = parseInt(m[2]);
  const period = m[3].toLowerCase();
  if (period === "pm" && h !== 12) h += 12;
  if (period === "am" && h === 12) h = 0;
  return h + min / 60;
}

export function shortDate(fullDate: string): string {
  const parts = fullDate.match(/\w+,\s+(\w+)\s+(\d+),\s+(\d+)/);
  if (!parts) return fullDate;
  const month = parts[1].slice(0, 3);
  return `${month} ${parseInt(parts[2])}, ${parts[3]}`;
}
