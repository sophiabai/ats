import { useState, useMemo, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { CandidateSummaryPanel } from "./components/candidate-summary-panel"
import { OptionalNoteStep } from "./components/optional-note-step"
import { MobileNoteStep } from "./components/mobile-note-step"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useAgentRequestSync } from "@/features/scheduling-agent"
import {
  CandidateCalendarGrid,
  CandidateSlotList,
} from "@/features/candidates/components/scheduling/candidate-date-slot-picker"
import {
  createSelfScheduleWindow,
  isSelfScheduleDate,
  makeSelfScheduleSlotGenerator,
} from "@/features/candidates/components/scheduling/self-schedule-slots"
import {
  DAY_LONG,
  MONTH_NAMES,
} from "@/features/candidates/components/scheduling/scheduling-date-utils"

const DEFAULT_CANDIDATE = "Andy"
const COMPANY = "ACME"

function firstName(fullName: string | undefined): string {
  if (!fullName) return DEFAULT_CANDIDATE
  return fullName.trim().split(/\s+/)[0] || DEFAULT_CANDIDATE
}


const BG_IMAGE = `url("data:image/svg+xml;utf8,%3Csvg xmlns=%22http:%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width=%222560%22 height=%221440%22%3E%3Cg filter=%22url(%23a)%22%3E%3Cg filter=%22url(%23b)%22%3E%3Cpath fill=%22%23fff%22 d=%22M-1280-720h5120v2880h-5120z%22%2F%3E%3Cpath d=%22M-92.757-796.64-663.637 328l636.16 1306.08 1388.8-231.84%22 fill=%22%23022afa%22%2F%3E%3Cpath d=%22m724.02 114.312-186.88 819.36 1239.04 1203.84 643.84-367.2%22 fill=%22%23022afa%22%2F%3E%3Cpath d=%22m1049.508-900.37-1283.84 511.2 686.08 1543.68 1324.8-210.24M2481.644 299.692l-842.24 1127.52 1032.96 773.28 451.84-960.48%22 fill=%22%23fff%22%2F%3E%3Cpath d=%22m1116.415 96.204-752.64 106.56 535.04 1376.64 802.56-486.72%22 fill=%22%23022afa%22%2F%3E%3Cpath d=%22m3177.527-912.072-1736.96 1241.28 180.48 874.08 1756.16-1981.44%22 fill=%22%2300e0ff%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3Cpath fill=%22%23fff%22 filter=%22url(%23c)%22 d=%22M0 0h2560v1440H0z%22%2F%3E%3Cdefs%3E%3Cfilter id=%22a%22%3E%3CfeComponentTransfer%3E%3CfeFuncR type=%22linear%22 slope=%221.04%22 intercept=%22-.02%22%2F%3E%3CfeFuncG type=%22linear%22 slope=%221.04%22 intercept=%22-.02%22%2F%3E%3CfeFuncB type=%22linear%22 slope=%221.04%22 intercept=%22-.02%22%2F%3E%3C%2FfeComponentTransfer%3E%3C%2Ffilter%3E%3Cfilter id=%22c%22 x=%22-1024%22 y=%22-576%22 width=%223584%22 height=%222016%22 filterUnits=%22userSpaceOnUse%22 primitiveUnits=%22userSpaceOnUse%22 color-interpolation-filters=%22linearRGB%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%22.2%22 numOctaves=%224%22 seed=%2215%22 stitchTiles=%22no-stitch%22 x=%220%22 y=%220%22 width=%222560%22 height=%221440%22 result=%22turbulence%22%2F%3E%3CfeSpecularLighting surfaceScale=%2210%22 specularConstant=%221.21%22 specularExponent=%2220%22 lighting-color=%22%23fff%22 x=%220%22 y=%220%22 width=%222560%22 height=%221440%22 in=%22turbulence%22 result=%22specularLighting%22%3E%3CfeDistantLight azimuth=%223%22 elevation=%22100%22%2F%3E%3C%2FfeSpecularLighting%3E%3C%2Ffilter%3E%3Cfilter id=%22b%22 x=%22-271.36%22 y=%22-271.36%22 width=%223102.72%22 height=%221982.72%22 filterUnits=%22userSpaceOnUse%22 color-interpolation-filters=%22sRGB%22%3E%3CfeFlood flood-opacity=%220%22 result=%22BackgroundImageFix%22%2F%3E%3CfeBlend in=%22SourceGraphic%22 in2=%22BackgroundImageFix%22 result=%22shape%22%2F%3E%3CfeGaussianBlur stdDeviation=%22271.36%22 result=%22effect1_foregroundBlur_1_2%22%2F%3E%3C%2Ffilter%3E%3C%2Fdefs%3E%3C%2Fsvg%3E")`








