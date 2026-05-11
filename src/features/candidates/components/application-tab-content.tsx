import { useMemo, useState } from "react";
import {
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  MoreHorizontal,
  Pencil,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  InterviewFeedbackDialog,
  RATING_LABELS,
  type InterviewFeedback,
  type Rating,
} from "@/features/candidates/components/interview-feedback-dialog";
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
      <div className="flex size-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
        <MoreHorizontal className="size-3" strokeWidth={3} />
      </div>
    );
  return (
    <div className="flex size-5 items-center justify-center rounded-full border border-muted-foreground/20 text-muted-foreground/40">
      <MoreHorizontal className="size-3" />
    </div>
  );
}

export function InterviewTimeline({
  interviews,
  scheduledByTitle,
  candidateName,
  feedbacks,
  onFeedbackChange,
}: {
  interviews: ReqInterview[];
  scheduledByTitle?: Record<string, Date>;
  candidateName?: string;
  feedbacks?: Record<string, Record<string, InterviewFeedback>>;
  onFeedbackChange?: (
    interviewTitle: string,
    interviewerName: string,
    feedback: InterviewFeedback,
  ) => void;
}) {
  return (
    <div className="pt-3">
      {interviews.map((iv, idx) => (
        <InterviewRow
          key={iv.id}
          interview={iv}
          isLast={idx === interviews.length - 1}
          scheduledAt={scheduledByTitle?.[iv.title]}
          candidateName={candidateName}
          feedbacks={feedbacks?.[iv.title]}
          onFeedbackChange={
            onFeedbackChange
              ? (name, fb) => onFeedbackChange(iv.title, name, fb)
              : undefined
          }
        />
      ))}
    </div>
  );
}

function formatScheduledTime(date: Date) {
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  const year = date.getFullYear();
  let hour = date.getHours();
  const minute = date.getMinutes();
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  const minuteStr = minute.toString().padStart(2, "0");
  return `${month} ${day}, ${year} ${hour}:${minuteStr} ${period} PST`;
}

const TECHNICAL_INTERVIEW_TYPES = new Set(["technical", "pair_programming"]);

const DEFAULT_INTERVIEWER_NOTES =
  "Target level: L8 IC - Staff Software Engineer.\nTips: (1) Don't be late (2) Ask open questions.";

function feedbackFormLabel(title: string) {
  return title.split(" (")[0];
}

const POSITIVE_RATINGS: ReadonlySet<Rating> = new Set(["yes", "strong_yes"]);

function FeedbackRatingBadge({ rating }: { rating: Rating }) {
  const isPositive = POSITIVE_RATINGS.has(rating);
  return (
    <Badge
      className={cn(
        "gap-0.5 border-0 px-1.5 py-0 text-[10px] font-medium",
        isPositive
          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
          : "bg-red-500/15 text-red-700 dark:text-red-400",
      )}
    >
      {isPositive ? (
        <Check className="size-3" strokeWidth={3} />
      ) : (
        <XCircle className="size-3" />
      )}
      {RATING_LABELS[rating]}
    </Badge>
  );
}

function InterviewerLine({
  name,
  onOpenFeedback,
  feedback,
}: {
  name: string;
  onOpenFeedback?: () => void;
  feedback?: InterviewFeedback;
}) {
  const hasFeedback = Boolean(feedback);
  const rating = feedback?.overallRating;

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm leading-5 text-muted-foreground">{name}</span>
      {rating && <FeedbackRatingBadge rating={rating} />}
      {onOpenFeedback && (
        hasFeedback ? (
          <Button
            variant="ghost"
            size="icon"
            className="size-6 text-muted-foreground"
            onClick={onOpenFeedback}
          >
            <Pencil className="size-3" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground"
            onClick={onOpenFeedback}
          >
            <Pencil className="size-3" />
            Add feedback
          </Button>
        )
      )}
    </div>
  );
}

