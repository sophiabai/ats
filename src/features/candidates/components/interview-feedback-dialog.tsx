import { useEffect, useState } from "react";
import {
  Captions,
  Check,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Search,
  Sparkles,
  Volume2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

export type Rating = "strong_no" | "no" | "yes" | "strong_yes";

export const RATING_LABELS: Record<Rating, string> = {
  strong_no: "Strong no",
  no: "No",
  yes: "Yes",
  strong_yes: "Strong yes",
};

const RATING_OPTIONS: { value: Rating; label: string }[] = (
  Object.keys(RATING_LABELS) as Rating[]
).map((value) => ({ value, label: RATING_LABELS[value] }));

export type SectionKey =
  | "coding"
  | "technical_depth"
  | "system_design"
  | "communication";

const SECTIONS: {
  key: SectionKey;
  title: string;
  description: string;
  commentsPlaceholder: string;
}[] = [
  {
    key: "coding",
    title: "Coding exercise",
    description:
      "Code quality, correctness, problem decomposition, and handling of edge cases.",
    commentsPlaceholder:
      "How was the candidate's approach? What did they do well? Where did they struggle?",
  },
  {
    key: "technical_depth",
    title: "Technical depth",
    description:
      "Depth of understanding of the language, frameworks, and engineering fundamentals.",
    commentsPlaceholder:
      "Did the candidate demonstrate senior-level fluency with the tools and concepts they used?",
  },
  {
    key: "system_design",
    title: "System design",
    description:
      "Architectural thinking, scalability awareness, and trade-off reasoning.",
    commentsPlaceholder:
      "How did they decompose the problem? Did they consider trade-offs, scale, and failure modes?",
  },
  {
    key: "communication",
    title: "Communication & collaboration",
    description:
      "Clarity of thought, ability to ask clarifying questions, and how they responded to feedback.",
    commentsPlaceholder:
      "How clearly did they explain their thinking? Were they receptive to nudges and pushback?",
  },
];

export type SectionState = {
  score: number | null;
  comments: string;
};

const EMPTY_SECTION: SectionState = { score: null, comments: "" };

const SCORE_OPTIONS = Array.from({ length: 10 }, (_, i) => i + 1);

export type InterviewFeedback = {
  overallRating: Rating | "";
  overallFeedback: string;
  sections: Record<SectionKey, SectionState>;
};

function emptyFeedback(): InterviewFeedback {
  return {
    overallRating: "",
    overallFeedback: "",
    sections: SECTIONS.reduce(
      (acc, s) => {
        acc[s.key] = { ...EMPTY_SECTION };
        return acc;
      },
      {} as Record<SectionKey, SectionState>,
    ),
  };
}

export function InterviewFeedbackDialog({
  open,
  onOpenChange,
  candidateName,
  interviewerName,
  interviewTitle,
  initialValue,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateName: string;
  interviewerName: string;
  interviewTitle: string;
  initialValue?: InterviewFeedback;
  onSave?: (feedback: InterviewFeedback) => void;
}) {
  const [overallRating, setOverallRating] = useState<Rating | "">(
    initialValue?.overallRating ?? "",
  );
  const [overallFeedback, setOverallFeedback] = useState(
    initialValue?.overallFeedback ?? "",
  );
  const [sections, setSections] = useState<Record<SectionKey, SectionState>>(
    () => initialValue?.sections ?? emptyFeedback().sections,
  );

  // Reset form whenever the dialog opens or the initial value changes.
  useEffect(() => {
    if (!open) return;
    const seed = initialValue ?? emptyFeedback();
    setOverallRating(seed.overallRating);
    setOverallFeedback(seed.overallFeedback);
    setSections(seed.sections);
  }, [open, initialValue]);

  const updateSection = (key: SectionKey, patch: Partial<SectionState>) => {
    setSections((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  };

  const handleSave = () => {
    onSave?.({ overallRating, overallFeedback, sections });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[calc(100vh-40px)] w-[calc(100vw-40px)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none"
      >
        <DialogTitle className="sr-only">
          {interviewerName}'s feedback for {candidateName}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Submit interview feedback for {candidateName}'s {interviewTitle}.
        </DialogDescription>

        <div className="flex shrink-0 items-center justify-between border-b px-6 py-4">
          <h2 className="text-base font-semibold">
            {candidateName} ({interviewerName}'s feedback)
          </h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-sm opacity-70 transition-opacity hover:opacity-100"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 gap-4 bg-muted p-4">
          <Card className="flex w-[520px] shrink-0 flex-col gap-0 overflow-hidden p-0">
            <RecordingPanel candidateName={candidateName} />
          </Card>

          <div className="min-w-0 flex-1 overflow-y-auto">
            <div className="space-y-10 px-6 py-6">
              <FeedbackSection
                title="Overall impressions"
                description={`Your overall recommendation for ${candidateName} for ${interviewTitle}.`}
              >
                <div className="space-y-2">
                  <Label>Overall rating</Label>
                  <RatingToggle
                    value={overallRating}
                    onChange={setOverallRating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overall-feedback">Overall feedback</Label>
                  <Textarea
                    id="overall-feedback"
                    placeholder="Summarize your impression of the candidate."
                    value={overallFeedback}
                    onChange={(e) => setOverallFeedback(e.target.value)}
                    className="min-h-[96px]"
                  />
                </div>
              </FeedbackSection>

              {SECTIONS.map((section) => (
                <FeedbackSection
                  key={section.key}
                  title={section.title}
                  description={section.description}
                >
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <Label>Score</Label>
                      <span className="text-xs text-muted-foreground">
                        1 = far below bar &nbsp;·&nbsp; 10 = exceptional
                      </span>
                    </div>
                    <ScoreToggle
                      value={sections[section.key].score}
                      onChange={(v) =>
                        updateSection(section.key, { score: v })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${section.key}-comments`}>Comments</Label>
                    <Textarea
                      id={`${section.key}-comments`}
                      placeholder={section.commentsPlaceholder}
                      value={sections[section.key].comments}
                      onChange={(e) =>
                        updateSection(section.key, {
                          comments: e.target.value,
                        })
                      }
                      className="min-h-[96px]"
                    />
                  </div>
                </FeedbackSection>
              ))}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t px-6 py-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save feedback</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FeedbackSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function RatingToggle({
  value,
  onChange,
}: {
  value: Rating | "";
  onChange: (value: Rating | "") => void;
}) {
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      value={value}
      onValueChange={(v) => onChange((v || "") as Rating | "")}
      className="grid w-full grid-cols-4"
    >
      {RATING_OPTIONS.map((opt) => {
        const isPositive = opt.value === "yes" || opt.value === "strong_yes";
        const isSelected = value === opt.value;
        return (
          <ToggleGroupItem
            key={opt.value}
            value={opt.value}
            className={cn(
              "gap-1.5",
              isSelected &&
                isPositive &&
                "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 hover:text-emerald-700 data-[state=on]:bg-emerald-500/10 data-[state=on]:text-emerald-700 dark:text-emerald-400 dark:data-[state=on]:text-emerald-400",
              isSelected &&
                !isPositive &&
                "bg-red-500/10 text-red-700 hover:bg-red-500/15 hover:text-red-700 data-[state=on]:bg-red-500/10 data-[state=on]:text-red-700 dark:text-red-400 dark:data-[state=on]:text-red-400",
            )}
          >
            {isPositive ? (
              <Check className="size-3.5" />
            ) : (
              <X className="size-3.5" />
            )}
            {opt.label}
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}

function ScoreToggle({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      value={value === null ? "" : String(value)}
      onValueChange={(v) => onChange(v === "" ? null : Number(v))}
      className="grid w-full grid-cols-10"
    >
      {SCORE_OPTIONS.map((n) => (
        <ToggleGroupItem
          key={n}
          value={String(n)}
          className="px-0 text-sm font-medium"
        >
          {n}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

// ---------------------------------------------------------------------------
// Recording panel (left column)
// ---------------------------------------------------------------------------

const CHAPTERS = [
  { label: "Intro", progress: 1 },
  { label: "Question 1", progress: 0.4 },
  { label: "Question 2", progress: 0 },
  { label: "Question 3", progress: 0 },
  { label: "Q&A", progress: 0 },
  { label: "Close up", progress: 0 },
];

function RecordingPanel({ candidateName }: { candidateName: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="flex h-full flex-col">
      <VideoFrame
        playing={playing}
        onTogglePlay={() => setPlaying((p) => !p)}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4">
        <Tabs defaultValue="summary" className="flex h-full min-h-0 flex-col">
          <TabsList className="self-start">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
            <TabsTrigger value="speakers">Speakers</TabsTrigger>
          </TabsList>

          <TabsContent
            value="summary"
            className="mt-3 min-h-0 flex-1 overflow-y-auto"
          >
            <SummaryTab candidateName={candidateName} />
          </TabsContent>
          <TabsContent
            value="transcript"
            className="mt-3 min-h-0 flex-1 overflow-y-auto"
          >
            <TranscriptTab candidateName={candidateName} />
          </TabsContent>
          <TabsContent
            value="speakers"
            className="mt-3 min-h-0 flex-1 overflow-y-auto"
          >
            <SpeakersTab candidateName={candidateName} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function VideoFrame({
  playing,
  onTogglePlay,
}: {
  playing: boolean;
  onTogglePlay: () => void;
}) {
  return (
    <div className="shrink-0 px-4 pt-4">
      <div className="overflow-hidden rounded-md bg-stone-900">
        <div className="group/video relative aspect-video w-full">
          <button
            type="button"
            onClick={onTogglePlay}
            className="absolute inset-0 flex items-center justify-center text-white/90"
            aria-label={playing ? "Pause" : "Play"}
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
              {playing ? (
                <Pause className="size-5 fill-white" />
              ) : (
                <Play className="size-5 fill-white" />
              )}
            </span>
          </button>

          <div className="absolute inset-x-3 bottom-12 opacity-0 transition-opacity group-hover/video:opacity-100">
            <ChapterProgress />
          </div>

          <div className="absolute inset-x-3 bottom-2 flex items-center justify-between text-white opacity-0 transition-opacity group-hover/video:opacity-100">
            <div className="flex items-center gap-1">
              <PlayerIconButton
                onClick={onTogglePlay}
                label={playing ? "Pause" : "Play"}
              >
                {playing ? (
                  <Pause className="size-4 fill-white" />
                ) : (
                  <Play className="size-4 fill-white" />
                )}
              </PlayerIconButton>
              <PlayerIconButton label="Skip back 10s">
                <RotateCcw className="size-4" />
              </PlayerIconButton>
              <PlayerIconButton label="Skip forward 10s">
                <RotateCw className="size-4" />
              </PlayerIconButton>
              <button
                type="button"
                className="rounded px-2 py-1 text-xs font-medium text-white/90 hover:bg-white/10"
              >
                1.5x
              </button>
              <PlayerIconButton label="Volume">
                <Volume2 className="size-4" />
              </PlayerIconButton>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-white/90 hover:bg-white/10"
              >
                <MessageSquare className="size-4" />
                Comment
              </button>
              <PlayerIconButton label="Captions">
                <Captions className="size-4" />
              </PlayerIconButton>
              <PlayerIconButton label="Fullscreen">
                <Maximize2 className="size-4" />
              </PlayerIconButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayerIconButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-8 items-center justify-center rounded text-white/90 hover:bg-white/10"
    >
      {children}
    </button>
  );
}

function ChapterProgress() {
  return (
    <div className="grid grid-cols-6 gap-1">
      {CHAPTERS.map((chapter) => (
        <div key={chapter.label} className="space-y-1">
          <p className="truncate text-[11px] font-medium text-white/90">
            {chapter.label}
          </p>
          <div className="relative h-1 overflow-hidden rounded-full bg-white/30">
            <div
              className="h-full bg-amber-400"
              style={{ width: `${chapter.progress * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function SummaryTab({ candidateName }: { candidateName: string }) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Sparkles className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary" />
        <Input
          placeholder="Ask anything about this call"
          className="pl-9"
        />
      </div>
      <p className="text-right text-[11px] text-muted-foreground">
        Generated by AI
      </p>

      <SummarySection title="Introduction and warm-up">
        <li>The interviewer welcomed {candidateName} and explained the format of the session.</li>
        <li>{candidateName} shared a brief background on their recent role and tech stack.</li>
        <li>The pair aligned on time spent on coding versus discussion.</li>
      </SummarySection>

      <SummarySection title="Coding exercise">
        <li>The interviewer presented a string-manipulation problem with growing complexity.</li>
        <li>{candidateName} asked clarifying questions about input constraints and edge cases.</li>
        <li>They walked through the brute-force approach before proposing an O(n) solution.</li>
        <li>Implementation was clean, with named helpers and meaningful variable names.</li>
        <li>They proactively reasoned about Unicode and whitespace handling.</li>
      </SummarySection>

      <SummarySection title="Design discussion">
        <li>The conversation moved to scaling the solution to streaming inputs.</li>
        <li>{candidateName} discussed trade-offs between batching and incremental processing.</li>
        <li>They referenced past experience with backpressure and queue-based architectures.</li>
      </SummarySection>
    </div>
  );
}

function SummarySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold">{title}</h4>
      <ul className="ml-4 list-disc space-y-1 text-sm text-muted-foreground">
        {children}
      </ul>
    </div>
  );
}

const TRANSCRIPT_LINES: {
  speaker: string;
  initials: string;
  time: string;
  text: string;
  highlight?: string;
}[] = [
  {
    speaker: "Mandy",
    initials: "MA",
    time: "0:01",
    text: "Good afternoon. Are you ready to start the coding exercise?",
  },
  { speaker: "Andy", initials: "AS", time: "1:02", text: "Yes, I'm ready." },
  {
    speaker: "Mandy",
    initials: "MA",
    time: "4:10",
    text: "Today, we'd like you to implement a function that checks if a string is a palindrome. A palindrome is a word that reads the same backward as forward.",
    highlight: "implement a function that checks if a string is a palindrome",
  },
  {
    speaker: "Andy",
    initials: "AS",
    time: "6:12",
    text: "Alright, I understand. Do you want me to consider spaces or punctuation in the check?",
  },
  {
    speaker: "Mandy",
    initials: "MA",
    time: "8:14",
    text: "Good question — let's strip non-alphanumeric characters and compare case-insensitively.",
  },
];

function TranscriptTab({ candidateName: _candidateName }: { candidateName: string }) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search transcript" className="pl-9" />
      </div>
      <div className="flex items-center justify-end gap-2">
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-900">
          1 of 4 instances
        </span>
        <button
          type="button"
          aria-label="Previous match"
          className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-muted"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Next match"
          className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-muted"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="space-y-3">
        {TRANSCRIPT_LINES.map((line, idx) => (
          <TranscriptLine key={idx} line={line} />
        ))}
      </div>
    </div>
  );
}

function TranscriptLine({
  line,
}: {
  line: (typeof TRANSCRIPT_LINES)[number];
}) {
  const before = line.highlight
    ? line.text.split(line.highlight)
    : [line.text];
  return (
    <div className="rounded-r-md border-l-2 border-fuchsia-500/40 bg-muted/40 px-3 py-2">
      <div className="flex items-center gap-2">
        <div className="flex size-6 items-center justify-center rounded-full bg-stone-200 text-[11px] font-medium text-stone-700">
          {line.initials}
        </div>
        <span className="text-sm font-medium">{line.speaker}</span>
        <span className="text-xs text-muted-foreground">{line.time}</span>
      </div>
      <p className="mt-1 text-sm text-foreground">
        {before.length === 2 ? (
          <>
            {before[0]}
            <mark className="rounded bg-amber-200/70 px-0.5">
              {line.highlight}
            </mark>
            {before[1]}
          </>
        ) : (
          line.text
        )}
      </p>
    </div>
  );
}

const SPEAKERS = [
  {
    name: "Andy Smith",
    color: "bg-rose-300",
    bars: [60, 12, 30, 8, 40, 14, 28, 6, 50, 10],
  },
  {
    name: "Marvin McKinney",
    color: "bg-emerald-300",
    bars: [40, 10, 22, 8, 18, 30, 8, 40, 14, 32],
  },
  {
    name: "Jacob Jones",
    color: "bg-sky-300",
    bars: [30, 8, 28, 36, 12, 24, 8, 18, 30, 14],
  },
];

function SpeakersTab({ candidateName: _candidateName }: { candidateName: string }) {
  return (
    <div className="space-y-5">
      {SPEAKERS.map((s) => (
        <div key={s.name} className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
              {s.name}
            </span>
            <span className="text-xs text-muted-foreground">0:01</span>
          </div>
          <div className="flex items-center gap-1">
            {s.bars.map((width, idx) => (
              <div
                key={idx}
                className={cn("h-1.5 rounded-full", s.color)}
                style={{ width: `${width}px` }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
