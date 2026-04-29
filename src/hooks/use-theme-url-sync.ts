import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import {
  parseThemeParam,
  serializeThemeParam,
  useThemeStore,
} from "@/stores/theme-store";

const PARAM = "theme";

/**
 * Keeps the `?theme=<brand>-<mode>` URL param in sync with the theme store in
 * both directions. URL is authoritative only when it actually changes (e.g.
 * navigation or shared link), while local toggles flow store → URL. The
 * default combination (default + light) stays absent from the URL so links
 * remain clean.
 */
export function useThemeUrlSync() {
  const [searchParams, setSearchParams] = useSearchParams();
  const theme = useThemeStore((s) => s.theme);
  const mode = useThemeStore((s) => s.mode);
  const setTheme = useThemeStore((s) => s.setTheme);
  const setMode = useThemeStore((s) => s.setMode);

  const prevSearchParamsRef = useRef(searchParams);

  useEffect(() => {
    const searchParamsChanged = prevSearchParamsRef.current !== searchParams;
    prevSearchParamsRef.current = searchParams;

    const raw = searchParams.get(PARAM);
    const parsed = parseThemeParam(raw);

    // URL is authoritative only when it changed externally (navigation, initial load)
    if (searchParamsChanged) {
      let updated = false;
      if (parsed.theme && parsed.theme !== theme) {
        setTheme(parsed.theme);
        updated = true;
      }
      if (parsed.mode && parsed.mode !== mode) {
        setMode(parsed.mode);
        updated = true;
      }
      if (updated) return;
    }

    // Sync store → URL
    const desired = serializeThemeParam(theme, mode);
    if (desired === raw) return;

    const next = new URLSearchParams(searchParams);
    if (desired === null) {
      next.delete(PARAM);
    } else {
      next.set(PARAM, desired);
    }
    setSearchParams(next, { replace: true });
  }, [searchParams, theme, mode, setTheme, setMode, setSearchParams]);
}
