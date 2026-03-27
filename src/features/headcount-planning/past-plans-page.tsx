import { Calendar, FileText, Lock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PastPlan {
  id: string;
  name: string;
  year: number;
  status: "finalized" | "archived";
  totalHeadcount: number;
  departments: number;
  lockedDate: string;
  lockedBy: string;
  description: string;
}

const pastPlans: PastPlan[] = [
  {
    id: "aop-2025",
    name: "AOP 2025",
    year: 2025,
    status: "finalized",
    totalHeadcount: 342,
    departments: 8,
    lockedDate: "Dec 15, 2024",
    lockedBy: "Sarah Chen",
    description:
      "Annual operating plan for fiscal year 2025. Base headcount projection across all departments.",
  },
  {
    id: "aop-2025-acquisition",
    name: "AOP 2025 with acquisition",
    year: 2025,
    status: "finalized",
    totalHeadcount: 410,
    departments: 10,
    lockedDate: "Jan 8, 2025",
    lockedBy: "Sarah Chen",
    description:
      "Revised plan incorporating the Acme Corp acquisition. Includes merged org structure and transition headcount.",
  },
  {
    id: "aop-2024",
    name: "AOP 2024",
    year: 2024,
    status: "archived",
    totalHeadcount: 298,
    departments: 7,
    lockedDate: "Dec 12, 2023",
    lockedBy: "James Miller",
    description:
      "Annual operating plan for fiscal year 2024. Focused on engineering and go-to-market expansion.",
  },
  {
    id: "aop-2023",
    name: "AOP 2023",
    year: 2023,
    status: "archived",
    totalHeadcount: 245,
    departments: 6,
    lockedDate: "Dec 8, 2022",
    lockedBy: "James Miller",
    description:
      "Annual operating plan for fiscal year 2023. Initial post-Series B scaling plan.",
  },
];

const statusConfig: Record<
  PastPlan["status"],
  { label: string; variant: "default" | "secondary" }
> = {
  finalized: { label: "Finalized", variant: "default" },
  archived: { label: "Archived", variant: "secondary" },
};

export function PastPlansPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold ">Past plans</h1>
        <p className="text-sm text-muted-foreground">
          View previously finalized and archived headcount plans.
        </p>
      </div>

      <div className="grid gap-4">
        {pastPlans.map((plan) => {
          const cfg = statusConfig[plan.status];
          return (
            <Card key={plan.id} className="transition-colors hover:bg-muted/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                      <FileText className="size-5 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{plan.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {plan.description}
                      </p>
                    </div>
                  </div>
                  <Badge variant={cfg.variant}>{cfg.label}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Users className="size-3.5" />
                    <span>{plan.totalHeadcount} headcount</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText className="size-3.5" />
                    <span>{plan.departments} departments</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Lock className="size-3.5" />
                    <span>Locked {plan.lockedDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-3.5" />
                    <span>By {plan.lockedBy}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export { PastPlansPage as Component };
