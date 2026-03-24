import {
  Briefcase,
  Building2,
  ExternalLink,
  MapPin,
  UserCheck,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ReqDraftFormData } from "@/types";

const EMPLOYMENT_LABELS: Record<string, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  intern: "Intern",
};

interface ReqDraftCardProps {
  formData: ReqDraftFormData;
  onOpen: () => void;
}

export function ReqDraftCard({ formData, onOpen }: ReqDraftCardProps) {
  const fields = [
    {
      icon: Building2,
      label: formData.department,
      show: !!formData.department && formData.department !== "Any department",
    },
    {
      icon: Briefcase,
      label: EMPLOYMENT_LABELS[formData.employment_type] ?? formData.employment_type,
      show: !!formData.employment_type,
    },
    {
      icon: MapPin,
      label: `Level: ${formData.level}`,
      show: !!formData.level,
    },
    {
      icon: UserCheck,
      label: `HM: ${formData.hiring_manager_name}`,
      show: !!formData.hiring_manager_name,
    },
    {
      icon: Users,
      label: `Recruiter: ${formData.recruiter_name}`,
      show: !!formData.recruiter_name,
    },
  ].filter((f) => f.show);

  return (
    <Card className="mt-4">
      <CardContent className="flex items-center gap-4">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <Briefcase className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate font-semibold">
              {formData.title || "Untitled role"}
            </span>
            <Badge variant="outline" className="shrink-0 text-xs">
              Draft
            </Badge>
          </div>

          {fields.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              {fields.map((f) => (
                <span key={f.label} className="flex items-center gap-1">
                  <f.icon className="size-3" />
                  {f.label}
                </span>
              ))}
            </div>
          )}
        </div>

        <Button
          size="sm"
          variant="outline"
          className="shrink-0 gap-1.5"
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
        >
          <ExternalLink className="size-3.5" />
          Open in editor
        </Button>
      </CardContent>
    </Card>
  );
}
