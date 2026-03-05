import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/constants";
import type { ChatMessage } from "@/types";

interface ChatResponse {
  role: "assistant";
  content: string;
}

async function sendMessage(messages: ChatMessage[]): Promise<ChatResponse> {
  return apiClient<ChatResponse>(API_ENDPOINTS.chat, {
    method: "POST",
    body: { messages },
  });
}

export function useChat() {
  return useMutation({ mutationFn: sendMessage });
}
