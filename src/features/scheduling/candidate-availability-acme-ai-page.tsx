import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CandidateSummaryPanel } from "./components/candidate-summary-panel"
import { OptionalNoteStep } from "./components/optional-note-step"
import { MobileNoteStep } from "./components/mobile-note-step"
import { useMediaQuery } from "@/hooks/use-media-query"

// ---------------------------------------------------------------------------
// Candidate availability picker page.
// Uses the "customer-brand" theme for primary color (#587dff).
// ---------------------------------------------------------------------------

const CANDIDATE = "Andy"
const COMPANY = "ACME"
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

const BG_IMAGE = `url("data:image/svg+xml;utf8,%3Csvg xmlns=%22http:%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width=%222560%22 height=%221440%22%3E%3Cg filter=%22url(%23a)%22%3E%3Cg filter=%22url(%23b)%22%3E%3Cpath fill=%22%23fff%22 d=%22M-1280-720h5120v2880h-5120z%22%2F%3E%3Cpath d=%22M-92.757-796.64-663.637 328l636.16 1306.08 1388.8-231.84%22 fill=%22%23022afa%22%2F%3E%3Cpath d=%22m724.02 114.312-186.88 819.36 1239.04 1203.84 643.84-367.2%22 fill=%22%23022afa%22%2F%3E%3Cpath d=%22m1049.508-900.37-1283.84 511.2 686.08 1543.68 1324.8-210.24M2481.644 299.692l-842.24 1127.52 1032.96 773.28 451.84-960.48%22 fill=%22%23fff%22%2F%3E%3Cpath d=%22m1116.415 96.204-752.64 106.56 535.04 1376.64 802.56-486.72%22 fill=%22%23022afa%22%2F%3E%3Cpath d=%22m3177.527-912.072-1736.96 1241.28 180.48 874.08 1756.16-1981.44%22 fill=%22%2300e0ff%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3Cpath fill=%22%23fff%22 filter=%22url(%23c)%22 d=%22M0 0h2560v1440H0z%22%2F%3E%3Cdefs%3E%3Cfilter id=%22a%22%3E%3CfeComponentTransfer%3E%3CfeFuncR type=%22linear%22 slope=%221.04%22 intercept=%22-.02%22%2F%3E%3CfeFuncG type=%22linear%22 slope=%221.04%22 intercept=%22-.02%22%2F%3E%3CfeFuncB type=%22linear%22 slope=%221.04%22 intercept=%22-.02%22%2F%3E%3C%2FfeComponentTransfer%3E%3C%2Ffilter%3E%3Cfilter id=%22c%22 x=%22-1024%22 y=%22-576%22 width=%223584%22 height=%222016%22 filterUnits=%22userSpaceOnUse%22 primitiveUnits=%22userSpaceOnUse%22 color-interpolation-filters=%22linearRGB%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%22.2%22 numOctaves=%224%22 seed=%2215%22 stitchTiles=%22no-stitch%22 x=%220%22 y=%220%22 width=%222560%22 height=%221440%22 result=%22turbulence%22%2F%3E%3CfeSpecularLighting surfaceScale=%2210%22 specularConstant=%221.21%22 specularExponent=%2220%22 lighting-color=%22%23fff%22 x=%220%22 y=%220%22 width=%222560%22 height=%221440%22 in=%22turbulence%22 result=%22specularLighting%22%3E%3CfeDistantLight azimuth=%223%22 elevation=%22100%22%2F%3E%3C%2FfeSpecularLighting%3E%3C%2Ffilter%3E%3Cfilter id=%22b%22 x=%22-271.36%22 y=%22-271.36%22 width=%223102.72%22 height=%221982.72%22 filterUnits=%22userSpaceOnUse%22 color-interpolation-filters=%22sRGB%22%3E%3CfeFlood flood-opacity=%220%22 result=%22BackgroundImageFix%22%2F%3E%3CfeBlend in=%22SourceGraphic%22 in2=%22BackgroundImageFix%22 result=%22shape%22%2F%3E%3CfeGaussianBlur stdDeviation=%22271.36%22 result=%22effect1_foregroundBlur_1_2%22%2F%3E%3C%2Ffilter%3E%3C%2Fdefs%3E%3C%2Fsvg%3E")`

