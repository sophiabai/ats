import { create } from "zustand";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import type { SchedulingAgentScope } from "@/features/scheduling-agent/types";

interface AgentThreadState {
  thread: ChatCompletionMessageParam[];
  scope?: SchedulingAgentScope;
  setThread: (thread: ChatCompletionMessageParam[]) => void;
  setScope: (scope?: SchedulingAgentScope) => void;
  resetThread: () => void;
}

export const useAgentThreadStore = create<AgentThreadState>((set) => ({
  thread: [],
  scope: undefined,
  setThread: (thread) => set({ thread }),
  setScope: (scope) => set({ scope }),
  resetThread: () => set({ thread: [], scope: undefined }),
}));
