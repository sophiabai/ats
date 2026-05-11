import {
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  HelpCircle,
  Pencil,
  Sparkles,
  Video,
  X,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoPlayer } from "@/components/ui/video-player";
import {
  useCandidateDetail,
  type ApplicationDetail,
} from "@/features/candidates/api/use-candidate-detail";
import {
  EducationSection,
  ExperienceSection,
} from "@/features/candidates/components/candidate-sections";
import { useCriteriaEvaluations } from "@/features/requisitions/api/use-criteria-evaluations";
import { cn } from "@/lib/utils";

interface ApplicationOverviewProps {
  app: ApplicationDetail;
}

export function ApplicationOverview({ app }: ApplicationOverviewProps) {
  const { data: candidate } = useCandidateDetail(app.candidate_id);

  return (
    <div className="divide-y divide-border">
      <div className="pb-8">
        <AISummarySection app={app} />
      </div>
      {candidate && (
        <div className="space-y-8 py-8">
          <ExperienceSection candidate={candidate} />
          <EducationSection candidate={candidate} />
        </div>
      )}
      <div className="py-8">
        <QuestionnaireResponsesSection />
      </div>
      <div className="pt-8">
        <VideoQuestionnaireSection />
      </div>
      <p className="border-t pt-6 text-xs text-muted-foreground/80">
        Reminder: Documents attached to this application are provided by the
        candidate. Use caution when downloading or clicking links in resumes,
        cover letters, or uploaded documents.
      </p>
    </div>
  );
}

