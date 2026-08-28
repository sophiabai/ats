import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Trash } from "lucide-react";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Availability week grid
//
// The candidate-facing "paint your availability onto a week" calendar.
// Drag to create, drag the body to move (across days), drag either edge to
// resize, click + Delete/Backspace to remove. Overlapping windows on the same
// day merge automatically, and a drag shorter than the interview duration
// snaps up to it, so a candidate cannot draw a window too short to hold the
// loop.
//
// Three levels of granularity, mirroring candidate-date-slot-picker:
//   useAvailabilityGrid()   — all state + config
//   AvailabilityWeekHeader  — week title, month popover, prev/Today/next
//   AvailabilityWeekGrid    — the grid itself
//   AvailabilityWeekPicker  — the two composed
//
// Styling depends on `.customer-brand` tokens and the `cand-fade-in`
// animation, both defined in src/index.css.
// ---------------------------------------------------------------------------

export type AvailabilitySlot = {
  /** Date key, `YYYY-MM-DD`. */
  day: string;
  /** Fractional hour, e.g. 9.25 for 9:15am. */
  startHour: number;
  /** Length in quarter-hour rows. */
  slots: number;
};

export type AvailabilityDayGroup = { label: string; ranges: string[] };

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_LONG = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function getMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
}

export function addBusinessDays(from: Date, n: number) {
  const d = new Date(from);
  let added = 0;
  while (added < n) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return d;
}

export function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseDateKey(dk: string) {
  const [y, m, d] = dk.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function getWeekDays(monday: Date) {
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { short: DAY_NAMES[d.getDay()], date: d.getDate(), full: d };
  });
}

function formatWeekTitle(monday: Date) {
  return `${DAY_LONG[monday.getDay()]}, ${MONTH_NAMES[monday.getMonth()]} ${monday.getDate()}, ${monday.getFullYear()}`;
}

function formatHour(h: number) {
  if (h === 0 || h === 12) return "12pm";
  if (h < 12) return `${h}am`;
  return `${h - 12}pm`;
}

function formatSlotTime(hour: number) {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  const ampm = h >= 12 ? "pm" : "am";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return m === 0 ? `${h12}:00${ampm}` : `${h12}:${String(m).padStart(2, "0")}${ampm}`;
}

/** "Wed May 27 12pm – 2pm" — the shape the recruiter and the agent consume. */
export function formatSlotForHandoff(slot: AvailabilitySlot): string {
  const date = parseDateKey(slot.day);
  const dayStr = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const start = formatSlotTime(slot.startHour);
  const end = formatSlotTime(slot.startHour + slot.slots * 0.25);
  return `${dayStr} ${start} – ${end}`;
}

// ---------------------------------------------------------------------------
// State hook
// ---------------------------------------------------------------------------

export type AvailabilityGridOptions = {
  /** Total interview length. A drag shorter than this snaps up to it. Default 210 (3h30m). */
  durationMinutes?: number;
  /** First hour shown on the grid. Default 8. */
  startHour?: number;
  /**
   * Last hour shown. The final hour band renders as a hatched, unselectable
   * tail, so with the defaults the candidate may select 8am–5pm on an
   * 8am–6pm grid. Default 18.
   */
  endHour?: number;
  /** First selectable date. Default: 2 business days from today. */
  windowStart?: Date;
  /** Last selectable date. Default: 13 days after windowStart. */
  windowEnd?: Date;
  /** Windows required before `isValid` flips true. Default 2. */
  minSelections?: number;
  /** Pixel height of one hour row. Default 48. */
  slotHeight?: number;
  /** Timezone suffix on grouped range labels. Default "PST". */
  timezoneLabel?: string;
  /** Windows to start with. */
  initialSelections?: AvailabilitySlot[];
};

