import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { CandidateSummaryPanel } from "./components/candidate-summary-panel"

const CANDIDATE = "Andy"
const COMPANY = "ACME"

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]
const DAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const BG_IMAGE = `url("data:image/svg+xml;utf8,%3Csvg xmlns=%22http:%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width=%222560%22 height=%221440%22%3E%3Cg filter=%22url(%23a)%22%3E%3Cg filter=%22url(%23b)%22%3E%3Cpath fill=%22%23fff%22 d=%22M-1280-720h5120v2880h-5120z%22%2F%3E%3Cpath d=%22M-92.757-796.64-663.637 328l636.16 1306.08 1388.8-231.84%22 fill=%22%23022afa%22%2F%3E%3Cpath d=%22m724.02 114.312-186.88 819.36 1239.04 1203.84 643.84-367.2%22 fill=%22%23022afa%22%2F%3E%3Cpath d=%22m1049.508-900.37-1283.84 511.2 686.08 1543.68 1324.8-210.24M2481.644 299.692l-842.24 1127.52 1032.96 773.28 451.84-960.48%22 fill=%22%23fff%22%2F%3E%3Cpath d=%22m1116.415 96.204-752.64 106.56 535.04 1376.64 802.56-486.72%22 fill=%22%23022afa%22%2F%3E%3Cpath d=%22m3177.527-912.072-1736.96 1241.28 180.48 874.08 1756.16-1981.44%22 fill=%22%2300e0ff%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3Cpath fill=%22%23fff%22 filter=%22url(%23c)%22 d=%22M0 0h2560v1440H0z%22%2F%3E%3Cdefs%3E%3Cfilter id=%22a%22%3E%3CfeComponentTransfer%3E%3CfeFuncR type=%22linear%22 slope=%221.04%22 intercept=%22-.02%22%2F%3E%3CfeFuncG type=%22linear%22 slope=%221.04%22 intercept=%22-.02%22%2F%3E%3CfeFuncB type=%22linear%22 slope=%221.04%22 intercept=%22-.02%22%2F%3E%3C%2FfeComponentTransfer%3E%3C%2Ffilter%3E%3Cfilter id=%22c%22 x=%22-1024%22 y=%22-576%22 width=%223584%22 height=%222016%22 filterUnits=%22userSpaceOnUse%22 primitiveUnits=%22userSpaceOnUse%22 color-interpolation-filters=%22linearRGB%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%22.2%22 numOctaves=%224%22 seed=%2215%22 stitchTiles=%22no-stitch%22 x=%220%22 y=%220%22 width=%222560%22 height=%221440%22 result=%22turbulence%22%2F%3E%3CfeSpecularLighting surfaceScale=%2210%22 specularConstant=%221.21%22 specularExponent=%2220%22 lighting-color=%22%23fff%22 x=%220%22 y=%220%22 width=%222560%22 height=%221440%22 in=%22turbulence%22 result=%22specularLighting%22%3E%3CfeDistantLight azimuth=%223%22 elevation=%22100%22%2F%3E%3C%2FfeSpecularLighting%3E%3C%2Ffilter%3E%3Cfilter id=%22b%22 x=%22-271.36%22 y=%22-271.36%22 width=%223102.72%22 height=%221982.72%22 filterUnits=%22userSpaceOnUse%22 color-interpolation-filters=%22sRGB%22%3E%3CfeFlood flood-opacity=%220%22 result=%22BackgroundImageFix%22%2F%3E%3CfeBlend in=%22SourceGraphic%22 in2=%22BackgroundImageFix%22 result=%22shape%22%2F%3E%3CfeGaussianBlur stdDeviation=%22271.36%22 result=%22effect1_foregroundBlur_1_2%22%2F%3E%3C%2Ffilter%3E%3C%2Fdefs%3E%3C%2Fsvg%3E")`

type TimeSlot = { time: string; available: boolean; multiDay?: { label: string; ranges: string[] }[] }

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

const WINDOW_START = addBusinessDays(new Date(), 2)
const WINDOW_END = (() => { const d = new Date(WINDOW_START); d.setDate(d.getDate() + 13); return d })()

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function isAvailableDate(d: Date) {
  const dow = d.getDay()
  if (dow === 0 || dow === 6) return false
  const dk = dateKey(d)
  return dk >= dateKey(WINDOW_START) && dk <= dateKey(WINDOW_END)
}

function generateSlots(date: Date): TimeSlot[] {
  const dow = date.getDay()
  if (dow === 0 || dow === 6 || !isAvailableDate(date)) return []
  const base: TimeSlot[] = [
    { time: "9:00 am", available: true },
    { time: "10:00 am", available: true },
    { time: "10:30 am", available: true },
    { time: "11:00 am", available: true },
    { time: "11:30 am", available: true },
    { time: "1:30 pm", available: true },
    { time: "1:00 pm", available: true },
    { time: "2:00 pm", available: true },
    { time: "2:30 pm", available: true },
  ]
  const nextDay = new Date(date)
  nextDay.setDate(nextDay.getDate() + 1)
  if (isAvailableDate(nextDay)) {
    base.push({
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
    })
  }
  return base
}

function getCalendarGrid(year: number, month: number) {
  const first = new Date(year, month, 1)
  const startDay = first.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevMonthDays = new Date(year, month, 0).getDate()
  const cells: { day: number; current: boolean; date: Date }[] = []
  for (let i = startDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i
    cells.push({ day: d, current: false, date: new Date(year, month - 1, d) })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true, date: new Date(year, month, d) })
  }
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, current: false, date: new Date(year, month + 1, d) })
  }
  return cells
}

