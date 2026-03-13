import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

type View = "table" | "cards";

interface ViewToggleProps {
  view: View;
  onViewChange: (view: View) => void;
  className?: string;
}

export type { View };

export function ViewToggle({ view, onViewChange, className }: ViewToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border bg-muted p-0.5",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onViewChange("table")}
        className={cn(
          "inline-flex items-center justify-center rounded-sm px-2.5 py-1.5 text-sm font-medium transition-colors",
          view === "table"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <List className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => onViewChange("cards")}
        className={cn(
          "inline-flex items-center justify-center rounded-sm px-2.5 py-1.5 text-sm font-medium transition-colors",
          view === "cards"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <LayoutGrid className="size-4" />
      </button>
    </div>
  );
}
