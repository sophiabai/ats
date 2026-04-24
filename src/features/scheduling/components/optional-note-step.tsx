import { Button } from "@/components/ui/button"

export function OptionalNoteStep({
  note,
  onNoteChange,
  onBack,
  onSubmit,
  submitLabel = "Submit",
}: {
  note: string
  onNoteChange: (value: string) => void
  onBack: () => void
  onSubmit: () => void
  submitLabel?: string
}) {
  return (
    <>
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
              onChange={(e) => onNoteChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="cand-slide-up fixed inset-x-0 bottom-0 z-20 flex items-center justify-between border-t border-border bg-stone-100/30 p-5 backdrop-blur-sm">
        <Button variant="secondary" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button size="lg" onClick={onSubmit}>
          {submitLabel}
        </Button>
      </div>
    </>
  )
}
