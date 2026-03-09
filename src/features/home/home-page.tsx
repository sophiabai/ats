import { Link } from "react-router";
import {
  Briefcase,
  Users,
  FileText,
  CalendarDays,
  ClipboardCheck,
  Mail,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  { title: "Requisitions", description: "Manage open roles", icon: Briefcase, href: "/requisitions" },
  { title: "Candidates", description: "Browse candidate profiles", icon: Users, href: "/candidates" },
  { title: "Applications", description: "Track pipeline progress", icon: FileText, href: "/applications" },
  { title: "Interviews", description: "Schedule and manage", icon: CalendarDays, href: "/interviews" },
  { title: "Assessments", description: "Scorecards and decisions", icon: ClipboardCheck, href: "/assessments" },
  { title: "Emails", description: "Communication logs", icon: Mail, href: "/emails" },
];

export function Component() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your recruiting workspace.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sections.map((s) => (
          <Link key={s.href} to={s.href} className="group">
            <Card className="transition-colors group-hover:border-primary/50">
              <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                <s.icon className="size-5 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">
                  {s.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {s.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
