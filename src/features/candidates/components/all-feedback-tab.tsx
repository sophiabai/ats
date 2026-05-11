import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bold,
  Check,
  ChevronRight,
  Clock,
  Italic,
  Link2,
  Pencil,
  Trash2,
  Underline,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { VideoPlayer } from "@/components/ui/video-player";
import { cn } from "@/lib/utils";
import {
  RATING_LABELS,
  type Rating,
} from "@/features/candidates/components/interview-feedback-dialog";

type FeedbackRating = Rating | "not_providing" | "pending";

type FeedbackSubsection = {
  title: string;
  text?: string;
  rating?: Rating;
};

type FeedbackSection = {
  title: string;
  rating?: Rating;
  text?: string;
  subsections?: FeedbackSubsection[];
};

type FeedbackEntry = {
  id: string;
  interviewer: string;
  stage: string;
  interview: string;
  rating: FeedbackRating;
  videoSrc?: string;
  sections: FeedbackSection[];
};

type Comment = {
  id: string;
  author: string;
  age: string;
  text: React.ReactNode;
  editable?: boolean;
};

const SAMPLE_VIDEO =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

const PROS_CONS_TEXT = (
  <div className="space-y-4 text-sm leading-6 text-foreground">
    <p>
      Good potential, might not enough experience working on large scale product
      suite. Has experience build something 0-1 (ish) in her part time job.
    </p>
    <div>
      <p className="font-semibold">Pros:</p>
      <ol className="ml-6 list-decimal space-y-0.5">
        <li>
          Good skillset in general. Has done user testings, prototyping, good
          visual skills.
        </li>
        <li>Has experience working on complex tooling before.</li>
      </ol>
    </div>
    <div>
      <p className="font-semibold">Cons:</p>
      <ol className="ml-6 list-decimal space-y-0.5">
        <li>
          Communication: when asked if her team is using "call time" to tracking
          success metrics she said no but didn't say why. But she handled other
          questions well.
        </li>
        <li>
          Not sure if she has enough experience articulate design decisions to
          stakeholders especially the leadership. (She gave some insights on how
          she handle leadership pushback but sounds like her team is quite
          small.)
        </li>
      </ol>
    </div>
  </div>
);

const FEEDBACK_ENTRIES: FeedbackEntry[] = [
  {
    id: "savannah",
    interviewer: "Savannah Nguyen",
    stage: "Recruiter phone screen",
    interview: "Interview",
    rating: "strong_yes",
    videoSrc: SAMPLE_VIDEO,
    sections: [
      {
        title: "Overall impression",
        rating: "strong_yes",
        text: "_PROS_CONS_",
      },
      {
        title: "Coding Exercise",
        subsections: [
          { title: "Design skills", text: "4" },
          { title: "Java skills", text: "3" },
          { title: "C++", text: "2" },
        ],
      },
      {
        title: "Communication",
        subsections: [
          {
            title: "Candidate has good communication skills",
            rating: "strong_no",
          },
          {
            title: "Other",
            text: "Good potential, might not enough experience working on large scale product suite. Has experience build something 0-1 (ish) in her part time job.",
          },
        ],
      },
    ],
  },
  {
    id: "anne-screen",
    interviewer: "Anne Montgomery",
    stage: "Hiring manager screen",
    interview: "Interview",
    rating: "strong_yes",
    videoSrc: SAMPLE_VIDEO,
    sections: [
      {
        title: "Overall impression",
        rating: "strong_yes",
        text: "Solid hiring manager screen. She had thoughtful questions about scope and team dynamics, and her experience aligns well with what we need.",
      },
      {
        title: "Leadership & ownership",
        text: "Demonstrated clear ownership over the migration project at her previous company. Walked through trade-offs and stakeholder management confidently.",
      },
    ],
  },
  {
    id: "anne-onsite",
    interviewer: "Anne Montgomery",
    stage: "Onsite",
    interview: "Presentation",
    rating: "yes",
    videoSrc: SAMPLE_VIDEO,
    sections: [
      {
        title: "Overall impression",
        rating: "yes",
        text: "Presentation was well-structured. She covered context, motivation, and impact. A few small gaps in the technical deep-dive but overall lean yes.",
      },
      {
        title: "Communication",
        subsections: [
          { title: "Clarity", text: "4" },
          { title: "Storytelling", text: "4" },
          { title: "Q&A handling", text: "3" },
        ],
      },
    ],
  },
  {
    id: "esther",
    interviewer: "Esther Howard",
    stage: "Onsite",
    interview: "Presentation",
    rating: "yes",
    videoSrc: SAMPLE_VIDEO,
    sections: [
      {
        title: "Overall impression",
        rating: "yes",
        text: "Strong presentation skills. Visuals were clear and she landed the key takeaways. I'd lean yes — would want to see one more signal on technical depth.",
      },
    ],
  },
  {
    id: "bessie",
    interviewer: "Bessie Cooper",
    stage: "Onsite",
    interview: "Presentation",
    rating: "no",
    videoSrc: SAMPLE_VIDEO,
    sections: [
      {
        title: "Overall impression",
        rating: "no",
        text: "I had a hard time understanding the impact of the work she described. When pressed on metrics, the answers got vague.",
      },
    ],
  },
  {
    id: "eleanor",
    interviewer: "Eleanor Pena",
    stage: "Onsite",
    interview: "System Design",
    rating: "strong_no",
    videoSrc: SAMPLE_VIDEO,
    sections: [
      {
        title: "Overall impression",
        rating: "strong_no",
        text: "Did not meet the bar for a senior system design interview. Struggled to decompose the problem and missed several scalability considerations.",
      },
    ],
  },
  {
    id: "ronald",
    interviewer: "Ronald Richards",
    stage: "Onsite",
    interview: "Core Value",
    rating: "not_providing",
    sections: [],
  },
  {
    id: "albert",
    interviewer: "Albert Flores",
    stage: "Onsite",
    interview: "Hiring Manager Close",
    rating: "pending",
    sections: [],
  },
];

