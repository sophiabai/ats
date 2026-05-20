import { useCallback, useState } from "react";
import { useChatStore } from "@/features/chat/stores/chat-store";
import { runAgent } from "@/features/scheduling-agent/agent-runner";
import { useAgentThreadStore } from "@/features/scheduling-agent/stores/agent-thread-store";
import type { ToolCallLogEntry } from "@/features/scheduling-agent/types";

const THREAD_ID = "default";

export function useSchedulingAgent() {
  const { addMessage, updateLastMessage } = useChatStore();
  const { thread, setThread } = useAgentThreadStore();
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);

  const run = useCallback(
    async (userInput: string) => {
      setIsPending(true);
      setIsError(false);

      let logMessageIndex: number | null = null;
      const currentLog: ToolCallLogEntry[] = [];

      try {
        const result = await runAgent(
          thread,
          userInput,
          { threadId: THREAD_ID },
          {
            onToolCallBatch: (entries) => {
              currentLog.push(...entries);
              const msg = {
                role: "assistant" as const,
                content: "",
                metadata: {
                  type: "tool_call_log" as const,
                  entries: [...currentLog],
                },
              };
              if (logMessageIndex === null) {
                addMessage(msg);
                logMessageIndex = useChatStore.getState().messages.length - 1;
              } else {
                updateLastMessage(msg);
              }
            },
            onToolCallComplete: (entry) => {
              const idx = currentLog.findIndex((e) => e.id === entry.id);
              if (idx >= 0) currentLog[idx] = { ...entry };
              if (logMessageIndex !== null) {
                updateLastMessage({
                  role: "assistant",
                  content: "",
                  metadata: {
                    type: "tool_call_log",
                    entries: [...currentLog],
                  },
                });
              }
            },
          },
        );

        setThread(result.finalThread);

        if (result.finalText) {
          addMessage({ role: "assistant", content: result.finalText });
        }
      } catch (err) {
        console.error("Scheduling agent error:", err);
        setIsError(true);
        addMessage({
          role: "assistant",
          content:
            "Sorry, something went wrong while I was working. Please try again.",
        });
      } finally {
        setIsPending(false);
      }
    },
    [thread, setThread, addMessage, updateLastMessage],
  );

  return { run, isPending, isError };
}
