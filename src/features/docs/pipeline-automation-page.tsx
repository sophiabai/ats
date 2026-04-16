import logoUrl from "@/assets/Logo.svg";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface MomentProps {
  number: number;
  title: string;
  segment: string;
  problem: {
    summary: string;
    detail: string;
    quote: string;
    source: string;
  };
  solution: {
    summary: string;
    detail: string;
    insight: string;
  };
}

const MOMENTS: MomentProps[] = [
  {
    number: 1,
    title: "Application screening",
    segment: "Large-volume, hourly, blue-collar workforce · Incoming applicants",
    problem: {
      summary: "Too many applicants, not enough recruiters to screen them.",
      detail:
        "Single HR operators manage full-cycle recruiting alongside payroll, benefits, and compliance — often for hundreds of hires a year. Manual screening can't keep up.",
      quote:
        "We were not budgeted to hire a recruiter, despite the fact that we have very consistent recruiting needs…we're recruiting hundreds of people.",
      source: "Mixlab, 200 EEs",
    },
    solution: {
      summary: "Auto-screen and advance qualified candidates.",
      detail:
        "If a candidate's screening score exceeds threshold (e.g. >80%), automatically move them to the next stage and notify the recruiter. No manual review required for clear-fit applicants.",
      insight:
        "ATS platforms assume specialists who dedicate focused time to recruiting. But when you're managing 30 reqs with an hour to spare, you need the system to move candidates forward on its own.",
    },
  },
  {
    number: 2,
    title: "Friction through the pipeline",
    segment: "Large-volume, hourly, blue-collar workforce · Qualified candidates",
    problem: {
      summary: "Candidates drop off because every step takes too long.",
      detail:
        "Hourly jobs are commoditized — Amazon vs. Lyft vs. cashier are interchangeable to candidates. They'll take whoever responds first. Admin work like scheduling requests and document collection creates delays that push candidates to competitors.",
      quote:
        "Probably in between when I call them, and when they actually schedule the interview is where we lose the most people.",
      source: "Swish Smiles, 220 EEs",
    },
    solution: {
      summary: "Automate the admin work between stages.",
      detail:
        "When a candidate advances, automatically trigger the next action — send scheduling requests, collect documents, fire reminders. Remove the recruiter as a bottleneck for routine handoffs.",
      insight:
        "Speed is everything. Waiting more than 24–48 hours means losing candidates to faster alternatives. The system needs automation that keeps things moving.",
    },
  },
  {
    number: 3,
    title: "Pre-onboarding",
    segment: "Large-volume, hourly, blue-collar workforce · Hired candidates",
    problem: {
      summary: "Manual handoff between ATS and HRIS loses candidates post-offer.",
      detail:
        "The gap between offer acceptance and Day 1 is a black hole. Admins manually transfer data, chase paperwork, and coordinate across disconnected systems. Candidates who accepted still ghost on their first day.",
      quote:
        "Drop-off continues even post-offer; many people accept and never show up for their first day.",
      source: "Hourly Recruiting Research",
    },
    solution: {
      summary: "Bring pre-onboarding into the ATS.",
      detail:
        "When a candidate is hired, automatically kick off document collection, background checks, and provisioning — no manual HRIS transfer. One continuous flow from offer to Day 1.",
      insight:
        "Recruiting conversation should hand off seamlessly to HR channels. Context gets lost and candidates have to re-explain their situation.",
    },
  },
];

function MomentCard({ moment }: { moment: MomentProps }) {
  return (
    <Card>
      <CardContent className="space-y-6 py-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="font-mono text-xs">
              {moment.number}
            </Badge>
            <h2 className="text-xl font-semibold tracking-tight">
              {moment.title}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">{moment.segment}</p>
        </div>

        <Separator />

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-destructive">
              Problem
            </h3>
            <p className="font-medium">{moment.problem.summary}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {moment.problem.detail}
            </p>
            <blockquote className="border-l-2 border-muted-foreground/20 pl-4 text-sm italic text-muted-foreground">
              "{moment.problem.quote}"
              <footer className="mt-1 text-xs not-italic">
                — {moment.problem.source}
              </footer>
            </blockquote>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
              Solution
            </h3>
            <p className="font-medium">{moment.solution.summary}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {moment.solution.detail}
            </p>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  Research insight:{" "}
                </span>
                {moment.solution.insight}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function Component() {
  return (
    <div className="min-h-svh bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-6 py-4">
          <img src={logoUrl} alt="Acme" className="size-8" />
          <span className="text-lg font-semibold">Acme ATS</span>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="mr-1.5 size-4" />
              Back to app
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">
            Why we need to automate pipeline management
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Three key moments where manual recruiting breaks down — and how
            automation can fix each one.
          </p>
        </div>

        <div className="mt-10 space-y-6">
          {MOMENTS.map((moment) => (
            <MomentCard key={moment.number} moment={moment} />
          ))}
        </div>
      </main>
    </div>
  );
}
