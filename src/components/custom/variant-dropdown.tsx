import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useVariantRegistryStore } from "@/stores/variant-registry-store";
import { useVariant } from "@/hooks/use-variant";

export function VariantDropdown() {
  const registry = useVariantRegistryStore((s) => s.registry);
  const [variant, setVariant] = useVariant<string>(
    registry?.defaultVariant ?? "default",
  );

  if (!registry) return null;

  const current =
    registry.options.find((o) => o.value === variant) ?? registry.options[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="xs"
          className="font-normal text-muted-foreground/60 hover:text-muted-foreground"
        >
          {current?.label ?? "Layout"}
          <ChevronDown className="opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        {registry.options.map((option) => {
          const active = option.value === variant;
          return (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => setVariant(option.value)}
              className={cn(active && "font-medium")}
            >
              <Check
                className={cn(
                  "size-3.5",
                  active ? "opacity-100" : "opacity-0",
                )}
              />
              {option.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
