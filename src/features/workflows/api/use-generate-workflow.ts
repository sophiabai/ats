import { useMutation } from "@tanstack/react-query"
import type { Node, Edge } from "@xyflow/react"
import { apiClient } from "@/lib/api-client"
import { API_ENDPOINTS, DEFAULT_MODEL } from "@/lib/constants"
import type { SopStep, WorkflowNodeData, WorkflowEdgeData } from "../types"

interface GenerateWorkflowResult {
  nodes: Node<WorkflowNodeData>[]
  edges: Edge<WorkflowEdgeData>[]
}

const SYSTEM_PROMPT = `You are a workflow diagram generator. Given an array of SOP steps, produce a React Flow graph with nodes and edges.

Output format — respond with ONLY valid JSON matching this structure:
{
  "nodes": [
    {
      "id": "node-1",
      "type": "workflowNode",
      "position": { "x": 0, "y": 0 },
      "data": {
        "label": "Short title",
        "subtitle": "Brief description",
        "stepType": "action" | "decision" | "manual",
        "sopStepId": "step-1"
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "node-1",
      "target": "node-2",
      "data": { "label": "Optional label" }
    }
  ]
}

Rules:
- Each SOP step maps to one or more nodes. Decision branches create additional nodes for each outcome's actions.
- Position nodes in a vertical flowchart layout. Start at x:300, y:0. Space nodes ~150px apart vertically. For branches, offset left/right by ~200px from center.
- Decision nodes should branch into their outcomes. Label edges with the branch outcome (e.g. "Yes"/"No", "Qualified"/"Not qualified").
- Use "workflowNode" as the type for all nodes.
- Keep labels short (2-4 words). Put detail in subtitle.
- Every node must be connected — no orphans.
- Merge branches back together when the process reconverges.

Respond with ONLY valid JSON. No other text.`

async function generateViaApi(steps: SopStep[]): Promise<GenerateWorkflowResult> {
  const { content } = await apiClient<{ content: string }>(
    API_ENDPOINTS.aiGenerate,
    {
      method: "POST",
      body: {
        prompt: `${SYSTEM_PROMPT}\n\nSOP steps:\n${JSON.stringify(steps)}`,
      },
    },
  )
  const match = content.match(/\{[\s\S]*\}/)
  if (!match) throw new Error("Failed to parse workflow response")
  return JSON.parse(match[0]) as GenerateWorkflowResult
}

async function generateDirect(steps: SopStep[]): Promise<GenerateWorkflowResult> {
  const { default: OpenAI } = await import("openai")
  const client = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  })

  const response = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: JSON.stringify(steps) },
    ],
  })

  const raw = response.choices[0]?.message?.content ?? ""
  const match = raw.match(/\{[\s\S]*\}/)
  if (!match) throw new Error("Failed to parse workflow response")
  return JSON.parse(match[0]) as GenerateWorkflowResult
}

const generateWorkflow = import.meta.env.DEV ? generateDirect : generateViaApi

export function useGenerateWorkflow() {
  return useMutation({ mutationFn: generateWorkflow })
}
