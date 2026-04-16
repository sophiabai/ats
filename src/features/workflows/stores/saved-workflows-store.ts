import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { SavedWorkflow, SopStep } from "../types"

interface SavedWorkflowsState {
  workflows: SavedWorkflow[]
  saveWorkflow: (input: string, steps: SopStep[]) => SavedWorkflow
  removeWorkflow: (id: string) => void
}

function nameFromInput(input: string): string {
  const first = input.split(/[.\n]/)[0].trim()
  return first.length > 60 ? first.slice(0, 57) + "..." : first
}

export const useSavedWorkflowsStore = create<SavedWorkflowsState>()(
  persist(
    (set, get) => ({
      workflows: [],
      saveWorkflow: (input, steps) => {
        const workflow: SavedWorkflow = {
          id: `wf-${Date.now()}`,
          name: nameFromInput(input),
          input,
          steps,
          createdAt: new Date().toISOString(),
        }
        set({ workflows: [workflow, ...get().workflows] })
        return workflow
      },
      removeWorkflow: (id) =>
        set((s) => ({ workflows: s.workflows.filter((w) => w.id !== id) })),
    }),
    { name: "saved-workflows" },
  ),
)
