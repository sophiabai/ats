import { CandidateDetailDefault } from "@/features/candidates/variants/default";
import { CandidateDetailV1 } from "@/features/candidates/variants/v1";
import { useVariant } from "@/hooks/use-variant";
import { useSetVariants } from "@/stores/variant-registry-store";

type Variant = "default" | "v1";

const VARIANT_OPTIONS: { value: Variant; label: string }[] = [
  { value: "default", label: "Current" },
  { value: "v1", label: "V1" },
];

export function Component() {
  const [variant] = useVariant<Variant>("default");

  useSetVariants({ defaultVariant: "default", options: VARIANT_OPTIONS });

  return variant === "v1" ? <CandidateDetailV1 /> : <CandidateDetailDefault />;
}
