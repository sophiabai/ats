import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DAY_LONG,
  DAY_SHORT,
  MONTH_NAMES,
  addBusinessDays,
  dateKey,
  getCalendarGrid,
} from "@/features/candidates/components/scheduling/scheduling-date-utils";
import {
  createSelfScheduleWindow,
  isSelfScheduleDate,
  makeSelfScheduleSlotGenerator,
} from "@/features/candidates/components/scheduling/self-schedule-slots";

export type CandidateTimeSlot = {
  time: string;
  available: boolean;
  multiDay?: { label: string; ranges: string[] }[];
};






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
  /** When true, hides the Today button. */
  compactHeader?: boolean;
  /** `sm` for the recruiter preview panel, `md` for the full candidate page. */
  size?: "sm" | "md";
  /** `split` puts next beside Today; `grouped` puts prev+next together on the left. */
  navLayout?: "split" | "grouped";
};

export function CandidateCalendarGrid({
  viewMonth,
  onChangeViewMonth,
  selectedDate,
  onSelectDate,
  isAvailableDate,
  className,
  compactHeader = false,
  size = "sm",
  navLayout = "split",
}: CandidateCalendarGridProps) {
  const md = size === "md";
  const navBtn = md
    ? "rounded-lg p-1.5 hover:bg-stone-100"
    : "rounded-md p-1 hover:bg-stone-100";
  const navIcon = md ? "h-4 w-4 text-stone-900" : "h-3.5 w-3.5 text-stone-900";
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
      <div className={cn("flex items-center justify-between", md ? "pb-4" : "pb-3")}>
        {navLayout === "grouped" ? (
          <div className="flex items-center gap-1">
            <button className={navBtn} onClick={prevMonth}>
              <ChevronLeftIcon className={navIcon} />
            </button>
            <button className={navBtn} onClick={nextMonth}>
              <ChevronRightIcon className={navIcon} />
            </button>
          </div>
        ) : (
          <button className={navBtn} onClick={prevMonth}>
            <ChevronLeftIcon className={navIcon} />
          </button>
        )}

        <div
          className={cn(
            "flex items-center font-medium text-foreground",
            md ? "gap-3 text-lg" : "gap-2 text-sm",
          )}
        >
          <span>{MONTH_NAMES[viewMonth.month]}</span>
          <span className="font-normal text-muted-foreground">{viewMonth.year}</span>
        </div>

        <div className="flex items-center gap-1">
          {navLayout === "split" && (
            <button className={navBtn} onClick={nextMonth}>
              <ChevronRightIcon className={navIcon} />
            </button>
          )}
          {!compactHeader && (
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
          )}
        </div>
      </div>

      <div
        className={cn(
          "grid grid-cols-7 text-center font-medium uppercase tracking-wide text-muted-foreground",
          md ? "gap-1 text-[11px]" : "gap-0.5 text-[10px]",
        )}
      >
        {DAY_SHORT.map((d) => (
          <div key={d} className={md ? "py-1" : "py-0.5"}>{d}</div>
        ))}
      </div>
      <div className="mb-1 h-px bg-border" />

      <div className={cn("grid grid-cols-7", md ? "gap-1" : "gap-0.5")}>
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
                "relative flex aspect-square items-center justify-center transition-colors",
                md ? "rounded-lg text-sm" : "rounded-md text-xs",
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
  size = "sm",
  hideMultiDay = false,
  selectMode = "direct",
  onConfirmSlot,
  tone = "outline",
  showHeading = true,
}: {
  selectedDate: Date | null;
  slots: CandidateTimeSlot[];
  selectedSlot: string | null;
  onSelectSlot: (slotId: string) => void;
  className?: string;
  /** `sm` for the recruiter preview panel, `md` for the full candidate page. */
  size?: "sm" | "md";
  /** Hide multi-day options (the mobile slot screen shows single-day only). */
  hideMultiDay?: boolean;
  /**
   * `direct` selects on tap. `confirm` reveals an inline Select button beside
   * the tapped slot — the mobile two-tap guard, so a mis-tap on a small target
   * cannot book an interview.
   */
  selectMode?: "direct" | "confirm";
  /** Called when the Select button is pressed in `confirm` mode. */
  onConfirmSlot?: (slotId: string) => void;
  /** `accent` gives filled slot buttons — bigger touch affordance on mobile. */
  tone?: "outline" | "accent";
  /** Suppress the day heading when the host already shows the date. */
  showHeading?: boolean;
}) {
  const md = size === "md";
  const accent = tone === "accent";
  const visibleSlots = hideMultiDay ? slots.filter((s) => !s.multiDay) : slots;
  return (
    <div className={cn("flex flex-col", className)}>
      {selectedDate ? (
        <>
          {showHeading && (
            <h3
              className={cn(
                "font-semibold text-foreground",
                md ? "pb-4 text-base" : "pb-3 text-sm",
              )}
            >
              {DAY_LONG[selectedDate.getDay()]} {selectedDate.getDate()}
            </h3>
          )}
          <div
            className={cn(
              "flex flex-col overflow-y-auto",
              accent ? "gap-4" : md ? "gap-2" : "gap-1.5",
            )}
          >
            {visibleSlots.map((slot, i) =>
              slot.multiDay ? (
                <div key={i} className="flex flex-col gap-1">
                  <p
                    className={cn(
                      "font-medium text-muted-foreground",
                      md ? "pt-2 text-xs" : "pt-1.5 text-xs",
                    )}
                  >
                    Multi-day options starting on this day
                  </p>
                  <button
                    onClick={() => onSelectSlot(`multi-${i}`)}
                    className={cn(
                      "border text-left transition-colors",
                      md ? "rounded-lg px-3 py-2 text-sm" : "rounded-md px-2.5 py-1.5 text-xs",
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
                <div key={i} className={cn("flex", selectMode === "confirm" && "gap-2")}>
                  <button
                    onClick={() => onSelectSlot(slot.time)}
                    className={cn(
                      "border font-medium transition-colors",
                      accent
                        ? "rounded-lg px-6 py-2.5 text-sm"
                        : md
                          ? "rounded-lg px-3 py-2 text-sm"
                          : "rounded-md px-2.5 py-1.5 text-xs",
                      selectMode === "confirm" && "flex-1",
                      accent
                        ? selectedSlot === slot.time
                          ? "border-primary bg-accent text-foreground"
                          : "border-border bg-accent text-foreground"
                        : selectedSlot === slot.time
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-foreground hover:border-primary/40",
                    )}
                  >
                    {slot.time}
                  </button>
                  {selectMode === "confirm" && selectedSlot === slot.time && (
                    <Button
                      className="cand-fade-in h-auto flex-1"
                      onClick={() => onConfirmSlot?.(slot.time)}
                    >
                      Select
                    </Button>
                  )}
                </div>
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
  // Defaults to the shared self-schedule rules, so this preview and the real
  // candidate page cannot drift apart.
  const window = useMemo(() => {
    const base = createSelfScheduleWindow();
    return { start: windowStart ?? base.start, end: windowEnd ?? base.end };
  }, [windowStart, windowEnd]);

  const defaultWindowStart = window.start;

  const isAvailableDate = useMemo(
    () => (d: Date) => isSelfScheduleDate(d, window),
    [window],
  );

  const slotGenerator = useMemo(
    () => generateSlots ?? makeSelfScheduleSlotGenerator(window),
    [generateSlots, window],
  );

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
