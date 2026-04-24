import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// ---------------------------------------------------------------------------
// Candidate availability picker page.
// Uses the "customer-brand" theme for primary color (#587dff).
// ---------------------------------------------------------------------------

const CANDIDATE = "Andy"
const COMPANY = "ACME"
const DURATION = "3 hours 30 minutes"
const DURATION_SLOTS = 14 // 3h30m = 14 quarter-hour slots
const SLOT_HEIGHT = 48
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]
const DAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

function getMonday(d: Date) {
  const date = new Date(d)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  return date
}

function addBusinessDays(from: Date, n: number) {
  const d = new Date(from)
  let added = 0
  while (added < n) {
    d.setDate(d.getDate() + 1)
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) added++
  }
  return d
}

const SCHEDULE_WINDOW_START = addBusinessDays(new Date(), 2)
const SCHEDULE_WINDOW_END = (() => {
  const d = new Date(SCHEDULE_WINDOW_START)
  d.setDate(d.getDate() + 13)
  return d
})()

function isAllowedDate(d: Date) {
  const dow = d.getDay()
  if (dow === 0 || dow === 6) return false
  const dk = dateKey(d)
  return dk >= dateKey(SCHEDULE_WINDOW_START) && dk <= dateKey(SCHEDULE_WINDOW_END)
}

function getWeekDays(monday: Date) {
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return { short: DAY_NAMES[d.getDay()], date: d.getDate(), full: d }
  })
}

function formatWeekTitle(monday: Date) {
  return `${DAY_LONG[monday.getDay()]}, ${MONTH_NAMES[monday.getMonth()]} ${monday.getDate()}, ${monday.getFullYear()}`
}

function formatHour(h: number) {
  if (h === 0 || h === 12) return "12pm"
  if (h < 12) return `${h}am`
  return `${h - 12}pm`
}