// ---------------------------------------------------------------------------
// Shared state hook — used by both DesktopLayout and MobileLayout
// ---------------------------------------------------------------------------
function useAvailabilityState() {
  const [weekStart, setWeekStart] = useState(() => getMonday(SCHEDULE_WINDOW_START))
  const [calendarOpen, setCalendarOpen] = useState(false)
  const days = useMemo(() => getWeekDays(weekStart), [weekStart])

  const [selections, setSelections] = useState<Slot[]>([])
  const [dragging, setDraggingState] = useState<{
    dayKey: string
    startRow: number
    currentRow: number
  } | null>(null)
  const draggingRef = useRef(dragging)
  const setDragging: typeof setDraggingState = (v) => {
    if (typeof v === "function") {
      setDraggingState((prev) => {
        const next = (v as (p: typeof dragging) => typeof dragging)(prev)
        draggingRef.current = next
        return next
      })
    } else {
      draggingRef.current = v
      setDraggingState(v)
    }
  }

  const [resizing, setResizingState] = useState<{
    dayKey: string
    slotIndex: number
    edge: "top" | "bottom"
    originalSlot: Slot
    currentRow: number
  } | null>(null)
  const resizingRef = useRef(resizing)
  const setResizing: typeof setResizingState = (v) => {
    if (typeof v === "function") {
      setResizingState((prev) => {
        const next = (v as (p: typeof resizing) => typeof resizing)(prev)
        resizingRef.current = next
        return next
      })
    } else {
      resizingRef.current = v
      setResizingState(v)
    }
  }
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; index: number } | null>(null)
  const [hoverPos, setHoverPos] = useState<{ dayKey: string; row: number } | null>(null)
  const [moving, setMovingState] = useState<{
    dayKey: string
    slotIndex: number
    originalSlot: Slot
    grabRow: number
    currentRow: number
    currentDayKey: string
  } | null>(null)
  const movingRef = useRef(moving)
  const setMoving: typeof setMovingState = (v) => {
    if (typeof v === "function") {
      setMovingState((prev) => {
        const next = (v as (p: typeof moving) => typeof moving)(prev)
        movingRef.current = next
        return next
      })
    } else {
      movingRef.current = v
      setMovingState(v)
    }
  }

  const totalRows = (HOURS.length - 1) * 4
  const availableRows = (HOURS.length - 2) * 4
  const selectionsRef = useRef(selections)
  selectionsRef.current = selections
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
    const d = draggingRef.current
    if (!d) return
    const minRow = Math.min(d.startRow, Math.min(d.currentRow, availableRows - 1))
    const maxRow = Math.min(Math.max(d.startRow, d.currentRow), availableRows - 1)
    const draggedSlots = maxRow - minRow + 1
    const actualSlots = Math.min(
      draggedSlots < DURATION_SLOTS ? Math.max(DURATION_SLOTS, draggedSlots) : draggedSlots,
      availableRows - minRow,
    )
    const newSlot: Slot = {
      day: d.dayKey,
      startHour: HOURS[0] + minRow * 0.25,
      slots: actualSlots,
    }
    setSelections((prev) => mergeOverlapping([...prev, newSlot]))
    setDragging(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableRows])

  const commitResize = useCallback(() => {
    const r = resizingRef.current
    if (!r) return
    const { dayKey, slotIndex, edge, originalSlot, currentRow } = r
    const daySlots = selectionsRef.current.filter((s) => s.day === dayKey)
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableRows])

  const commitMove = useCallback(() => {
    const m = movingRef.current
    if (!m) return
    const { dayKey, slotIndex, originalSlot, grabRow, currentRow, currentDayKey } = m
    const daySlots = selectionsRef.current.filter((s) => s.day === dayKey)
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableRows])

  useEffect(() => {
    if (!moving) return
    function handleGlobalMouseUp() {
      commitMove()
    }
    window.addEventListener("mouseup", handleGlobalMouseUp)
    window.addEventListener("touchend", handleGlobalMouseUp)
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp)
      window.removeEventListener("touchend", handleGlobalMouseUp)
    }
  }, [moving, commitMove])

  function getRowFromY(e: React.MouseEvent, containerRect: DOMRect) {
    const y = e.clientY - containerRect.top
    const row = Math.floor(y / (SLOT_HEIGHT / 4))
    return Math.max(0, Math.min(totalRows - 1, row))
  }

  function getRowFromTouch(touch: React.Touch, containerRect: DOMRect) {
    const y = touch.clientY - containerRect.top
    const row = Math.floor(y / (SLOT_HEIGHT / 4))
    return Math.max(0, Math.min(totalRows - 1, row))
  }

  function getDayKeyFromTouch(touch: React.Touch): string | null {
    const el = document.elementFromPoint(touch.clientX, touch.clientY)
    const gridEl = el?.closest("[data-grid]") as HTMLElement | null
    return gridEl?.dataset.daykey ?? null
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

  return {
    weekStart, setWeekStart,
    calendarOpen, setCalendarOpen,
    days,
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
    step, setStep,
    note, setNote,
    groupedSelections,
  }
}

