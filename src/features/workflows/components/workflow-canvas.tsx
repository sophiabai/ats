import { useCallback } from "react"
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type OnNodesChange,
  type Node,
  type Edge,
  type EdgeChange,
  type NodeTypes,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { WorkflowNode } from "./workflow-node"
import type { WorkflowNodeData, WorkflowEdgeData } from "../types"

const nodeTypes: NodeTypes = {
  workflowNode: WorkflowNode,
}

const defaultEdgeOptions = {
  type: "smoothstep",
  style: { strokeWidth: 2 },
  animated: false,
}

interface WorkflowCanvasProps {
  initialNodes: Node<WorkflowNodeData>[]
  initialEdges: Edge<WorkflowEdgeData>[]
  onNodesChange?: (nodes: Node<WorkflowNodeData>[]) => void
  onEdgesChange?: (edges: Edge<WorkflowEdgeData>[]) => void
}

export function WorkflowCanvas({
  initialNodes,
  initialEdges,
  onNodesChange: onNodesChangeProp,
  onEdgesChange: onEdgesChangeProp,
}: WorkflowCanvasProps) {
  const [nodes, , handleNodesChange] = useNodesState<Node<WorkflowNodeData>>(initialNodes)
  const [edges, , handleEdgesChange] = useEdgesState<Edge<WorkflowEdgeData>>(initialEdges)

  const onNodesChange: OnNodesChange<Node<WorkflowNodeData>> = useCallback(
    (changes) => {
      handleNodesChange(changes)
      if (onNodesChangeProp) {
        setTimeout(() => onNodesChangeProp(nodes), 0)
      }
    },
    [handleNodesChange, onNodesChangeProp, nodes],
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge<WorkflowEdgeData>>[]) => {
      handleEdgesChange(changes)
      if (onEdgesChangeProp) {
        setTimeout(() => onEdgesChangeProp(edges), 0)
      }
    },
    [handleEdgesChange, onEdgesChangeProp, edges],
  )

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges.map((e) => ({
        ...e,
        label: (e.data?.label as string) ?? undefined,
      }))}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      fitView
      fitViewOptions={{ padding: 0.3 }}
      proOptions={{ hideAttribution: true }}
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      <Controls showInteractive={false} />
    </ReactFlow>
  )
}
