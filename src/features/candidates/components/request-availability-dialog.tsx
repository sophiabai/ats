import { useState } from "react";
import { ChevronDown, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

function VariableBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-black/10 px-2 py-0.5 text-xs font-medium text-primary",
        className,
      )}
    >
      {children}
      <X className="size-3 cursor-pointer" />
    </span>
  );
}

export function RequestAvailabilityDialog({
  open,
  onOpenChange,
  candidateName,
  candidateEmail,
  reqTitle,
  companyName,
  senderName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateName: string;
  candidateEmail: string;
  reqTitle: string;
  companyName: string;
  senderName: string;
}) {
  const [duration, setDuration] = useState("195");
  const [window, setWindow] = useState("2-weeks");
  const [startTime, setStartTime] = useState("08:00 AM");
  const [endTime, setEndTime] = useState("05:00 PM");
  const [timezone, setTimezone] = useState("america-los-angeles");
  const [minSlots, setMinSlots] = useState("2");
  const [minDays, setMinDays] = useState("2");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[calc(100vh-80px)] max-h-[720px] w-[calc(100vw-80px)] max-w-[1360px] flex-col gap-0 overflow-hidden p-0 sm:max-w-[1360px]"
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
          <div className="flex w-[456px] shrink-0 flex-col gap-5">
            <h3 className="text-lg font-semibold">Request details</h3>

            <div className="space-y-1">
              <Label>Interview duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="60">1 hour (total interview length)</SelectItem>
                  <SelectItem value="90">1 hour 30 minutes (total interview length)</SelectItem>
                  <SelectItem value="120">2 hours (total interview length)</SelectItem>
                  <SelectItem value="150">2 hours 30 minutes (total interview length)</SelectItem>
                  <SelectItem value="180">3 hours (total interview length)</SelectItem>
                  <SelectItem value="195">3 hours 15 minutes (total interview length)</SelectItem>
                  <SelectItem value="240">4 hours (total interview length)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Share availability window</Label>
              <Select value={window} onValueChange={setWindow}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-week">Next 1 calendar week</SelectItem>
                  <SelectItem value="2-weeks">Next 2 calendar weeks</SelectItem>
                  <SelectItem value="3-weeks">Next 3 calendar weeks</SelectItem>
                  <SelectItem value="4-weeks">Next 4 calendar weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Start time</Label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger>
                    <Clock className="size-4 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="07:00 AM">07:00 AM</SelectItem>
                    <SelectItem value="08:00 AM">08:00 AM</SelectItem>
                    <SelectItem value="09:00 AM">09:00 AM</SelectItem>
                    <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>End time</Label>
                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger>
                    <Clock className="size-4 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="04:00 PM">04:00 PM</SelectItem>
                    <SelectItem value="05:00 PM">05:00 PM</SelectItem>
                    <SelectItem value="06:00 PM">06:00 PM</SelectItem>
                    <SelectItem value="07:00 PM">07:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="truncate">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="america-los-angeles">PDT America/Los Angeles</SelectItem>
                    <SelectItem value="america-new-york">EDT America/New York</SelectItem>
                    <SelectItem value="america-chicago">CDT America/Chicago</SelectItem>
                    <SelectItem value="europe-london">BST Europe/London</SelectItem>
                    <SelectItem value="asia-kolkata">IST Asia/Kolkata</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Minimum time slots to share</Label>
                <Select value={minSlots} onValueChange={setMinSlots}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Minimum days to share</Label>
                <Select value={minDays} onValueChange={setMinDays}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Right: Request email */}
          <div className="flex min-w-0 flex-1 flex-col gap-5">
            <h3 className="text-lg font-semibold">Request email</h3>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-card">
              {/* Template bar */}
              <div className="flex items-center border-b px-3 py-2.5">
                <button
                  type="button"
                  className="flex items-center gap-1 text-sm text-foreground"
                >
                  Template: Request availability default
                  <ChevronDown className="size-3.5" />
                </button>
              </div>

              {/* To field */}
              <div className="flex items-center gap-2 border-b px-4 py-2.5">
                <div className="flex flex-1 flex-wrap items-center gap-2 px-2">
                  <VariableBadge>
                    {candidateName} ({candidateEmail})
                  </VariableBadge>
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-primary"
                >
                  CC/BCC
                </button>
              </div>

              {/* Email body */}
              <div className="flex-1 overflow-y-auto px-4 py-3">
                <div className="space-y-4 text-base leading-relaxed text-black">
                  <p>
                    Hi <VariableBadge>{candidateName}</VariableBadge> ,
                  </p>
                  <p>
                    We&apos;re excited to move forward with your candidacy for the{" "}
                    <VariableBadge>{reqTitle}</VariableBadge> at{" "}
                    <VariableBadge>{companyName}</VariableBadge> ! Please use the
                    link below to share your availability for an interview.
                  </p>
                  <p>Looking forward to speaking with you!</p>

                  <div className="rounded-lg bg-muted p-3">
                    <VariableBadge>
                      Enter your availability here &gt;&gt;
                    </VariableBadge>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Send the email to generate the scheduling link. (Only visible
                      to you)
                    </p>
                  </div>
                </div>
              </div>

              {/* Signature */}
              <div className="px-4 py-3">
                <div className="text-base text-black">
                  <p>Best,</p>
                  <div className="mt-1">
                    <VariableBadge>{senderName}</VariableBadge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t px-4 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <div className="flex items-stretch">
            <Button className="rounded-r-none">Send</Button>
            <div className="w-px bg-card" />
            <Button
              className="rounded-l-none px-3"
              aria-label="More send options"
            >
              <ChevronDown className="size-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