type AvailState = ReturnType<typeof useAvailabilityState>

// ---------------------------------------------------------------------------
// Shared calendar grid (used by both layouts)
// ---------------------------------------------------------------------------
function CalendarGrid({ s }: { s: AvailState }) {
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Time column */}
      <div className="flex w-[52px] shrink-0 flex-col border-r border-stone-200">
        <div className="h-14 shrink-0 border-b border-black/10 shadow-[0_2px_4px_-2px_rgba(0,0,0,0.06)]" />
        {HOURS.slice(0, -1).map((h) => (
          <div key={h} className="flex h-12 shrink-0 items-start justify-end pr-1">
            <span className="text-xs text-muted-foreground">{formatHour(h)}</span>
          </div>
        ))}
      </div>

      {/* Day columns */}
      {s.days.map((day) => {
        const dk = dateKey(day.full)
        const dayAllowed = isAllowedDate(day.full)
        return (
        <div
          key={dk}
          className="relative flex flex-1 flex-col border-r border-stone-200 last:border-r-0"
        >
          <div className="flex h-14 shrink-0 flex-col items-center justify-center border-b border-black/10 p-2 shadow-[0_2px_4px_-2px_rgba(0,0,0,0.06)]">
            <span className={`text-xs text-muted-foreground ${!dayAllowed ? "opacity-40" : ""}`}>{day.short}</span>
            <span className={`text-base font-medium text-stone-900 ${!dayAllowed ? "opacity-40" : ""}`}>{day.date}</span>
          </div>

          <div
            data-grid
            data-daykey={dk}
            className="relative select-none touch-none"
            style={{ height: (HOURS.length - 1) * SLOT_HEIGHT }}
            onMouseDown={(e) => {
              if (!dayAllowed) return
              if (s.resizing || s.moving) return
              s.setSelectedSlot(null)
              s.setHoverPos(null)
              const rect = e.currentTarget.getBoundingClientRect()
              const row = s.getRowFromY(e, rect)
              if (row >= s.availableRows) return
              const clickHour = HOURS[0] + row * 0.25
              const hitIdx = s.selections.findIndex(
                (sl) =>
                  sl.day === dk &&
                  clickHour >= sl.startHour &&
                  clickHour < sl.startHour + sl.slots * 0.25
              )
              if (hitIdx < 0) {
                s.setDragging({ dayKey: dk, startRow: row, currentRow: row })
              }
            }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const row = s.getRowFromY(e, rect)
              if (s.moving) {
                const targetKey = dayAllowed ? dk : s.moving.currentDayKey
                if (row !== s.moving.currentRow || targetKey !== s.moving.currentDayKey) {
                  s.setMoving((prev) => prev ? { ...prev, currentRow: row, currentDayKey: targetKey } : null)
                }
                return
              }
              if (!dayAllowed) return
              if (s.resizing) {
                if (row !== s.resizing.currentRow) {
                  s.setResizing((prev) => prev ? { ...prev, currentRow: row } : null)
                }
                return
              }
              if (s.dragging) {
                if (s.dragging.dayKey === dk && row !== s.dragging.currentRow) {
                  s.setDragging((prev) => (prev ? { ...prev, currentRow: row } : null))
                }
                return
              }
              if (!s.hoverPos || s.hoverPos.dayKey !== dk || s.hoverPos.row !== row) {
                s.setHoverPos({ dayKey: dk, row })
              }
            }}
            onMouseUp={() => {
              if (s.moving) s.commitMove()
              else if (s.resizing) s.commitResize()
              else s.commitDrag()
            }}
            onMouseLeave={() => {
              s.setHoverPos(null)
              if (s.resizing) s.commitResize()
              else if (s.dragging) s.commitDrag()
            }}
            onTouchStart={(e) => {
              if (!dayAllowed) return
              if (s.resizing || s.moving) return
              const touch = e.touches[0]
              const rect = e.currentTarget.getBoundingClientRect()
              const row = s.getRowFromTouch(touch, rect)
              if (row >= s.availableRows) return
              const clickHour = HOURS[0] + row * 0.25
              const hitIdx = s.selections.findIndex(
                (sl) =>
                  sl.day === dk &&
                  clickHour >= sl.startHour &&
                  clickHour < sl.startHour + sl.slots * 0.25
              )
              if (hitIdx < 0) {
                e.preventDefault()
                s.setSelectedSlot(null)
                s.setDragging({ dayKey: dk, startRow: row, currentRow: row })
              }
            }}
            onTouchMove={(e) => {
              const touch = e.touches[0]
              const rect = e.currentTarget.getBoundingClientRect()
              const row = s.getRowFromTouch(touch, rect)
              if (s.moving) {
                e.preventDefault()
                const touchDayKey = s.getDayKeyFromTouch(touch) ?? s.moving.currentDayKey
                if (row !== s.moving.currentRow || touchDayKey !== s.moving.currentDayKey) {
                  s.setMoving((prev) => prev ? { ...prev, currentRow: row, currentDayKey: touchDayKey } : null)
                }
                return
              }
              if (s.resizing) {
                e.preventDefault()
                if (row !== s.resizing.currentRow) {
                  s.setResizing((prev) => prev ? { ...prev, currentRow: row } : null)
                }
                return
              }
              if (s.dragging) {
                e.preventDefault()
                if (row !== s.dragging.currentRow) {
                  s.setDragging((prev) => (prev ? { ...prev, currentRow: row } : null))
                }
                return
              }
            }}
            onTouchEnd={(e) => {
              if (s.movingRef.current || s.resizingRef.current || s.draggingRef.current) {
                e.preventDefault()
              }
              if (s.movingRef.current) s.commitMove()
              else if (s.resizingRef.current) s.commitResize()
              else if (s.draggingRef.current) s.commitDrag()
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
                const isBeingMovedAway = s.moving && s.moving.dayKey === dk && s.moving.slotIndex === i && s.moving.currentDayKey !== dk
                if (isBeingMovedAway) return null
                let displaySlot = slot
                if (s.moving && s.moving.dayKey === dk && s.moving.slotIndex === i) {
                  const rowDelta = s.moving.currentRow - s.moving.grabRow
                  const originalStartRow = (s.moving.originalSlot.startHour - HOURS[0]) * 4
                  const newStartRow = Math.max(0, Math.min(s.availableRows - s.moving.originalSlot.slots, originalStartRow + rowDelta))
                  displaySlot = { ...slot, startHour: HOURS[0] + newStartRow * 0.25 }
                } else if (s.resizing && s.resizing.dayKey === dk && s.resizing.slotIndex === i) {
                  if (s.resizing.edge === "bottom") {
                    const startRow = (s.resizing.originalSlot.startHour - HOURS[0]) * 4
                    const clampedEnd = Math.min(s.resizing.currentRow + 1, s.availableRows)
                    const newSlots = Math.max(1, clampedEnd - startRow)
                    displaySlot = { ...slot, slots: newSlots }
                  } else {
                    const originalEndRow = Math.min((s.resizing.originalSlot.startHour - HOURS[0]) * 4 + s.resizing.originalSlot.slots, s.availableRows)
                    const newStartHour = HOURS[0] + s.resizing.currentRow * 0.25
                    const newSlots = Math.max(1, originalEndRow - s.resizing.currentRow)
                    displaySlot = { ...slot, startHour: newStartHour, slots: newSlots }
                  }
                }
                const topPx = (displaySlot.startHour - HOURS[0]) * SLOT_HEIGHT
                const heightPx = displaySlot.slots * (SLOT_HEIGHT / 4)
                const isSelected = s.selectedSlot?.day === dk && s.selectedSlot?.index === i
                const isMovingSelf = s.moving && s.moving.dayKey === dk && s.moving.slotIndex === i
                const isResizingSelf = s.resizing && s.resizing.dayKey === dk && s.resizing.slotIndex === i
                const showSelectedShadow = isSelected || isResizingSelf
                const isFocused = showSelectedShadow || isMovingSelf
                return (
                  <div
                    key={i}
                    className={`group/slot absolute z-10 cursor-grab rounded-md border border-primary/30 bg-primary/10 px-1.5 py-1 transition-[inset] duration-100 active:cursor-grabbing ${isFocused ? "inset-x-0" : "inset-x-1"} ${showSelectedShadow ? "shadow-[0_0_0_2px_rgba(88,125,255,0.3),0_4px_16px_rgba(88,125,255,0.25)]" : ""} ${isMovingSelf ? "opacity-80 shadow-lg" : ""}`}
                    style={{ top: topPx, height: heightPx }}
                    onMouseEnter={() => s.setHoverPos(null)}
                    onClick={(e) => { e.stopPropagation() }}
                    onMouseDown={(e) => {
                      e.stopPropagation()
                      const rect = e.currentTarget.closest("[data-grid]")!.getBoundingClientRect()
                      const row = s.getRowFromY(e as unknown as React.MouseEvent, rect)
                      s.setMoving({ dayKey: dk, slotIndex: i, originalSlot: slot, grabRow: row, currentRow: row, currentDayKey: dk })
                    }}
                    onMouseUp={() => {
                      if (s.moving && s.moving.grabRow === s.moving.currentRow && s.moving.dayKey === s.moving.currentDayKey) {
                        s.setSelectedSlot(isSelected ? null : { day: dk, index: i })
                      }
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      const touch = e.touches[0]
                      const rect = e.currentTarget.closest("[data-grid]")!.getBoundingClientRect()
                      const row = s.getRowFromTouch(touch, rect)
                      s.setMoving({ dayKey: dk, slotIndex: i, originalSlot: slot, grabRow: row, currentRow: row, currentDayKey: dk })
                    }}
                    onTouchEnd={() => {
                      if (s.moving && s.moving.grabRow === s.moving.currentRow && s.moving.dayKey === s.moving.currentDayKey) {
                        s.setSelectedSlot(isSelected ? null : { day: dk, index: i })
                      }
                      s.commitMove()
                    }}
                  >
                    <span className="block text-[11px] leading-none font-medium text-primary">
                      {s.formatSlotLabel(displaySlot)}
                    </span>
                    <button
                      className={`absolute right-1 top-1 rounded p-0.5 text-primary hover:bg-primary/20 ${isSelected ? "block" : "hidden group-hover/slot:block"}`}
                      title="Delete"
                      onClick={(e) => {
                        e.stopPropagation()
                        s.deleteSlot(dk, i)
                      }}
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                    <div
                      className="absolute inset-x-0 top-0 h-3 cursor-n-resize sm:h-1.5"
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        const rect = e.currentTarget.closest("[data-grid]")!.getBoundingClientRect()
                        const row = s.getRowFromY(e as unknown as React.MouseEvent, rect)
                        s.setResizing({ dayKey: dk, slotIndex: i, edge: "top", originalSlot: slot, currentRow: row })
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        const touch = e.touches[0]
                        const rect = e.currentTarget.closest("[data-grid]")!.getBoundingClientRect()
                        const row = s.getRowFromTouch(touch, rect)
                        s.setResizing({ dayKey: dk, slotIndex: i, edge: "top", originalSlot: slot, currentRow: row })
                      }}
                    />
                    <div
                      className="absolute inset-x-0 bottom-0 h-3 cursor-s-resize sm:h-1.5"
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        const rect = e.currentTarget.closest("[data-grid]")!.getBoundingClientRect()
                        const row = s.getRowFromY(e as unknown as React.MouseEvent, rect)
                        s.setResizing({ dayKey: dk, slotIndex: i, edge: "bottom", originalSlot: slot, currentRow: row })
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        const touch = e.touches[0]
                        const rect = e.currentTarget.closest("[data-grid]")!.getBoundingClientRect()
                        const row = s.getRowFromTouch(touch, rect)
                        s.setResizing({ dayKey: dk, slotIndex: i, edge: "bottom", originalSlot: slot, currentRow: row })
                      }}
                    />
                  </div>
                )
              })}

            {s.moving && s.moving.currentDayKey === dk && s.moving.dayKey !== dk && (() => {
              const rowDelta = s.moving.currentRow - s.moving.grabRow
              const originalStartRow = (s.moving.originalSlot.startHour - HOURS[0]) * 4
              const newStartRow = Math.max(0, Math.min(s.availableRows - s.moving.originalSlot.slots, originalStartRow + rowDelta))
              const topPx = newStartRow * (SLOT_HEIGHT / 4)
              const heightPx = s.moving.originalSlot.slots * (SLOT_HEIGHT / 4)
              return (
                <div
                  className="absolute inset-x-0 z-10 rounded-md border border-primary/30 bg-primary/10 px-1.5 py-1 opacity-80 shadow-lg"
                  style={{ top: topPx, height: heightPx }}
                >
                  <span className="block text-[11px] leading-none font-medium text-primary">
                    {s.formatSlotLabel(s.moving.originalSlot)}
                  </span>
                </div>
              )
            })()}

            {s.previewSlot && s.previewSlot.day === dk && (
              <div
                className="absolute inset-x-1 z-20 rounded-md border border-primary/40 bg-primary/20"
                style={{
                  top: (s.previewSlot.startHour - HOURS[0]) * SLOT_HEIGHT,
                  height: s.previewSlot.slots * (SLOT_HEIGHT / 4),
                }}
              />
            )}

            {s.hoverPos && s.hoverPos.dayKey === dk && !s.dragging && !s.resizing && !s.moving && !s.ghostSuppressed && (() => {
              if (s.hoverPos.row >= s.availableRows) return null
              const hoverHour = HOURS[0] + s.hoverPos.row * 0.25
              const overlapsExisting = s.selections.some(
                (sl) => sl.day === dk && hoverHour >= sl.startHour && hoverHour < sl.startHour + sl.slots * 0.25
              )
              if (overlapsExisting) return null
              const clampedSlots = Math.min(DURATION_SLOTS, s.availableRows - s.hoverPos.row)
              if (clampedSlots <= 0) return null
              const ghostTop = s.hoverPos.row * (SLOT_HEIGHT / 4)
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
      )})}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Calendar header with date title, arrows, and "Today"
