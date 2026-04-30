import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  EmailComposer,
  type EmailContext,
  type EmailTemplateKey,
} from "@/features/candidates/components/email-composer";
import { SendSplitButton } from "@/features/candidates/components/send-button";

export type SentEmailPayload = {
  templateKey: EmailTemplateKey;
  context: EmailContext;
  candidateName: string;
  candidateEmail: string;
};

export function EmailDialog({
  open,
  onOpenChange,
  candidateName,
  candidateEmail,
  companyName,
  senderName,
  jobTitle = "",
  initialTemplate = "availability-default",
  customBodyHtml,
  onSent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateName: string;
  candidateEmail: string;
  companyName: string;
  senderName: string;
  jobTitle?: string;
  initialTemplate?: EmailTemplateKey;
  /** Optional prefilled body HTML (e.g. from an AI draft). */
  customBodyHtml?: string;
  onSent?: (payload: SentEmailPayload) => void;
}) {
  const [templateKey, setTemplateKey] =
    useState<EmailTemplateKey>(initialTemplate);

  useEffect(() => {
    if (open) setTemplateKey(initialTemplate);
  }, [open, initialTemplate]);

  const context: EmailContext = {
    candidateName,
    candidateEmail,
    jobTitle,
    companyName,
    senderName,
    recruiterName: senderName,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[calc(100vh-40px)] w-[calc(100vw-40px)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none"
      >
        <DialogTitle className="sr-only">Email {candidateName}</DialogTitle>
        <DialogDescription className="sr-only">
          Send an email to the candidate
        </DialogDescription>

        <div className="flex shrink-0 items-center justify-between border-b px-8 py-4">
          <h2 className="text-lg font-semibold">Email {candidateName}</h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-sm opacity-70 transition-opacity hover:opacity-100"
          >
            <X className="size-5" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <div className="flex min-h-0 flex-1 overflow-y-auto bg-muted px-8 pt-6 pb-8">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
            <EmailComposer
              key={customBodyHtml ?? "default"}
              initialTemplate={initialTemplate}
              recipientName={candidateName}
              recipientEmail={candidateEmail}
              context={context}
              customBodyHtml={customBodyHtml}
              onTemplateChange={setTemplateKey}
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between border-t px-4 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <SendSplitButton
            onSend={() => {
              onSent?.({
                templateKey,
                context,
                candidateName,
                candidateEmail,
              });
              onOpenChange(false);
            }}
            successMessage="Email sent successfully"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
