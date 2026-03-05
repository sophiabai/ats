import { ErrorBoundary } from "@/app/error-boundary";
import { ChatPanel } from "@/features/chat/components/chat-panel";

export function AssistantPage() {
  return (
    <ErrorBoundary>
      <ChatPanel />
    </ErrorBoundary>
  );
}

export { AssistantPage as Component };
