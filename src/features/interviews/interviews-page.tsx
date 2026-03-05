import { CalendarDays } from "lucide-react";

export function InterviewsPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
      <CalendarDays className="size-12" />
      <h1 className="text-2xl font-semibold text-foreground">Interviews</h1>
      <p>Interview scheduling and management will live here.</p>
    </div>
  );
}

export { InterviewsPage as Component };
