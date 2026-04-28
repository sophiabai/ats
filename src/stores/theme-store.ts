import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Theme = "system" | "light" | "dark" | "rippling"

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
