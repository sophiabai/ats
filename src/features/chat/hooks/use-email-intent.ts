import { useCallback } from "react";
import { useDraftEmail } from "@/features/candidates/api/use-draft-email";
import { useChatStore } from "@/features/chat/stores/chat-store";
import { findCandidateByName } from "@/lib/candidate-lookup";
import { CURRENT_USER } from "@/lib/constants";

// Match "email <word> <word>…" — at least two tokens after "email" so we don't
// trip on phrases like "email me" or "email functionality".
export const EMAIL_INTENT_RE = /^email\s+\S+\s+\S+/i;

export function useEmailIntent() {
  const draftEmail = useDraftEmail();
  const { addMessage } = useChatStore();

  const handleEmailIntent = useCallback(
    async (prompt: string) => {
      try {
        const draft = await draftEmail.mutateAsync({
          prompt,
          senderName: CURRENT_USER.name,
          companyName: CURRENT_USER.company,
        });

        const recipient = draft.recipientName?.trim();
        if (!recipient) {
          addMessage({
            role: "assistant",
            content:
              "I couldn't figure out who you wanted to email. Try something like `email Jane Warren about the offer`.",
          });
          return;
        }

        const candidate = await findCandidateByName(recipient);
        if (!candidate) {
          addMessage({
            role: "assistant",
            content: `I couldn't find a candidate named \`${recipient}\` in your pipeline.`,
          });
          return;
        }

        const candidateName = `${candidate.first_name} ${candidate.last_name}`;
        addMessage({
          role: "assistant",
          content:
            draft.message ||
            `Drafted an email to \`${candidateName}\`. Review and send when ready.`,
          metadata: {
            type: "email_draft",
            candidateName,
            candidateEmail: candidate.email ?? "",
            bodyHtml: draft.bodyHtml,
            jobTitle: candidate.headline ?? "",
          },
        });
      } catch (err) {
        console.error(err);
        addMessage({
          role: "assistant",
          content: "Sorry, I couldn't draft that email. Please try again.",
        });
      }
    },
    [draftEmail, addMessage],
  );

  return {
    handleEmailIntent,
    isPending: draftEmail.isPending,
  };
}
