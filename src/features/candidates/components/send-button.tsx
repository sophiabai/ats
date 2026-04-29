import { useState } from "react";
import { Calendar, ChevronDown, Clock, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function ScheduleDialog({
  open,
  onOpenChange,
  onSchedule,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSchedule: (date: string, time: string) => void;
}) {
  const [date, setDate] = useState("today");
  const [time, setTime] = useState("11:00 AM");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-10 w-[420px] rounded-lg border bg-card p-6 shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">Schedule message</h3>
            <p className="text-sm text-muted-foreground">
              Time zone: Pacific Time (US and Canada)
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-sm opacity-70 transition-opacity hover:opacity-100"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Select value={date} onValueChange={setDate}>
            <SelectTrigger className="w-full">
              <Calendar className="size-4 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="tomorrow">Tomorrow</SelectItem>
              <SelectItem value="monday">Monday</SelectItem>
              <SelectItem value="tuesday">Tuesday</SelectItem>
            </SelectContent>
          </Select>
          <Select value={time} onValueChange={setTime}>
            <SelectTrigger className="w-full">
              <Clock className="size-4 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="08:00 AM">08:00 AM</SelectItem>
              <SelectItem value="09:00 AM">09:00 AM</SelectItem>
              <SelectItem value="10:00 AM">10:00 AM</SelectItem>
              <SelectItem value="11:00 AM">11:00 AM</SelectItem>
              <SelectItem value="12:00 PM">12:00 PM</SelectItem>
              <SelectItem value="01:00 PM">01:00 PM</SelectItem>
              <SelectItem value="02:00 PM">02:00 PM</SelectItem>
              <SelectItem value="03:00 PM">03:00 PM</SelectItem>
              <SelectItem value="04:00 PM">04:00 PM</SelectItem>
              <SelectItem value="05:00 PM">05:00 PM</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSchedule(date, time);
              onOpenChange(false);
            }}
          >
            Schedule message
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SendSplitButton({
  onSend,
  label = "Send",
  successMessage = "Availability request email sent successfully",
  scheduleLabel = "Schedule message",
}: {
  onSend?: () => void;
  label?: string;
  successMessage?: string;
  scheduleLabel?: string;
}) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  const handleSendNow = () => {
    onSend?.();
    toast.success(successMessage);
  };

  const handleSchedule = (date: string, time: string) => {
    onSend?.();
    const dateLabel = date === "today" ? "today" : date === "tomorrow" ? "tomorrow" : date;
    toast.success(`Email scheduled for ${dateLabel} at ${time}`);
  };

  return (
    <>
      <div className="flex items-stretch">
        <Button className="rounded-r-none" onClick={handleSendNow}>
          {label}
        </Button>
        <div className="w-px bg-card" />
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              className="rounded-l-none px-3"
              aria-label="More send options"
            >
              <ChevronDown className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56 p-0">
            <div className="px-4 pt-3 pb-2">
              <p className="text-sm font-medium text-muted-foreground">
                {scheduleLabel}
              </p>
            </div>
            <div className="px-2 pb-1">
              <button
                type="button"
                className="flex w-full items-center rounded-md px-2 py-2 text-sm font-medium hover:bg-accent"
                onClick={() => {
                  setPopoverOpen(false);
                  handleSchedule("today", "5:00 PM");
                }}
              >
                Later today at 5:00 PM
              </button>
              <button
                type="button"
                className="flex w-full items-center rounded-md px-2 py-2 text-sm font-medium hover:bg-accent"
                onClick={() => {
                  setPopoverOpen(false);
                  handleSchedule("tomorrow", "8:00 AM");
                }}
              >
                Tomorrow at 8:00 AM
              </button>
            </div>
            <div className="border-t px-2 py-1">
              <button
                type="button"
                className="flex w-full items-center rounded-md px-2 py-2 text-sm hover:bg-accent"
                onClick={() => {
                  setPopoverOpen(false);
                  setScheduleDialogOpen(true);
                }}
              >
                Custom time
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <ScheduleDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        onSchedule={handleSchedule}
      />
    </>
  );
}
