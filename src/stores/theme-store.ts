import { create } from "zustand"
import { persist } from "zustand/middleware"

export const THEMES = ["default", "rippling"] as const
export const MODES = ["system", "light", "dark"] as const

export type Theme = (typeof THEMES)[number]
export type Mode = (typeof MODES)[number]

export function isValidTheme(value: unknown): value is Theme {
  return typeof value === "string" && (THEMES as readonly string[]).includes(value)
}

export function isValidMode(value: unknown): value is Mode {
  return typeof value === "string" && (MODES as readonly string[]).includes(value)
}

const DEFAULT_THEME: Theme = "default"
const DEFAULT_MODE: Mode = "light"

interface ThemeState {
  theme: Theme
  mode: Mode
  setTheme: (theme: Theme) => void
  setMode: (mode: Mode) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: DEFAULT_THEME,
      mode: DEFAULT_MODE,
      setTheme: (theme) => set({ theme }),
      setMode: (mode) => set({ mode }),
    }),
    { name: "ats-theme", version: 2 },
  ),
)

/**
 * Parses the `?theme=` URL param into a theme + mode pair. Accepts both the
 * canonical `<brand>-<mode>` format and legacy values like `dark`, `system`,
 * or `rippling` that predate the split.
 */
export function parseThemeParam(
  value: string | null | undefined,
): { theme?: Theme; mode?: Mode } {
  if (!value) return {}

  if (value.includes("-")) {
    const [brand, mode] = value.split("-", 2)
    return {
      theme: isValidTheme(brand) ? brand : undefined,
      mode: isValidMode(mode) ? mode : undefined,
    }
  }

  if (isValidTheme(value)) return { theme: value }
  if (isValidMode(value)) return { mode: value }
  return {}
}

/**
 * Serializes theme + mode into the `?theme=` URL param. Returns `null` when
 * the combination equals the defaults (kept out of the URL for clean links).
 */
export function serializeThemeParam(theme: Theme, mode: Mode): string | null {
  if (theme === DEFAULT_THEME && mode === DEFAULT_MODE) return null
  return `${theme}-${mode}`
}

function applyTheme(theme: Theme, mode: Mode) {
  const root = document.documentElement
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
  const isDark = mode === "dark" || (mode === "system" && prefersDark)

  root.classList.toggle("dark", isDark)
  root.classList.toggle("rippling", theme === "rippling")
}

function init() {
  const urlTheme = new URLSearchParams(window.location.search).get("theme")
  const parsed = parseThemeParam(urlTheme)

  const patch: Partial<ThemeState> = {}
  if (parsed.theme) patch.theme = parsed.theme
  if (parsed.mode) patch.mode = parsed.mode

  // Coerce stale persisted values back to defaults
  const current = useThemeStore.getState()
  if (!isValidTheme(patch.theme ?? current.theme)) patch.theme = DEFAULT_THEME
  if (!isValidMode(patch.mode ?? current.mode)) patch.mode = DEFAULT_MODE

  if (Object.keys(patch).length > 0) useThemeStore.setState(patch)

  const run = () => {
    const { theme, mode } = useThemeStore.getState()
    applyTheme(theme, mode)
  }

  const unsub = useThemeStore.subscribe(run)
  run()

  const mq = window.matchMedia("(prefers-color-scheme: dark)")
  mq.addEventListener("change", run)

  return () => {
    unsub()
    mq.removeEventListener("change", run)
  }
}

init()