type Slot = { day: string; startHour: number; slots: number }

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function Component() {
  const [weekStart, setWeekStart] = useState(() => getMonday(SCHEDULE_WINDOW_START))
  const [calendarOpen, setCalendarOpen] = useState(false)
  const days = useMemo(() => getWeekDays(weekStart), [weekStart])

  const [selections, setSelections] = useState<Slot[]>([])
  const [dragging, setDragging] = useState<{
    dayKey: string
    startRow: number
    currentRow: number
  } | null>(null)
  const [resizing, setResizing] = useState<{
    dayKey: string
    slotIndex: number
    edge: "top" | "bottom"
    originalSlot: Slot
    currentRow: number
  } | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; index: number } | null>(null)
  const [hoverPos, setHoverPos] = useState<{ dayKey: string; row: number } | null>(null)
  const [moving, setMoving] = useState<{
    dayKey: string
    slotIndex: number
    originalSlot: Slot
    grabRow: number
    currentRow: number
    currentDayKey: string
  } | null>(null)

  const totalRows = (HOURS.length - 1) * 4
  const availableRows = (HOURS.length - 2) * 4 // rows before the unavailable last hour
  const lastDeleteTime = useRef(0)
  const [ghostSuppressed, setGhostSuppressed] = useState(false)

  const deleteSlot = useCallback((dayKey: string, slotIndex: number) => {
    const daySlots = selections.filter((s) => s.day === dayKey)
    const target = daySlots[slotIndex]
    if (target) {
      setSelections((prev) =>
        prev.filter(
          (s) => !(s.day === target.day && s.startHour === target.startHour && s.slots === target.slots)
        )
      )
      lastDeleteTime.current = Date.now()
      setGhostSuppressed(true)
      setTimeout(() => setGhostSuppressed(false), 1000)
    }
  }, [selections])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!selectedSlot) return
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault()
        deleteSlot(selectedSlot.day, selectedSlot.index)
        setSelectedSlot(null)
      } else if (e.key === "Escape") {
        setSelectedSlot(null)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedSlot, deleteSlot])

  const previewSlot = useMemo(() => {
    if (!dragging) return null
    const minRow = Math.min(dragging.startRow, Math.min(dragging.currentRow, availableRows - 1))
    const maxRow = Math.min(Math.max(dragging.startRow, dragging.currentRow), availableRows - 1)
    const draggedSlots = maxRow - minRow + 1
    const actualSlots = Math.min(
      draggedSlots < DURATION_SLOTS ? Math.max(DURATION_SLOTS, draggedSlots) : draggedSlots,
      availableRows - minRow,
    )
    return { day: dragging.dayKey, startHour: HOURS[0] + minRow * 0.25, slots: actualSlots }
  }, [dragging, availableRows])

  function mergeOverlapping(slots: Slot[]): Slot[] {
    const byDay = new Map<string, Slot[]>()
    for (const s of slots) {
      const arr = byDay.get(s.day) ?? []
      arr.push(s)
      byDay.set(s.day, arr)
    }
    const result: Slot[] = []
    for (const [, daySlots] of byDay) {
      daySlots.sort((a, b) => a.startHour - b.startHour)
      const merged: Slot[] = [{ ...daySlots[0] }]
      for (let i = 1; i < daySlots.length; i++) {
        const prev = merged[merged.length - 1]
        const cur = daySlots[i]
        const prevEnd = prev.startHour + prev.slots * 0.25
        if (cur.startHour <= prevEnd) {
          const curEnd = cur.startHour + cur.slots * 0.25
          const newEnd = Math.max(prevEnd, curEnd)
          prev.slots = Math.round((newEnd - prev.startHour) / 0.25)
        } else {
          merged.push({ ...cur })
        }
      }
      result.push(...merged)
    }
    return result
  }

  const commitDrag = useCallback(() => {
    if (!dragging) return
    const minRow = Math.min(dragging.startRow, Math.min(dragging.currentRow, availableRows - 1))
    const maxRow = Math.min(Math.max(dragging.startRow, dragging.currentRow), availableRows - 1)
    const draggedSlots = maxRow - minRow + 1
    const actualSlots = Math.min(
      draggedSlots < DURATION_SLOTS ? Math.max(DURATION_SLOTS, draggedSlots) : draggedSlots,
      availableRows - minRow,
    )
    const newSlot: Slot = {
      day: dragging.dayKey,
      startHour: HOURS[0] + minRow * 0.25,
      slots: actualSlots,
    }
    setSelections((prev) => mergeOverlapping([...prev, newSlot]))
    setDragging(null)
  }, [dragging, availableRows])

  const commitResize = useCallback(() => {
    if (!resizing) return
    const { dayKey, slotIndex, edge, originalSlot, currentRow } = resizing
    const daySlots = selections.filter((s) => s.day === dayKey)
    const target = daySlots[slotIndex]
    if (!target) { setResizing(null); return }

    let newStartHour = originalSlot.startHour
    let newSlots = originalSlot.slots

    if (edge === "bottom") {
      const clampedEnd = Math.min(currentRow + 1, availableRows)
      const startRow = (originalSlot.startHour - HOURS[0]) * 4
      newSlots = Math.max(1, clampedEnd - startRow)
    } else {
      const originalEndRow = Math.min((originalSlot.startHour - HOURS[0]) * 4 + originalSlot.slots, availableRows)
      newStartHour = HOURS[0] + currentRow * 0.25
      newSlots = Math.max(1, originalEndRow - currentRow)
    }

    setSelections((prev) =>
      mergeOverlapping(
        prev.map((s) =>
          s.day === target.day && s.startHour === target.startHour && s.slots === target.slots
            ? { ...s, startHour: newStartHour, slots: newSlots }
            : s
        )
      )
    )
    setResizing(null)
  }, [resizing, selections])

  const commitMove = useCallback(() => {
    if (!moving) return
    const { dayKey, slotIndex, originalSlot, grabRow, currentRow, currentDayKey } = moving
    const daySlots = selections.filter((s) => s.day === dayKey)
    const target = daySlots[slotIndex]
    if (!target) { setMoving(null); return }

    const rowDelta = currentRow - grabRow
    const originalStartRow = (originalSlot.startHour - HOURS[0]) * 4
    const newStartRow = Math.max(0, Math.min(availableRows - originalSlot.slots, originalStartRow + rowDelta))
    const newStartHour = HOURS[0] + newStartRow * 0.25

    setSelections((prev) =>
      mergeOverlapping(
        prev.map((s) =>
          s.day === target.day && s.startHour === target.startHour && s.slots === target.slots
            ? { ...s, day: currentDayKey, startHour: newStartHour }
            : s
        )
      )
    )
    setMoving(null)
  }, [moving, selections, totalRows])

  useEffect(() => {
    if (!moving) return
    function handleGlobalMouseUp() {
      commitMove()
    }
    window.addEventListener("mouseup", handleGlobalMouseUp)
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp)
  }, [moving, commitMove])

  function getRowFromY(e: React.MouseEvent, containerRect: DOMRect) {
    const y = e.clientY - containerRect.top
    const row = Math.floor(y / (SLOT_HEIGHT / 4))
    return Math.max(0, Math.min(totalRows - 1, row))
  }

  function formatSlotLabel(slot: Slot) {
    const hours = (slot.slots * 0.25)
    let duration: string
    if (hours >= 1) {
      const h = Math.floor(hours)
      const m = (hours - h) * 60
      duration = `${h}h${m > 0 ? ` ${m}m` : ""}`
    } else {
      duration = `${hours * 60}m`
    }
    return (<>Available<br />{duration}</>)
  }

  const isValid = selections.length >= 2
  const [step, setStep] = useState(1)
  const [note, setNote] = useState("")

  function formatSlotTime(hour: number) {
    const h = Math.floor(hour)
    const m = Math.round((hour - h) * 60)
    const ampm = h >= 12 ? "pm" : "am"
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
    return m === 0 ? `${h12}:00${ampm}` : `${h12}:${String(m).padStart(2, "0")}${ampm}`
  }

  function parseDateKey(dk: string) {
    const [y, m, d] = dk.split("-").map(Number)
    return new Date(y, m - 1, d)
  }

  const groupedSelections = useMemo(() => {
    const byDay = new Map<string, Slot[]>()
    for (const s of selections) {
      const arr = byDay.get(s.day) ?? []
      arr.push(s)
      byDay.set(s.day, arr)
    }
    const sorted = [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b))
    return sorted.map(([dk, slots]) => {
      const d = parseDateKey(dk)
      const label = `${DAY_LONG[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
      const ranges = slots
        .sort((a, b) => a.startHour - b.startHour)
        .map((s) => {
          const end = s.startHour + s.slots * 0.25
          return `${formatSlotTime(s.startHour)} - ${formatSlotTime(end)} (PST)`
        })
      return { label, ranges }
    })
  }, [selections])

  return (
    <div
      className="customer-brand relative flex min-h-svh flex-col overflow-hidden bg-muted"
      style={{
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "repeat",
        backgroundImage: `url("data:image/svg+xml;utf8,%3Csvg xmlns=%22http:%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width=%222560%22 height=%221440%22%3E%3Cg filter=%22url(%23a)%22%3E%3Cg filter=%22url(%23b)%22%3E%3Cpath fill=%22%23fff%22 d=%22M-1280-720h5120v2880h-5120z%22%2F%3E%3Cpath d=%22M-92.757-796.64-663.637 328l636.16 1306.08 1388.8-231.84%22 fill=%22%23022afa%22%2F%3E%3Cpath d=%22m724.02 114.312-186.88 819.36 1239.04 1203.84 643.84-367.2%22 fill=%22%23022afa%22%2F%3E%3Cpath d=%22m1049.508-900.37-1283.84 511.2 686.08 1543.68 1324.8-210.24M2481.644 299.692l-842.24 1127.52 1032.96 773.28 451.84-960.48%22 fill=%22%23fff%22%2F%3E%3Cpath d=%22m1116.415 96.204-752.64 106.56 535.04 1376.64 802.56-486.72%22 fill=%22%23022afa%22%2F%3E%3Cpath d=%22m3177.527-912.072-1736.96 1241.28 180.48 874.08 1756.16-1981.44%22 fill=%22%2300e0ff%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3Cpath fill=%22%23fff%22 filter=%22url(%23c)%22 d=%22M0 0h2560v1440H0z%22%2F%3E%3Cdefs%3E%3Cfilter id=%22a%22%3E%3CfeComponentTransfer%3E%3CfeFuncR type=%22linear%22 slope=%221.04%22 intercept=%22-.02%22%2F%3E%3CfeFuncG type=%22linear%22 slope=%221.04%22 intercept=%22-.02%22%2F%3E%3CfeFuncB type=%22linear%22 slope=%221.04%22 intercept=%22-.02%22%2F%3E%3C%2FfeComponentTransfer%3E%3C%2Ffilter%3E%3Cfilter id=%22c%22 x=%22-1024%22 y=%22-576%22 width=%223584%22 height=%222016%22 filterUnits=%22userSpaceOnUse%22 primitiveUnits=%22userSpaceOnUse%22 color-interpolation-filters=%22linearRGB%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%22.2%22 numOctaves=%224%22 seed=%2215%22 stitchTiles=%22no-stitch%22 x=%220%22 y=%220%22 width=%222560%22 height=%221440%22 result=%22turbulence%22%2F%3E%3CfeSpecularLighting surfaceScale=%2210%22 specularConstant=%221.21%22 specularExponent=%2220%22 lighting-color=%22%23fff%22 x=%220%22 y=%220%22 width=%222560%22 height=%221440%22 in=%22turbulence%22 result=%22specularLighting%22%3E%3CfeDistantLight azimuth=%223%22 elevation=%22100%22%2F%3E%3C%2FfeSpecularLighting%3E%3C%2Ffilter%3E%3Cfilter id=%22b%22 x=%22-271.36%22 y=%22-271.36%22 width=%223102.72%22 height=%221982.72%22 filterUnits=%22userSpaceOnUse%22 color-interpolation-filters=%22sRGB%22%3E%3CfeFlood flood-opacity=%220%22 result=%22BackgroundImageFix%22%2F%3E%3CfeBlend in=%22SourceGraphic%22 in2=%22BackgroundImageFix%22 result=%22shape%22%2F%3E%3CfeGaussianBlur stdDeviation=%22271.36%22 result=%22effect1_foregroundBlur_1_2%22%2F%3E%3C%2Ffilter%3E%3C%2Fdefs%3E%3C%2Fsvg%3E")`,
      }}
    >

      {step === 1 && (<>
      {/* Main content — Step 1: Calendar */}
      <div className="cand-fade-up relative z-10 flex flex-1 items-start justify-center px-8 pb-[200px] pt-14">
        <div className="flex w-[884px] overflow-hidden rounded-3xl bg-white/85 shadow-sm">
          {/* Left summary panel */}
          <div className="flex w-[264px] shrink-0 flex-col gap-10 p-6">
            {/* Company logo */}
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-stone-200 bg-white">
              <img src="/customer-logo.svg" alt="ACME" className="h-16 w-auto" />
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
                    Pacific Daylight Time
                    <ChevronDownIcon className="h-4 w-4 text-stone-500" />
                  </span>
                </div>
              </div>

              {/* Language */}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <GlobeIcon className="h-4 w-4 text-primary" />
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
          <div className="flex flex-1 flex-col overflow-hidden rounded-l-3xl bg-white">
            {/* Calendar header */}
            <div className="flex items-center gap-2 border-b border-stone-200 px-5 py-4">
              <div className="flex flex-1 items-center gap-2">
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 hover:opacity-70">
                      <span className="text-lg font-semibold text-stone-900">
                        {formatWeekTitle(weekStart)}
                      </span>
                      <ChevronDownIcon className="h-4 w-4 text-stone-500" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <ShadcnCalendar
                      mode="single"
                      selected={weekStart}
                      defaultMonth={weekStart}
                      onSelect={(date) => {
                        if (date) {
                          setWeekStart(getMonday(date))
                          setCalendarOpen(false)
                        }
                      }}
                      weekStartsOn={1}
                      disabled={(date) => !isAllowedDate(date)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex items-stretch rounded-lg shadow-xs">
                <button
                  className="rounded-l-lg border border-stone-200 bg-white p-1.5 hover:bg-stone-50"
                  onClick={() => {
                    const prev = new Date(weekStart)
                    prev.setDate(prev.getDate() - 7)
                    setWeekStart(prev)
                  }}
                >
                  <ChevronLeftIcon className="h-4 w-4 text-stone-900" />
                </button>
                <button
                  className="border-y border-stone-200 bg-white px-2 py-1 text-xs font-medium text-stone-900 hover:bg-stone-50"
                  onClick={() => setWeekStart(getMonday(new Date()))}
                >
                  Today
                </button>
                <button
                  className="rounded-r-lg border border-stone-200 bg-white p-1.5 hover:bg-stone-50"
                  onClick={() => {
                    const next = new Date(weekStart)
                    next.setDate(next.getDate() + 7)
                    setWeekStart(next)
                  }}
                >
                  <ChevronRightIcon className="h-4 w-4 text-stone-900" />
                </button>
              </div>
            </div>

            {/* Calendar grid */}
            <div className="flex flex-1 overflow-hidden">
              {/* Time column */}
              <div className="flex w-[52px] shrink-0 flex-col border-r border-stone-200">
                {/* Header spacer */}
                <div className="h-14 shrink-0 border-b border-black/10 shadow-[0_2px_4px_-2px_rgba(0,0,0,0.06)]" />
                {HOURS.slice(0, -1).map((h) => (
                  <div key={h} className="flex h-12 shrink-0 items-start justify-end pr-1">
                    <span className="text-xs text-muted-foreground">{formatHour(h)}</span>
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {days.map((day) => {
                const dk = dateKey(day.full)
                const dayAllowed = isAllowedDate(day.full)
                return (
                <div
                  key={dk}
                  className="relative flex flex-1 flex-col border-r border-stone-200 last:border-r-0"
                >
                  {/* Day header */}
                  <div className={`flex h-14 shrink-0 flex-col items-center justify-center border-b border-black/10 p-2 shadow-[0_2px_4px_-2px_rgba(0,0,0,0.06)] ${!dayAllowed ? "opacity-40" : ""}`}>
                    <span className="text-xs text-muted-foreground">{day.short}</span>
                    <span className="text-base font-medium text-stone-900">{day.date}</span>
                  </div>

                  {/* Slot grid */}
                  <div
                    data-grid
                    className="relative select-none"
                    style={{ height: (HOURS.length - 1) * SLOT_HEIGHT }}
                    onMouseDown={(e) => {
                      if (!dayAllowed) return
                      if (resizing || moving) return
                      setSelectedSlot(null)
                      setHoverPos(null)
                      const rect = e.currentTarget.getBoundingClientRect()
                      const row = getRowFromY(e, rect)
                      if (row >= availableRows) return
                      const clickHour = HOURS[0] + row * 0.25
                      const hitIdx = selections.findIndex(
                        (s) =>
                          s.day === dk &&
                          clickHour >= s.startHour &&
                          clickHour < s.startHour + s.slots * 0.25
                      )
                      if (hitIdx < 0) {
                        setDragging({ dayKey: dk, startRow: row, currentRow: row })
                      }
                    }}
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const row = getRowFromY(e, rect)
                      if (moving) {
                        const targetKey = dayAllowed ? dk : moving.currentDayKey
                        if (row !== moving.currentRow || targetKey !== moving.currentDayKey) {
                          setMoving((prev) => prev ? { ...prev, currentRow: row, currentDayKey: targetKey } : null)
                        }
                        return
                      }
                      if (!dayAllowed) return
                      if (resizing) {
                        if (row !== resizing.currentRow) {
                          setResizing((prev) => prev ? { ...prev, currentRow: row } : null)
                        }
                        return
                      }
                      if (dragging) {
                        if (dragging.dayKey === dk && row !== dragging.currentRow) {
                          setDragging((prev) => (prev ? { ...prev, currentRow: row } : null))
                        }
                        return
                      }
                      if (!hoverPos || hoverPos.dayKey !== dk || hoverPos.row !== row) {
                        setHoverPos({ dayKey: dk, row })
                      }
                    }}
                    onMouseUp={() => {
                      if (moving) commitMove()
                      else if (resizing) commitResize()
                      else commitDrag()
                    }}
                    onMouseLeave={() => {
                      setHoverPos(null)
                      if (resizing) commitResize()
                      else if (dragging) commitDrag()
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
                      .filter((s) => s.day === dk)
                      .map((slot, i) => {
                        const isBeingMovedAway = moving && moving.dayKey === dk && moving.slotIndex === i && moving.currentDayKey !== dk
                        if (isBeingMovedAway) return null
                        let displaySlot = slot
                        if (moving && moving.dayKey === dk && moving.slotIndex === i) {
                          const rowDelta = moving.currentRow - moving.grabRow
                          const originalStartRow = (moving.originalSlot.startHour - HOURS[0]) * 4
                          const newStartRow = Math.max(0, Math.min(availableRows - moving.originalSlot.slots, originalStartRow + rowDelta))
                          displaySlot = { ...slot, startHour: HOURS[0] + newStartRow * 0.25 }
                        } else if (resizing && resizing.dayKey === dk && resizing.slotIndex === i) {
                          if (resizing.edge === "bottom") {
                            const startRow = (resizing.originalSlot.startHour - HOURS[0]) * 4
                            const clampedEnd = Math.min(resizing.currentRow + 1, availableRows)
                            const newSlots = Math.max(1, clampedEnd - startRow)
                            displaySlot = { ...slot, slots: newSlots }
                          } else {
                            const originalEndRow = Math.min((resizing.originalSlot.startHour - HOURS[0]) * 4 + resizing.originalSlot.slots, availableRows)
                            const newStartHour = HOURS[0] + resizing.currentRow * 0.25
                            const newSlots = Math.max(1, originalEndRow - resizing.currentRow)
                            displaySlot = { ...slot, startHour: newStartHour, slots: newSlots }
                          }
                        }
                        const topPx = (displaySlot.startHour - HOURS[0]) * SLOT_HEIGHT
                        const heightPx = displaySlot.slots * (SLOT_HEIGHT / 4)
                        const isSelected = selectedSlot?.day === dk && selectedSlot?.index === i
                        const isMoving = moving && moving.dayKey === dk && moving.slotIndex === i
                        const isResizing = resizing && resizing.dayKey === dk && resizing.slotIndex === i
                        const showSelectedShadow = isSelected || isResizing
                        const isFocused = showSelectedShadow || isMoving
                        return (
                          <div
                            key={i}
                            className={`group/slot absolute z-10 cursor-grab rounded-md border border-primary/30 bg-primary/10 px-1.5 py-1 transition-[inset] duration-100 active:cursor-grabbing ${isFocused ? "inset-x-0" : "inset-x-1"} ${showSelectedShadow ? "shadow-[0_0_0_2px_rgba(88,125,255,0.3),0_4px_16px_rgba(88,125,255,0.25)]" : ""} ${isMoving ? "opacity-80 shadow-lg" : ""}`}
                            style={{ top: topPx, height: heightPx }}
                            onMouseEnter={() => setHoverPos(null)}
                            onClick={(e) => {
                              e.stopPropagation()
                            }}
                            onMouseDown={(e) => {
                              e.stopPropagation()
                              const rect = e.currentTarget.closest("[data-grid]")!.getBoundingClientRect()
                              const row = getRowFromY(e as unknown as React.MouseEvent, rect)
                              setMoving({ dayKey: dk, slotIndex: i, originalSlot: slot, grabRow: row, currentRow: row, currentDayKey: dk })
                            }}
                            onMouseUp={() => {
                              if (moving && moving.grabRow === moving.currentRow && moving.dayKey === moving.currentDayKey) {
                                setSelectedSlot(isSelected ? null : { day: dk, index: i })
                              }
                            }}
                          >
                            <span className="block text-[11px] leading-none font-medium text-primary">
                              {formatSlotLabel(displaySlot)}
                            </span>
                            <button
                              className="absolute right-1 top-1 hidden rounded p-0.5 text-primary hover:bg-primary/20 group-hover/slot:block"
                              title="Delete"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteSlot(dk, i)
                              }}
                            >
                              <TrashIcon className="h-3.5 w-3.5" />
                            </button>
                            {/* Top resize handle */}
                            <div
                              className="absolute inset-x-0 top-0 h-1.5 cursor-n-resize"
                              onMouseDown={(e) => {
                                e.stopPropagation()
                                const rect = e.currentTarget.closest("[data-grid]")!.getBoundingClientRect()
                                const row = getRowFromY(e as unknown as React.MouseEvent, rect)
                                setResizing({ dayKey: dk, slotIndex: i, edge: "top", originalSlot: slot, currentRow: row })
                              }}
                            />
                            {/* Bottom resize handle */}
                            <div
                              className="absolute inset-x-0 bottom-0 h-1.5 cursor-s-resize"
                              onMouseDown={(e) => {
                                e.stopPropagation()
                                const rect = e.currentTarget.closest("[data-grid]")!.getBoundingClientRect()
                                const row = getRowFromY(e as unknown as React.MouseEvent, rect)
                                setResizing({ dayKey: dk, slotIndex: i, edge: "bottom", originalSlot: slot, currentRow: row })
                              }}
                            />
                          </div>
                        )
                      })}

                    {/* Moving block in target day */}
                    {moving && moving.currentDayKey === dk && moving.dayKey !== dk && (() => {
                      const rowDelta = moving.currentRow - moving.grabRow
                      const originalStartRow = (moving.originalSlot.startHour - HOURS[0]) * 4
                      const newStartRow = Math.max(0, Math.min(availableRows - moving.originalSlot.slots, originalStartRow + rowDelta))
                      const topPx = newStartRow * (SLOT_HEIGHT / 4)
                      const heightPx = moving.originalSlot.slots * (SLOT_HEIGHT / 4)
                      return (
                        <div
                          className="absolute inset-x-0 z-10 rounded-md border border-primary/30 bg-primary/10 px-1.5 py-1 opacity-80 shadow-lg"
                          style={{ top: topPx, height: heightPx }}
                        >
                          <span className="block text-[11px] leading-none font-medium text-primary">
                            {formatSlotLabel(moving.originalSlot)}
                          </span>
                        </div>
                      )
                    })()}

                    {/* Drag preview */}
                    {previewSlot && previewSlot.day === dk && (
                      <div
                        className="absolute inset-x-1 z-20 rounded-md border border-primary/40 bg-primary/20"
                        style={{
                          top: (previewSlot.startHour - HOURS[0]) * SLOT_HEIGHT,
                          height: previewSlot.slots * (SLOT_HEIGHT / 4),
                        }}
                      />
                    )}

                    {/* Hover ghost block */}
                    {hoverPos && hoverPos.dayKey === dk && !dragging && !resizing && !moving && !ghostSuppressed && (() => {
                      if (hoverPos.row >= availableRows) return null
                      const hoverHour = HOURS[0] + hoverPos.row * 0.25
                      const overlapsExisting = selections.some(
                        (s) => s.day === dk && hoverHour >= s.startHour && hoverHour < s.startHour + s.slots * 0.25
                      )
                      if (overlapsExisting) return null
                      const clampedSlots = Math.min(DURATION_SLOTS, availableRows - hoverPos.row)
                      if (clampedSlots <= 0) return null
                      const ghostTop = hoverPos.row * (SLOT_HEIGHT / 4)
                      const ghostHeight = clampedSlots * (SLOT_HEIGHT / 4)
                      return (
                        <div
                          className="cand-fade-in pointer-events-none absolute inset-x-1 z-5 rounded-md border border-dashed border-primary/30 bg-primary/5"
                          style={{ top: ghostTop, height: ghostHeight }}
                        >
                          <span className="block px-1.5 py-1 text-[11px] leading-none font-medium text-primary/40">
                            Available<br />3h 30m
                          </span>
                        </div>
                      )
                    })()}

                    {/* Unavailable last row hatched */}
                    <div
                      className="absolute inset-x-0 bottom-0 border-t border-stone-200"
                      style={{
                        height: SLOT_HEIGHT,
                        backgroundImage:
                          "repeating-linear-gradient(135deg, transparent, transparent 4px, rgba(0,0,0,0.04) 4px, rgba(0,0,0,0.04) 5px)",
                      }}
                    />

                    {/* Full-column disabled overlay */}
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
              )})}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar — Step 1 */}
      <div className="cand-slide-up fixed inset-x-0 bottom-0 z-20 flex items-center justify-end gap-3 border-t border-border bg-stone-100/30 p-5 backdrop-blur-sm">
        {!isValid && (
          <Badge variant="secondary">
            Select at least 2 time slots to continue
          </Badge>
        )}
        <Button disabled={!isValid} size="lg" onClick={() => setStep(2)}>
          Continue
        </Button>
      </div>
      </>)}

      {step === 2 && (<>
      {/* Main content — Step 2: Optional note */}
      <div className="cand-fade-up relative z-10 flex flex-1 items-start justify-center p-14">
        <div className="flex w-[560px] flex-col gap-6 overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              Add an optional note to the recruiter
            </h2>
            <textarea
              className="h-[120px] w-full resize rounded-lg border border-input bg-white px-3.5 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder=" "
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Bottom bar — Step 2 */}
      <div className="cand-slide-up fixed inset-x-0 bottom-0 z-20 flex items-center justify-between border-t border-border bg-stone-100/30 p-5 backdrop-blur-sm">
        <Button variant="secondary" size="lg" onClick={() => setStep(1)}>
          Back
        </Button>
        <Button size="lg" onClick={() => setStep(3)}>
          Submit
        </Button>
      </div>
      </>)}

      {step === 3 && (<>
      {/* Main content — Step 3: Confirmation */}
      <div className="cand-fade-up relative z-10 flex flex-1 items-start justify-center px-8 pb-[200px] pt-10">
        <div className="flex w-[560px] flex-col items-center gap-8 rounded-3xl border border-border bg-card px-6 py-8 shadow-sm">
          <ScheduledIllustration />
          <div className="flex w-full flex-col items-center gap-6">
            <div className="flex w-full flex-col gap-2 text-foreground">
              <h2 className="text-2xl font-semibold leading-8">
                Thanks for sharing your availability!
              </h2>
              <p className="text-base leading-6">
                You will get a confirmation once your meeting is scheduled.
                <br />
                Looking forward to meeting with you!
              </p>
            </div>

            <div className="h-px w-full bg-border" />

            <div className="flex w-full flex-col gap-4 text-foreground">
              {groupedSelections.map((group) => (
                <div key={group.label} className="flex flex-col gap-0.5">
                  <p className="text-base font-semibold leading-6">{group.label}</p>
                  {group.ranges.map((range, i) => (
                    <p key={i} className="text-base leading-6">{range}</p>
                  ))}
                </div>
              ))}
            </div>

            <div className="flex w-full flex-col gap-4">
              <div className="h-px w-full bg-border" />
              <div className="text-sm leading-5 text-muted-foreground">
                <p>All times displayed in America/Los_Angeles.</p>
                <p>You can update your availability until the interview is scheduled.</p>
              </div>
            </div>

            <Button onClick={() => setStep(1)}>
              Update availability
            </Button>
          </div>
        </div>
      </div>
      </>)}
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

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

function ScheduledIllustration() {
  return <img src="/scheduled.svg" alt="" width={158} height={125} />
}
