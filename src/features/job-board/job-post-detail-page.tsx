import { useParams } from "react-router";
import {
  MapPin,
  Building2,
  UserCheck,
  DollarSign,
  Briefcase,
} from "lucide-react";
import { useJobPost } from "@/features/job-board/api/use-job-posts";
import type { LocationPayRange } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const EMPLOYMENT_LABELS: Record<string, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  intern: "Intern",
};

function parseLocations(location: string | null): string[] {
  if (!location) return [];
  return location
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean);
}

interface DescriptionSection {
  title: string;
  content: string;
}

function parseDescription(description: string | null): DescriptionSection[] {
  if (!description) return [];
  const sections: DescriptionSection[] = [];
  const parts = description.split(/^## /m).filter(Boolean);

  for (const part of parts) {
    const newlineIdx = part.indexOf("\n");
    if (newlineIdx === -1) continue;
    const title = part.slice(0, newlineIdx).trim();
    const content = part.slice(newlineIdx + 1).trim();
    if (title && content) {
      sections.push({ title, content });
    }
  }

  return sections;
}

function renderSectionContent(content: string) {
  const lines = content.split("\n").filter((l) => l.trim());
  const isList = lines.every((l) => l.startsWith("- "));

  if (isList) {
    return (
      <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
        {lines.map((line, i) => (
          <li key={i}>{line.replace(/^- /, "")}</li>
        ))}
      </ul>
    );
  }

  return (
    <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
      {content}
    </p>
  );
}

function formatPayRange(range: LocationPayRange, currency: string) {
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(n);

  return `${fmt(range.min)} - ${fmt(range.max)} ${currency} per year (${range.location})`;
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-80" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="flex gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-24 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

function IconDetail({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5 text-sm">
      <Tooltip>
        <TooltipTrigger asChild>
          <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent side="left">{label}</TooltipContent>
      </Tooltip>
      <span className="font-medium">{children}</span>
    </div>
  );
}

export function Component() {
  const { postId } = useParams<{ postId: string }>();
  const { data: job, isLoading, error } = useJobPost(postId!);

  if (isLoading) return <DetailSkeleton />;

  if (error || !job) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
        <p className="text-destructive">
          {error ? `Failed to load: ${error.message}` : "Job post not found"}
        </p>
        <Button variant="outline" onClick={() => window.history.back()}>
          Go back
        </Button>
      </div>
    );
  }

  const locations = parseLocations(job.location);
  const sections = parseDescription(job.description);
  const payRanges = job.location_pay_ranges;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{job.title}</h1>
          <Badge variant="outline">
            {EMPLOYMENT_LABELS[job.employment_type] ?? job.employment_type}
          </Badge>
        </div>
      </div>

      <Separator />

      <div className="grid gap-8 md:grid-cols-[1fr_200px]">
        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-3 text-base font-semibold">{section.title}</h2>
              {renderSectionContent(section.content)}
            </section>
          ))}

          {job.requirements && job.requirements.length > 0 && (
            <section>
              <h2 className="mb-3 text-base font-semibold">Qualifications</h2>
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                {job.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </section>
          )}

          {payRanges && payRanges.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
                <DollarSign className="size-4" />
                Compensation
              </h2>
              <p className="text-sm font-medium">
                The pay range for this role is:
              </p>
              <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                {payRanges.map((range) => (
                  <li key={range.location}>
                    {formatPayRange(range, job.salary_currency)}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside>
          <Card>
            <CardContent className="space-y-3">
              {job.department && (
                <IconDetail icon={Building2} label="Department">
                  {job.department}
                </IconDetail>
              )}
              <IconDetail icon={Briefcase} label="Employment type">
                {EMPLOYMENT_LABELS[job.employment_type] ?? job.employment_type}
              </IconDetail>
              {locations.length > 0 && (
                <IconDetail icon={MapPin} label="Location">
                  <span className="flex flex-wrap gap-1">
                    {locations.map((loc) => (
                      <Badge key={loc} variant="secondary" className="text-xs">
                        {loc}
                      </Badge>
                    ))}
                  </span>
                </IconDetail>
              )}
              {job.hiring_manager_name && (
                <IconDetail icon={UserCheck} label="Hiring manager">
                  {job.hiring_manager_name}
                </IconDetail>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
