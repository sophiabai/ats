import { Clock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ScheduleDetailsFormValues = {
  duration: string;
  availWindow: string;
  startTime: string;
  endTime: string;
  timezone: string;
  minSlots: string;
  minDays: string;
  breakMinutes: string;
  ignoreOrder: boolean;
  ignoreLimits: boolean;
};

export const DEFAULT_SCHEDULE_DETAILS: ScheduleDetailsFormValues = {
  duration: "195",
  availWindow: "2-weeks",
  startTime: "08:00 AM",
  endTime: "05:00 PM",
  timezone: "america-los-angeles",
  minSlots: "2",
  minDays: "2",
  breakMinutes: "0",
  ignoreOrder: false,
  ignoreLimits: false,
};

type ScheduleDetailsFormProps = {
  values: ScheduleDetailsFormValues;
  onChange: (patch: Partial<ScheduleDetailsFormValues>) => void;
  /** When true, shows the "Add break between interviews" select + the two limit checkboxes. */
  showBreakAndLimits?: boolean;
};

export function ScheduleDetailsForm({
  values,
  onChange,
  showBreakAndLimits = false,
}: ScheduleDetailsFormProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="space-y-1">
        <Label>Interview duration</Label>
        <Select
          value={values.duration}
          onValueChange={(v) => onChange({ duration: v })}
        >
          <SelectTrigger className="w-full">
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
        <Select
          value={values.availWindow}
          onValueChange={(v) => onChange({ availWindow: v })}
        >
          <SelectTrigger className="w-full">
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
          <Select
            value={values.startTime}
            onValueChange={(v) => onChange({ startTime: v })}
          >
            <SelectTrigger className="w-full">
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
          <Select
            value={values.endTime}
            onValueChange={(v) => onChange({ endTime: v })}
          >
            <SelectTrigger className="w-full">
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
          <Select
            value={values.timezone}
            onValueChange={(v) => onChange({ timezone: v })}
          >
            <SelectTrigger className="w-full truncate">
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
          <Select
            value={values.minSlots}
            onValueChange={(v) => onChange({ minSlots: v })}
          >
            <SelectTrigger className="w-full">
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
          <Select
            value={values.minDays}
            onValueChange={(v) => onChange({ minDays: v })}
          >
            <SelectTrigger className="w-full">
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

      {showBreakAndLimits && (
        <>
          <div className="space-y-1">
            <Label>Add break between interviews</Label>
            <Select
              value={values.breakMinutes}
              onValueChange={(v) => onChange({ breakMinutes: v })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0 min</SelectItem>
                <SelectItem value="5">5 min</SelectItem>
                <SelectItem value="10">10 min</SelectItem>
                <SelectItem value="15">15 min</SelectItem>
                <SelectItem value="30">30 min</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={values.ignoreOrder}
                onCheckedChange={(v) => onChange({ ignoreOrder: v === true })}
              />
              Ignore order of interviews
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={values.ignoreLimits}
                onCheckedChange={(v) => onChange({ ignoreLimits: v === true })}
              />
              Ignore interviewers&rsquo; daily and weekly interview limit
            </label>
          </div>
        </>
      )}
    </div>
  );
}