// ---------------------------------------------------------------------------
// Shared state hook
// ---------------------------------------------------------------------------
function useScheduleState() {
  const [step, setStep] = useState(1)
  const [note, setNote] = useState("")

  // Shared with the recruiter's "Preview as a candidate" panel, so the two
  // cannot drift apart.
  const window = useMemo(() => createSelfScheduleWindow(), [])
  const isAvailableDate = useMemo(
    () => (d: Date) => isSelfScheduleDate(d, window),
    [window],
  )
  const generateSlots = useMemo(() => makeSelfScheduleSlotGenerator(window), [window])

  const [viewMonth, setViewMonth] = useState(() => ({
    year: window.start.getFullYear(),
    month: window.start.getMonth(),
  }))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  const slots = useMemo(
    () => (selectedDate ? generateSlots(selectedDate) : []),
    [selectedDate, generateSlots],
  )

  const confirmationDetails = useMemo(() => {
    if (!selectedDate || !selectedSlot) return null
    const matchedSlot = slots.find(
      (s) => s.time === selectedSlot || (s.multiDay && `multi-${slots.indexOf(s)}` === selectedSlot),
    )
    if (!matchedSlot) return null
    if (matchedSlot.multiDay) {
      return matchedSlot.multiDay.map((day) => ({
        label: day.label,
        ranges: day.ranges,
      }))
    }
    const dateLabel = `${DAY_LONG[selectedDate.getDay()]}, ${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`
    return [{ label: dateLabel, ranges: [`${matchedSlot.time} (PST)`] }]
  }, [selectedDate, selectedSlot, slots])

  return {
    step, setStep,
    note, setNote,
    viewMonth, setViewMonth,
    selectedDate, setSelectedDate,
    selectedSlot, setSelectedSlot,
    slots,
    isAvailableDate,
    confirmationDetails,
  }
}

type ScheduleState = ReturnType<typeof useScheduleState>

