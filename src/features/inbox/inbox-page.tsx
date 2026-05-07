import { InboxV1 } from "@/features/inbox/variants/v1";
import { InboxV2 } from "@/features/inbox/variants/v2";
import { useVariant } from "@/hooks/use-variant";
import { useSetVariants } from "@/stores/variant-registry-store";

type Variant = "v1" | "v2";

const VARIANT_OPTIONS: { value: Variant; label: string }[] = [
  { value: "v2", label: "V2" },
  { value: "v1", label: "V1" },
];

export function Component() {
  const [variant] = useVariant<Variant>("v2");

  useSetVariants({ defaultVariant: "v2", options: VARIANT_OPTIONS });

  return variant === "v2" ? <InboxV2 /> : <InboxV1 />;
}
