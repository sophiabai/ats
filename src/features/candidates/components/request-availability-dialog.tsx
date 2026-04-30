import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmailComposer } from "@/features/candidates/components/email-composer";
import { SendSplitButton } from "@/features/candidates/components/send-button";
import {
  DEFAULT_SCHEDULE_DETAILS,
  ScheduleDetailsForm,
  type ScheduleDetailsFormValues,
} from "@/features/candidates/components/scheduling/schedule-details-form";

export function RequestAvailabilityDialog({
  open,
  onOpenChange,
  candidateName,
  candidateEmail,
  reqTitle,
  companyName,
  senderName,
  onSent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateName: string;
  candidateEmail: string;
  reqTitle: string;
  companyName: string;
  senderName: string;
  onSent?: () => void;
}) {
  const [details, setDetails] = useState<ScheduleDetailsFormValues>(DEFAULT_SCHEDULE_DETAILS);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[calc(100vh-40px)] w-[calc(100vw-40px)] max-w-none sm:max-w-none flex-col gap-0 overflow-hidden p-0"
      >
        <DialogTitle className="sr-only">Request availability</DialogTitle>
        <DialogDescription className="sr-only">
          Send an availability request email to the candidate
        </DialogDescription>

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b px-8 py-4">
          <h2 className="text-lg font-semibold">
            Request availability from {candidateName}&mdash; {reqTitle}
          </h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-sm opacity-70 transition-opacity hover:opacity-100"
          >
            <X className="size-5" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1 gap-10 overflow-y-auto bg-muted px-8 pt-6 pb-8">
          {/* Left: Request details */}
          <div className="flex w-[460px] shrink-0 flex-col gap-5">
            <h3 className="text-lg font-semibold">Request details</h3>
            <ScheduleDetailsForm
              values={details}
              onChange={(patch) => setDetails((prev) => ({ ...prev, ...patch }))}
            />
          </div>

          {/* Right: Request email */}
          <div className="flex min-w-0 flex-1 flex-col gap-5">
            <h3 className="text-lg font-semibold">Request email</h3>

            <EmailComposer
              initialTemplate="availability-default"
              recipientName={candidateName}
              recipientEmail={candidateEmail}
              context={{
                candidateName,
                candidateEmail,
                jobTitle: reqTitle,
                companyName,
                senderName,
                recruiterName: senderName,
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t px-4 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <SendSplitButton
            onSend={() => {
              onSent?.();
              onOpenChange(false);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