function AISummarySection({ app }: { app: ApplicationDetail }) {
  const { data: evaluationMap, isLoading } = useCriteriaEvaluations(app.req_id);
  const evaluations = evaluationMap?.get(app.candidate_id) ?? [];

  const total = evaluations.length;
  const metCount = evaluations.filter((e) => e.met).length;
  const matchPct = total > 0 ? Math.round((metCount / total) * 100) : null;

  return (
    <section>
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="flex items-center gap-1.5 font-semibold">
            <Sparkles className="size-4 text-berry-600" strokeWidth={1.5} />
            Summary
          </h3>
          {matchPct !== null && (
            <Badge
              variant="secondary"
              className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            >
              {matchPct}% match
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Edit criteria"
        >
          <Pencil className="size-3.5" />
        </Button>
      </header>

      <div className="mt-4 space-y-2">
        {isLoading ? (
          <>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-5 w-4/5" />
          </>
        ) : evaluations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No AI evaluation available for this application.
          </p>
        ) : (
          evaluations.map((e, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <CriterionIcon met={e.met} reasoning={e.reasoning} />
              <span className="flex-1">{e.criterion}</span>
            </div>
          ))
        )}
      </div>

      {evaluations.length > 0 && (
        <p className="mt-4 text-xs text-muted-foreground/80">
          AI can make mistakes. Double-check it or edit the criteria to improve
          AI assessments.
        </p>
      )}
    </section>
  );
}

function CriterionIcon({
  met,
  reasoning,
}: {
  met: boolean;
  reasoning: string | null;
}) {
  // Treat evaluations without reasoning as "unclear" — we don't have enough
  // signal to confidently say met or not met.
  if (!reasoning) {
    return (
      <HelpCircle
        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
        strokeWidth={2}
      />
    );
  }
  return met ? (
    <Check
      className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
      strokeWidth={2.5}
    />
  ) : (
    <X
      className="mt-0.5 size-4 shrink-0 text-red-500"
      strokeWidth={2.5}
    />
  );
}

interface QuestionnaireResponse {
  question: string;
  helper?: string;
  answer?: string;
  file?: string;
}

const QUESTIONNAIRE_RESPONSES: QuestionnaireResponse[] = [
  {
    question: "GitHub profile",
    helper:
      "Share your GitHub profile so we can get a sense of your public work, contributions, and coding style.",
    answer: "github.com/asmith",
  },
  {
    question:
      "What draws you to this senior backend engineer role, and why now?",
    answer:
      "I've spent the last four years at a mid-stage startup scaling our data pipeline from handling a few thousand requests per day to over 50 million. That journey taught me a lot — but I've hit a ceiling in terms of the problems I get to work on. What excites me about this role specifically is the distributed systems challenges at your scale. The engineering blog posts on your Kafka migration and the custom rate-limiting layer were honestly what pushed me to apply. I want to be in a room where those conversations are happening daily, and I think my background in reliability engineering is a direct fit for where your platform team is heading.",
  },
  {
    question: "Security certification",
    helper:
      "Upload a copy of any relevant security certification (e.g. CISSP, CEH, CompTIA Security+, AWS Security Specialty). PDF or image, max 5 MB.",
    file: "andy_smith_CISSP.pdf",
  },
];

function QuestionnaireResponsesSection() {
  return (
    <section>
      <h3 className="font-semibold">Questionnaire responses</h3>
      <div className="mt-4 space-y-5">
        {QUESTIONNAIRE_RESPONSES.map((r, i) => (
          <div key={i} className="flex gap-3">
            <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded bg-amber-500/10">
              <ClipboardList
                className="size-3.5 text-amber-600 dark:text-amber-400"
                strokeWidth={1.5}
              />
            </div>
            <div className="min-w-0 flex-1 text-sm">
              <div className="font-medium leading-snug">{r.question}</div>
              {r.helper && (
                <p className="mt-0.5 text-muted-foreground">{r.helper}</p>
              )}
              {r.answer && (
                <p className="mt-1 break-words whitespace-pre-wrap text-foreground">
                  {r.answer}
                </p>
              )}
              {r.file && (
                <div className="mt-2">
                  <Badge
                    variant="secondary"
                    className="rounded-md font-medium"
                  >
                    {r.file}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const VIDEO_QUESTIONS = [
  {
    prompt:
      "Tell us a little about yourself and why you're interested in working in customer support.",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  },
  {
    prompt: "Describe a time when you had to handle a difficult customer.",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  },
  {
    prompt: "What does great customer service mean to you?",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  },
  {
    prompt: "How do you stay organized when juggling multiple tickets?",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  },
  {
    prompt: "Why do you want to work at our company?",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  },
];

function VideoQuestionnaireSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const total = VIDEO_QUESTIONS.length;
  const current = VIDEO_QUESTIONS[activeIdx];

  return (
    <section>
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold">Video questionnaire</h3>
          <p className="mt-2 text-xs text-muted-foreground">
            Question {activeIdx + 1} of {total}
          </p>
          <p className="text-sm font-medium leading-snug">{current.prompt}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="xs">
            View transcript
          </Button>
          <Button
            variant="outline"
            size="icon-xs"
            aria-label="Previous question"
            disabled={activeIdx === 0}
            onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
          >
            <ChevronLeft />
          </Button>
          <Button
            size="xs"
            disabled={activeIdx === total - 1}
            onClick={() => setActiveIdx((i) => Math.min(total - 1, i + 1))}
          >
            Next question
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <VideoPlayer
          key={current.src}
          src={current.src}
          className="w-full"
        />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {VIDEO_QUESTIONS.map((q, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIdx(i)}
              aria-label={`Question ${i + 1}`}
              className={cn(
                "group/thumb relative h-20 w-32 shrink-0 overflow-hidden rounded-lg border bg-muted transition-opacity",
                i === activeIdx
                  ? "border-berry-600 opacity-100"
                  : "border-transparent opacity-80 hover:opacity-100",
              )}
            >
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-stone-700 to-stone-900 text-xs font-medium text-white">
                <Video
                  className="size-5 opacity-70 transition-opacity group-hover/thumb:opacity-100"
                  strokeWidth={1.5}
                />
                <span className="ml-1.5">Question {i + 1}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
