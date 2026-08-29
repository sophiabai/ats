import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  blend,
  contrastRatio,
  gradeContrast,
  resolveColor,
  toRgb,
  type ContrastGrade,
  type Rgb,
} from "@/features/component-gallery/lib/contrast";

// ---------------------------------------------------------------------------
// Layout primitives for the gallery itself.
// ---------------------------------------------------------------------------

export function Section({
  id,
  title,
  caption,
  children,
}: {
  id: string;
  title: string;
  caption?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-6 rounded-xl border border-border bg-card px-6 py-5"
    >
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {caption && (
        <p className="mt-0.5 font-mono text-xs text-muted-foreground">{caption}</p>
      )}
      <div className="mt-5 flex flex-col gap-5">{children}</div>
    </section>
  );
}

/** A labelled row — the label sits in a fixed gutter, like the reference gallery. */
export function Row({
  label,
  children,
  align = "center",
}: {
  label?: string;
  children: React.ReactNode;
  align?: "center" | "start";
}) {
  return (
    <div className="flex gap-6">
      <div className="w-28 shrink-0 pt-1.5 font-mono text-xs text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-wrap gap-3",
          align === "center" ? "items-center" : "items-start",
        )}
      >
        {children}
      </div>
    </div>
  );
}

/** Wraps one specimen with its variant name underneath. */
export function Specimen({
  name,
  children,
  className,
}: {
  name?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-start gap-1.5", className)}>
      {children}
      {name && (
        <span className="font-mono text-[10px] text-muted-foreground">{name}</span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Typography — sizes measured live from the DOM
// ---------------------------------------------------------------------------

type TypeStep = {
  token: string;
  cls: string;
  /**
   * `override` — leading set by --text-*--line-height in index.css
   * `unpaired` — arbitrary size with no paired leading; inherits `normal`
   */
  note?: "override" | "unpaired";
};

const TYPE_STEPS: TypeStep[] = [
  { token: "text-[10px]", cls: "text-[10px]", note: "unpaired" },
  { token: "text-[11px]", cls: "text-[11px]", note: "unpaired" },
  { token: "text-xs", cls: "text-xs" },
  { token: "text-sm", cls: "text-sm" },
  { token: "text-base", cls: "text-base", note: "override" },
  { token: "text-lg", cls: "text-lg", note: "override" },
  { token: "text-xl", cls: "text-xl", note: "override" },
  { token: "text-2xl", cls: "text-2xl" },
  { token: "text-3xl", cls: "text-3xl" },
  { token: "text-4xl", cls: "text-4xl" },
];

const SPECIMEN = "The quick brown fox";

export function TypeScale() {
  const refs = useRef<(HTMLSpanElement | null)[]>([]);
  const [metrics, setMetrics] = useState<{ size: string; leading: string }[]>([]);

  useEffect(() => {
    setMetrics(
      TYPE_STEPS.map((_, i) => {
        const el = refs.current[i];
        if (!el) return { size: "—", leading: "—" };
        const cs = getComputedStyle(el);
        const round = (v: string) => `${Math.round(parseFloat(v))}px`;
        return { size: round(cs.fontSize), leading: round(cs.lineHeight) };
      }),
    );
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline gap-6 border-b border-border pb-1.5">
        <span className="w-28 shrink-0 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
          class
        </span>
        <span className="w-24 shrink-0 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
          size / leading
        </span>
        <span className="w-20 shrink-0 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
          leading from
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
          specimen
        </span>
      </div>

      {TYPE_STEPS.map((step, i) => (
        <div key={step.token} className="flex items-baseline gap-6">
          <span className="w-28 shrink-0 font-mono text-xs text-muted-foreground">
            {step.token}
          </span>
          <span className="w-24 shrink-0 font-mono text-xs text-muted-foreground">
            {metrics[i]?.size ?? "—"}
            <span className="text-muted-foreground/50">
              {" / "}
              {metrics[i]?.leading ?? "—"}
            </span>
          </span>
          <span
            className={cn(
              "w-20 shrink-0 font-mono text-[10px]",
              step.note === "override"
                ? "text-foreground"
                : step.note === "unpaired"
                  ? "text-destructive"
                  : "text-muted-foreground/60",
            )}
          >
            {step.note === "override"
              ? "index.css"
              : step.note === "unpaired"
                ? "unset"
                : "tailwind"}
          </span>
          <span
            ref={(el) => {
              refs.current[i] = el;
            }}
            className={cn(step.cls, "min-w-0 truncate text-foreground")}
          >
            {SPECIMEN}
          </span>
        </div>
      ))}

      <p className="mt-1 text-xs text-muted-foreground">
        Both numbers are measured live. <span className="font-mono">index.css</span>{" "}
        marks the three steps whose leading is overridden by{" "}
        <span className="font-mono">--text-*--line-height</span>;{" "}
        <span className="font-mono text-destructive">unset</span> marks arbitrary
        sizes that carry no paired leading and inherit{" "}
        <span className="font-mono">normal</span>.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Text colours — contrast measured live against the card background
// ---------------------------------------------------------------------------

const TEXT_COLORS: { token: string; cls: string; exempt?: boolean }[] = [
  { token: "text-foreground", cls: "text-foreground" },
  { token: "text-muted-foreground", cls: "text-muted-foreground" },
  { token: "text-primary", cls: "text-primary" },
  { token: "text-destructive", cls: "text-destructive" },
  { token: "text-secondary-foreground", cls: "text-secondary-foreground" },
  { token: "text-accent-foreground", cls: "text-accent-foreground" },
  { token: "text-brand", cls: "text-brand" },
  { token: "text-berry-500", cls: "text-berry-500" },
  { token: "disabled (50%)", cls: "text-foreground opacity-50", exempt: true },
];

const GRADE_CLASS: Record<ContrastGrade, string> = {
  AAA: "text-emerald-600",
  AA: "text-emerald-600",
  fails: "text-destructive",
  exempt: "text-muted-foreground",
};

export function TextColorScale() {
  const refs = useRef<(HTMLSpanElement | null)[]>([]);
  const [rows, setRows] = useState<{ ratio: number; grade: ContrastGrade }[]>([]);

  useEffect(() => {
    const bg: Rgb = resolveColor("var(--card)") ?? [255, 255, 255];
    setRows(
      TEXT_COLORS.map((c, i) => {
        const el = refs.current[i];
        if (!el) return { ratio: 0, grade: "fails" as ContrastGrade };
        const cs = getComputedStyle(el);
        const fg = toRgb(cs.color);
        if (!fg) return { ratio: 0, grade: "fails" as ContrastGrade };
        // Flatten opacity against the background before measuring.
        const alpha = parseFloat(cs.opacity || "1");
        const ratio = contrastRatio(blend(fg, bg, alpha), bg);
        return { ratio, grade: gradeContrast(ratio, c.exempt) };
      }),
    );
  }, []);

  return (
    <div className="flex flex-col gap-2">
      {TEXT_COLORS.map((c, i) => (
        <div key={c.token} className="flex items-baseline gap-6">
          <span className="w-40 shrink-0 font-mono text-xs text-muted-foreground">
            {c.token}
          </span>
          <span
            ref={(el) => {
              refs.current[i] = el;
            }}
            className={cn(c.cls, "w-48 shrink-0 text-sm")}
          >
            {SPECIMEN}
          </span>
          <span className="w-14 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
            {rows[i] ? rows[i].ratio.toFixed(2) : "—"}
          </span>
          <span
            className={cn(
              "font-mono text-xs",
              rows[i] ? GRADE_CLASS[rows[i].grade] : "text-muted-foreground",
            )}
          >
            {rows[i]?.grade ?? ""}
          </span>
        </div>
      ))}
      <p className="mt-1 text-xs text-muted-foreground">
        Ratio against <span className="font-mono">--card</span>, normal-text
        thresholds (4.5 AA / 7 AAA). Opacity is flattened against the background
        before measuring.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Colour tokens
// ---------------------------------------------------------------------------

const SURFACE_TOKENS = [
  ["--background", "bg-background"],
  ["--card", "bg-card"],
  ["--popover", "bg-popover"],
  ["--muted", "bg-muted"],
  ["--accent", "bg-accent"],
  ["--secondary", "bg-secondary"],
  ["--primary", "bg-primary"],
  ["--destructive", "bg-destructive"],
  ["--brand", "bg-brand"],
  ["--highlight", "bg-highlight"],
  ["--border", "bg-border"],
  ["--ring", "bg-ring"],
];

const BERRY = [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

export function ColorTokens() {
  return (
    <div className="flex flex-col gap-5">
      <Row label="surfaces" align="start">
        {SURFACE_TOKENS.map(([token, cls]) => (
          <Specimen key={token} name={token}>
            <div
              className={cn(
                "size-14 rounded-lg border border-border",
                cls,
              )}
            />
          </Specimen>
        ))}
      </Row>
      <Row label="berry" align="start">
        {BERRY.map((step) => (
          <Specimen key={step} name={String(step)}>
            <div
              className="size-14 rounded-lg border border-border"
              style={{ backgroundColor: `var(--color-berry-${step})` }}
            />
          </Specimen>
        ))}
      </Row>
    </div>
  );
}
