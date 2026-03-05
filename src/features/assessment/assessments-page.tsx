import { ClipboardCheck } from "lucide-react";

export function AssessmentsPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
      <ClipboardCheck className="size-12" />
      <h1 className="text-2xl font-semibold text-foreground">Assessments</h1>
      <p>Scorecards and stage decisions will be managed here.</p>
    </div>
  );
}

export { AssessmentsPage as Component };
