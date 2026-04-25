import { Button } from "@/components/ui/button"

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="m15 18-6-6 6-6" />
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

export function MobileNoteStep({
  note,
  onNoteChange,
  onBack,
  onSubmit,
  submitLabel = "Submit",
  subtitle,
}: {
  note: string
  onNoteChange: (value: string) => void
  onBack: () => void
  onSubmit: () => void
  submitLabel?: string
  subtitle?: string
}) {
  const hasNote = note.trim().length > 0
  const skipLabel = `Skip and ${submitLabel.toLowerCase()}`

  return (
    <div className="cand-fade-up flex flex-1 flex-col">
      <div className="flex items-center gap-4 border-b border-border p-6">
        <button
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border"
          onClick={onBack}
        >
          <ChevronLeftIcon className="h-4 w-4 text-foreground" />
        </button>
        <div className="flex flex-col gap-2">
          <div>
            <p className="text-lg font-medium text-foreground">
              Add an optional note to the recruiter
            </p>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <InfoPills />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-6 px-8 py-6">
        <textarea
          autoFocus
          className="h-24 w-full resize rounded-lg border border-input bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder=" "
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
        />
        {hasNote ? (
          <Button className="h-12 w-full" onClick={onSubmit}>
            {submitLabel}
          </Button>
        ) : (
          <Button variant="outline" className="h-12 w-full text-foreground" onClick={onSubmit}>
            {skipLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