export function Component() {
  const [viewMonth, setViewMonth] = useState(() => ({ year: WINDOW_START.getFullYear(), month: WINDOW_START.getMonth() }))
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => WINDOW_START)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  const calendarCells = useMemo(
    () => getCalendarGrid(viewMonth.year, viewMonth.month),
    [viewMonth],
  )

  const slots = useMemo(
    () => (selectedDate ? generateSlots(selectedDate) : []),
    [selectedDate],
  )

  const today = useMemo(() => dateKey(new Date()), [])

  function prevMonth() {
    setViewMonth((v) => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 })
  }
  function nextMonth() {
    setViewMonth((v) => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 })
  }

  return (
    <div
      className="customer-brand relative flex min-h-svh flex-col overflow-hidden bg-muted"
      style={{ backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "repeat", backgroundImage: BG_IMAGE }}
    >
      <div className="cand-fade-up relative z-10 flex flex-1 items-start justify-center px-8 pb-[200px] pt-14">
        <div className="flex overflow-hidden rounded-3xl bg-white/85">
          <CandidateSummaryPanel
            candidateName={CANDIDATE}
            companyName={COMPANY}
            greeting={`Schedule your interview with ${COMPANY}`}
          />

          {/* Calendar + time slots group */}
          <div className="flex rounded-l-3xl bg-white shadow-lg">
          {/* Month calendar */}
          <div className="flex flex-col border-r border-border p-6">
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center gap-1">
                <button className="rounded-lg p-1.5 hover:bg-stone-100" onClick={prevMonth}>
                  <ChevronLeftIcon className="h-4 w-4 text-stone-900" />
                </button>
                <button className="rounded-lg p-1.5 hover:bg-stone-100" onClick={nextMonth}>
                  <ChevronRightIcon className="h-4 w-4 text-stone-900" />
                </button>
              </div>
              <div className="flex items-center gap-3 text-lg font-medium text-foreground">
                <span>{MONTH_NAMES[viewMonth.month]}</span>
                <span className="font-normal text-muted-foreground">{viewMonth.year}</span>
              </div>
              <button
                className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-stone-50"
                onClick={() => {
                  const now = new Date()
                  setViewMonth({ year: now.getFullYear(), month: now.getMonth() })
                }}
              >
                Today
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {DAY_SHORT.map((d) => (
                <div key={d} className="w-12 py-1">{d}</div>
              ))}
            </div>
            <div className="mb-1 h-px bg-border" />

            {/* Date cells */}
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((cell, i) => {
                const dk = dateKey(cell.date)
                const isToday = dk === today
                const isSelected = selectedDate && dk === dateKey(selectedDate)
                const available = cell.current && isAvailableDate(cell.date)
                const hasAvailableDot = available && cell.date.getDay() !== 0 && cell.date.getDay() !== 6
                return (
                  <button
                    key={i}
                    disabled={!available}
                    onClick={() => { setSelectedDate(cell.date); setSelectedSlot(null) }}
                    className={`relative flex h-10 w-12 items-center justify-center rounded-lg text-sm transition-colors
                      ${!cell.current ? "text-stone-300" : ""}
                      ${cell.current && !available ? "text-stone-300" : ""}
                      ${cell.current && available && !isSelected ? "text-foreground hover:bg-stone-100" : ""}
                      ${cell.current && available && isAvailableDate(cell.date) && cell.date.getDay() >= 1 && cell.date.getDay() <= 5 ? "font-medium text-primary" : ""}
                      ${isSelected ? "bg-primary font-semibold text-primary-foreground" : ""}
                      ${isToday && !isSelected ? "font-semibold" : ""}
                    `}
                  >
                    {cell.day}
                    {hasAvailableDot && !isSelected && (
                      <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Time slots */}
          <div className="flex w-[264px] flex-col bg-white p-6">
            {selectedDate ? (
              <>
                <h3 className="pb-4 text-base font-semibold text-foreground">
                  {DAY_LONG[selectedDate.getDay()]} {selectedDate.getDate()}
                </h3>
                <div className="flex flex-col gap-2 overflow-y-auto">
                  {slots.map((slot, i) =>
                    slot.multiDay ? (
                      <div key={i} className="flex flex-col gap-1">
                        <p className="pt-2 text-xs font-medium text-muted-foreground">
                          Multi-day options starting on this day
                        </p>
                        <button
                          onClick={() => setSelectedSlot(`multi-${i}`)}
                          className={`rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                            selectedSlot === `multi-${i}`
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border hover:border-primary/40"
                          }`}
                        >
                          {slot.multiDay.map((day, di) => (
                            <div key={di} className={di > 0 ? "mt-1.5" : ""}>
                              <span className="text-muted-foreground">{day.label}</span>
                              {day.ranges.map((r, ri) => (
                                <p key={ri} className="font-medium text-foreground">{r}</p>
                              ))}
                            </div>
                          ))}
                        </button>
                      </div>
                    ) : (
                      <button
                        key={i}
                        onClick={() => setSelectedSlot(slot.time)}
                        className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                          selectedSlot === slot.time
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-foreground hover:border-primary/40"
                        }`}
                      >
                        {slot.time}
                      </button>
                    ),
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Select a date to see available times</p>
            )}
          </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="cand-slide-up fixed inset-x-0 bottom-0 z-20 flex items-center justify-end gap-3 border-t border-border bg-stone-100/30 p-5 backdrop-blur-sm">
        <div className="flex items-center">
          <span className="text-sm text-muted-foreground">None of these work?</span>
          <Button variant="link" size="lg">
            Suggest time
          </Button>
        </div>
        <Button size="lg" disabled={!selectedSlot}>
          Schedule
        </Button>
      </div>
    </div>
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
