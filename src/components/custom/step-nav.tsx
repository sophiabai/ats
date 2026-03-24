import * as React from "react";
import { Check, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepNavItem {
  label: string;
  subtitle?: string;
  icon: LucideIcon;
}

interface StepNavProps {
  steps: readonly StepNavItem[];
  current: number;
  onStepClick: (index: number) => void;
  className?: string;
}

export function StepNav({
  steps,
  current,
  onStepClick,
  className,
}: StepNavProps) {
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const itemRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  React.useLayoutEffect(() => {
    const overlay = overlayRef.current;
    const activeEl = itemRefs.current[current];
    if (!overlay || !activeEl) return;

    const top = activeEl.offsetTop;
    const bottom =
      overlay.offsetHeight - (top + activeEl.offsetHeight);
    overlay.style.clipPath = `inset(${top}px 0px ${bottom}px 0px round 8px)`;
  }, [current]);

  return (
    <nav className={cn("relative flex shrink-0 flex-col gap-1", className)}>
      {steps.map((step, i) => {
        const isCompleted = i < current;
        const Icon = step.icon;

        return (
          <button
            key={i}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            type="button"
            onClick={() => onStepClick(i)}
            className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left"
          >
            <div
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full transition-colors",
                isCompleted
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {isCompleted ? (
                <Check className="size-4" />
              ) : (
                <Icon className="size-4" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-muted-foreground">
                {step.label}
              </p>
            </div>
          </button>
        );
      })}

      {/* Highlighted overlay clipped to the active step */}
      <div
        ref={overlayRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 flex flex-col gap-1"
        style={{
          clipPath: "inset(0 0 100% 0 round 8px)",
          transition: "clip-path 0.25s var(--ease-out-quint)",
        }}
      >
        {steps.map((step, i) => {
          const Icon = step.icon;

          return (
            <button
              key={i}
              type="button"
              tabIndex={-1}
              className="flex items-center gap-3 rounded-lg bg-primary/5 px-3 py-2.5 text-left"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Icon className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {step.label}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
