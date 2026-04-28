import { VariantSwitcher } from "@/components/custom/variant-switcher";
import { CandidateDetailDefault } from "@/features/candidates/variants/default";
import { CandidateDetailV1 } from "@/features/candidates/variants/v1";
import { useVariant } from "@/hooks/use-variant";

type Variant = "default" | "v1";

const VARIANT_OPTIONS: { value: Variant; label: string }[] = [
  { value: "default", label: "Current" },
  { value: "v1", label: "V1" },
];

export function Component() {
  const [variant, setVariant] = useVariant<Variant>("default");

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <VariantSwitcher
          value={variant}
          onChange={setVariant}
          options={VARIANT_OPTIONS}
        />
      </div>
      {variant === "v1" ? <CandidateDetailV1 /> : <CandidateDetailDefault />}
    </div>
  );
}
