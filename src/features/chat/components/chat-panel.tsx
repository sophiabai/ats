import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/features/chat/stores/chat-store";
import { MessageBubble } from "@/features/chat/components/message-bubble";
import { MessageSkeleton } from "@/features/chat/components/message-skeleton";
import { ChatInput } from "@/features/chat/components/chat-input";
import { useSchedulingAgent } from "@/features/scheduling-agent";

export function ChatPanel() {
  const { messages, addMessage, clearMessages } = useChatStore();
  const agent = useSchedulingAgent();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, agent.isPending]);

  function handleSend(content: string) {
    if (agent.isPending) return;
    const trimmed = content.trim();
    if (!trimmed) return;
    addMessage({ role: "user", content: trimmed });
    void agent.run(trimmed);
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Recruiting coordination agent</h2>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearMessages}
            className="text-xs text-muted-foreground"
          >
            Clear
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 px-4 py-4">
        {messages.length === 0 && !agent.isPending && (
          <div className="flex h-full items-center justify-center py-20">
            <p className="text-sm text-muted-foreground">
              Send a message to start a conversation.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {messages.map((msg, idx) => (
            <MessageBubble key={idx} message={msg} />
          ))}
          {agent.isPending && <MessageSkeleton />}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {agent.isError && (
        <div className="border-t bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
          Failed to get a response. Please try again.
        </div>
      )}

      <div className="border-t p-4">
        <ChatInput onSend={handleSend} disabled={agent.isPending} />
      </div>
    </div>
  );
}
