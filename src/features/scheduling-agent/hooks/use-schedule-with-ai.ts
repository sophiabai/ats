import { useCallback } from "react";
import { useChatStore } from "@/features/chat/stores/chat-store";
import { useChatBarStore } from "@/stores/chat-bar-store";
import { useSchedulingAgent } from "@/features/scheduling-agent/hooks/use-scheduling-agent";

export function useScheduleWithAI() {
  const setDocked = useChatBarStore((s) => s.setDocked);
  const addMessage = useChatStore((s) => s.addMessage);
  const agent = useSchedulingAgent();

  const launch = useCallback(
    (prompt: string) => {
      if (agent.isPending) return;
      setDocked(true);
      addMessage({ role: "user", content: prompt });
      void agent.run(prompt);
    },
    [agent, addMessage, setDocked],
  );

  return { launch, isPending: agent.isPending };
}
