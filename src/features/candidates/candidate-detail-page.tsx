import { CandidateDetailV1 } from "@/features/candidates/variants/v1";
import { CandidateDetailV2 } from "@/features/candidates/variants/v2";
import { useVariant } from "@/hooks/use-variant";
import { useSetVariants } from "@/stores/variant-registry-store";

type Variant = "v1" | "v2";

const VARIANT_OPTIONS: { value: Variant; label: string }[] = [
  { value: "v2", label: "V2" },
  { value: "v1", label: "V1" },
];

export function Component() {
  const [variant] = useVariant<Variant>("v1");

  useSetVariants({ defaultVariant: "v1", options: VARIANT_OPTIONS });

  return variant === "v2" ? <CandidateDetailV2 /> : <CandidateDetailV1 />;
}
