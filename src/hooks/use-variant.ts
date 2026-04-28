import { useSearchParams } from "react-router";

const PARAM = "v";

/**
 * Reads and writes a prototype layout variant via the `?v=` search param.
 * The default variant is represented as an absent param so URLs stay clean.
 */
export function useVariant<T extends string>(
  defaultVariant: T,
): [T, (variant: T) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const current = (searchParams.get(PARAM) ?? defaultVariant) as T;

  const setVariant = (variant: T) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (variant === defaultVariant) {
          next.delete(PARAM);
        } else {
          next.set(PARAM, variant);
        }
        return next;
      },
      { replace: true },
    );
  };

  return [current, setVariant];
}
