export type SopStepType = "action" | "decision" | "manual"

export interface SopBranch {
  label: string
  description: string
}

export interface SopStep {
  id: string
  stepNumber: number
  type: SopStepType
  label: string
  description: string
  branches?: SopBranch[]
}

export interface WorkflowNodeData {
  label: string
  subtitle: string
  stepType: SopStepType
  sopStepId?: string
}

export interface WorkflowEdgeData {
  label?: string
}

export interface SavedWorkflow {
  id: string
  name: string
  input: string
  steps: SopStep[]
  createdAt: string
}
