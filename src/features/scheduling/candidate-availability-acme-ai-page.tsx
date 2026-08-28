import { useState, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AvailabilityWeekGrid,
  AvailabilityWeekHeader,
  formatSlotForHandoff,
  useAvailabilityGrid,
} from "@/features/candidates/components/scheduling/availability-week-grid"
import { CandidateSummaryPanel } from "./components/candidate-summary-panel"
import { OptionalNoteStep } from "./components/optional-note-step"
import { MobileNoteStep } from "./components/mobile-note-step"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useAgentRequestSync } from "@/features/scheduling-agent"

// ---------------------------------------------------------------------------
// Candidate availability picker page.
// Uses the "customer-brand" theme for primary color (#587dff).
//
// The week grid itself lives in
// @/features/candidates/components/scheduling/availability-week-grid — this
// file is page chrome: branding, the 3-step flow, and the agent handoff.
// ---------------------------------------------------------------------------

const DEFAULT_CANDIDATE = "Andy"
const COMPANY = "ACME"

function firstName(fullName: string | undefined): string {
  if (!fullName) return DEFAULT_CANDIDATE
  return fullName.trim().split(/\s+/)[0] || DEFAULT_CANDIDATE
}

const BG_IMAGE = `url("data:image/svg+xml;utf8,%3Csvg xmlns=%22http:%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width=%222560%22 height=%221440%22%3E%3Cg filter=%22url(%23a)%22%3E%3Cg filter=%22url(%23b)%22%3E%3Cpath fill=%22%23fff%22 d=%22M-1280-720h5120v2880h-5120z%22%2F%3E%3Cpath d=%22M-92.757-796.64-663.637 328l636.16 1306.08 1388.8-231.84%22 fill=%22%23022afa%22%2F%3E%3Cpath d=%22m724.02 114.312-186.88 819.36 1239.04 1203.84 643.84-367.2%22 fill=%22%23022afa%22%2F%3E%3Cpath d=%22m1049.508-900.37-1283.84 511.2 686.08 1543.68 1324.8-210.24M2481.644 299.692l-842.24 1127.52 1032.96 773.28 451.84-960.48%22 fill=%22%23fff%22%2F%3E%3Cpath d=%22m1116.415 96.204-752.64 106.56 535.04 1376.64 802.56-486.72%22 fill=%22%23022afa%22%2F%3E%3Cpath d=%22m3177.527-912.072-1736.96 1241.28 180.48 874.08 1756.16-1981.44%22 fill=%22%2300e0ff%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3Cpath fill=%22%23fff%22 filter=%22url(%23c)%22 d=%22M0 0h2560v1440H0z%22%2F%3E%3Cdefs%3E%3Cfilter id=%22a%22%3E%3CfeComponentTransfer%3E%3CfeFuncR type=%22linear%22 slope=%221.04%22 intercept=%22-.02%22%2F%3E%3CfeFuncG type=%22linear%22 slope=%221.04%22 intercept=%22-.02%22%2F%3E%3CfeFuncB type=%22linear%22 slope=%221.04%22 intercept=%22-.02%22%2F%3E%3C%2FfeComponentTransfer%3E%3C%2Ffilter%3E%3Cfilter id=%22c%22 x=%22-1024%22 y=%22-576%22 width=%223584%22 height=%222016%22 filterUnits=%22userSpaceOnUse%22 primitiveUnits=%22userSpaceOnUse%22 color-interpolation-filters=%22linearRGB%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%22.2%22 numOctaves=%224%22 seed=%2215%22 stitchTiles=%22no-stitch%22 x=%220%22 y=%220%22 width=%222560%22 height=%221440%22 result=%22turbulence%22%2F%3E%3CfeSpecularLighting surfaceScale=%2210%22 specularConstant=%221.21%22 specularExponent=%2220%22 lighting-color=%22%23fff%22 x=%220%22 y=%220%22 width=%222560%22 height=%221440%22 in=%22turbulence%22 result=%22specularLighting%22%3E%3CfeDistantLight azimuth=%223%22 elevation=%22100%22%2F%3E%3C%2FfeSpecularLighting%3E%3C%2Ffilter%3E%3Cfilter id=%22b%22 x=%22-271.36%22 y=%22-271.36%22 width=%223102.72%22 height=%221982.72%22 filterUnits=%22userSpaceOnUse%22 color-interpolation-filters=%22sRGB%22%3E%3CfeFlood flood-opacity=%220%22 result=%22BackgroundImageFix%22%2F%3E%3CfeBlend in=%22SourceGraphic%22 in2=%22BackgroundImageFix%22 result=%22shape%22%2F%3E%3CfeGaussianBlur stdDeviation=%22271.36%22 result=%22effect1_foregroundBlur_1_2%22%2F%3E%3C%2Ffilter%3E%3C%2Fdefs%3E%3C%2Fsvg%3E")`

// ---------------------------------------------------------------------------
// Page state — the shared grid state plus this page's step/note flow
// ---------------------------------------------------------------------------
function useAvailabilityPageState() {
  const grid = useAvailabilityGrid()
  const [step, setStep] = useState(1)
  const [note, setNote] = useState("")
  return { ...grid, step, setStep, note, setNote }
}

type AvailState = ReturnType<typeof useAvailabilityPageState>

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
function DesktopLayout({ s, candidateName }: { s: AvailState; candidateName: string }) {
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
            candidateName={candidateName}
            companyName={COMPANY}
            greeting={`Share your availability to meet with ${COMPANY}`}
          />

          <div className="flex flex-1 flex-col overflow-hidden rounded-l-3xl bg-white shadow-lg">
            <AvailabilityWeekHeader state={s} />
            <AvailabilityWeekGrid state={s} />
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
function MobileLayout({ s, candidateName }: { s: AvailState; candidateName: string }) {
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
                <p className="text-sm text-muted-foreground">Hi {candidateName},</p>
                <p className="text-lg font-medium text-foreground">
                  Select dates to meet with {COMPANY}
                </p>
              </div>
            </div>
            <InfoPills />
          </div>

          {/* Calendar header + grid */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <AvailabilityWeekHeader state={s} compact />
            <div className="flex-1 overflow-auto">
              <AvailabilityWeekGrid state={s} />
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
  const s = useAvailabilityPageState()
  const isMobile = useMediaQuery("(max-width: 639px)")
  const { request, submitAvailability } = useAgentRequestSync()
  const syncedRef = useRef(false)
  const candidateName = firstName(request?.candidate_name)

  useEffect(() => {
    if (s.step === 3 && request && !syncedRef.current) {
      syncedRef.current = true
      const slots = s.selections.map(formatSlotForHandoff)
      submitAvailability(slots, s.note || undefined)
    }
  }, [s.step, s.selections, s.note, request, submitAvailability])

  return isMobile
    ? <MobileLayout s={s} candidateName={candidateName} />
    : <DesktopLayout s={s} candidateName={candidateName} />
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




function ScheduledIllustration() {
  return <img src="/scheduled.svg" alt="" width={158} height={125} />
}
