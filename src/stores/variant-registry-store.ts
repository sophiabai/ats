import { useEffect } from "react";
import { create } from "zustand";

export interface VariantOption {
  value: string;
  label: string;
}

export interface VariantRegistry {
  defaultVariant: string;
  options: VariantOption[];
}

interface VariantRegistryState {
  registry: VariantRegistry | null;
  setRegistry: (registry: VariantRegistry | null) => void;
}

export const useVariantRegistryStore = create<VariantRegistryState>((set) => ({
  registry: null,
  setRegistry: (registry) => set({ registry }),
}));

/**
 * Registers the current page's available layout variants so the global header
 * can render a dropdown for them. Mirrors the useSetPageTitle pattern.
 */
export function useSetVariants<T extends string>(
  registry: { defaultVariant: T; options: { value: T; label: string }[] } | null | undefined,
) {
  const setRegistry = useVariantRegistryStore((s) => s.setRegistry);

  const key = registry
    ? `${registry.defaultVariant}|${registry.options.map((o) => `${o.value}:${o.label}`).join(",")}`
    : null;

  useEffect(() => {
    if (registry) {
      setRegistry({
        defaultVariant: registry.defaultVariant,
        options: registry.options.map((o) => ({ value: o.value, label: o.label })),
      });
    }
    return () => setRegistry(null);
    // registry is intentionally compared via the derived key so pages can pass inline objects
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, setRegistry]);
}
