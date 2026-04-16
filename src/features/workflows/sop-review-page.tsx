import { useEffect } from "react"
import { useNavigate } from "react-router"
import { ArrowRight, Loader2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SopStepCard } from "./components/sop-step-card"
import { useGenerateWorkflow } from "./api/use-generate-workflow"
import { useWorkflowStore } from "./stores/workflow-store"
import { useSavedWorkflowsStore } from "./stores/saved-workflows-store"

export function Component() {
  const navigate = useNavigate()
  const { input, steps, updateStep, removeStep, addStep, setGraph } = useWorkflowStore()
  const generateWorkflow = useGenerateWorkflow()
  const saveWorkflow = useSavedWorkflowsStore((s) => s.saveWorkflow)

  useEffect(() => {
    if (steps.length === 0) navigate("/workflows", { replace: true })
  }, [steps.length, navigate])

  function handleGenerate() {
    if (generateWorkflow.isPending) return
    generateWorkflow.mutate(steps, {
      onSuccess: (result) => {
        setGraph(result.nodes, result.edges)
        saveWorkflow(input, steps)
        navigate("/workflows/builder")
      },
    })
  }

  function handleAddStep() {
    const id = `step-${Date.now()}`
    addStep({
      id,
      stepNumber: steps.length + 1,
      type: "action",
      label: "ACTION",
      description: "Describe what happens in this step...",
    })
  }

  if (steps.length === 0) return null

  return (
    <div className="-mx-17 -mt-6 flex flex-1 flex-col">

      {generateWorkflow.isError && (
        <p className="px-6 py-3 text-center text-sm text-destructive">
          Failed to generate workflow. Please try again.
        </p>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[640px] py-8">
          <div className="flex flex-col gap-5">
            {steps.map((step) => (
              <SopStepCard
                key={step.id}
                step={step}
                onUpdate={(patch) => updateStep(step.id, patch)}
                onRemove={() => removeStep(step.id)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddStep}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-3.5 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            <Plus className="size-4" />
            Add step
          </button>

          <div className="mt-8 flex justify-end">
            <Button
              className="gap-1.5"
              disabled={generateWorkflow.isPending}
              onClick={handleGenerate}
            >
              {generateWorkflow.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Generate workflow
                  <ArrowRight className="size-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
