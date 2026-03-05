import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/features/chat/stores/chat-store";
import { useChat } from "@/features/chat/api/use-chat";
import { MessageBubble } from "@/features/chat/components/message-bubble";
import { MessageSkeleton } from "@/features/chat/components/message-skeleton";
import { ChatInput } from "@/features/chat/components/chat-input";

export function ChatPanel() {
  const { messages, addMessage, clearMessages } = useChatStore();
  const chat = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chat.isPending]);

  function handleSend(content: string) {
    const userMessage = { role: "user" as const, content };
    addMessage(userMessage);

    const updatedMessages = [...messages, userMessage];
    chat.mutate(updatedMessages, {
      onSuccess: (data) => {
        addMessage({ role: "assistant", content: data.content });
      },
    });
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Chat with GPT</h2>
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
        {messages.length === 0 && !chat.isPending && (
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
          {chat.isPending && <MessageSkeleton />}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {chat.isError && (
        <div className="border-t bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
          Failed to get a response. Please try again.
        </div>
      )}

      <div className="border-t p-4">
        <ChatInput onSend={handleSend} disabled={chat.isPending} />
      </div>
    </div>
  );
}
