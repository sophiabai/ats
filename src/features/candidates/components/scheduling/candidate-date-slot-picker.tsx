import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export type CandidateTimeSlot = {
  time: string;
  available: boolean;
  multiDay?: { label: string; ranges: string[] }[];
};

function addBusinessDays(from: Date, n: number) {
  const d = new Date(from);
  let added = 0;
  while (added < n) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return d;
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getCalendarGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const cells: { day: number; current: boolean; date: Date }[] = [];
  for (let i = startDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    cells.push({ day: d, current: false, date: new Date(year, month - 1, d) });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true, date: new Date(year, month, d) });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, current: false, date: new Date(year, month + 1, d) });
  }
  return cells;
}

function defaultIsAvailableDate(d: Date, windowStart: Date, windowEnd: Date) {
  const dow = d.getDay();
  if (dow === 0 || dow === 6) return false;
  const dk = dateKey(d);
  return dk >= dateKey(windowStart) && dk <= dateKey(windowEnd);
}

function defaultGenerateSlots(
  date: Date,
  windowStart: Date,
  windowEnd: Date,
): CandidateTimeSlot[] {
  const dow = date.getDay();
  if (dow === 0 || dow === 6 || !defaultIsAvailableDate(date, windowStart, windowEnd)) {
    return [];
  }
  return [
    { time: "9:00 am", available: true },
    { time: "10:00 am", available: true },
    { time: "1:00 pm", available: true },
  ];
}

// ---------------------------------------------------------------------------
// Calendar grid (month view)
// ---------------------------------------------------------------------------

export type CandidateCalendarGridProps = {
  viewMonth: { year: number; month: number };
  onChangeViewMonth: (v: { year: number; month: number }) => void;
  selectedDate: Date | null;
  onSelectDate: (d: Date) => void;
  isAvailableDate: (d: Date) => boolean;
  className?: string;
  /** When true, shows Today button + previous/next month in a compact header. */
  compactHeader?: boolean;
};

