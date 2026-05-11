import { Briefcase, GraduationCap } from "lucide-react";
import type { CandidateDetail } from "@/features/candidates/api/use-candidate-detail";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatMonth(dateStr: string): string {
  const [year, month] = dateStr.split("-");
  return `${MONTH_NAMES[parseInt(month, 10) - 1]} ${year}`;
}

export function durationLabel(start: string, end: string | null): string {
  const s = new Date(start + "-01");
  const e = end ? new Date(end + "-01") : new Date();
  let months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  if (months < 1) months = 1;
  const yrs = Math.floor(months / 12);
  const mos = months % 12;
  if (yrs > 0 && mos > 0)
    return `${yrs} yr${yrs > 1 ? "s" : ""} ${mos} mo${mos > 1 ? "s" : ""}`;
  if (yrs > 0) return `${yrs} yr${yrs > 1 ? "s" : ""}`;
  return `${mos} mo${mos > 1 ? "s" : ""}`;
}

export function ExperienceSection({
  candidate,
}: {
  candidate: CandidateDetail;
}) {
  const workHistory = candidate.work_history ?? [];
  if (workHistory.length === 0) return null;

  return (
    <section>
      <h3 className="font-semibold">Experience</h3>
      <p className="mt-1 mb-4 text-sm text-muted-foreground">
        Total years of experience:{" "}
        <span className="font-semibold text-foreground">10.5 years</span>
      </p>
      <div className="space-y-7">
        {workHistory.map((w, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
              <Briefcase
                className="size-5 text-blue-600 dark:text-blue-400"
                strokeWidth={1.2}
              />
            </div>
            <div className="min-w-0 flex-1">
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
              <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-sm text-muted-foreground">
                <span>
                  {formatMonth(w.start_date)} –{" "}
                  {w.end_date ? formatMonth(w.end_date) : "Present"}
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
          </div>
        ))}
      </div>
    </section>
  );
}

export function EducationSection({
  candidate,
}: {
  candidate: CandidateDetail;
}) {
  const education = candidate.education ?? [];
  if (education.length === 0) return null;

  return (
    <section>
      <h3 className="mb-4 font-semibold">Education</h3>
      <div className="space-y-4">
        {education.map((ed, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
              <GraduationCap
                className="size-5 text-emerald-600 dark:text-emerald-400"
                strokeWidth={1.2}
              />
            </div>
            <div>
              <div className="font-medium leading-snug">
                {ed.degree}
                {ed.field ? ` in ${ed.field}` : ""}
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
  );
}
