import { useState, useRef, useMemo, useCallback } from "react"
import { SendSplitButton } from "@/features/candidates/components/send-button"
import { ChevronDown, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TooltipProvider } from "@/components/ui/tooltip"
import { EmailComposer } from "@/features/candidates/components/email-composer"
import {
  InterviewPlanCardList,
  type InterviewPlanSession,
} from "@/features/candidates/components/scheduling/interview-plan-card"
import { SchedulingOptionCard } from "@/features/candidates/components/scheduling/scheduling-option-card"
import { InterviewerCalendarGrid } from "@/features/candidates/components/scheduling/interviewer-calendar-grid"
import {
  DEMO_INTERVIEWERS,
  DEMO_SCHEDULE_DATES,
  parseTimeToHour,
  shortDate,
} from "@/features/candidates/components/scheduling/scheduling-demo-data"
import type {
  CalendarEvent,
  ScheduleDateOption,
} from "@/features/candidates/components/scheduling/scheduling-types"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function initEditableInterviews(option: ScheduleDateOption): InterviewPlanSession[] {
  return option.interviews.map((iv) => {
    const parts = iv.time.split(/[–-]/)
    const startHour = parseTimeToHour(parts[0].trim())
    const endHour = parseTimeToHour(parts[1].trim())
    const durationMinutes = Math.round((endHour - startHour) * 60)
    return {
      title: iv.title,
      startHour,
      durationMinutes,
      room: iv.room,
      participants: iv.participants,
    }
  })
}

function deriveCalendarEvents(
  editable: InterviewPlanSession[],
  baseEvents: Record<string, CalendarEvent[]>,
): Record<string, CalendarEvent[]> {
  const result: Record<string, CalendarEvent[]> = {}
  for (const [name, events] of Object.entries(baseEvents)) {
    result[name] = events.map((ev) => {
      if (ev.type !== "interview") return ev
      const evLower = ev.title.toLowerCase()
      const match = editable.find((e) => {
        const k = e.title.toLowerCase()
        return evLower.includes(k) || evLower.includes(k.split(" ")[0])
      })
      if (match) {
        return { ...ev, startHour: match.startHour, durationHours: match.durationMinutes / 60 }
      }
      return ev
    })
  }
  return result
}

// ---------------------------------------------------------------------------
// Confirm details panel (Step 2)
// ---------------------------------------------------------------------------

