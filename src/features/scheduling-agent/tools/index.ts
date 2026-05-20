import type { ChatCompletionTool } from "openai/resources/chat/completions";
import type { ToolDefinition } from "@/features/scheduling-agent/types";
import { schedulingTools } from "@/features/scheduling-agent/tools/handlers";

export const TOOL_REGISTRY: Map<string, ToolDefinition> = new Map(
  schedulingTools.map((t) => [t.name, t]),
);

export function getOpenAiToolSchemas(): ChatCompletionTool[] {
  return Array.from(TOOL_REGISTRY.values()).map((t) => ({
    type: "function",
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }));
}

export function getTool(name: string): ToolDefinition | undefined {
  return TOOL_REGISTRY.get(name);
}
