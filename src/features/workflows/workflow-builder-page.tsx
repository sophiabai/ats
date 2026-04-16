import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { ReactFlowProvider } from "@xyflow/react"

import { WorkflowCanvas } from "./components/workflow-canvas"
import { CopilotPanel } from "./components/copilot-panel"
import { useWorkflowStore } from "./stores/workflow-store"

export function Component() {
  const navigate = useNavigate()
  const { nodes, edges, setNodes, setEdges } = useWorkflowStore()
  const [copilotCollapsed, setCopilotCollapsed] = useState(false)

  useEffect(() => {
    if (nodes.length === 0) navigate("/workflows", { replace: true })
  }, [nodes.length, navigate])

  if (nodes.length === 0) return null

  return (
    <div className="-mx-17 -mt-6 flex flex-1 overflow-hidden">
      <div className="relative flex-1">
        <ReactFlowProvider>
          <WorkflowCanvas
            initialNodes={nodes}
            initialEdges={edges}
            onNodesChange={setNodes}
            onEdgesChange={setEdges}
          />
        </ReactFlowProvider>
      </div>
      <CopilotPanel
        collapsed={copilotCollapsed}
        onToggle={() => setCopilotCollapsed(!copilotCollapsed)}
      />
    </div>
  )
}
