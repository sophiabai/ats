import { useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ViewToggle, type View } from "@/components/custom/view-toggle";
import type { ApplicationDetail } from "@/features/candidates/api/use-candidate-detail";
import type { Milestone } from "@/types/database";

const MILESTONE_LABELS: Record<Milestone, string> = {
  application: "Application",
  screen: "Screen",
  final_interview: "Final interview",
  offer: "Offer",
  offer_accepted: "Offer accepted",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-700",
  hired: "bg-blue-500/15 text-blue-700",
  rejected: "bg-destructive/15 text-destructive",
  withdrawn: "bg-amber-500/15 text-amber-700",
};

const INTERVIEW_STATUS_COLORS: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  scheduled: "bg-blue-500/15 text-blue-700",
  completed: "bg-emerald-500/15 text-emerald-700",
  cancelled: "bg-muted text-muted-foreground line-through",
  no_show: "bg-destructive/15 text-destructive",
};

export function ApplicationTabContent({ app }: { app: ApplicationDetail }) {
  const req = app.requisitions;
  const interviews = app.application_interviews ?? [];
  const [interviewView, setInterviewView] = useState<View>("table");

  const interviewsByStage = new Map<string, typeof interviews>();
  for (const interview of interviews) {
    const stageName = interview.req_stages?.name ?? "Unknown";
    if (!interviewsByStage.has(stageName)) {
      interviewsByStage.set(stageName, []);
    }
    interviewsByStage.get(stageName)!.push(interview);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Position
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-semibold">{req.title}</div>
            <div className="text-xs text-muted-foreground">
              {req.department}
              {req.location ? ` · ${req.location}` : ""}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current milestone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-semibold">
              {MILESTONE_LABELS[app.current_milestone]}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant="outline"
              className={STATUS_COLORS[app.status] ?? ""}
            >
              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Applied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-semibold">
              {formatDistanceToNow(new Date(app.applied_date), {
                addSuffix: true,
              })}
            </div>
            <div className="text-xs text-muted-foreground">
              {format(new Date(app.applied_date), "MMM d, yyyy")}
            </div>
          </CardContent>
        </Card>
      </div>

      {app.source && (
        <div className="text-sm text-muted-foreground">
          Source: <Badge variant="secondary">{app.source}</Badge>
          {app.referrer_name && <span> · Referred by {app.referrer_name}</span>}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Interview schedule</h3>
          {interviews.length > 0 && (
            <ViewToggle view={interviewView} onViewChange={setInterviewView} />
          )}
        </div>
        {interviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No interviews scheduled yet.
          </p>
        ) : (
          [...interviewsByStage.entries()].map(
            ([stageName, stageInterviews]) => (
              <div key={stageName} className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  {stageName}
                </h4>
                {interviewView === "cards" ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {stageInterviews.map((iv) => (
                      <Card key={iv.id}>
                        <CardContent>
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-medium">{iv.title}</span>
                            <Badge
                              variant="outline"
                              className={
                                INTERVIEW_STATUS_COLORS[iv.status] ?? ""
                              }
                            >
                              {iv.status.replace(/_/g, " ")}
                            </Badge>
                          </div>
                          <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                            <div className="capitalize">
                              {iv.interview_type.replace(/_/g, " ")}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <User className="size-3.5" />
                              {iv.interviewer_name ?? "Unassigned"}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="size-3.5" />
                              {iv.duration_minutes}m
                            </div>
                            {iv.scheduled_at ? (
                              <div className="flex items-center gap-1.5">
                                <CalendarDays className="size-3.5" />
                                {format(
                                  new Date(iv.scheduled_at),
                                  "MMM d, h:mm a",
                                )}
                              </div>
                            ) : (
                              <div className="text-muted-foreground/50">
                                Not scheduled
                              </div>
                            )}
                            {iv.location && (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="size-3.5" />
                                {iv.location}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Interview</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Interviewer</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Scheduled</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stageInterviews.map((iv) => (
                          <TableRow key={iv.id}>
                            <TableCell className="font-medium">
                              {iv.title}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {iv.interview_type.replace(/_/g, " ")}
                            </TableCell>
                            <TableCell>
                              {iv.interviewer_name ? (
                                <div className="flex items-center gap-1.5">
                                  <User className="size-3.5 text-muted-foreground" />
                                  {iv.interviewer_name}
                                </div>
                              ) : (
                                <span className="text-muted-foreground/50">
                                  Unassigned
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Clock className="size-3.5" />
                                {iv.duration_minutes}m
                              </div>
                            </TableCell>
                            <TableCell>
                              {iv.scheduled_at ? (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <CalendarDays className="size-3.5" />
                                  {format(
                                    new Date(iv.scheduled_at),
                                    "MMM d, h:mm a",
                                  )}
                                  {iv.location && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="size-3" />
                                      {iv.location}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground/50">
                                  Not scheduled
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  INTERVIEW_STATUS_COLORS[iv.status] ?? ""
                                }
                              >
                                {iv.status.replace(/_/g, " ")}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            ),
          )
        )}
      </div>

      {app.notes && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Notes</h3>
          <p className="text-sm text-muted-foreground">{app.notes}</p>
        </div>
      )}
    </div>
  );
}
