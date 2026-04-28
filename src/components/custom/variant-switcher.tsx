import { cn } from "@/lib/utils";

interface VariantOption<T extends string> {
  value: T;
  label: string;
}

interface VariantSwitcherProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: VariantOption<T>[];
  className?: string;
  "aria-label"?: string;
}

export function VariantSwitcher<T extends string>({
  value,
  onChange,
  options,
  className,
  "aria-label": ariaLabel = "Layout variant",
}: VariantSwitcherProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center rounded-md border bg-muted p-0.5",
        className,
      )}
    >
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex items-center justify-center rounded-sm px-2.5 py-1 text-xs font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