const SAMPLE_COMMENT_TEXT = (
  <>
    Hi <span className="font-medium text-primary">@Savannah</span>, can you
    schedule a interview for this candidate? Please also CC{" "}
    <span className="font-medium text-primary">@Yvonne</span> so she can add a
    training interviewer to shadow the interview? Thanks!
  </>
);

const COMMENTS: Comment[] = [
  {
    id: "c1",
    author: "Albert Flores",
    age: "2 days ago",
    text: SAMPLE_COMMENT_TEXT,
  },
  {
    id: "c2",
    author: "Albert Flores",
    age: "3 minutes ago",
    text: SAMPLE_COMMENT_TEXT,
    editable: true,
  },
];

export function AllFeedbackTab() {
  const [selectedId, setSelectedId] = useState(FEEDBACK_ENTRIES[0]?.id ?? "");
  const selectedIdx = FEEDBACK_ENTRIES.findIndex((e) => e.id === selectedId);
  const selected = FEEDBACK_ENTRIES[selectedIdx] ?? FEEDBACK_ENTRIES[0];

  const goPrev = () => {
    if (selectedIdx > 0) setSelectedId(FEEDBACK_ENTRIES[selectedIdx - 1].id);
  };
  const goNext = () => {
    if (selectedIdx < FEEDBACK_ENTRIES.length - 1)
      setSelectedId(FEEDBACK_ENTRIES[selectedIdx + 1].id);
  };

  return (
    <div className="flex min-h-0 flex-1 gap-6 overflow-hidden">
      <div className="flex min-w-0 flex-1 overflow-hidden rounded-2xl border bg-card">
        <FeedbackList
          selectedId={selected.id}
          onSelect={setSelectedId}
        />
        <FeedbackDetail
          entry={selected}
          isFirst={selectedIdx === 0}
          isLast={selectedIdx === FEEDBACK_ENTRIES.length - 1}
          onPrev={goPrev}
          onNext={goNext}
        />
      </div>

      <div className="hidden w-80 shrink-0 flex-col gap-4 overflow-y-auto py-2 lg:flex">
        <CommentsPanel />
        <NotesToMyselfCard />
      </div>
    </div>
  );
}

function FeedbackList({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex w-64 shrink-0 flex-col overflow-y-auto border-r bg-card">
      {FEEDBACK_ENTRIES.map((entry) => {
        const isSelected = entry.id === selectedId;
        return (
          <button
            key={entry.id}
            type="button"
            onClick={() => onSelect(entry.id)}
            className={cn(
              "flex flex-col gap-2 border-b px-4 py-3 text-left transition-colors hover:bg-muted/60",
              isSelected && "bg-muted",
            )}
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{entry.interviewer}</p>
              <p className="truncate text-xs text-muted-foreground">
                {entry.stage}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {entry.interview}
              </p>
            </div>
            <RatingBadge rating={entry.rating} />
          </button>
        );
      })}
    </div>
  );
}

