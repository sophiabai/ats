import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useLayoutEffect,
} from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface TabItem {
  value: string;
  label: React.ReactNode;
}

interface ResponsiveTabsListProps {
  items: TabItem[];
  activeValue: string;
  onValueChange: (value: string) => void;
  className?: string;
}

const MORE_BUTTON_WIDTH = 80;
const TABS_LIST_PADDING = 6;

export function ResponsiveTabsList({
  items,
  activeValue,
  onValueChange,
  className,
}: ResponsiveTabsListProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(items.length);

  const recalculate = useCallback(() => {
    const outer = outerRef.current;
    const measure = measureRef.current;
    if (!outer || !measure) return;

    const available = outer.clientWidth;
    const children = Array.from(measure.children) as HTMLElement[];
    let used = TABS_LIST_PADDING;
    let count = 0;

    for (let i = 0; i < children.length; i++) {
      const w = children[i].offsetWidth;
      const isLast = i === children.length - 1;

      if (isLast && used + w <= available) {
        count++;
        break;
      }

      if (used + w + MORE_BUTTON_WIDTH > available) break;
      used += w;
      count++;
    }

    setVisibleCount(Math.max(1, count));
  }, []);

  useLayoutEffect(recalculate);

  useEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;
    const ro = new ResizeObserver(recalculate);
    ro.observe(outer);
    return () => ro.disconnect();
  }, [recalculate]);

  const visible = items.slice(0, visibleCount);
  const overflow = items.slice(visibleCount);
  const isActiveInOverflow = overflow.some((i) => i.value === activeValue);

  return (
    <div ref={outerRef} className="relative min-w-0 flex-1">
      <div
        ref={measureRef}
        aria-hidden
        className="pointer-events-none invisible absolute flex h-0 overflow-hidden"
      >
        {items.map((item) => (
          <span
            key={item.value}
            className="inline-flex items-center gap-1.5 border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap"
          >
            {item.label}
          </span>
        ))}
      </div>

      <TabsList className={cn("w-auto", className)}>
        {visible.map((item) => (
          <TabsTrigger key={item.value} value={item.value}>
            {item.label}
          </TabsTrigger>
        ))}
        {overflow.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "inline-flex h-[calc(100%-1px)] items-center gap-1 rounded-md px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  isActiveInOverflow
                    ? "bg-background text-foreground shadow-sm"
                    : "text-foreground/60 hover:text-foreground",
                )}
              >
                More
                <ChevronDown className="size-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {overflow.map((item) => (
                <DropdownMenuItem
                  key={item.value}
                  className={cn(
                    item.value === activeValue && "bg-accent font-medium",
                  )}
                  onSelect={() => onValueChange(item.value)}
                >
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </TabsList>
    </div>
  );
}
