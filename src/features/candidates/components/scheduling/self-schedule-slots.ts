import {
  DAY_SHORT,
  MONTH_NAMES,
  addBusinessDays,
  dateKey,
} from "@/features/candidates/components/scheduling/scheduling-date-utils";

// ---------------------------------------------------------------------------
// Self-schedule slot rules — the single source of truth for which times a
// candidate is offered.
//
// Used by BOTH the candidate self-schedule page and the recruiter's
// "Preview as a candidate" panel, so the recruiter always sees exactly what
// the candidate will get. These two used to be separate implementations and
// had drifted: the page offered nine slots plus multi-day options, the preview
// offered three and no multi-day.
// ---------------------------------------------------------------------------

export type SelfScheduleSlot = {
  time: string;
  available: boolean;
  multiDay?: { label: string; ranges: string[] }[];
};

export type SelfScheduleWindow = { start: Date; end: Date };

/**
 * The bookable window: opens 2 business days out, runs 14 days.
 *
 * Call this rather than reading a module constant — computing it at module
 * load freezes it for the life of the page session.
 */
export function createSelfScheduleWindow(from: Date = new Date()): SelfScheduleWindow {
  const start = addBusinessDays(from, 2);
  const end = new Date(start);
  end.setDate(end.getDate() + 13);
  return { start, end };
}

export function isSelfScheduleDate(d: Date, window: SelfScheduleWindow): boolean {
  const dow = d.getDay();
  if (dow === 0 || dow === 6) return false;
  const dk = dateKey(d);
  return dk >= dateKey(window.start) && dk <= dateKey(window.end);
}

/** Times offered on a bookable weekday. */
const BASE_TIMES = [
  "9:00 am",
  "10:00 am",
  "10:30 am",
  "11:00 am",
  "11:30 am",
  "1:30 pm",
  "1:00 pm",
  "2:00 pm",
  "2:30 pm",
];

/**
 * Builds the slot generator for a window. When the following day is also
 * bookable, a multi-day option is appended that splits the loop across both
 * days.
 */
export function makeSelfScheduleSlotGenerator(window: SelfScheduleWindow) {
  return function generateSelfScheduleSlots(date: Date): SelfScheduleSlot[] {
    if (!isSelfScheduleDate(date, window)) return [];

    const slots: SelfScheduleSlot[] = BASE_TIMES.map((time) => ({
      time,
      available: true,
    }));

    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    if (isSelfScheduleDate(nextDay, window)) {
      slots.push({
        time: "",
        available: true,
        multiDay: [
          {
            label: `Day 1: ${DAY_SHORT[date.getDay()]}, ${MONTH_NAMES[date.getMonth()].slice(0, 3)} ${date.getDate()}`,
            ranges: ["9:00 am - 10:00 am", "11:00 am - 12:00 pm"],
          },
          {
            label: `Day 2: ${DAY_SHORT[nextDay.getDay()]}, ${MONTH_NAMES[nextDay.getMonth()].slice(0, 3)} ${nextDay.getDate()}`,
            ranges: ["9:00 am - 10:30 am"],
          },
        ],
      });
    }

    return slots;
  };
}