function InterviewRow({
  interview,
  isLast,
  scheduledAt,
  candidateName,
  feedbacks,
  onFeedbackChange,
}: {
  interview: ReqInterview;
  isLast: boolean;
  scheduledAt?: Date;
  candidateName?: string;
  feedbacks?: Record<string, InterviewFeedback>;
  onFeedbackChange?: (interviewerName: string, feedback: InterviewFeedback) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [feedbackInterviewer, setFeedbackInterviewer] = useState<string | null>(
    null,
  );
  const interviewers = (interview.interviewer_name ?? "")
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean);
  const isTechnical = TECHNICAL_INTERVIEW_TYPES.has(interview.interview_type);
  const notes = interview.instructions || DEFAULT_INTERVIEWER_NOTES;
  const openFeedback = (name: string) => () => setFeedbackInterviewer(name);

  return (
    <div className="flex gap-2">
      <div className="flex flex-col items-center">
        <div className="flex size-5 shrink-0 items-center justify-center rounded bg-stone-200/30 text-muted-foreground">
          <Calendar className="size-4" />
        </div>
        {!isLast && <div className="w-px flex-1 bg-border" />}
      </div>
      <div className={cn("min-w-0 flex-1", !isLast && "pb-5")}>
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="flex items-center gap-1.5 text-left hover:text-muted-foreground focus-visible:outline-none"
        >
          <span className="text-sm leading-5 font-medium">
            {interview.title} ({interview.duration_minutes} min)
          </span>
          {expanded ? (
            <ChevronDown className="size-3.5 stroke-[2.5] text-muted-foreground" />
          ) : (
            <ChevronRight className="size-3.5 stroke-[2.5] text-muted-foreground" />
          )}
        </button>
        {scheduledAt && (
          <p className="text-sm leading-5 text-muted-foreground">
            {formatScheduledTime(scheduledAt)}
          </p>
        )}
        {!expanded &&
          (interviewers.length > 0 ? (
            interviewers.map((name) => (
              <InterviewerLine
                key={name}
                name={name}
                onOpenFeedback={openFeedback(name)}
                feedback={feedbacks?.[name]}
              />
            ))
          ) : (
            <p className="text-sm leading-5 text-muted-foreground">
              No interviewers
            </p>
          ))}
        <div
          className={cn(
            "stage-collapse grid",
            expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="mt-3 space-y-4">
              <div className="group">
                <div className="flex items-center gap-1">
                  <p className="text-sm leading-5 font-medium text-foreground">
                    Interviewers
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                  >
                    <Pencil className="size-3" />
                  </Button>
                </div>
                {interviewers.length > 0 ? (
                  interviewers.map((name) => (
                    <InterviewerLine
                      key={name}
                      name={name}
                      onOpenFeedback={openFeedback(name)}
                      feedback={feedbacks?.[name]}
                    />
                  ))
                ) : (
                  <p className="text-sm leading-5 text-muted-foreground">
                    No interviewers
                  </p>
                )}
              </div>
              <div className="group">
                <div className="flex items-center gap-1">
                  <p className="text-sm leading-5 font-medium text-foreground">
                    Notes to interviewers
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                  >
                    <Pencil className="size-3" />
                  </Button>
                </div>
                <p className="text-sm leading-5 whitespace-pre-line text-muted-foreground">
                  {notes}
                </p>
              </div>
              <div className="group">
                <p className="text-sm leading-5 font-medium text-foreground">
                  Feedback form
                </p>
                <div className="flex items-center gap-1">
                  <a
                    href="#"
                    className="text-sm leading-5 text-blue-600 underline underline-offset-2 hover:text-blue-700 dark:text-blue-400"
                  >
                    {feedbackFormLabel(interview.title)}
                  </a>
                  <div className="flex items-center">
                    <Button variant="ghost" size="icon" className="size-7">
                      <Copy className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
              {isTechnical && (
                <div className="group">
                  <p className="text-sm leading-5 font-medium text-foreground">
                    CodePair link
                  </p>
                  <div className="flex items-center gap-1">
                    <a
                      href="#"
                      className="text-sm leading-5 text-blue-600 underline underline-offset-2 hover:text-blue-700 dark:text-blue-400"
                    >
                      CodePair
                    </a>
                    <div className="flex items-center">
                      <Button variant="ghost" size="icon" className="size-7">
                        <Copy className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-3 flex items-center border-t border-border/60 pt-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    More actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>Add note</DropdownMenuItem>
                  <DropdownMenuItem>Reschedule interview</DropdownMenuItem>
                  <DropdownMenuItem>Cancel interview</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
      <InterviewFeedbackDialog
        open={feedbackInterviewer !== null}
        onOpenChange={(open) => {
          if (!open) setFeedbackInterviewer(null);
        }}
        candidateName={candidateName ?? "Candidate"}
        interviewerName={feedbackInterviewer ?? ""}
        interviewTitle={interview.title}
        initialValue={
          feedbackInterviewer ? feedbacks?.[feedbackInterviewer] : undefined
        }
        onSave={(value) => {
          if (!feedbackInterviewer) return;
          onFeedbackChange?.(feedbackInterviewer, value);
        }}
      />
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
