import { Mail } from "lucide-react";

export function EmailsPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
      <Mail className="size-12" />
      <h1 className="text-2xl font-semibold text-foreground">Emails</h1>
      <p>Email templates and communication logs will live here.</p>
    </div>
  );
}

export { EmailsPage as Component };
