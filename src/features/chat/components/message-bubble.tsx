import Markdown from "react-markdown";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex items-start justify-end">
        <div className="max-w-[75%] rounded-2xl bg-muted px-4 py-2.5 text-sm leading-relaxed text-foreground">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="prose prose-sm max-w-none text-foreground prose-p:leading-relaxed prose-pre:rounded-lg prose-pre:bg-muted">
      <Markdown>{message.content}</Markdown>
    </div>
  );
}
