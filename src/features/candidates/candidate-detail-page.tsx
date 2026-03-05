import { useParams, useSearchParams } from "react-router";
import {
  MapPin,
  Mail,
  Phone,
  Building2,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useCandidateDetail } from "@/features/candidates/api/use-candidate-detail";
import { ApplicationTabContent } from "@/features/candidates/components/application-tab-content";

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="size-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export function Component() {
  const { candidateId } = useParams<{ candidateId: string }>();
  const [searchParams] = useSearchParams();
  const preselectedAppId = searchParams.get("app");

  const {
    data: candidate,
    isLoading,
    error,
  } = useCandidateDetail(candidateId!);

  if (isLoading) return <ProfileSkeleton />;

  if (error || !candidate) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
        <p className="text-destructive">
          {error ? `Failed to load: ${error.message}` : "Candidate not found"}
        </p>
        <Button variant="outline" onClick={() => window.history.back()}>
          Go back
        </Button>
      </div>
    );
  }

  const apps = candidate.applications ?? [];
  const defaultTab =
    preselectedAppId && apps.some((a) => a.id === preselectedAppId)
      ? preselectedAppId
      : apps[0]?.id;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-muted text-xl font-semibold uppercase">
          {candidate.first_name[0]}
          {candidate.last_name[0]}
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">
            {candidate.first_name} {candidate.last_name}
          </h1>
          {candidate.headline && (
            <p className="text-muted-foreground">{candidate.headline}</p>
          )}

          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Mail className="size-3.5" />
              {candidate.email}
            </div>
            {candidate.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="size-3.5" />
                {candidate.phone}
              </div>
            )}
            {candidate.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                {candidate.location}
              </div>
            )}
            {candidate.current_company && (
              <div className="flex items-center gap-1.5">
                <Building2 className="size-3.5" />
                {candidate.current_title
                  ? `${candidate.current_title} at ${candidate.current_company}`
                  : candidate.current_company}
              </div>
            )}
            {candidate.years_experience != null && (
              <div className="flex items-center gap-1.5">
                <Briefcase className="size-3.5" />
                {candidate.years_experience} yrs experience
              </div>
            )}
          </div>

          {candidate.skills && candidate.skills.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {candidate.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          )}

          {candidate.education && candidate.education.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-x-4 text-xs text-muted-foreground">
              {candidate.education.map((ed, i) => (
                <div key={i} className="flex items-center gap-1">
                  <GraduationCap className="size-3" />
                  {ed.degree} {ed.field ? `in ${ed.field}` : ""}, {ed.school}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {apps.length === 0 ? (
        <p className="text-muted-foreground">
          No applications for this candidate.
        </p>
      ) : (
        <Tabs defaultValue={defaultTab}>
          <TabsList>
            {apps.map((app) => (
              <TabsTrigger key={app.id} value={app.id}>
                {app.requisitions.title}
              </TabsTrigger>
            ))}
          </TabsList>
          {apps.map((app) => (
            <TabsContent key={app.id} value={app.id} className="mt-4">
              <ApplicationTabContent app={app} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
