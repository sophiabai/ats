import { useMemo } from "react";
import { Check, CheckCircle2, Circle, Clock, Minus, User, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useCriteriaEvaluations } from "@/features/requisitions/api/use-criteria-evaluations";
import type { ApplicationDetail } from "@/features/candidates/api/use-candidate-detail";
import type { Milestone, ReqInterview } from "@/types/database";
import type { ReqStageWithInterviews } from "@/features/candidates/api/use-candidate-detail";

export const MILESTONE_ORDER: Milestone[] = [
  "application",
  "screen",
  "final_interview",
  "offer",
  "offer_accepted",
];

export const MILESTONE_LABELS: Record<Milestone, string> = {
  application: "Application",
  screen: "Screen",
  final_interview: "Final interview",
  offer: "Offer",
  offer_accepted: "Offer accepted",
};

export type StageStatus = "completed" | "current" | "upcoming";

export function getStageStatus(
  milestone: Milestone,
  stageId: string,
  currentMilestone: Milestone,
  currentStageId: string | null,
  stages: ReqStageWithInterviews[],
): StageStatus {
  const milestoneIdx = MILESTONE_ORDER.indexOf(milestone);
  const currentMilestoneIdx = MILESTONE_ORDER.indexOf(currentMilestone);

  if (milestoneIdx < currentMilestoneIdx) return "completed";
  if (milestoneIdx > currentMilestoneIdx) return "upcoming";

  // Same milestone — compare sort_order within that milestone
  if (stageId === currentStageId) return "current";
  const thisStage = stages.find((s) => s.id === stageId);
  const curStage = stages.find((s) => s.id === currentStageId);
  if (thisStage && curStage && thisStage.sort_order < curStage.sort_order)
    return "completed";
  return "upcoming";
}

export function StageIcon({ status }: { status: StageStatus }) {
  if (status === "completed")
    return (
      <div className="flex size-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
        <Check className="size-3" strokeWidth={3} />
      </div>
    );
  if (status === "current")
    return (
      <div className="flex size-5 items-center justify-center rounded-full bg-blue-500/15 text-blue-600">
        <Circle className="size-2.5 fill-current" />
      </div>
    );
  return (
    <div className="flex size-5 items-center justify-center rounded-full bg-muted text-muted-foreground/40">
      <Minus className="size-3" />
    </div>
  );
}

export function InterviewTimeline({ interviews }: { interviews: ReqInterview[] }) {
  return (
    <div className="mt-2 pt-2">
      {interviews.map((iv, idx) => {
        const isLast = idx === interviews.length - 1;
        return (
          <div key={iv.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border bg-background">
                <Circle className="size-1.5 fill-muted-foreground/40 text-muted-foreground/40" />
              </div>
              {!isLast && <div className="w-px flex-1 bg-border" />}
            </div>
            <div className={cn("pb-3", isLast && "pb-0")}>
              <span className="text-sm text-muted-foreground">{iv.title}</span>
              <div className="flex items-center gap-3 text-xs text-muted-foreground/60">
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {iv.duration_minutes}m
                </span>
                {iv.interviewer_name && (
                  <span className="flex items-center gap-1">
                    <User className="size-3" />
                    {iv.interviewer_name}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CriteriaEvaluationsSection({
  reqId,
  candidateId,
}: {
  reqId: string;
  candidateId: string;
}) {
  const { data: evaluations } = useCriteriaEvaluations(reqId);
  const evals = evaluations?.get(candidateId);

  if (!evals || evals.length === 0) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Criteria evaluations</h3>
        <p className="text-sm text-muted-foreground">Not yet evaluated</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Criteria evaluations</h3>
      <TooltipProvider>
        <div className="space-y-1">
          {evals.map((ev) => (
            <Tooltip key={ev.criterion}>
              <TooltipTrigger asChild>
                <div className="flex items-start gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50">
                  {ev.met ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  ) : (
                    <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                  )}
                  <span
                    className={cn(
                      ev.met ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {ev.criterion}
                  </span>
                </div>
              </TooltipTrigger>
              {ev.reasoning && (
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="text-xs">{ev.reasoning}</p>
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}

export function ApplicationTabContent({ app }: { app: ApplicationDetail }) {
  const pipeline = useMemo(() => {
    const stages = app.requisitions?.req_stages ?? [];
    const grouped = new Map<Milestone, ReqStageWithInterviews[]>();

    for (const ms of MILESTONE_ORDER) {
      grouped.set(ms, []);
    }
    for (const stage of stages) {
      grouped.get(stage.milestone)?.push(stage);
    }
    for (const [, arr] of grouped) {
      arr.sort((a, b) => a.sort_order - b.sort_order);
    }
    for (const [, arr] of grouped) {
      for (const stage of arr) {
        stage.req_interviews = (stage.req_interviews ?? []).sort(
          (a, b) => (a.order_position ?? 0) - (b.order_position ?? 0),
        );
      }
    }

    return grouped;
  }, [app.requisitions?.req_stages]);

  const allStages = app.requisitions?.req_stages ?? [];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {MILESTONE_ORDER.map((ms) => {
          const stages = pipeline.get(ms) ?? [];
          const hasStages = stages.length > 0;
          const milestonePastOrCurrent =
            MILESTONE_ORDER.indexOf(ms) <=
            MILESTONE_ORDER.indexOf(app.current_milestone);

          return (
            <div key={ms}>
              <h4
                className={cn(
                  "text-sm font-semibold",
                  milestonePastOrCurrent
                    ? "text-foreground"
                    : "text-muted-foreground/60",
                )}
              >
                {MILESTONE_LABELS[ms]}
              </h4>

              {hasStages ? (
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {stages.map((stage) => {
                    const status = getStageStatus(
                      ms,
                      stage.id,
                      app.current_milestone,
                      app.current_stage_id,
                      allStages,
                    );

                    return (
                      <Card
                        key={stage.id}
                        className={cn(
                          "gap-0 py-0",
                          status === "current" &&
                            "ring-2 ring-blue-500/30",
                          status === "upcoming" && "opacity-50",
                        )}
                      >
                        <CardContent className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <StageIcon status={status} />
                            <span className="text-sm font-medium">
                              {stage.name}
                            </span>
                          </div>
                          {stage.req_interviews.length > 0 && (
                            <InterviewTimeline interviews={stage.req_interviews} />
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card
                  className={cn(
                    "mt-2 gap-0 py-0",
                    !milestonePastOrCurrent && "opacity-50",
                  )}
                >
                  <CardContent className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <StageIcon
                        status={
                          milestonePastOrCurrent ? "completed" : "upcoming"
                        }
                      />
                      <span className="text-sm text-muted-foreground">
                        {MILESTONE_LABELS[ms]}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          );
        })}
      </div>

      <CriteriaEvaluationsSection
        reqId={app.req_id}
        candidateId={app.candidate_id}
      />

      {app.notes && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Notes</h3>
          <p className="text-sm text-muted-foreground">{app.notes}</p>
        </div>
      )}
    </div>
  );
}