function FeedbackDetail({
  entry,
  isFirst,
  isLast,
  onPrev,
  onNext,
}: {
  entry: FeedbackEntry;
  isFirst: boolean;
  isLast: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  const hasContent = entry.sections.length > 0;

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-card">
      <div className="flex flex-col gap-8 px-6 py-6">
        {entry.videoSrc && (
          <VideoPlayer src={entry.videoSrc} className="w-full rounded-lg" />
        )}

        {hasContent ? (
          <div className="flex flex-col gap-8">
            {entry.sections.map((section, i) => (
              <div key={i} className="flex flex-col gap-8">
                {i > 0 && <Separator />}
                <Section section={section} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyFeedback entry={entry} />
        )}
      </div>

      <div className="mt-auto flex items-center justify-between border-t bg-card px-6 py-4">
        <Button variant="outline" onClick={onPrev} disabled={isFirst}>
          <ArrowLeft />
          Previous feedback
        </Button>
        <Button onClick={onNext} disabled={isLast}>
          Next feedback
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}

function Section({ section }: { section: FeedbackSection }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">{section.title}</h2>
      {section.rating && (
        <div>
          <RatingBadge rating={section.rating} />
        </div>
      )}
      {section.text === "_PROS_CONS_" ? (
        PROS_CONS_TEXT
      ) : section.text ? (
        <p className="text-sm leading-6 whitespace-pre-line text-foreground">
          {section.text}
        </p>
      ) : null}
      {section.subsections && (
        <div className="space-y-5">
          {section.subsections.map((sub, i) => (
            <div key={i} className="space-y-2">
              <h3 className="text-base font-medium">{sub.title}</h3>
              {sub.rating ? (
                <div>
                  <RatingBadge rating={sub.rating} />
                </div>
              ) : sub.text ? (
                <p className="text-sm leading-6 whitespace-pre-line text-foreground">
                  {sub.text}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyFeedback({ entry }: { entry: FeedbackEntry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
      <p className="text-sm">
        {entry.rating === "pending"
          ? `${entry.interviewer} hasn't submitted feedback yet.`
          : `${entry.interviewer} chose not to provide a rating.`}
      </p>
    </div>
  );
}

function RatingBadge({ rating }: { rating: FeedbackRating }) {
  if (rating === "not_providing") {
    return (
      <Badge
        variant="secondary"
        className="rounded-full px-2 py-0.5 text-xs font-medium"
      >
        Not providing
      </Badge>
    );
  }
  if (rating === "pending") {
    return (
      <Badge className="gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-900 hover:bg-indigo-100 dark:bg-indigo-500/20 dark:text-indigo-300">
        <Clock className="size-3" />
        Pending
      </Badge>
    );
  }

  const isPositive = rating === "yes" || rating === "strong_yes";

  return (
    <Badge
      className={cn(
        "gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        isPositive
          ? "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-300"
          : "bg-red-500/15 text-red-700 hover:bg-red-500/15 dark:text-red-300",
      )}
    >
      {isPositive ? (
        <Check className="size-3" strokeWidth={3} />
      ) : (
        <X className="size-3" strokeWidth={3} />
      )}
      {RATING_LABELS[rating]}
    </Badge>
  );
}

function CommentsPanel() {
  return (
    <Card className="gap-4 py-5">
      <CardHeader className="px-5 pb-0">
        <CardTitle className="text-lg">Comments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 px-5">
        <CommentEditor />
        {COMMENTS.map((c) => (
          <CommentRow key={c.id} comment={c} />
        ))}
      </CardContent>
    </Card>
  );
}

function CommentEditor() {
  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <div className="flex items-center gap-0.5 border-b px-2 py-1">
        <Button variant="ghost" size="icon" className="size-7">
          <Bold className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" className="size-7">
          <Italic className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" className="size-7">
          <Underline className="size-4" />
        </Button>
        <span className="mx-1 h-5 w-px bg-border" />
        <Button variant="ghost" size="icon" className="size-7">
          <Link2 className="size-4" />
        </Button>
      </div>
      <Textarea
        placeholder="Add a comment. Use @ to mention someone"
        className="min-h-[64px] resize-none rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  );
}

function CommentRow({ comment }: { comment: Comment }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Avatar size="sm">
          <AvatarFallback>
            {comment.author
              .split(" ")
              .map((p) => p[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-primary">{comment.author}</p>
          <p className="text-xs text-muted-foreground">{comment.age}</p>
        </div>
        {comment.editable && (
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="size-7">
              <Pencil className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-destructive hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        )}
      </div>
      <p className="text-sm leading-5 text-foreground">{comment.text}</p>
    </div>
  );
}

function NotesToMyselfCard() {
  return (
    <Card className="py-0">
      <button
        type="button"
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="text-base font-semibold">Notes to myself</span>
        <ChevronRight className="size-4 text-muted-foreground" />
      </button>
    </Card>
  );
}
