import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router";
import { formatDistanceToNow } from "date-fns";
import {
  MapPin,
  Mail,
  Phone,
  GraduationCap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useCandidateDetail, type CandidateDetail } from "@/features/candidates/api/use-candidate-detail";
import { ApplicationTabContent } from "@/features/candidates/components/application-tab-content";
import { useSetPageTitle } from "@/stores/page-title-store";

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
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

  useSetPageTitle(
    candidate ? `${candidate.first_name} ${candidate.last_name}` : null,
  );

  const apps = candidate?.applications ?? [];
  const defaultTab =
    preselectedAppId && apps.some((a) => a.id === preselectedAppId)
      ? preselectedAppId
      : "profile";
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);

  useEffect(() => {
    setActiveTab(undefined);
  }, [candidateId]);

  const tabsValue = activeTab ?? defaultTab;

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

  return (
    <div className="space-y-6">
      <div>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold ">
            {candidate.first_name} {candidate.last_name}
          </h1>
          {candidate.current_company && (
            <p className="mt-1.5 text-sm text-muted-foreground">
              {candidate.current_title
                ? `${candidate.current_title} at ${candidate.current_company}`
                : candidate.current_company}
            </p>
          )}
          {candidate.last_activity_action && (
            <p
              className={
                candidate.current_company
                  ? "mt-1 text-sm text-muted-foreground"
                  : "mt-1.5 text-sm text-muted-foreground"
              }
            >
              {candidate.last_activity_action}
              {candidate.last_activity_at &&
                ` · ${formatDistanceToNow(new Date(candidate.last_activity_at), { addSuffix: true })}`}
            </p>
          )}
        </div>
      </div>


      <Tabs value={tabsValue} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          {apps.map((app) => (
            <TabsTrigger key={app.id} value={app.id}>
              {app.requisitions.title}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <ProfileTabContent candidate={candidate} />
        </TabsContent>

        {apps.map((app) => (
          <TabsContent key={app.id} value={app.id} className="mt-4">
            <ApplicationTabContent app={app} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatMonth(dateStr: string) {
  const [year, month] = dateStr.split("-");
  return `${MONTH_NAMES[parseInt(month, 10) - 1]} ${year}`;
}

function durationLabel(start: string, end: string | null) {
  const s = new Date(start + "-01");
  const e = end ? new Date(end + "-01") : new Date();
  let months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  if (months < 1) months = 1;
  const yrs = Math.floor(months / 12);
  const mos = months % 12;
  if (yrs > 0 && mos > 0) return `${yrs} yr${yrs > 1 ? "s" : ""} ${mos} mo${mos > 1 ? "s" : ""}`;
  if (yrs > 0) return `${yrs} yr${yrs > 1 ? "s" : ""}`;
  return `${mos} mo${mos > 1 ? "s" : ""}`;
}

function ProfileTabContent({ candidate }: { candidate: CandidateDetail }) {
  const workHistory = candidate.work_history ?? [];
  const education = candidate.education ?? [];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
      <div className="space-y-8">
        {workHistory.length > 0 && (
          <section>
            <h3 className="mb-4 font-semibold">Experience</h3>
            <div className="space-y-7">
              {workHistory.map((w, i) => (
                <div key={i}>
                  <div className="font-medium leading-snug">{w.title}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-sm text-muted-foreground">
                    <span>{w.company}</span>
                    {w.location && (
                      <>
                        <span className="text-border">·</span>
                        <span>{w.location}</span>
                      </>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground/70">
                    <span>
                      {formatMonth(w.start_date)} – {w.end_date ? formatMonth(w.end_date) : "Present"}
                    </span>
                    <span className="text-border">·</span>
                    <span>{durationLabel(w.start_date, w.end_date)}</span>
                  </div>
                  {w.description && (
                    <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                      {w.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {education.length > 0 && (
          <section>
            <h3 className="mb-4 font-semibold">Education</h3>
            <div className="space-y-4">
              {education.map((ed, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <GraduationCap className="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-medium leading-snug">
                      {ed.degree}{ed.field ? ` in ${ed.field}` : ""}
                    </div>
                    <div className="mt-0.5 text-sm text-muted-foreground">
                      {ed.school}
                      {ed.end_year ? ` · ${ed.end_year}` : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <aside className="space-y-6 lg:border-l lg:pl-6">
        <section>
          <h3 className="mb-4 font-semibold">Contact</h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="size-3.5 shrink-0" />
              <span className="truncate">{candidate.email}</span>
            </div>
            {candidate.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="size-3.5 shrink-0" />
                {candidate.phone}
              </div>
            )}
            {candidate.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" />
                {candidate.location}
              </div>
            )}
          </div>
        </section>

        {candidate.skills && candidate.skills.length > 0 && (
          <section>
            <h3 className="mb-4 font-semibold">Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {candidate.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {candidate.notes && (
          <section>
            <h3 className="mb-4 font-semibold">Notes</h3>
            <p className="text-sm text-muted-foreground">{candidate.notes}</p>
          </section>
        )}
      </aside>
    </div>
  );
}
