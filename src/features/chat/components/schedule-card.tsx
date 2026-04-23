import { Calendar, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { ScheduleSlot } from "@/types";

interface ScheduleCardProps {
  date: string;
  slots: ScheduleSlot[];
}

export function ScheduleCard({ date, slots }: ScheduleCardProps) {
  return (
    <Card className="mt-4">
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-muted-foreground" />
          <span className="font-semibold">{date}</span>
        </div>

        <div className="divide-y divide-border">
          {slots.map((slot) => (
            <div key={slot.time + slot.title} className="flex gap-4 py-3 first:pt-0 last:pb-0">
              <span className="w-24 shrink-0 text-sm text-muted-foreground">
                {slot.time}
              </span>
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-semibold">{slot.title}</p>
                {slot.participants.map((p) => (
                  <div key={p} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User className="size-3" />
                    {p}
                  </div>
                ))}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3" />
                  {slot.location}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="justify-end border-t">
        <Button variant="outline" size="sm">
          View schedule
        </Button>
      </CardFooter>
    </Card>
  );
}
