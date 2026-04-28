import { create } from "zustand"
import { persist } from "zustand/middleware"

export const THEMES = ["system", "light", "dark", "rippling"] as const
export type Theme = (typeof THEMES)[number]

export function isValidTheme(value: unknown): value is Theme {
  return typeof value === "string" && (THEMES as readonly string[]).includes(value)
}

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "system",
      setTheme: (theme) => set({ theme }),
    }),
    { name: "ats-theme" },
  ),
)

function applyTheme(theme: Theme) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
  const isDark = theme === "dark" || (theme === "system" && prefersDark)
  document.documentElement.classList.toggle("dark", isDark)
  document.documentElement.classList.toggle("rippling", theme === "rippling")
}

function init() {
  // URL overrides localStorage so shared links apply the intended theme
  const urlTheme = new URLSearchParams(window.location.search).get("theme")
  if (isValidTheme(urlTheme)) {
    useThemeStore.setState({ theme: urlTheme })
  }

  const unsub = useThemeStore.subscribe((state) => applyTheme(state.theme))
  applyTheme(useThemeStore.getState().theme)

  const mq = window.matchMedia("(prefers-color-scheme: dark)")
  const handler = () => applyTheme(useThemeStore.getState().theme)
  mq.addEventListener("change", handler)

  return () => {
    unsub()
    mq.removeEventListener("change", handler)
  }
}

init()
