import Markdown from "react-markdown";
import type { ChatMessage, ReqDraftFormData } from "@/types";
import { ReqDraftCard } from "@/features/chat/components/req-draft-card";
import { ScheduleCard } from "@/features/chat/components/schedule-card";

interface MessageBubbleProps {
  message: ChatMessage;
  onOpenReqDraft?: (formData: ReqDraftFormData) => void;
}

export function MessageBubble({ message, onOpenReqDraft }: MessageBubbleProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex items-start justify-end">
        <div className="max-w-[75%] rounded-2xl bg-muted px-4 py-2.5 text-sm leading-relaxed text-foreground">
          <p className="whitespace-pre-wrap">
            {message.command && (
              <span className="mr-1.5 inline-flex items-center rounded-md bg-foreground/10 px-1.5 py-0.5 text-xs font-medium">
                /{message.command}
              </span>
            )}
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  const reqDraft = message.metadata?.type === "req_draft" ? message.metadata : null;
  const schedule = message.metadata?.type === "schedule" ? message.metadata : null;

  return (
    <div>
      <div className="prose prose-sm max-w-none text-foreground prose-p:leading-relaxed prose-pre:rounded-lg prose-pre:bg-muted">
        <Markdown
          components={{
            code: ({ children }) => (
              <span className="inline-flex items-center rounded-md bg-foreground/10 px-1.5 py-0.5 text-xs font-medium not-prose">
                {children}
              </span>
            ),
          }}
        >
          {message.content}
        </Markdown>
      </div>
      {reqDraft && onOpenReqDraft && (
        <ReqDraftCard
          formData={reqDraft.formData}
          onOpen={() => onOpenReqDraft(reqDraft.formData)}
        />
      )}
      {schedule && (
        <ScheduleCard date={schedule.date} slots={schedule.slots} />
      )}
    </div>
  );
}
