import { create } from "zustand";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

interface AgentThreadState {
  thread: ChatCompletionMessageParam[];
  setThread: (thread: ChatCompletionMessageParam[]) => void;
  resetThread: () => void;
}

export const useAgentThreadStore = create<AgentThreadState>((set) => ({
  thread: [],
  setThread: (thread) => set({ thread }),
  resetThread: () => set({ thread: [] }),
}));