export function CandidateCalendarGrid({
  viewMonth,
  onChangeViewMonth,
  selectedDate,
  onSelectDate,
  isAvailableDate,
  className,
  compactHeader = false,
}: CandidateCalendarGridProps) {
  const cells = useMemo(
    () => getCalendarGrid(viewMonth.year, viewMonth.month),
    [viewMonth],
  );
  const today = useMemo(() => dateKey(new Date()), []);

  function prevMonth() {
    onChangeViewMonth(
      viewMonth.month === 0
        ? { year: viewMonth.year - 1, month: 11 }
        : { ...viewMonth, month: viewMonth.month - 1 },
    );
  }
  function nextMonth() {
    onChangeViewMonth(
      viewMonth.month === 11
        ? { year: viewMonth.year + 1, month: 0 }
        : { ...viewMonth, month: viewMonth.month + 1 },
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between pb-3">
        <button className="rounded-md p-1 hover:bg-stone-100" onClick={prevMonth}>
          <ChevronLeftIcon className="h-3.5 w-3.5 text-stone-900" />
        </button>
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <span>{MONTH_NAMES[viewMonth.month]}</span>
          <span className="font-normal text-muted-foreground">{viewMonth.year}</span>
        </div>
        {compactHeader ? (
          <button className="rounded-md p-1 hover:bg-stone-100" onClick={nextMonth}>
            <ChevronRightIcon className="h-3.5 w-3.5 text-stone-900" />
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <button className="rounded-md p-1 hover:bg-stone-100" onClick={nextMonth}>
              <ChevronRightIcon className="h-3.5 w-3.5 text-stone-900" />
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const now = new Date();
                onChangeViewMonth({ year: now.getFullYear(), month: now.getMonth() });
              }}
            >
              Today
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {DAY_SHORT.map((d) => (
          <div key={d} className="py-0.5">{d}</div>
        ))}
      </div>
      <div className="mb-1 h-px bg-border" />

      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((cell, i) => {
          const dk = dateKey(cell.date);
          const isToday = dk === today;
          const isSelected = selectedDate && dk === dateKey(selectedDate);
          const available = cell.current && isAvailableDate(cell.date);
          const hasTodayDot = isToday && cell.current;
          return (
            <button
              key={i}
              disabled={!available}
              onClick={() => onSelectDate(cell.date)}
              className={cn(
                "relative flex aspect-square items-center justify-center rounded-md text-xs transition-colors",
                !cell.current && "text-stone-300",
                cell.current && !available && "text-stone-300",
                cell.current && available && !isSelected && "text-foreground hover:bg-stone-100",
                cell.current &&
                  available &&
                  cell.date.getDay() >= 1 &&
                  cell.date.getDay() <= 5 &&
                  !isSelected &&
                  "font-medium text-primary",
                isSelected && "bg-primary font-semibold text-primary-foreground",
                isToday && !isSelected && "font-semibold",
              )}
            >
              {cell.day}
              {hasTodayDot && !isSelected && (
                <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Slot list column
// ---------------------------------------------------------------------------

export function CandidateSlotList({
  selectedDate,
  slots,
  selectedSlot,
  onSelectSlot,
  className,
}: {
  selectedDate: Date | null;
  slots: CandidateTimeSlot[];
  selectedSlot: string | null;
  onSelectSlot: (slotId: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      {selectedDate ? (
        <>
          <h3 className="pb-3 text-sm font-semibold text-foreground">
            {DAY_LONG[selectedDate.getDay()]} {selectedDate.getDate()}
          </h3>
          <div className="flex flex-col gap-1.5 overflow-y-auto">
            {slots.map((slot, i) =>
              slot.multiDay ? (
                <div key={i} className="flex flex-col gap-1">
                  <p className="pt-1.5 text-xs font-medium text-muted-foreground">
                    Multi-day options starting on this day
                  </p>
                  <button
                    onClick={() => onSelectSlot(`multi-${i}`)}
                    className={cn(
                      "rounded-md border px-2.5 py-1.5 text-left text-xs transition-colors",
                      selectedSlot === `multi-${i}`
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-foreground hover:border-primary/40",
                    )}
                  >
                    {slot.multiDay.map((day, di) => (
                      <div key={di} className={di > 0 ? "mt-3" : ""}>
                        <span
                          className={cn(
                            selectedSlot === `multi-${i}`
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground",
                          )}
                        >
                          {day.label}
                        </span>
                        {day.ranges.map((r, ri) => (
                          <p key={ri} className="font-medium">{r}</p>
                        ))}
                      </div>
                    ))}
                  </button>
                </div>
              ) : (
                <button
                  key={i}
                  onClick={() => onSelectSlot(slot.time)}
                  className={cn(
                    "rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
                    selectedSlot === slot.time
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-foreground hover:border-primary/40",
                  )}
                >
                  {slot.time}
                </button>
              ),
            )}
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Select a date to see available times
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Composed date + slot picker
// ---------------------------------------------------------------------------

export type CandidateDateSlotPickerProps = {
  /** First date the candidate may pick. Defaults to 2 business days from today. */
  windowStart?: Date;
  /** Last date the candidate may pick. Defaults to 13 days after windowStart. */
  windowEnd?: Date;
  /** Override slot generation. Defaults to a small fixed set of weekday slots. */
  generateSlots?: (date: Date) => CandidateTimeSlot[];
  /** Initial selected date. */
  initialDate?: Date | null;
  /** Initial selected slot id (`slot.time` or `multi-<idx>`). */
  initialSlot?: string | null;
  onSelectionChange?: (selection: {
    date: Date | null;
    slotId: string | null;
  }) => void;
  className?: string;
  calendarClassName?: string;
  slotsClassName?: string;
  compactCalendarHeader?: boolean;
};

export function CandidateDateSlotPicker({
  windowStart,
  windowEnd,
  generateSlots,
  initialDate = null,
  initialSlot = null,
  onSelectionChange,
  className,
  calendarClassName,
  slotsClassName,
  compactCalendarHeader = false,
}: CandidateDateSlotPickerProps) {
  const defaultWindowStart = useMemo(
    () => windowStart ?? addBusinessDays(new Date(), 2),
    [windowStart],
  );
  const defaultWindowEnd = useMemo(() => {
    if (windowEnd) return windowEnd;
    const d = new Date(defaultWindowStart);
    d.setDate(d.getDate() + 13);
    return d;
  }, [windowEnd, defaultWindowStart]);

  const isAvailableDate = (d: Date) =>
    defaultIsAvailableDate(d, defaultWindowStart, defaultWindowEnd);

  const slotGenerator =
    generateSlots ?? ((d: Date) => defaultGenerateSlots(d, defaultWindowStart, defaultWindowEnd));

  const [viewMonth, setViewMonth] = useState(() => ({
    year: (initialDate ?? defaultWindowStart).getFullYear(),
    month: (initialDate ?? defaultWindowStart).getMonth(),
  }));
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(initialSlot);

  const slots = useMemo(
    () => (selectedDate ? slotGenerator(selectedDate) : []),
    [selectedDate, slotGenerator],
  );

  function notify(next: { date: Date | null; slotId: string | null }) {
    onSelectionChange?.(next);
  }

  return (
    <div className={cn("flex", className)}>
      <CandidateCalendarGrid
        viewMonth={viewMonth}
        onChangeViewMonth={setViewMonth}
        selectedDate={selectedDate}
        onSelectDate={(d) => {
          setSelectedDate(d);
          setSelectedSlot(null);
          notify({ date: d, slotId: null });
        }}
        isAvailableDate={isAvailableDate}
        compactHeader={compactCalendarHeader}
        className={calendarClassName}
      />
      <CandidateSlotList
        selectedDate={selectedDate}
        slots={slots}
        selectedSlot={selectedSlot}
        onSelectSlot={(slotId) => {
          setSelectedSlot(slotId);
          notify({ date: selectedDate, slotId });
        }}
        className={slotsClassName}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers re-exported for callers that need them
// ---------------------------------------------------------------------------

export { dateKey, addBusinessDays, MONTH_NAMES, DAY_LONG, DAY_SHORT };

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