// ---------------------------------------------------------------------------
function CalendarHeader({ s, compact }: { s: AvailState; compact?: boolean }) {
  return (
    <div className={`flex items-center gap-2 border-b border-stone-200 ${compact ? "px-3 py-3" : "px-5 py-4"}`}>
      <div className="flex flex-1 items-center gap-2">
        <Popover open={s.calendarOpen} onOpenChange={s.setCalendarOpen}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2 hover:opacity-70">
              <span className={`font-semibold text-stone-900 ${compact ? "text-base" : "text-lg"}`}>
                {formatWeekTitle(s.weekStart)}
              </span>
              <ChevronDownIcon className="h-4 w-4 text-stone-500" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <ShadcnCalendar
              mode="single"
              selected={s.weekStart}
              defaultMonth={s.weekStart}
              onSelect={(date) => {
                if (date) {
                  s.setWeekStart(getMonday(date))
                  s.setCalendarOpen(false)
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
            const prev = new Date(s.weekStart)
            prev.setDate(prev.getDate() - 7)
            s.setWeekStart(prev)
          }}
        >
          <ChevronLeftIcon className="h-4 w-4 text-stone-900" />
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
            const next = new Date(s.weekStart)
            next.setDate(next.getDate() + 7)
            s.setWeekStart(next)
          }}
        >
          <ChevronRightIcon className="h-4 w-4 text-stone-900" />
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Confirmation content (shared)
// ---------------------------------------------------------------------------
function ConfirmationContent({ s, stacked, onUpdateAvailability }: { s: AvailState; stacked?: boolean; onUpdateAvailability?: () => void }) {
  return (
    <>
      <ScheduledIllustration />
      <div className={`flex w-full flex-col items-center gap-6 ${stacked ? "px-2" : ""}`}>
        <div className="flex w-full flex-col gap-2 text-foreground">
          <h2 className={`font-semibold leading-8 ${stacked ? "text-xl" : "text-2xl"}`}>
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
          {s.groupedSelections.map((group) => (
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

        <Button size="lg" onClick={onUpdateAvailability ?? (() => s.setStep(1))}>
          Update availability
        </Button>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Desktop layout
// ---------------------------------------------------------------------------
function DesktopLayout({ s }: { s: AvailState }) {
  return (
    <div
      className="customer-brand relative flex min-h-svh flex-col overflow-hidden bg-muted"
      style={{
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "repeat",
        backgroundImage: BG_IMAGE,
      }}
    >
      {s.step === 1 && (<>
      <div className="cand-fade-up relative z-10 flex flex-1 items-start justify-center px-8 pb-[200px] pt-14">
        <div className="flex w-[884px] overflow-hidden rounded-3xl bg-white/85">
          <CandidateSummaryPanel
            candidateName={CANDIDATE}
            companyName={COMPANY}
            greeting={`Share your availability to meet with ${COMPANY}`}
          />

          <div className="flex flex-1 flex-col overflow-hidden rounded-l-3xl bg-white shadow-lg">
            <CalendarHeader s={s} />
            <CalendarGrid s={s} />
          </div>
        </div>
      </div>

      <div className="cand-slide-up fixed inset-x-0 bottom-0 z-20 flex items-center justify-end gap-3 border-t border-border bg-stone-100/30 p-5 backdrop-blur-sm">
        {!s.isValid && (
          <Badge variant="secondary">
            Select at least 2 time slots to continue
          </Badge>
        )}
        <Button disabled={!s.isValid} size="lg" onClick={() => s.setStep(2)}>
          Continue
        </Button>
      </div>
      </>)}

      {s.step === 2 && (
        <OptionalNoteStep
          note={s.note}
          onNoteChange={s.setNote}
          onBack={() => s.setStep(1)}
          onSubmit={() => s.setStep(3)}
        />
      )}

      {s.step === 3 && (
      <div className="cand-fade-up relative z-10 flex flex-1 items-start justify-center px-8 pb-[200px] pt-10">
        <div className="flex w-[560px] flex-col items-center gap-8 rounded-3xl border border-border bg-card px-6 py-8 shadow-sm">
          <ConfirmationContent s={s} />
        </div>
      </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Info pills (mobile)
// ---------------------------------------------------------------------------
function InfoPills() {
  return (
    <div className="flex gap-1">
      <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] tracking-wide text-blue-900">
        3h 30m
      </span>
      <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] tracking-wide text-emerald-900">
        PDT
        <ChevronDownIcon className="h-2 w-2" />
      </span>
      <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] tracking-wide text-amber-900">
        EN (US)
        <ChevronDownIcon className="h-2 w-2" />
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Mobile layout — 3 steps: calendar → note → confirmation
// ---------------------------------------------------------------------------
function MobileLayout({ s }: { s: AvailState }) {
  const [mobileStep, setMobileStep] = useState(1)

  useEffect(() => {
    const prevHtml = document.documentElement.style.backgroundColor
    const prevBody = document.body.style.backgroundColor
    document.documentElement.style.backgroundColor = "#fff"
    document.body.style.backgroundColor = "#fff"

    let meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null
    const createdMeta = !meta
    if (!meta) {
      meta = document.createElement("meta")
      meta.name = "theme-color"
      document.head.appendChild(meta)
    }
    const prevTheme = meta.content
    meta.content = "#ffffff"

    return () => {
      document.documentElement.style.backgroundColor = prevHtml
      document.body.style.backgroundColor = prevBody
      if (createdMeta && meta) meta.remove()
      else if (meta) meta.content = prevTheme
    }
  }, [])

  return (
    <div className="customer-brand flex min-h-svh flex-col bg-white">
      {/* Step 1: Calendar grid */}
      {mobileStep === 1 && (
        <div className="cand-fade-up flex flex-1 flex-col">
          {/* Header */}
          <div className="flex flex-col gap-4 border-b border-border p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-white">
                <img src="/customer-logo.svg" alt={COMPANY} className="h-14 w-auto" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hi {CANDIDATE},</p>
                <p className="text-lg font-medium text-foreground">
                  Select dates to meet with {COMPANY}
                </p>
              </div>
            </div>
            <InfoPills />
          </div>

          {/* Calendar header + grid */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <CalendarHeader s={s} compact />
            <div className="flex-1 overflow-auto">
              <CalendarGrid s={s} />
            </div>
          </div>

          {/* Bottom bar */}
          <div className="sticky bottom-0 z-20 flex flex-col items-center gap-3 border-t border-border bg-white p-4">
            {!s.isValid && (
              <Badge variant="secondary">
                Select at least 2 time slots to continue
              </Badge>
            )}
            <Button
              disabled={!s.isValid}
              className="h-12 w-full"
              onClick={() => setMobileStep(2)}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Optional note */}
      {mobileStep === 2 && (
        <MobileNoteStep
          note={s.note}
          onNoteChange={s.setNote}
          onBack={() => setMobileStep(1)}
          onSubmit={() => setMobileStep(3)}
          submitLabel="Submit"
        />
      )}

      {/* Step 3: Confirmation */}
      {mobileStep === 3 && (
        <div className="cand-fade-up flex flex-1 flex-col items-center gap-8 px-8 py-10">
          <ConfirmationContent
            s={s}
            stacked
            onUpdateAvailability={() => setMobileStep(1)}
          />
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component — layout switcher
// ---------------------------------------------------------------------------
export function Component() {
  const s = useAvailabilityState()
  const isMobile = useMediaQuery("(max-width: 639px)")
  return isMobile ? <MobileLayout s={s} /> : <DesktopLayout s={s} />
}

// ---------------------------------------------------------------------------
// Inline SVG icons
// ---------------------------------------------------------------------------
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
