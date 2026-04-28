import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { isValidTheme, useThemeStore } from "@/stores/theme-store";

const PARAM = "theme";

/**
 * Keeps the `?theme=` URL param in sync with the theme store in both
 * directions. System (the default) stays absent from the URL so links
 * remain clean, while any explicit theme choice is reflected so the URL
 * is shareable.
 */
export function useThemeUrlSync() {
  const [searchParams, setSearchParams] = useSearchParams();
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  useEffect(() => {
    const urlTheme = searchParams.get(PARAM);
    const validUrlTheme = isValidTheme(urlTheme) ? urlTheme : null;

    // URL is authoritative when it carries a valid theme that differs from the store
    if (validUrlTheme && validUrlTheme !== theme) {
      setTheme(validUrlTheme);
      return;
    }

    // Otherwise keep the URL reflective of the current theme
    if (theme === "system") {
      if (urlTheme !== null) {
        const next = new URLSearchParams(searchParams);
        next.delete(PARAM);
        setSearchParams(next, { replace: true });
      }
    } else if (urlTheme !== theme) {
      const next = new URLSearchParams(searchParams);
      next.set(PARAM, theme);
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, theme, setTheme, setSearchParams]);
}
