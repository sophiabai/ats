import { useState, useCallback, useMemo } from "react"

// ---------------------------------------------------------------------------
// Self-contained candidate availability picker page.
// No imports from the rest of the codebase — only React + Tailwind.
// ---------------------------------------------------------------------------

const CANDIDATE = "Andy"
const COMPANY = "ACME"
const DURATION = "3 hour 30 minutes"
const SLOT_HEIGHT = 48
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]

const DAYS = [
  { short: "Mon", date: 5 },
  { short: "Tue", date: 6 },
  { short: "Wed", date: 7 },
  { short: "Thu", date: 8 },
  { short: "Fri", date: 9 },
]

function formatHour(h: number) {
  if (h === 0 || h === 12) return "12pm"
  if (h < 12) return `${h}am`
  return `${h - 12}pm`
}

type Slot = { day: number; startHour: number; slots: number }

export function Component() {
  const [selections, setSelections] = useState<Slot[]>([])
  const [dragging, setDragging] = useState<{
    dayIdx: number
    startRow: number
    currentRow: number
  } | null>(null)

  const previewSlot = useMemo(() => {
    if (!dragging) return null
    const minRow = Math.min(dragging.startRow, dragging.currentRow)
    const maxRow = Math.max(dragging.startRow, dragging.currentRow)
    return { day: dragging.dayIdx, startHour: HOURS[0] + minRow * 0.5, slots: maxRow - minRow + 1 }
  }, [dragging])

  const toggleSlotAtPosition = useCallback(
    (dayIdx: number, row: number) => {
      const hour = HOURS[0] + row * 0.5
      const existingIdx = selections.findIndex(
        (s) => s.day === dayIdx && hour >= s.startHour && hour < s.startHour + s.slots * 0.5
      )
      if (existingIdx >= 0) {
        setSelections((prev) => prev.filter((_, i) => i !== existingIdx))
      }
    },
    [selections]
  )

  const commitDrag = useCallback(() => {
    if (!dragging) return
    const minRow = Math.min(dragging.startRow, dragging.currentRow)
    const maxRow = Math.max(dragging.startRow, dragging.currentRow)
    const newSlot: Slot = {
      day: dragging.dayIdx,
      startHour: HOURS[0] + minRow * 0.5,
      slots: maxRow - minRow + 1,
    }
    setSelections((prev) => {
      const filtered = prev.filter(
        (s) =>
          s.day !== newSlot.day ||
          s.startHour + s.slots * 0.5 <= newSlot.startHour ||
          newSlot.startHour + newSlot.slots * 0.5 <= s.startHour
      )
      return [...filtered, newSlot]
    })
    setDragging(null)
  }, [dragging])

  const totalRows = (HOURS.length - 1) * 2

  function getRowFromY(e: React.MouseEvent, containerRect: DOMRect) {
    const y = e.clientY - containerRect.top
    const row = Math.floor(y / (SLOT_HEIGHT / 2))
    return Math.max(0, Math.min(totalRows - 1, row))
  }

  function formatSlotLabel(slot: Slot) {
    const hours = (slot.slots * 0.5)
    if (hours >= 1) {
      const h = Math.floor(hours)
      const m = (hours - h) * 60
      return `Available (${h}h${m > 0 ? ` ${m}m` : ""})`
    }
    return `Available (${hours * 60}m)`
  }

  const isValid = selections.length >= 2

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-[#fafafa]">
      {/* Gradient background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 80% at 20% 60%, rgba(180,160,255,0.25) 0%, transparent 60%), radial-gradient(ellipse 100% 80% at 80% 40%, rgba(120,200,255,0.3) 0%, transparent 60%)",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-1 items-start justify-center px-8 pb-[200px] pt-14">
        <div className="flex w-[884px] overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          {/* Left summary panel */}
          <div className="flex w-[264px] shrink-0 flex-col gap-10 border-r border-black/10 p-6">
            {/* Company logo */}
            <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-stone-200 bg-white">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(180,140,255,0.6) 0%, rgba(255,160,80,0.6) 50%, rgba(120,200,255,0.5) 100%)",
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold tracking-wider text-white drop-shadow-sm">
                  ACME
                </span>
              </div>
            </div>

            {/* Greeting */}
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">Hi {CANDIDATE},</p>
              <p className="text-lg font-semibold leading-7 text-stone-900">
                Share your availability to meet with {COMPANY}
              </p>
            </div>

            {/* Metadata */}
            <div className="flex flex-col gap-6">
              {/* Duration */}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                  <ClockIcon className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Duration</span>
                  <span className="text-sm font-medium text-stone-900">{DURATION}</span>
                </div>
              </div>

              {/* Timezone */}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
                  <MapPinIcon className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Display time zone</span>
                  <span className="flex items-center gap-1 text-sm font-medium text-stone-900">
                    Pacific Day Time
                    <ChevronDownIcon className="h-4 w-4 text-stone-500" />
                  </span>
                </div>
              </div>

              {/* Language */}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                  <GlobeIcon className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Display language</span>
                  <span className="flex items-center gap-1 text-sm font-medium text-stone-900">
                    EN (US)
                    <ChevronDownIcon className="h-4 w-4 text-stone-500" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right calendar area */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Calendar header */}
            <div className="flex items-center gap-2 border-b border-stone-200 px-5 py-4">
              <div className="flex flex-1 items-center gap-2">
                <span className="text-lg font-semibold text-stone-900">Monday, May 5, 2025</span>
                <ChevronDownIcon className="h-4 w-4 text-stone-500" />
              </div>
              <div className="flex items-stretch shadow-xs">
                <button className="rounded-l-lg border border-stone-200 bg-white p-1.5 hover:bg-stone-50">
                  <ChevronLeftIcon className="h-4 w-4 text-stone-900" />
                </button>
                <button className="border-y border-stone-200 bg-white px-2 py-1 text-xs font-medium text-stone-900 hover:bg-stone-50">
                  Today
                </button>
                <button className="rounded-r-lg border border-stone-200 bg-white p-1.5 hover:bg-stone-50">
                  <ChevronRightIcon className="h-4 w-4 text-stone-900" />
                </button>
              </div>
            </div>

            {/* Calendar grid */}
            <div className="flex flex-1 overflow-hidden">
              {/* Time column */}
              <div className="flex w-[52px] shrink-0 flex-col border-r border-stone-200">
                {/* Header spacer */}
                <div className="h-14 shrink-0 border-b border-black/10 shadow-sm" />
                {HOURS.slice(0, -1).map((h) => (
                  <div key={h} className="flex h-12 shrink-0 items-start justify-end pr-1">
                    <span className="text-xs text-muted-foreground">{formatHour(h)}</span>
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {DAYS.map((day, dayIdx) => (
                <div
                  key={day.short}
                  className="relative flex flex-1 flex-col border-r border-stone-200 last:border-r-0"
                >
                  {/* Day header */}
                  <div className="flex h-14 shrink-0 flex-col items-center justify-center border-b border-black/10 p-2 shadow-sm">
                    <span className="text-xs text-muted-foreground">{day.short}</span>
                    <span className="text-base font-medium text-stone-900">{day.date}</span>
                  </div>

                  {/* Slot grid */}
                  <div
                    className="relative select-none"
                    style={{ height: (HOURS.length - 1) * SLOT_HEIGHT }}
                    onMouseDown={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const row = getRowFromY(e, rect)
                      const clickHour = HOURS[0] + row * 0.5
                      const hitIdx = selections.findIndex(
                        (s) =>
                          s.day === dayIdx &&
                          clickHour >= s.startHour &&
                          clickHour < s.startHour + s.slots * 0.5
                      )
                      if (hitIdx >= 0) {
                        toggleSlotAtPosition(dayIdx, row)
                      } else {
                        setDragging({ dayIdx, startRow: row, currentRow: row })
                      }
                    }}
                    onMouseMove={(e) => {
                      if (!dragging || dragging.dayIdx !== dayIdx) return
                      const rect = e.currentTarget.getBoundingClientRect()
                      const row = getRowFromY(e, rect)
                      if (row !== dragging.currentRow) {
                        setDragging((prev) => (prev ? { ...prev, currentRow: row } : null))
                      }
                    }}
                    onMouseUp={commitDrag}
                    onMouseLeave={() => {
                      if (dragging) commitDrag()
                    }}
                  >
                    {/* Hour grid lines */}
                    {HOURS.slice(0, -1).map((h, i) => (
                      <div
                        key={h}
                        className="absolute w-full border-b border-black/10"
                        style={{ top: (i + 1) * SLOT_HEIGHT }}
                      />
                    ))}

                    {/* Half-hour grid lines */}
                    {HOURS.slice(0, -1).map((h, i) => (
                      <div
                        key={`half-${h}`}
                        className="absolute w-full border-b border-black/5"
                        style={{ top: i * SLOT_HEIGHT + SLOT_HEIGHT / 2 }}
                      />
                    ))}

                    {/* Selected slots */}
                    {selections
                      .filter((s) => s.day === dayIdx)
                      .map((slot, i) => {
                        const topPx = (slot.startHour - HOURS[0]) * (SLOT_HEIGHT * 2)
                        const heightPx = slot.slots * (SLOT_HEIGHT / 2)
                        return (
                          <div
                            key={i}
                            className="absolute inset-x-1 z-10 cursor-pointer rounded-md border border-blue-300 bg-blue-100/80 px-1.5 py-1"
                            style={{ top: topPx, height: heightPx }}
                          >
                            <span className="text-[11px] font-medium text-blue-700">
                              {formatSlotLabel(slot)}
                            </span>
                          </div>
                        )
                      })}

                    {/* Drag preview */}
                    {previewSlot && previewSlot.day === dayIdx && (
                      <div
                        className="absolute inset-x-1 z-20 rounded-md border border-blue-400 bg-blue-200/60"
                        style={{
                          top: (previewSlot.startHour - HOURS[0]) * (SLOT_HEIGHT * 2),
                          height: previewSlot.slots * (SLOT_HEIGHT / 2),
                        }}
                      />
                    )}

                    {/* Unavailable last row hatched */}
                    <div
                      className="absolute inset-x-0 bottom-0 border-t border-stone-200"
                      style={{
                        height: SLOT_HEIGHT,
                        backgroundImage:
                          "repeating-linear-gradient(135deg, transparent, transparent 4px, rgba(0,0,0,0.04) 4px, rgba(0,0,0,0.04) 5px)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-end gap-3 border-t border-stone-200 bg-stone-100/30 p-5 backdrop-blur-sm">
        {!isValid && (
          <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600">
            Please select at least 2 time slots
          </span>
        )}
        <button
          disabled={!isValid}
          className="rounded-lg bg-[#587dff] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Inline SVG icons
// ---------------------------------------------------------------------------
function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
