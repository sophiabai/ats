export type Interviewer = {
  name: string;
  initials: string;
  location: string;
  timezone: string;
  timezoneFull: string;
  utcOffset: number;
  businessStart?: number;
  businessEnd?: number;
  avatar?: string;
};

export type CalendarEvent = {
  title: string;
  startHour: number;
  durationHours: number;
  type: "interview" | "busy" | "conflict";
};

export type InterviewSlot = {
  time: string;
  title: string;
  participants: { name: string; avatar?: string; conflict?: boolean }[];
  room: string;
};

export type ScheduleDateOption = {
  date: string;
  dateShort: string;
  interviews: InterviewSlot[];
  calendarEvents: Record<string, CalendarEvent[]>;
};
