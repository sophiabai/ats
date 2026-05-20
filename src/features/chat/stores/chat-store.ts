import { create } from "zustand";
import type { ChatMessage } from "@/types";

interface ChatState {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  updateLastMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  updateLastMessage: (message) =>
    set((state) => {
      if (state.messages.length === 0) return state;
      const next = state.messages.slice(0, -1);
      next.push(message);
      return { messages: next };
    }),
  clearMessages: () => set({ messages: [] }),
}));
