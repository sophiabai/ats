import { FileText } from "lucide-react";

export function ApplicationsPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
      <FileText className="size-12" />
      <h1 className="text-2xl font-semibold text-foreground">Applications</h1>
      <p>Candidate applications and pipeline tracking will live here.</p>
    </div>
  );
}

export { ApplicationsPage as Component };
