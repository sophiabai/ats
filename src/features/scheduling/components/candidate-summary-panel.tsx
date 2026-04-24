const DURATION = "3 hours 30 minutes"

export function CandidateSummaryPanel({
  candidateName,
  companyName,
  greeting,
}: {
  candidateName: string
  companyName: string
  greeting: string
}) {
  return (
    <div className="flex w-[264px] shrink-0 flex-col gap-10 p-6">
      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-stone-200 bg-white">
        <img src="/customer-logo.svg" alt={companyName} className="h-16 w-auto" />
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">Hi {candidateName},</p>
        <p className="text-lg font-semibold leading-7 text-stone-900">
          {greeting}
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
            <ClockIcon className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Duration</span>
            <span className="text-sm font-medium text-stone-900">{DURATION}</span>
          </div>
        </div>

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
