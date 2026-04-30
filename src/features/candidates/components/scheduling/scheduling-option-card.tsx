import { Check, DoorOpen } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ScheduleDateOption } from "./scheduling-types";

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function ParticipantBadge({
  name,
  conflict,
}: {
  name: string;
  conflict?: boolean;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "gap-1 text-[11px] font-medium",
        conflict && "border-destructive/20 bg-destructive/10 text-destructive",
      )}
    >
      <Avatar className="size-3">
        <AvatarFallback className="text-[6px]">{initials(name)}</AvatarFallback>
      </Avatar>
      {name}
      {conflict && " (Conflict)"}
    </Badge>
  );
}

function RoomBadge({ room }: { room: string }) {
  return (
    <Badge variant="secondary" className="gap-1 text-[11px] font-medium">
      <DoorOpen className="size-3" />
      {room}
    </Badge>
  );
}

export function SchedulingOptionCard({
  option,
  selected,
  onSelect,
  variant = "selectable",
}: {
  option: ScheduleDateOption;
  selected?: boolean;
  onSelect?: () => void;
  /**
   * - `selectable` (default): clickable card with Select/Selected button (used in "Find a time")
   * - `static`: non-interactive (used in read-only preview)
   */
  variant?: "selectable" | "static";
}) {
  const isSelectable = variant === "selectable";

  const inner = (
    <>
      <div className="flex items-center justify-between">
        <p className="text-base font-semibold">{option.date}</p>
        {isSelectable &&
          (selected ? (
            <Badge variant="secondary" className="gap-1">
              <Check className="size-3.5" />
              Selected
            </Badge>
          ) : (
            <Button
              size="sm"
              className="h-6 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.();
              }}
            >
              Select
            </Button>
          ))}
      </div>

      <div className="mt-4 space-y-3">
        {option.interviews.map((interview, i) => (
          <div key={i} className="flex gap-2">
            <span className="w-20 shrink-0 text-sm font-semibold leading-5">
              {interview.time}
            </span>
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-semibold">{interview.title}</p>
              <div className="flex flex-wrap gap-1">
                {interview.participants.map((p) => (
                  <ParticipantBadge
                    key={p.name}
                    name={p.name}
                    conflict={p.conflict}
                  />
                ))}
                <RoomBadge room={interview.room} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  if (!isSelectable) {
    return (
      <div className="w-full rounded-xl border border-border bg-card p-4 shadow-sm">
        {inner}
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.();
        }
      }}
      className={cn(
        "w-full cursor-pointer rounded-xl border bg-card p-4 text-left shadow-sm transition-shadow outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected ? "border-ring shadow-md" : "border-border hover:shadow-md",
      )}
    >
      {inner}
    </div>
  );
}
