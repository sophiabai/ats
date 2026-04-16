import { create } from "zustand"
import type { Node, Edge } from "@xyflow/react"
import type { SopStep, WorkflowNodeData, WorkflowEdgeData } from "../types"

interface WorkflowState {
  input: string
  steps: SopStep[]
  nodes: Node<WorkflowNodeData>[]
  edges: Edge<WorkflowEdgeData>[]

  setInput: (input: string) => void
  setSteps: (steps: SopStep[]) => void
  updateStep: (id: string, patch: Partial<SopStep>) => void
  addStep: (step: SopStep) => void
  removeStep: (id: string) => void
  reorderStep: (id: string, direction: "up" | "down") => void
  setGraph: (nodes: Node<WorkflowNodeData>[], edges: Edge<WorkflowEdgeData>[]) => void
  setNodes: (nodes: Node<WorkflowNodeData>[]) => void
  setEdges: (edges: Edge<WorkflowEdgeData>[]) => void
  reset: () => void
}

function renumber(steps: SopStep[]): SopStep[] {
  return steps.map((s, i) => ({ ...s, stepNumber: i + 1 }))
}

export const useWorkflowStore = create<WorkflowState>((set) => ({
  input: "",
  steps: [],
  nodes: [],
  edges: [],

  setInput: (input) => set({ input }),
  setSteps: (steps) => set({ steps }),
  updateStep: (id, patch) =>
    set((s) => ({
      steps: s.steps.map((step) =>
        step.id === id ? { ...step, ...patch } : step
      ),
    })),
  addStep: (step) =>
    set((s) => ({ steps: renumber([...s.steps, step]) })),
  removeStep: (id) =>
    set((s) => ({ steps: renumber(s.steps.filter((step) => step.id !== id)) })),
  reorderStep: (id, direction) =>
    set((s) => {
      const idx = s.steps.findIndex((step) => step.id === id)
      if (idx === -1) return s
      const newIdx = direction === "up" ? idx - 1 : idx + 1
      if (newIdx < 0 || newIdx >= s.steps.length) return s
      const next = [...s.steps]
      ;[next[idx], next[newIdx]] = [next[newIdx], next[idx]]
      return { steps: renumber(next) }
    }),
  setGraph: (nodes, edges) => set({ nodes, edges }),
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  reset: () => set({ input: "", steps: [], nodes: [], edges: [] }),
}))
