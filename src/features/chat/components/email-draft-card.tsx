import {
  EmailComposer,
  type EmailContext,
} from "@/features/candidates/components/email-composer";
import { SendSplitButton } from "@/features/candidates/components/send-button";
import { CURRENT_USER } from "@/lib/constants";
import type { EmailDraftMetadata } from "@/types";

interface EmailDraftCardProps {
  draft: EmailDraftMetadata;
  senderName?: string;
  companyName?: string;
}

export function EmailDraftCard({
  draft,
  senderName = CURRENT_USER.name,
  companyName = CURRENT_USER.company,
}: EmailDraftCardProps) {
  const context: EmailContext = {
    candidateName: draft.candidateName,
    candidateEmail: draft.candidateEmail,
    jobTitle: draft.jobTitle,
    companyName,
    senderName,
    recruiterName: senderName,
  };

  return (
    <div className="mt-3 flex h-[440px] max-h-[60vh] w-full">
      <EmailComposer
        initialTemplate="availability-default"
        context={context}
        recipientName={draft.candidateName}
        recipientEmail={draft.candidateEmail}
        customBodyHtml={draft.bodyHtml}
        footerTrailing={
          <SendSplitButton
            successMessage={`Email sent to ${draft.candidateName}`}
          />
        }
      />
    </div>
  );
}
