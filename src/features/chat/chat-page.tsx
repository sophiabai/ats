import { ErrorBoundary } from "@/app/error-boundary";
import { ChatPanel } from "@/features/chat/components/chat-panel";

export function Component() {
  return (
    <ErrorBoundary>
      <ChatPanel />
    </ErrorBoundary>
  );
}