export function useAvailabilityGrid(options: AvailabilityGridOptions = {}) {
  const {
    durationMinutes = 210,
    startHour = 8,
    endHour = 18,
    minSelections = 2,
    slotHeight = 48,
    timezoneLabel = "PST",
    initialSelections = [],
  } = options;

  const durationSlots = Math.max(1, Math.round(durationMinutes / 15));

  const hours = useMemo(
    () =>
      Array.from({ length: Math.max(2, endHour - startHour + 1) }, (_, i) => startHour + i),
    [startHour, endHour],
  );

  // Computed per mount rather than at module load, so the window is testable
  // and overridable.
  const windowStart = useMemo(
    () => options.windowStart ?? addBusinessDays(new Date(), 2),
    [options.windowStart],
  );
  const windowEnd = useMemo(() => {
    if (options.windowEnd) return options.windowEnd;
    const d = new Date(windowStart);
    d.setDate(d.getDate() + 13);
    return d;
  }, [options.windowEnd, windowStart]);

  const isAllowedDate = useCallback(
    (d: Date) => {
      const dow = d.getDay();
      if (dow === 0 || dow === 6) return false;
      const dk = dateKey(d);
      return dk >= dateKey(windowStart) && dk <= dateKey(windowEnd);
    },
    [windowStart, windowEnd],
  );

  const [weekStart, setWeekStart] = useState(() => getMonday(windowStart));
  const [calendarOpen, setCalendarOpen] = useState(false);
  const days = useMemo(() => getWeekDays(weekStart), [weekStart]);

  const [selections, setSelections] = useState<AvailabilitySlot[]>(initialSelections);

  const [dragging, setDraggingState] = useState<{
    dayKey: string;
    startRow: number;
    currentRow: number;
  } | null>(null);
  const draggingRef = useRef(dragging);
  const setDragging: typeof setDraggingState = (v) => {
    if (typeof v === "function") {
      setDraggingState((prev) => {
        const next = (v as (p: typeof dragging) => typeof dragging)(prev);
        draggingRef.current = next;
        return next;
      });
    } else {
      draggingRef.current = v;
      setDraggingState(v);
    }
  };

  const [resizing, setResizingState] = useState<{
    dayKey: string;
    slotIndex: number;
    edge: "top" | "bottom";
    originalSlot: AvailabilitySlot;
    currentRow: number;
  } | null>(null);
  const resizingRef = useRef(resizing);
  const setResizing: typeof setResizingState = (v) => {
    if (typeof v === "function") {
      setResizingState((prev) => {
        const next = (v as (p: typeof resizing) => typeof resizing)(prev);
        resizingRef.current = next;
        return next;
      });
    } else {
      resizingRef.current = v;
      setResizingState(v);
    }
  };

  const [selectedSlot, setSelectedSlot] = useState<{ day: string; index: number } | null>(null);
  const [hoverPos, setHoverPos] = useState<{ dayKey: string; row: number } | null>(null);

  const [moving, setMovingState] = useState<{
    dayKey: string;
    slotIndex: number;
    originalSlot: AvailabilitySlot;
    grabRow: number;
    currentRow: number;
    currentDayKey: string;
  } | null>(null);
  const movingRef = useRef(moving);
  const setMoving: typeof setMovingState = (v) => {
    if (typeof v === "function") {
      setMovingState((prev) => {
        const next = (v as (p: typeof moving) => typeof moving)(prev);
        movingRef.current = next;
        return next;
      });
    } else {
      movingRef.current = v;
      setMovingState(v);
    }
  };

  const totalRows = (hours.length - 1) * 4;
  const availableRows = (hours.length - 2) * 4;
  const selectionsRef = useRef(selections);
  selectionsRef.current = selections;
  const lastDeleteTime = useRef(0);
  const [ghostSuppressed, setGhostSuppressed] = useState(false);

  const deleteSlot = useCallback(
    (dayKey: string, slotIndex: number) => {
      const daySlots = selections.filter((s) => s.day === dayKey);
      const target = daySlots[slotIndex];
      if (target) {
        setSelections((prev) =>
          prev.filter(
            (s) =>
              !(
                s.day === target.day &&
                s.startHour === target.startHour &&
                s.slots === target.slots
              ),
          ),
        );
        lastDeleteTime.current = Date.now();
        setGhostSuppressed(true);
        setTimeout(() => setGhostSuppressed(false), 1000);
      }
    },
    [selections],
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!selectedSlot) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteSlot(selectedSlot.day, selectedSlot.index);
        setSelectedSlot(null);
      } else if (e.key === "Escape") {
        setSelectedSlot(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedSlot, deleteSlot]);

  const previewSlot = useMemo(() => {
    if (!dragging) return null;
    const minRow = Math.min(dragging.startRow, Math.min(dragging.currentRow, availableRows - 1));
    const maxRow = Math.min(Math.max(dragging.startRow, dragging.currentRow), availableRows - 1);
    const draggedSlots = maxRow - minRow + 1;
    const actualSlots = Math.min(
      draggedSlots < durationSlots ? Math.max(durationSlots, draggedSlots) : draggedSlots,
      availableRows - minRow,
    );
    return { day: dragging.dayKey, startHour: hours[0] + minRow * 0.25, slots: actualSlots };
  }, [dragging, availableRows, durationSlots, hours]);

  const mergeOverlapping = useCallback((slots: AvailabilitySlot[]): AvailabilitySlot[] => {
    const byDay = new Map<string, AvailabilitySlot[]>();
    for (const s of slots) {
      const arr = byDay.get(s.day) ?? [];
      arr.push(s);
      byDay.set(s.day, arr);
    }
    const result: AvailabilitySlot[] = [];
    for (const [, daySlots] of byDay) {
      daySlots.sort((a, b) => a.startHour - b.startHour);
      const merged: AvailabilitySlot[] = [{ ...daySlots[0] }];
      for (let i = 1; i < daySlots.length; i++) {
        const prev = merged[merged.length - 1];
        const cur = daySlots[i];
        const prevEnd = prev.startHour + prev.slots * 0.25;
        if (cur.startHour <= prevEnd) {
          const curEnd = cur.startHour + cur.slots * 0.25;
          const newEnd = Math.max(prevEnd, curEnd);
          prev.slots = Math.round((newEnd - prev.startHour) / 0.25);
        } else {
          merged.push({ ...cur });
        }
      }
      result.push(...merged);
    }
    return result;
  }, []);

  const commitDrag = useCallback(() => {
    const d = draggingRef.current;
    if (!d) return;
    const minRow = Math.min(d.startRow, Math.min(d.currentRow, availableRows - 1));
    const maxRow = Math.min(Math.max(d.startRow, d.currentRow), availableRows - 1);
    const draggedSlots = maxRow - minRow + 1;
    const actualSlots = Math.min(
      draggedSlots < durationSlots ? Math.max(durationSlots, draggedSlots) : draggedSlots,
      availableRows - minRow,
    );
    const newSlot: AvailabilitySlot = {
      day: d.dayKey,
      startHour: hours[0] + minRow * 0.25,
      slots: actualSlots,
    };
    setSelections((prev) => mergeOverlapping([...prev, newSlot]));
    setDragging(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableRows, durationSlots, hours, mergeOverlapping]);

  const commitResize = useCallback(() => {
    const r = resizingRef.current;
    if (!r) return;
    const { dayKey, slotIndex, edge, originalSlot, currentRow } = r;
    const daySlots = selectionsRef.current.filter((s) => s.day === dayKey);
    const target = daySlots[slotIndex];
    if (!target) {
      setResizing(null);
      return;
    }

    let newStartHour = originalSlot.startHour;
    let newSlots = originalSlot.slots;

    if (edge === "bottom") {
      const clampedEnd = Math.min(currentRow + 1, availableRows);
      const startRow = (originalSlot.startHour - hours[0]) * 4;
      newSlots = Math.max(1, clampedEnd - startRow);
    } else {
      const originalEndRow = Math.min(
        (originalSlot.startHour - hours[0]) * 4 + originalSlot.slots,
        availableRows,
      );
      newStartHour = hours[0] + currentRow * 0.25;
      newSlots = Math.max(1, originalEndRow - currentRow);
    }

    setSelections((prev) =>
      mergeOverlapping(
        prev.map((s) =>
          s.day === target.day &&
          s.startHour === target.startHour &&
          s.slots === target.slots
            ? { ...s, startHour: newStartHour, slots: newSlots }
            : s,
        ),
      ),
    );
    setResizing(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableRows, hours, mergeOverlapping]);

  const commitMove = useCallback(() => {
    const m = movingRef.current;
    if (!m) return;
    const { dayKey, slotIndex, originalSlot, grabRow, currentRow, currentDayKey } = m;
    const daySlots = selectionsRef.current.filter((s) => s.day === dayKey);
    const target = daySlots[slotIndex];
    if (!target) {
      setMoving(null);
      return;
    }

    const rowDelta = currentRow - grabRow;
    const originalStartRow = (originalSlot.startHour - hours[0]) * 4;
    const newStartRow = Math.max(
      0,
      Math.min(availableRows - originalSlot.slots, originalStartRow + rowDelta),
    );
    const newStartHour = hours[0] + newStartRow * 0.25;

    setSelections((prev) =>
      mergeOverlapping(
        prev.map((s) =>
          s.day === target.day &&
          s.startHour === target.startHour &&
          s.slots === target.slots
            ? { ...s, day: currentDayKey, startHour: newStartHour }
            : s,
        ),
      ),
    );
    setMoving(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableRows, hours, mergeOverlapping]);

  useEffect(() => {
    if (!moving) return;
    function handleGlobalMouseUp() {
      commitMove();
    }
    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("touchend", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("touchend", handleGlobalMouseUp);
    };
  }, [moving, commitMove]);

  const getRowFromY = useCallback(
    (e: React.MouseEvent, containerRect: DOMRect) => {
      const y = e.clientY - containerRect.top;
      const row = Math.floor(y / (slotHeight / 4));
      return Math.max(0, Math.min(totalRows - 1, row));
    },
    [slotHeight, totalRows],
  );

  const getRowFromTouch = useCallback(
    (touch: React.Touch, containerRect: DOMRect) => {
      const y = touch.clientY - containerRect.top;
      const row = Math.floor(y / (slotHeight / 4));
      return Math.max(0, Math.min(totalRows - 1, row));
    },
    [slotHeight, totalRows],
  );

  const getDayKeyFromTouch = useCallback((touch: React.Touch): string | null => {
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const gridEl = el?.closest("[data-grid]") as HTMLElement | null;
    return gridEl?.dataset.daykey ?? null;
  }, []);

  const formatSlotLabel = useCallback((slot: Pick<AvailabilitySlot, "slots">) => {
    const hrs = slot.slots * 0.25;
    let duration: string;
    if (hrs >= 1) {
      const h = Math.floor(hrs);
      const m = (hrs - h) * 60;
      duration = `${h}h${m > 0 ? ` ${m}m` : ""}`;
    } else {
      duration = `${hrs * 60}m`;
    }
    return (
      <>
        Available
        <br />
        {duration}
      </>
    );
  }, []);

  const isValid = selections.length >= minSelections;

  const groupedSelections = useMemo<AvailabilityDayGroup[]>(() => {
    const byDay = new Map<string, AvailabilitySlot[]>();
    for (const s of selections) {
      const arr = byDay.get(s.day) ?? [];
      arr.push(s);
      byDay.set(s.day, arr);
    }
    const sorted = [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b));
    return sorted.map(([dk, slots]) => {
      const d = parseDateKey(dk);
      const label = `${DAY_LONG[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
      const ranges = slots
        .sort((a, b) => a.startHour - b.startHour)
        .map((s) => {
          const end = s.startHour + s.slots * 0.25;
          return `${formatSlotTime(s.startHour)} - ${formatSlotTime(end)} (${timezoneLabel})`;
        });
      return { label, ranges };
    });
  }, [selections, timezoneLabel]);

  return {
    // config
    hours, slotHeight, durationSlots, minSelections,
    windowStart, windowEnd, isAllowedDate,
    // week
    weekStart, setWeekStart,
    calendarOpen, setCalendarOpen,
    days,
    // selections
    selections, setSelections,
    dragging, setDragging,
    resizing, setResizing,
    selectedSlot, setSelectedSlot,
    hoverPos, setHoverPos,
    moving, setMoving,
    totalRows, availableRows,
    ghostSuppressed,
    deleteSlot,
    previewSlot,
    commitDrag, commitResize, commitMove,
    draggingRef, resizingRef, movingRef,
    getRowFromY, getRowFromTouch, getDayKeyFromTouch,
    formatSlotLabel,
    isValid,
    groupedSelections,
  };
}

export type AvailabilityGridState = ReturnType<typeof useAvailabilityGrid>;

// ---------------------------------------------------------------------------
// Grid
// ---------------------------------------------------------------------------

export function AvailabilityWeekGrid({
  state: s,
  className,
}: {
  state: AvailabilityGridState;
  className?: string;
}) {
  const { hours: HOURS, slotHeight: SLOT_HEIGHT, durationSlots: DURATION_SLOTS } = s;

  return (
    <div className={cn("flex flex-1 overflow-hidden", className)}>
      {/* Time column */}
      <div className="flex w-[52px] shrink-0 flex-col border-r border-stone-200">
        <div className="h-14 shrink-0 border-b border-black/10 shadow-[0_2px_4px_-2px_rgba(0,0,0,0.06)]" />
        {HOURS.slice(0, -1).map((h) => (
          <div
            key={h}
            className="flex shrink-0 items-start justify-end pr-1"
            style={{ height: SLOT_HEIGHT }}
          >
            <span className="text-xs text-muted-foreground">{formatHour(h)}</span>
          </div>
        ))}
      </div>

      {/* Day columns */}
      {s.days.map((day) => {
        const dk = dateKey(day.full);
        const dayAllowed = s.isAllowedDate(day.full);
        return (
          <div
            key={dk}
            className="relative flex flex-1 flex-col border-r border-stone-200 last:border-r-0"
          >
            <div className="flex h-14 shrink-0 flex-col items-center justify-center border-b border-black/10 p-2 shadow-[0_2px_4px_-2px_rgba(0,0,0,0.06)]">
              <span className={`text-xs text-muted-foreground ${!dayAllowed ? "opacity-40" : ""}`}>
                {day.short}
              </span>
              <span className={`text-base font-medium text-stone-900 ${!dayAllowed ? "opacity-40" : ""}`}>
                {day.date}
              </span>
            </div>

            <div
              data-grid
              data-daykey={dk}
              className="relative touch-none select-none"
              style={{ height: (HOURS.length - 1) * SLOT_HEIGHT }}
              onMouseDown={(e) => {
                if (!dayAllowed) return;
                if (s.resizing || s.moving) return;
                s.setSelectedSlot(null);
                s.setHoverPos(null);
                const rect = e.currentTarget.getBoundingClientRect();
                const row = s.getRowFromY(e, rect);
                if (row >= s.availableRows) return;
                const clickHour = HOURS[0] + row * 0.25;
                const hitIdx = s.selections.findIndex(
                  (sl) =>
                    sl.day === dk &&
                    clickHour >= sl.startHour &&
                    clickHour < sl.startHour + sl.slots * 0.25,
                );
                if (hitIdx < 0) {
                  s.setDragging({ dayKey: dk, startRow: row, currentRow: row });
                }
              }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const row = s.getRowFromY(e, rect);
                if (s.moving) {
                  const targetKey = dayAllowed ? dk : s.moving.currentDayKey;
                  if (row !== s.moving.currentRow || targetKey !== s.moving.currentDayKey) {
                    s.setMoving((prev) =>
                      prev ? { ...prev, currentRow: row, currentDayKey: targetKey } : null,
                    );
                  }
                  return;
                }
                if (!dayAllowed) return;
                if (s.resizing) {
                  if (row !== s.resizing.currentRow) {
                    s.setResizing((prev) => (prev ? { ...prev, currentRow: row } : null));
                  }
                  return;
                }
                if (s.dragging) {
                  if (s.dragging.dayKey === dk && row !== s.dragging.currentRow) {
                    s.setDragging((prev) => (prev ? { ...prev, currentRow: row } : null));
                  }
                  return;
                }
                if (!s.hoverPos || s.hoverPos.dayKey !== dk || s.hoverPos.row !== row) {
                  s.setHoverPos({ dayKey: dk, row });
                }
              }}
              onMouseUp={() => {
                if (s.moving) s.commitMove();
                else if (s.resizing) s.commitResize();
                else s.commitDrag();
              }}
              onMouseLeave={() => {
                s.setHoverPos(null);
                if (s.resizing) s.commitResize();
                else if (s.dragging) s.commitDrag();
              }}
              onTouchStart={(e) => {
                if (!dayAllowed) return;
                if (s.resizing || s.moving) return;
                const touch = e.touches[0];
                const rect = e.currentTarget.getBoundingClientRect();
                const row = s.getRowFromTouch(touch, rect);
                if (row >= s.availableRows) return;
                const clickHour = HOURS[0] + row * 0.25;
                const hitIdx = s.selections.findIndex(
                  (sl) =>
                    sl.day === dk &&
                    clickHour >= sl.startHour &&
                    clickHour < sl.startHour + sl.slots * 0.25,
                );
                if (hitIdx < 0) {
                  e.preventDefault();
                  s.setSelectedSlot(null);
                  s.setDragging({ dayKey: dk, startRow: row, currentRow: row });
                }
              }}
              onTouchMove={(e) => {
                const touch = e.touches[0];
                const rect = e.currentTarget.getBoundingClientRect();
                const row = s.getRowFromTouch(touch, rect);
                if (s.moving) {
                  e.preventDefault();
                  const touchDayKey = s.getDayKeyFromTouch(touch) ?? s.moving.currentDayKey;
                  if (row !== s.moving.currentRow || touchDayKey !== s.moving.currentDayKey) {
                    s.setMoving((prev) =>
                      prev ? { ...prev, currentRow: row, currentDayKey: touchDayKey } : null,
                    );
                  }
                  return;
                }
                if (s.resizing) {
                  e.preventDefault();
                  if (row !== s.resizing.currentRow) {
                    s.setResizing((prev) => (prev ? { ...prev, currentRow: row } : null));
                  }
                  return;
                }
                if (s.dragging) {
                  e.preventDefault();
                  if (row !== s.dragging.currentRow) {
                    s.setDragging((prev) => (prev ? { ...prev, currentRow: row } : null));
                  }
                  return;
                }
              }}
              onTouchEnd={(e) => {
                if (s.movingRef.current || s.resizingRef.current || s.draggingRef.current) {
                  e.preventDefault();
                }
                if (s.movingRef.current) s.commitMove();
                else if (s.resizingRef.current) s.commitResize();
                else if (s.draggingRef.current) s.commitDrag();
              }}
            >
              {HOURS.slice(0, -1).map((h, i) => (
                <div
                  key={h}
                  className="absolute w-full border-b border-black/10"
                  style={{ top: (i + 1) * SLOT_HEIGHT }}
                />
              ))}
              {HOURS.slice(0, -1).map((h, i) => (
                <div
                  key={`half-${h}`}
                  className="absolute w-full border-b border-black/5"
                  style={{ top: i * SLOT_HEIGHT + SLOT_HEIGHT / 2 }}
                />
              ))}

              {s.selections
                .filter((sl) => sl.day === dk)
                .map((slot, i) => {
                  const isBeingMovedAway =
                    s.moving &&
                    s.moving.dayKey === dk &&
                    s.moving.slotIndex === i &&
                    s.moving.currentDayKey !== dk;
                  if (isBeingMovedAway) return null;
                  let displaySlot = slot;
                  if (s.moving && s.moving.dayKey === dk && s.moving.slotIndex === i) {
                    const rowDelta = s.moving.currentRow - s.moving.grabRow;
                    const originalStartRow = (s.moving.originalSlot.startHour - HOURS[0]) * 4;
                    const newStartRow = Math.max(
                      0,
                      Math.min(
                        s.availableRows - s.moving.originalSlot.slots,
                        originalStartRow + rowDelta,
                      ),
                    );
                    displaySlot = { ...slot, startHour: HOURS[0] + newStartRow * 0.25 };
                  } else if (s.resizing && s.resizing.dayKey === dk && s.resizing.slotIndex === i) {
                    if (s.resizing.edge === "bottom") {
                      const startRow = (s.resizing.originalSlot.startHour - HOURS[0]) * 4;
                      const clampedEnd = Math.min(s.resizing.currentRow + 1, s.availableRows);
                      const newSlots = Math.max(1, clampedEnd - startRow);
                      displaySlot = { ...slot, slots: newSlots };
                    } else {
                      const originalEndRow = Math.min(
                        (s.resizing.originalSlot.startHour - HOURS[0]) * 4 +
                          s.resizing.originalSlot.slots,
                        s.availableRows,
                      );
                      const newStartHour = HOURS[0] + s.resizing.currentRow * 0.25;
                      const newSlots = Math.max(1, originalEndRow - s.resizing.currentRow);
                      displaySlot = { ...slot, startHour: newStartHour, slots: newSlots };
                    }
                  }
                  const topPx = (displaySlot.startHour - HOURS[0]) * SLOT_HEIGHT;
                  const heightPx = displaySlot.slots * (SLOT_HEIGHT / 4);
                  const isSelected =
                    s.selectedSlot?.day === dk && s.selectedSlot?.index === i;
                  const isMovingSelf =
                    s.moving && s.moving.dayKey === dk && s.moving.slotIndex === i;
                  const isResizingSelf =
                    s.resizing && s.resizing.dayKey === dk && s.resizing.slotIndex === i;
                  const showSelectedShadow = isSelected || isResizingSelf;
                  const isFocused = showSelectedShadow || isMovingSelf;
                  return (
                    <div
                      key={i}
                      className={`group/slot absolute z-10 cursor-grab rounded-md border border-primary/30 bg-primary/10 px-1.5 py-1 transition-[inset] duration-100 active:cursor-grabbing ${isFocused ? "inset-x-0" : "inset-x-1"} ${showSelectedShadow ? "shadow-[0_0_0_2px_rgba(88,125,255,0.3),0_4px_16px_rgba(88,125,255,0.25)]" : ""} ${isMovingSelf ? "opacity-80 shadow-lg" : ""}`}
                      style={{ top: topPx, height: heightPx }}
                      onMouseEnter={() => s.setHoverPos(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        const rect = e.currentTarget
                          .closest("[data-grid]")!
                          .getBoundingClientRect();
                        const row = s.getRowFromY(e as unknown as React.MouseEvent, rect);
                        s.setMoving({
                          dayKey: dk,
                          slotIndex: i,
                          originalSlot: slot,
                          grabRow: row,
                          currentRow: row,
                          currentDayKey: dk,
                        });
                      }}
                      onMouseUp={() => {
                        if (
                          s.moving &&
                          s.moving.grabRow === s.moving.currentRow &&
                          s.moving.dayKey === s.moving.currentDayKey
                        ) {
                          s.setSelectedSlot(isSelected ? null : { day: dk, index: i });
                        }
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        const touch = e.touches[0];
                        const rect = e.currentTarget
                          .closest("[data-grid]")!
                          .getBoundingClientRect();
                        const row = s.getRowFromTouch(touch, rect);
                        s.setMoving({
                          dayKey: dk,
                          slotIndex: i,
                          originalSlot: slot,
                          grabRow: row,
                          currentRow: row,
                          currentDayKey: dk,
                        });
                      }}
                      onTouchEnd={() => {
                        if (
                          s.moving &&
                          s.moving.grabRow === s.moving.currentRow &&
                          s.moving.dayKey === s.moving.currentDayKey
                        ) {
                          s.setSelectedSlot(isSelected ? null : { day: dk, index: i });
                        }
                        s.commitMove();
                      }}
                    >
                      <span className="block text-[11px] leading-none font-medium text-primary">
                        {s.formatSlotLabel(displaySlot)}
                      </span>
                      <button
                        className={`absolute right-1 top-1 rounded p-0.5 text-primary hover:bg-primary/20 ${isSelected ? "block" : "hidden group-hover/slot:block"}`}
                        title="Delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          s.deleteSlot(dk, i);
                        }}
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                      <div
                        className="absolute inset-x-0 top-0 h-3 cursor-n-resize sm:h-1.5"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          const rect = e.currentTarget
                            .closest("[data-grid]")!
                            .getBoundingClientRect();
                          const row = s.getRowFromY(e as unknown as React.MouseEvent, rect);
                          s.setResizing({
                            dayKey: dk,
                            slotIndex: i,
                            edge: "top",
                            originalSlot: slot,
                            currentRow: row,
                          });
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          const touch = e.touches[0];
                          const rect = e.currentTarget
                            .closest("[data-grid]")!
                            .getBoundingClientRect();
                          const row = s.getRowFromTouch(touch, rect);
                          s.setResizing({
                            dayKey: dk,
                            slotIndex: i,
                            edge: "top",
                            originalSlot: slot,
                            currentRow: row,
                          });
                        }}
                      />
                      <div
                        className="absolute inset-x-0 bottom-0 h-3 cursor-s-resize sm:h-1.5"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          const rect = e.currentTarget
                            .closest("[data-grid]")!
                            .getBoundingClientRect();
                          const row = s.getRowFromY(e as unknown as React.MouseEvent, rect);
                          s.setResizing({
                            dayKey: dk,
                            slotIndex: i,
                            edge: "bottom",
                            originalSlot: slot,
                            currentRow: row,
                          });
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          const touch = e.touches[0];
                          const rect = e.currentTarget
                            .closest("[data-grid]")!
                            .getBoundingClientRect();
                          const row = s.getRowFromTouch(touch, rect);
                          s.setResizing({
                            dayKey: dk,
                            slotIndex: i,
                            edge: "bottom",
                            originalSlot: slot,
                            currentRow: row,
                          });
                        }}
                      />
                    </div>
                  );
                })}

              {/* Ghost of a window being dragged in from another day */}
              {s.moving &&
                s.moving.currentDayKey === dk &&
                s.moving.dayKey !== dk &&
                (() => {
                  const rowDelta = s.moving.currentRow - s.moving.grabRow;
                  const originalStartRow = (s.moving.originalSlot.startHour - HOURS[0]) * 4;
                  const newStartRow = Math.max(
                    0,
                    Math.min(
                      s.availableRows - s.moving.originalSlot.slots,
                      originalStartRow + rowDelta,
                    ),
                  );
                  const topPx = newStartRow * (SLOT_HEIGHT / 4);
                  const heightPx = s.moving.originalSlot.slots * (SLOT_HEIGHT / 4);
                  return (
                    <div
                      className="absolute inset-x-0 z-10 rounded-md border border-primary/30 bg-primary/10 px-1.5 py-1 opacity-80 shadow-lg"
                      style={{ top: topPx, height: heightPx }}
                    >
                      <span className="block text-[11px] leading-none font-medium text-primary">
                        {s.formatSlotLabel(s.moving.originalSlot)}
                      </span>
                    </div>
                  );
                })()}

              {/* Live preview while dragging out a new window */}
              {s.previewSlot && s.previewSlot.day === dk && (
                <div
                  className="absolute inset-x-1 z-20 rounded-md border border-primary/40 bg-primary/20"
                  style={{
                    top: (s.previewSlot.startHour - HOURS[0]) * SLOT_HEIGHT,
                    height: s.previewSlot.slots * (SLOT_HEIGHT / 4),
                  }}
                />
              )}

              {/* Hover ghost showing what a click would create */}
              {s.hoverPos &&
                s.hoverPos.dayKey === dk &&
                !s.dragging &&
                !s.resizing &&
                !s.moving &&
                !s.ghostSuppressed &&
                (() => {
                  if (s.hoverPos.row >= s.availableRows) return null;
                  const hoverHour = HOURS[0] + s.hoverPos.row * 0.25;
                  const overlapsExisting = s.selections.some(
                    (sl) =>
                      sl.day === dk &&
                      hoverHour >= sl.startHour &&
                      hoverHour < sl.startHour + sl.slots * 0.25,
                  );
                  if (overlapsExisting) return null;
                  const clampedSlots = Math.min(
                    DURATION_SLOTS,
                    s.availableRows - s.hoverPos.row,
                  );
                  if (clampedSlots <= 0) return null;
                  const ghostTop = s.hoverPos.row * (SLOT_HEIGHT / 4);
                  const ghostHeight = clampedSlots * (SLOT_HEIGHT / 4);
                  return (
                    <div
                      className="cand-fade-in pointer-events-none absolute inset-x-1 z-5 rounded-md border border-dashed border-primary/30 bg-primary/5"
                      style={{ top: ghostTop, height: ghostHeight }}
                    >
                      <span className="block px-1.5 py-1 text-[11px] leading-none font-medium text-primary/40">
                        {s.formatSlotLabel({ slots: clampedSlots })}
                      </span>
                    </div>
                  );
                })()}

              {/* Hatched, unselectable tail hour */}
              <div
                className="absolute inset-x-0 bottom-0 border-t border-stone-200"
                style={{
                  height: SLOT_HEIGHT,
                  backgroundImage:
                    "repeating-linear-gradient(135deg, transparent, transparent 4px, rgba(0,0,0,0.04) 4px, rgba(0,0,0,0.04) 5px)",
                }}
              />

              {!dayAllowed && (
                <div
                  className="absolute inset-0 z-20"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(135deg, transparent, transparent 4px, rgba(0,0,0,0.04) 4px, rgba(0,0,0,0.04) 5px)",
                  }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Header — week title, month popover, prev / Today / next
// ---------------------------------------------------------------------------

export function AvailabilityWeekHeader({
  state: s,
  compact,
  className,
}: {
  state: AvailabilityGridState;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 border-b border-stone-200",
        compact ? "px-3 py-3" : "px-5 py-4",
        className,
      )}
    >
      <div className="flex flex-1 items-center gap-2">
        <Popover open={s.calendarOpen} onOpenChange={s.setCalendarOpen}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2 hover:opacity-70">
              <span
                className={`font-semibold text-stone-900 ${compact ? "text-base" : "text-lg"}`}
              >
                {formatWeekTitle(s.weekStart)}
              </span>
              <ChevronDown className="h-4 w-4 text-stone-500" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <ShadcnCalendar
              mode="single"
              selected={s.weekStart}
              defaultMonth={s.weekStart}
              onSelect={(date) => {
                if (date) {
                  s.setWeekStart(getMonday(date));
                  s.setCalendarOpen(false);
                }
              }}
              weekStartsOn={1}
              disabled={(date) => !s.isAllowedDate(date)}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex items-stretch rounded-lg shadow-xs">
        <button
          className="rounded-l-lg border border-stone-200 bg-white p-1.5 hover:bg-stone-50"
          onClick={() => {
            const prev = new Date(s.weekStart);
            prev.setDate(prev.getDate() - 7);
            s.setWeekStart(prev);
          }}
        >
          <ChevronLeft className="h-4 w-4 text-stone-900" />
        </button>
        <button
          className="border-y border-stone-200 bg-white px-2 py-1 text-xs font-medium text-stone-900 hover:bg-stone-50"
          onClick={() => s.setWeekStart(getMonday(new Date()))}
        >
          Today
        </button>
        <button
          className="rounded-r-lg border border-stone-200 bg-white p-1.5 hover:bg-stone-50"
          onClick={() => {
            const next = new Date(s.weekStart);
            next.setDate(next.getDate() + 7);
            s.setWeekStart(next);
          }}
        >
          <ChevronRight className="h-4 w-4 text-stone-900" />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Composed picker
// ---------------------------------------------------------------------------

export function AvailabilityWeekPicker({
  state,
  compactHeader,
  className,
}: {
  state: AvailabilityGridState;
  compactHeader?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-1 flex-col overflow-hidden", className)}>
      <AvailabilityWeekHeader state={state} compact={compactHeader} />
      <AvailabilityWeekGrid state={state} />
    </div>
  );
}
