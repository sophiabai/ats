import { useState } from "react"
import { useNavigate } from "react-router"
import { Loader2, MessageSquare, Send, Sparkles, Upload, Workflow } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

import { Button } from "@/components/ui/button"
import { useGenerateSop } from "./api/use-generate-sop"
import { useWorkflowStore } from "./stores/workflow-store"
import { useSavedWorkflowsStore } from "./stores/saved-workflows-store"

const examples = [
  "When we get a new application, check if the candidate has 3+ years of experience and is based in the US. If qualified, move them to a phone screen and notify the recruiter via Slack. If not, send an automated rejection email.",
  "Create an onboarding workflow that assigns a buddy on day one, sends a welcome email with login credentials, orders a laptop, and schedules orientation sessions for the first week.",
  "Screen candidates by verifying references and running a background check. If both pass, route the candidate to the hiring manager for a final interview. If either fails, send a rejection notice and add them to the nurture pool.",
]

export function Component() {
  const [value, setValue] = useState("")
  const navigate = useNavigate()
  const generateSop = useGenerateSop()
  const { setInput, setSteps } = useWorkflowStore()
  const savedWorkflows = useSavedWorkflowsStore((s) => s.workflows)

  function handleSubmit() {
    const trimmed = value.trim()
    if (!trimmed || generateSop.isPending) return
    setInput(trimmed)
    generateSop.mutate(trimmed, {
      onSuccess: (steps) => {
        setSteps(steps)
        navigate("/workflows/review")
      },
    })
  }

  function handleExample(text: string) {
    setValue(text)
  }

  function handleOpenSaved(workflow: (typeof savedWorkflows)[number]) {
    setInput(workflow.input)
    setSteps(workflow.steps)
    navigate("/workflows/review")
  }

  return (
    <div className="-mx-17 -mt-0 flex flex-1 flex-col items-center justify-center px-4 pb-8">
      <div className="flex w-full max-w-[640px] flex-col">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-berry-50">
          <Sparkles className="size-6 text-berry-500" strokeWidth={1.5} />
        </div>

        <h1 className="mb-2 text-2xl font-semibold tracking-tight">
          Describe your workflow
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Type your process in plain language or upload an existing SOP document.
        </p>

        <div className="mb-8 w-full rounded-2xl border bg-card p-3 shadow-sm">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g., When a new application comes in, check if the candidate has 3+ years of experience..."
            rows={4}
            disabled={generateSop.isPending}
            className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
          <div className="mt-3 flex items-center justify-between">
            <Button variant="link" size="sm" className="gap-1.5 text-muted-foreground">
              <Upload className="size-4" />
              Upload PDF
            </Button>
            <Button
              size="sm"
              className="gap-1.5 rounded-full"
              disabled={!value.trim() || generateSop.isPending}
              onClick={handleSubmit}
            >
              {generateSop.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Generate SOP
                  <Send className="size-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>

        {generateSop.isError && (
          <p className="mb-4 text-center text-sm text-destructive">
            Failed to generate SOP. Please try again.
          </p>
        )}

        <span className="mb-4 self-start text-xs font-medium tracking-widest text-muted-foreground">
          Try an example
        </span>

        <div className="flex w-full flex-col gap-2.5">
          {examples.map((text) => (
            <button
              key={text}
              type="button"
              onClick={() => handleExample(text)}
              className="flex items-start gap-3 rounded-xl border bg-card px-4 py-3.5 text-left text-sm transition-colors hover:bg-accent"
            >
              <MessageSquare className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground">{text}</span>
            </button>
          ))}
        </div>

        {savedWorkflows.length > 0 && (
          <>
            <span className="mb-4 mt-8 self-start text-xs font-medium tracking-widest text-muted-foreground">
              Your workflows
            </span>

            <div className="flex w-full flex-col gap-2.5">
              {savedWorkflows.map((wf) => (
                <button
                  key={wf.id}
                  type="button"
                  onClick={() => handleOpenSaved(wf)}
                  className="flex items-start gap-3 rounded-xl border bg-card px-4 py-3.5 text-left text-sm transition-colors hover:bg-accent"
                >
                  <Workflow className="mt-0.5 size-4 shrink-0 text-brand" />
                  <div className="min-w-0 flex-1">
                    <span className="font-medium">{wf.name}</span>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {wf.steps.length} steps · {formatDistanceToNow(new Date(wf.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