// ---------------------------------------------------------------------------
// Shared calendar grid
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Shared confirmation view
// ---------------------------------------------------------------------------
function ConfirmationContent({ s, stacked, onReschedule }: { s: ScheduleState; stacked?: boolean; onReschedule?: () => void }) {
  const handleReschedule = onReschedule ?? (() => s.setStep(1))
  return (
    <>
      <ScheduledIllustration />
      <div className="flex w-full flex-col gap-5 text-foreground">
        <div className="flex flex-col gap-2">
          <h2 className={`font-semibold leading-snug ${stacked ? "text-[22px]" : "text-2xl"}`}>
            Your interview is scheduled!
          </h2>
          <p className="text-base leading-6">
            You will get an email confirmation with a calendar invite.{" "}
            Looking forward to meeting with you!
          </p>
        </div>

        {s.confirmationDetails && (
          <div className={`flex flex-col gap-6 ${stacked ? "rounded-xl bg-stone-50 p-4" : ""}`}>
            {s.confirmationDetails.map((group) => (
              <div key={group.label} className="flex flex-col gap-0.5">
                <p className="text-base font-medium leading-6">{group.label}</p>
                {group.ranges.map((range, i) => (
                  <p key={i} className="text-base leading-6">{range}</p>
                ))}
              </div>
            ))}
          </div>
        )}

        {!stacked && (
          <div className="flex flex-col gap-4">
            <div className="h-px w-full bg-border" />
            <div className="text-sm leading-5 text-muted-foreground">
              <p>All times displayed in America/Los_Angeles.</p>
            </div>
          </div>
        )}

        <div className={`flex gap-3 ${stacked ? "flex-col" : "items-center justify-center"}`}>
          {stacked ? (
            <>
              <Button variant="outline" className="h-12 w-full" onClick={handleReschedule}>
                Cancel interview
              </Button>
              <Button className="h-12 w-full" onClick={handleReschedule}>
                Reschedule
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleReschedule}>Reschedule</Button>
              <Button variant="outline" onClick={handleReschedule}>Cancel interview</Button>
            </>
          )}
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Desktop layout
// ---------------------------------------------------------------------------
function DesktopLayout({ s, candidateName }: { s: ScheduleState; candidateName: string }) {
  return (
    <div
      className="customer-brand relative flex min-h-svh flex-col overflow-hidden bg-muted"
      style={{ backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "repeat", backgroundImage: BG_IMAGE }}
    >
      {s.step === 1 && (<>
      <div className="cand-fade-up relative z-10 flex flex-1 items-start justify-center px-8 pb-[200px] pt-14">
        <div className="flex overflow-hidden rounded-3xl bg-white/85">
          <CandidateSummaryPanel
            candidateName={candidateName}
            companyName={COMPANY}
            greeting={`Schedule your interview with ${COMPANY}`}
          />

          <div className="flex rounded-l-3xl bg-white shadow-lg">
            <CandidateCalendarGrid
              viewMonth={s.viewMonth}
              onChangeViewMonth={s.setViewMonth}
              selectedDate={s.selectedDate}
              onSelectDate={(d) => { s.setSelectedDate(d); s.setSelectedSlot(null) }}
              isAvailableDate={s.isAvailableDate}
              size="md"
              navLayout="grouped"
              className="flex flex-col border-r border-border p-6"
            />

            <CandidateSlotList
              selectedDate={s.selectedDate}
              slots={s.slots}
              selectedSlot={s.selectedSlot}
              onSelectSlot={s.setSelectedSlot}
              size="md"
              className="w-[264px] shrink-0 bg-white p-6"
            />
          </div>
        </div>
      </div>

      <div className="cand-slide-up fixed inset-x-0 bottom-0 z-20 flex items-center justify-end gap-3 border-t border-border bg-stone-100/30 p-5 backdrop-blur-sm">
        <div className="flex items-center">
          <span className="text-sm text-foreground">None of these work?</span>
          <Button variant="link" size="lg">Suggest time</Button>
        </div>
        <Button size="lg" disabled={!s.selectedSlot} onClick={() => s.setStep(2)}>
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
          submitLabel="Schedule"
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
// Mobile layout (3 steps + confirmation)
// Step 1: Calendar  •  Step 2: Time slots  •  Step 3: Note  •  Step 4: Confirmation
// ---------------------------------------------------------------------------
function MobileLayout({ s, candidateName }: { s: ScheduleState; candidateName: string }) {
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

  const selectedDateLabel = s.selectedDate
    ? `${MONTH_NAMES[s.selectedDate.getMonth()]} ${s.selectedDate.getDate()}, ${s.selectedDate.getFullYear()}`
    : ""
  const selectedDayLabel = s.selectedDate
    ? DAY_LONG[s.selectedDate.getDay()]
    : ""
  const selectedTimeLabel = s.selectedSlot && !s.selectedSlot.startsWith("multi-")
    ? `${s.selectedSlot} PDT`
    : s.selectedSlot
    ? "Multi-day slot"
    : ""

  return (
    <div className="customer-brand flex min-h-svh flex-col bg-white">
      {/* Step 1: Calendar */}
      {mobileStep === 1 && (
        <div className="cand-fade-up flex flex-1 flex-col">
          <div className="flex flex-col gap-4 border-b border-border p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-white">
                <img src="/customer-logo.svg" alt={COMPANY} className="h-14 w-auto" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hi {candidateName},</p>
                <p className="text-lg font-medium text-foreground">Schedule your interview with {COMPANY}</p>
              </div>
            </div>

            <MobileInfoRows />
          </div>

          <div className="flex-1 p-6">
            <CandidateCalendarGrid
              viewMonth={s.viewMonth}
              onChangeViewMonth={s.setViewMonth}
              selectedDate={s.selectedDate}
              onSelectDate={(d) => {
                s.setSelectedDate(d)
                s.setSelectedSlot(null)
                setMobileStep(2)
              }}
              isAvailableDate={s.isAvailableDate}
              size="md"
              navLayout="grouped"
            />
          </div>
        </div>
      )}

      {/* Step 2: Time slots */}
      {mobileStep === 2 && (
        <div className="cand-fade-up flex flex-1 flex-col">
          <div className="flex items-center gap-4 border-b border-border p-6">
            <button
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border"
              onClick={() => setMobileStep(1)}
            >
              <ChevronLeftIcon className="h-4 w-4 text-foreground" />
            </button>
            <div className="flex flex-col gap-2">
              <div>
                <p className="text-lg font-medium text-foreground">{selectedDayLabel}</p>
                <p className="text-sm text-muted-foreground">{selectedDateLabel}</p>
              </div>
              <InfoPills />
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-6 p-6">
            <h3 className="text-lg font-medium text-foreground">Select a time</h3>
            <CandidateSlotList
              selectedDate={s.selectedDate}
              slots={s.slots}
              selectedSlot={s.selectedSlot}
              onSelectSlot={s.setSelectedSlot}
              onConfirmSlot={() => setMobileStep(3)}
              selectMode="confirm"
              tone="accent"
              hideMultiDay
              showHeading={false}
              size="md"
            />
          </div>
        </div>
      )}

      {/* Step 3: Optional note */}
      {mobileStep === 3 && (
        <MobileNoteStep
          note={s.note}
          onNoteChange={(v) => s.setNote(v)}
          onBack={() => setMobileStep(2)}
          onSubmit={() => setMobileStep(4)}
          submitLabel="Schedule"
          subtitle={`${selectedDateLabel} ${selectedTimeLabel}`}
        />
      )}

      {/* Step 4: Confirmation */}
      {mobileStep === 4 && (
        <div className="cand-fade-up flex flex-1 flex-col items-center gap-8 px-8 py-10">
          <ConfirmationContent s={s} stacked onReschedule={() => setMobileStep(1)} />
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main entry point — switches between desktop and mobile
// ---------------------------------------------------------------------------
export function Component() {
  const s = useScheduleState()
  const isMobile = useMediaQuery("(max-width: 639px)")
  const { request, submitPickedSlot } = useAgentRequestSync()
  const syncedRef = useRef(false)
  const candidateName = firstName(request?.candidate_name)

  useEffect(() => {
    if (s.step === 3 && request && !syncedRef.current && s.confirmationDetails) {
      syncedRef.current = true
      const slot = s.confirmationDetails
        .map((d) => `${d.label}: ${d.ranges.join(", ")}`)
        .join(" | ")
      submitPickedSlot(slot, s.note || undefined)
    }
  }, [s.step, s.confirmationDetails, s.note, request, submitPickedSlot])

  return isMobile
    ? <MobileLayout s={s} candidateName={candidateName} />
    : <DesktopLayout s={s} candidateName={candidateName} />
}

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------
function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}


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

function MobileInfoRows() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
          <MapPinIcon className="h-4 w-4 text-emerald-600" />
        </div>
        <span className="flex items-center gap-1 text-sm text-foreground">
          Pacific Daylight Time
          <ChevronDownIcon className="h-4 w-4 text-stone-500" />
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
          <GlobeIcon className="h-4 w-4 text-amber-600" />
        </div>
        <span className="flex items-center gap-1 text-sm text-foreground">
          EN (US)
          <ChevronDownIcon className="h-4 w-4 text-stone-500" />
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <ClockIcon className="h-4 w-4 text-primary" />
        </div>
        <span className="text-sm text-foreground">3 hours 30 minutes</span>
      </div>
    </div>
  )
}

function ScheduledIllustration() {
  return <img src="/scheduled.svg" alt="" width={158} height={125} />
}