function ConfirmDetailsPanel({
  selectedDate,
  editedInterviews,
  onUpdateInterview,
}: {
  selectedDate: ScheduleDateOption
  editedInterviews: InterviewPlanSession[]
  onUpdateInterview: (idx: number, patch: Partial<InterviewPlanSession>) => void
}) {
  return (
    <div className="flex w-[460px] shrink-0 flex-col gap-6 overflow-y-auto bg-muted px-8 py-6">
      <h3 className="text-lg font-semibold">Step 2 of 3: Confirm details</h3>

      <div className="flex flex-col gap-1">
        <span className="px-1 text-sm font-medium">Add to calendar</span>
        <Select defaultValue="recruiting">
          <SelectTrigger className="w-full rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recruiting">Recruiting</SelectItem>
            <SelectItem value="personal">Personal</SelectItem>
            <SelectItem value="team">Team</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <InterviewPlanCardList
        interviews={editedInterviews}
        dateShort={shortDate(selectedDate.date)}
        onUpdateInterview={onUpdateInterview}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main dialog
// ---------------------------------------------------------------------------

export type ScheduledInterviewsPayload = {
  date: string
  interviews: {
    title: string
    startHour: number
    durationMinutes: number
  }[]
}

export function ScheduleInterviewDialog({
  open,
  onOpenChange,
  candidateName,
  reqTitle,
  onScheduled,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidateName: string
  reqTitle: string
  onScheduled?: (payload: ScheduledInterviewsPayload) => void
}) {
  const [selectedDateIdx, setSelectedDateIdx] = useState(0)
  const [step, setStep] = useState(1)
  const selectedDate = DEMO_SCHEDULE_DATES[selectedDateIdx]
  const [editedInterviews, setEditedInterviews] = useState<InterviewPlanSession[]>(() =>
    initEditableInterviews(selectedDate),
  )
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  const handleGoToStep2 = useCallback(() => {
    setEditedInterviews(initEditableInterviews(selectedDate))
    setStep(2)
  }, [selectedDate])

  const handleUpdateInterview = useCallback(
    (idx: number, patch: Partial<InterviewPlanSession>) => {
      setEditedInterviews((prev) =>
        prev.map((iv, i) => (i === idx ? { ...iv, ...patch } : iv)),
      )
    },
    [],
  )

  const derivedEvents = useMemo(
    () =>
      step === 2
        ? deriveCalendarEvents(editedInterviews, selectedDate.calendarEvents)
        : undefined,
    [step, editedInterviews, selectedDate],
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[calc(100vh-40px)] w-[calc(100vw-40px)] max-w-none sm:max-w-none flex-col gap-0 overflow-hidden p-0"
      >
        <TooltipProvider delayDuration={200}>
          <DialogTitle className="sr-only">Schedule interview</DialogTitle>
          <DialogDescription className="sr-only">
            Find a time to schedule an interview
          </DialogDescription>

          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-white px-8 py-4">
            <h2 className="text-lg font-semibold">
              Scheduling interview for {candidateName} — {reqTitle}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* Body */}
          <div className="flex flex-1 overflow-hidden border-b border-border">
            {step === 1 && (
              <div className="flex w-[460px] shrink-0 flex-col gap-5 overflow-y-auto bg-muted px-8 py-5">
                <h3 className="text-lg font-semibold">Step 1 of 3: Find a time</h3>

                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="gap-1 text-xs font-normal">
                    Sort by: Best fit
                    <ChevronDown className="size-3" />
                  </Badge>
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    Preference
                  </Button>
                </div>

                <div className="space-y-3">
                  {DEMO_SCHEDULE_DATES.map((option, i) => (
                    <div
                      key={i}
                      ref={(el) => {
                        cardRefs.current[i] = el
                      }}
                    >
                      <SchedulingOptionCard
                        option={option}
                        selected={selectedDateIdx === i}
                        onSelect={() => setSelectedDateIdx(i)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <ConfirmDetailsPanel
                selectedDate={selectedDate}
                editedInterviews={editedInterviews}
                onUpdateInterview={handleUpdateInterview}
              />
            )}

            {step === 3 && (
              <div className="flex w-full flex-col items-center gap-5 overflow-y-auto bg-muted px-8 py-5">
                <div className="flex w-full max-w-2xl flex-col gap-5">
                  <h3 className="text-lg font-semibold">Step 3 of 3: Send confirmation</h3>

                  <EmailComposer
                    initialTemplate="confirmation"
                    recipientName={candidateName}
                    recipientEmail={`${candidateName.toLowerCase().replace(/\s+/g, "")}@gmail.com`}
                    context={{
                      candidateName,
                      candidateEmail: `${candidateName.toLowerCase().replace(/\s+/g, "")}@gmail.com`,
                      jobTitle: reqTitle,
                      companyName: "ACME AI",
                      senderName: "Anne Montgomery",
                      recruiterName: "Anne Montgomery",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Right panel — calendar grid (steps 1 & 2 only) */}
            {step !== 3 && (
              <InterviewerCalendarGrid
                selectedDate={selectedDate}
                interviewers={DEMO_INTERVIEWERS}
                calendarEvents={derivedEvents}
                onPrev={
                  selectedDateIdx > 0
                    ? () => {
                        const next = selectedDateIdx - 1
                        setSelectedDateIdx(next)
                        cardRefs.current[next]?.scrollIntoView({
                          behavior: "smooth",
                          block: "nearest",
                        })
                      }
                    : undefined
                }
                onNext={
                  selectedDateIdx < DEMO_SCHEDULE_DATES.length - 1
                    ? () => {
                        const next = selectedDateIdx + 1
                        setSelectedDateIdx(next)
                        cardRefs.current[next]?.scrollIntoView({
                          behavior: "smooth",
                          block: "nearest",
                        })
                      }
                    : undefined
                }
              />
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between bg-white px-8 py-3">
            {step === 1 && (
              <>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleGoToStep2}>Next: Confirm details</Button>
              </>
            )}
            {step === 2 && (
              <>
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setStep(3)}>Next: Send confirmation</Button>
              </>
            )}
            {step === 3 && (
              <>
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <SendSplitButton
                  label="Schedule and send"
                  successMessage="Interview scheduled and confirmation sent"
                  scheduleLabel="Schedule now and send message later"
                  onSend={() => {
                    onScheduled?.({
                      date: selectedDate.date,
                      interviews: editedInterviews.map((iv) => ({
                        title: iv.title,
                        startHour: iv.startHour,
                        durationMinutes: iv.durationMinutes,
                      })),
                    })
                    onOpenChange(false)
                  }}
                />
              </>
            )}
          </div>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  )
}
