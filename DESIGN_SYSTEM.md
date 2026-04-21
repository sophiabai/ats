# Design System Reference

Use this doc to bootstrap a new prototype with the same FE stack, tokens, and app shell as the ATS project.

## How to use this doc (for Claude)

You are starting a **new, empty project**. The user wants it to look and feel identical to the ATS project that this doc was extracted from — but it is its own app with its own routes and features.

**Read in this order:**
1. Section 0 — non-negotiable rules. Read all of it before touching anything.
2. Section 1 — install everything and set up config files exactly as shown.
3. Section 2 — paste `src/index.css` verbatim.
4. Section 3 — port `RootLayout`, `TopNav`, `AppSidebar` starters. Adapt the sidebar nav items to the new app's domain, but keep the structure.
5. Sections 4–8 — reference while building (conventions, folder layout, troubleshooting, verification).

**What to copy from this doc vs. what to adapt:**
- **Copy verbatim**: `src/index.css`, `components.json`, `src/lib/utils.ts`, `vite.config.ts`, `tsconfig` paths, `theme-store.ts`, `providers.tsx`.
- **Copy and adapt**: `RootLayout`, `TopNav`, `AppSidebar`, breadcrumb segment titles.
- **Do not copy** from the source ATS repo unless the user explicitly asks for a specific feature (see rule 20).

**If the user asks for a feature beyond the shell** (tables, forms, modals, etc.), use shadcn components from `@/components/ui/*`. Add them with `npx shadcn@latest add <name>`. Don't invent your own primitives.

**When uncertain, stop and ask**, don't guess — especially about routes, data shape, or which sidebar items to include. This doc cannot tell you those.

---

## 0. Read this first — common gotchas

These are the things that will trip you up if you skim. **Do not deviate from them** unless the user asks.

1. **This is Vite + React 19, not Next.js.** No `app/` routing, no RSC, no `"use client"`, no `next/link`, no `next/image`. The folder is called `src/app/` only as a naming convention — it's just a Vite React app.
2. **Router is `react-router` v7, imported bare** — not `react-router-dom`. Use `import { Link, Outlet, useLocation } from "react-router"`. `<Link to="...">`, never `href`.
3. **Tailwind v4, not v3.** No `tailwind.config.{js,ts}` file, no `@tailwind base; @tailwind components; @tailwind utilities;`. Everything is driven from `src/index.css` with `@import "tailwindcss"` and `@theme inline { ... }`. Tokens are CSS variables; Tailwind generates utilities from them automatically (e.g. `--color-berry-600` → `bg-berry-600`).
4. **shadcn `new-york` style, `neutral` base color, CSS variables mode.** Use the exact `components.json` in section 1. Do **not** re-run `shadcn init` with defaults after copying this doc — the doc assumes the config below.
5. **`cn()` lives at `@/lib/utils`**, not `@/utils` or `@/lib/cn`.
6. **Path alias `@/*` → `./src/*`** must be set in **both** `vite.config.ts` and `tsconfig.app.json` or imports will fail at runtime vs. type-check.
7. **Dark mode is class-based.** A `.dark` class on `<html>` (or any ancestor) flips variables. Driven by a Zustand store (section 2). Must run `apply(theme)` before first render or you'll get a flash.
8. **The shell's top nav is a sibling to `SidebarProvider`, not inside it.** The `SidebarInset` header (with breadcrumbs) is a *second* bar inside the inset — there are two horizontal bars. See diagram in section 3.
9. **Sidebar sits below the top nav via CSS, not JS.** The `[data-slot="sidebar-container"]` rule in `index.css` is load-bearing — do not delete it.
10. **`px-17` is intentional.** Tailwind v4 accepts arbitrary numeric scale; `px-17` = 68px content gutter. Don't "fix" it to `px-16` or `px-20`.
11. **Lucide icons auto-size to `size-4` inside buttons** via `[&_svg:not([class*='size-'])]:size-4`. Only pass an explicit `size-*` class when you want to override.
12. **Icon-only buttons need `<span className="sr-only">Label</span>`** for a11y. shadcn buttons don't add this for you.
13. **Use `asChild` to compose shadcn buttons/menu-items with `<Link>`** — never wrap a `<Button>` in a `<Link>` (produces nested interactive elements). Correct pattern: `<Button asChild><Link to="/x">…</Link></Button>`.
14. **Do not add dependencies from the "optional extras" list** (Plate.js, xyflow, Supabase, OpenAI, etc.) unless the new prototype actually needs them. They bloat the install significantly.
15. **React 19 quirks**: no `React.FC` needed, no `forwardRef` needed for most cases (ref is a regular prop). shadcn's generated components already reflect this.
16. **Radix Slot usage is non-standard here.** Components import `import { Slot } from "radix-ui"` and use `Slot.Root` — **not** `import { Slot } from "@radix-ui/react-slot"` with `<Slot />`. Match the existing pattern when editing generated components.
17. **`radix-ui` (the meta-package) is the only Radix dep.** Don't add individual `@radix-ui/react-*` sub-packages unless something explicitly needs one. All primitives come from the meta-package via namespace imports.
18. **Custom color utilities come from `@theme inline`.** Every `--color-<name>: <value>;` inside that block becomes `bg-<name>`, `text-<name>`, `border-<name>`, etc. To add a new color, add the variable there — not in a config file.
19. **Tailwind v4 arbitrary values syntax**: `h-(--top-nav-height)` with parens reads a CSS variable; `h-[3rem]` with brackets takes a literal. This repo prefers parens for tokens. Both are valid v4 syntax.
20. **Don't copy ATS-specific components from the source repo** unless the new prototype needs those features: `ChatBar`, `DockedChatPanel`, `chat-bar-store`, `page-title-store`, `starred-requisitions-store`, Plate editor (`editor*.tsx`, `*-node.tsx`, etc.), `@xyflow/react` workflow builder, Supabase client. The starter components in section 3 are intentionally trimmed.
21. **Don't assume filenames.** Read before writing. The existing repo has a `src/app/router.tsx` that wraps `createBrowserRouter`; the starter in this doc inlines the router into `main.tsx` for simplicity — pick one pattern and stick with it.

---

## 1. Frontend stack

- **Build / framework**: Vite 7 + React 19 (not Next.js), TypeScript 5.9
- **Router**: React Router 7 (`react-router`, not `react-router-dom`)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`), `tw-animate-css`, `@tailwindcss/typography`, `tailwind-scrollbar-hide`
- **UI**: shadcn/ui (via `shadcn` v3), Radix primitives (`radix-ui` + `@radix-ui/react-toolbar`), `class-variance-authority`, `clsx`, `tailwind-merge`, `cmdk`
- **Icons**: `lucide-react`
- **State**: `zustand` (stores under `src/stores/*`)
- **Data**: `@tanstack/react-query` v5
- **Extras used by ATS (optional)**: Plate.js editor, `@xyflow/react`, `react-markdown`, `date-fns`
- **Path alias**: `@/*` → `./src/*`

### Minimal install

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm i react-router zustand @tanstack/react-query \
  tailwindcss @tailwindcss/vite tw-animate-css @tailwindcss/typography tailwind-scrollbar-hide \
  class-variance-authority clsx tailwind-merge lucide-react radix-ui cmdk
npm i -D shadcn @types/node
npx shadcn@latest init
# Accept prompts: style=new-york, base color=neutral, CSS variables=yes.
# Then override components.json with the one in section 1 before adding components.
npx shadcn@latest add sidebar button dropdown-menu avatar breadcrumb separator tooltip input card badge tabs collapsible
```

### `components.json` (shadcn config — copy verbatim)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "rtl": false,
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

`"rsc": false` and `"config": ""` are both important — they tell shadcn this is a Vite app (no React Server Components) and that Tailwind v4 is config-file-less.

### `src/lib/utils.ts`

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### `vite.config.ts`

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
```

### `tsconfig.app.json` (relevant bits)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "jsx": "react-jsx",
    "strict": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

Also add the same `paths` to `tsconfig.json` (the root config) so `shadcn` CLI resolves `@/...` correctly.

### `src/main.tsx` (entry)

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router";
import { Providers } from "@/app/providers";
import { RootLayout } from "@/app/layout";
import "@/index.css";
import "@/stores/theme-store"; // imports the store so its initial apply() side-effect runs

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // { path: "/", element: <HomePage /> },
      // add routes here
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>,
);
```

### `src/app/providers.tsx`

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>{children}</TooltipProvider>
    </QueryClientProvider>
  );
}
```

## 2. Design tokens (`src/index.css`)

Drop this file in verbatim — it's the entire token layer. Uses Tailwind v4's `@theme inline` + `:root` / `.dark` CSS variables. Palette is oklch-based.

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@plugin "@tailwindcss/typography";

@custom-variant dark (&:is(.dark *));

@theme inline {
    --ease-out-quint: cubic-bezier(0.23, 1, 0.32, 1);
    --ease-in-out-quart: cubic-bezier(0.77, 0, 0.175, 1);
    --radius-sm: calc(var(--radius) - 4px);
    --radius-md: calc(var(--radius) - 2px);
    --radius-lg: var(--radius);
    --radius-xl: calc(var(--radius) + 4px);
    --radius-2xl: calc(var(--radius) + 8px);
    --radius-3xl: calc(var(--radius) + 12px);
    --radius-4xl: calc(var(--radius) + 16px);
    --color-background: var(--background);
    --color-foreground: var(--foreground);
    --color-card: var(--card);
    --color-card-foreground: var(--card-foreground);
    --color-popover: var(--popover);
    --color-popover-foreground: var(--popover-foreground);
    --color-primary: var(--primary);
    --color-primary-foreground: var(--primary-foreground);
    --color-secondary: var(--secondary);
    --color-secondary-foreground: var(--secondary-foreground);
    --color-muted: var(--muted);
    --color-muted-foreground: var(--muted-foreground);
    --color-accent: var(--accent);
    --color-accent-foreground: var(--accent-foreground);
    --color-destructive: var(--destructive);
    --color-border: var(--border);
    --color-input: var(--input);
    --color-ring: var(--ring);
    --color-chart-1: var(--chart-1);
    --color-chart-2: var(--chart-2);
    --color-chart-3: var(--chart-3);
    --color-chart-4: var(--chart-4);
    --color-chart-5: var(--chart-5);
    --color-sidebar: var(--sidebar);
    --color-sidebar-foreground: var(--sidebar-foreground);
    --color-sidebar-primary: var(--sidebar-primary);
    --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
    --color-sidebar-accent: var(--sidebar-accent);
    --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
    --color-sidebar-border: var(--sidebar-border);
    --color-sidebar-ring: var(--sidebar-ring);
    --color-top-nav: var(--top-nav);
    --color-berry-25: #FDF3FF;
    --color-berry-50: #FCE9FF;
    --color-berry-100: #F0D0F5;
    --color-berry-200: #EAB8F2;
    --color-berry-300: #CE71BB;
    --color-berry-400: #B64195;
    --color-berry-500: #9F1E7A;
    --color-berry-600: #7A005D;
    --color-berry-700: #4A0039;
    --color-berry-800: #47002A;
    --color-berry-900: #2E0011;
    --color-brand: var(--brand);
    --color-highlight: var(--highlight);
}

:root {
    --top-nav-height: 3rem;
    --stone-50: oklch(0.985 0.001 106.423);
    --stone-100: oklch(0.970 0.001 106.424);
    --stone-200: oklch(0.923 0.003 48.717);
    --stone-300: oklch(0.869 0.005 56.366);
    --stone-400: oklch(0.709 0.010 56.259);
    --stone-500: oklch(0.553 0.013 58.071);
    --stone-600: oklch(0.444 0.011 73.639);
    --stone-700: oklch(0.374 0.010 67.558);
    --stone-800: oklch(0.268 0.007 34.298);
    --stone-900: oklch(0.216 0.006 56.043);
    --stone-950: oklch(0.147 0.004 49.250);

    --radius: 0.625rem;
    --background: var(--stone-50);
    --foreground: var(--stone-800);
    --card: oklch(1 0 0);
    --card-foreground: var(--stone-800);
    --popover: oklch(1 0 0);
    --popover-foreground: var(--stone-800);
    --primary: var(--stone-900);
    --primary-foreground: var(--stone-50);
    --secondary: var(--stone-100);
    --secondary-foreground: var(--stone-800);
    --muted: var(--stone-100);
    --muted-foreground: var(--stone-500);
    --accent: var(--stone-100);
    --accent-foreground: var(--stone-900);
    --destructive: oklch(0.577 0.245 27.325);
    --border: var(--stone-200);
    --input: var(--stone-200);
    --ring: var(--stone-400);
    --chart-1: oklch(0.646 0.222 41.116);
    --chart-2: oklch(0.6 0.118 184.704);
    --chart-3: oklch(0.398 0.07 227.392);
    --chart-4: oklch(0.828 0.189 84.429);
    --chart-5: oklch(0.769 0.188 70.08);
    --sidebar: var(--stone-50);
    --sidebar-foreground: var(--stone-500);
    --sidebar-primary: var(--stone-800);
    --sidebar-primary-foreground: var(--stone-50);
    --sidebar-accent: var(--stone-200);
    --sidebar-accent-foreground: var(--stone-800);
    --sidebar-border: var(--stone-200);
    --sidebar-ring: var(--stone-400);
    --top-nav: var(--stone-100);
    --highlight: oklch(0.852 0.199 91.936);
    --brand: oklch(0.623 0.214 259.815);
}

.dark {
    --background: var(--sidebar);
    --foreground: var(--stone-50);
    --card: var(--stone-900);
    --card-foreground: var(--stone-50);
    --popover: var(--stone-900);
    --popover-foreground: var(--stone-50);
    --primary: var(--stone-200);
    --primary-foreground: var(--stone-900);
    --secondary: var(--stone-800);
    --secondary-foreground: var(--stone-50);
    --muted: var(--stone-800);
    --muted-foreground: var(--stone-400);
    --accent: var(--stone-800);
    --accent-foreground: var(--stone-50);
    --destructive: oklch(0.704 0.191 22.216);
    --border: var(--stone-800);
    --input: var(--stone-800);
    --ring: var(--stone-500);
    --chart-1: oklch(0.488 0.243 264.376);
    --chart-2: oklch(0.696 0.17 162.48);
    --chart-3: oklch(0.769 0.188 70.08);
    --chart-4: oklch(0.627 0.265 303.9);
    --chart-5: oklch(0.645 0.246 16.439);
    --sidebar: var(--stone-900);
    --sidebar-foreground: var(--stone-400);
    --sidebar-primary: oklch(0.488 0.243 264.376);
    --sidebar-primary-foreground: var(--stone-50);
    --sidebar-accent: var(--stone-800);
    --sidebar-accent-foreground: var(--stone-50);
    --sidebar-border: var(--stone-800);
    --sidebar-ring: var(--stone-500);
    --top-nav: var(--stone-800);
    --highlight: oklch(0.852 0.199 91.936);
    --brand: oklch(0.707 0.165 254.624);
}

[data-slot="sidebar-container"] {
  top: var(--top-nav-height, 0px);
  height: calc(100svh - var(--top-nav-height, 0px));
}

@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; }
  .animate-in, .animate-out { animation-timing-function: var(--ease-out-quint); }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Token cheat sheet

| Concept | Class / var |
|---|---|
| Page background | `bg-background` (stone-50 / stone-900) |
| Body text | `text-foreground` |
| Muted text | `text-muted-foreground` |
| Cards / popovers | `bg-card` / `bg-popover` (white / stone-900) |
| Borders | `border-border` (stone-200 / stone-800) |
| Focus ring | `ring-ring/50` with `ring-[3px]` |
| Brand accent (berry) | `bg-berry-600`, `text-berry-500`, etc. |
| Brand (blue) | `text-brand` / `bg-brand` |
| Highlight (yellow) | `bg-highlight` |
| Destructive | `bg-destructive text-white` |
| Top nav surface | `bg-top-nav` (stone-100 / stone-800) |
| Sidebar surface | `bg-sidebar` |
| Radius default | `rounded-md` = 8px, `rounded-lg` = 10px, `rounded-xl` = 14px |
| Easings | `ease-out-quint`, `ease-in-out-quart` |

### Dark mode

Toggle `.dark` class on `<html>` (the root element). Use a Zustand store:

```ts
// src/stores/theme-store.ts
import { create } from "zustand";

export type Theme = "system" | "light" | "dark";

function resolve(theme: Theme): "light" | "dark" {
  if (theme !== "system") return theme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function apply(theme: Theme) {
  document.documentElement.classList.toggle("dark", resolve(theme) === "dark");
}

const initial = (localStorage.getItem("theme") as Theme) ?? "system";
apply(initial); // run once at module load so first paint is correct (no FOUC)

// Re-apply when the OS scheme changes, if the user is on "system".
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  if ((localStorage.getItem("theme") as Theme) === "system" || !localStorage.getItem("theme")) {
    apply("system");
  }
});

export const useThemeStore = create<{ theme: Theme; setTheme: (t: Theme) => void }>((set) => ({
  theme: initial,
  setTheme: (theme) => {
    localStorage.setItem("theme", theme);
    apply(theme);
    set({ theme });
  },
}));
```

Importing this file from `main.tsx` (as shown above) is what triggers the initial `apply()`. If you delete the import, dark mode won't initialize.

## 3. App shell layout

Structure (all in `src/app/layout.tsx`):

```
<div class="flex h-svh flex-col">          ← full-viewport column
  <TopNav />                                ← h-(--top-nav-height) = 48px
  <SidebarProvider class="min-h-0 flex-1">  ← horizontal row under the top nav
    <AppSidebar collapsible="icon" />       ← collapses to icon rail
    <SidebarInset class="relative min-w-0 min-h-0 overflow-hidden">
      <header class="flex h-16 shrink-0 items-center gap-2 border-b border-border
                     transition-[width,height] ease-in-out-quart
                     group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <SidebarTrigger /> | vertical Separator | Breadcrumb
      </header>
      <div class="flex w-full flex-1 flex-col gap-6 overflow-y-auto px-17 pt-6">
        <Outlet />                          ← routed page
      </div>
    </SidebarInset>
  </SidebarProvider>
</div>
```

Key details:

- **Two horizontal bars**: (1) the global `<TopNav>` at 48px (brand, team switcher, search, notifications, avatar) and (2) an in-content `<header>` inside `<SidebarInset>` that houses the sidebar trigger and breadcrumbs. Don't merge them.
- **TopNav**: fixed height `h-(--top-nav-height)` (48px), `bg-top-nav`, `border-b border-border`, `px-4`. Left: small berry-600 logo chip (`size-6 rounded-md`) + team switcher (ghost button, `ChevronsUpDown`). Right: Search, Bell, Avatar (`size-8` ghost icon buttons); avatar opens user menu with theme switcher (system/light/dark).
- **Sidebar container override** (in `index.css`) pins the sidebar below the top nav:
  ```css
  [data-slot="sidebar-container"] {
    top: var(--top-nav-height, 0px);
    height: calc(100svh - var(--top-nav-height, 0px));
  }
  ```
- **AppSidebar**: `collapsible="icon"`. Sections:
  - `SidebarContent pt-2` → `NavMain` (flat list) + `NavProjects` (collapsible trees).
  - `SidebarFooter` → `NavUser` card.
  - `SidebarRail` for drag-to-resize.
- **Inset header** shrinks from `h-16` to `h-12` when sidebar collapses, via `group-has-data-[collapsible=icon]/sidebar-wrapper:h-12`, eased by `ease-in-out-quart`.
- **Breadcrumbs** derived from pathname with a `SEGMENT_TITLES` map + `ROUTE_OVERRIDES` for custom routes; supports dynamic titles via `location.state.breadcrumb` or a `page-title-store`.
- **Content well**: `px-17 pt-6 gap-6` (Tailwind v4 accepts arbitrary numeric scale; `px-17` ≈ 68px), `overflow-y-auto`.

### Starter `RootLayout`

```tsx
// src/app/layout.tsx
import { Link, Outlet, useLocation } from "react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { TopNav } from "@/components/top-nav";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const SEGMENT_TITLES: Record<string, string> = {
  // fill in per-app
};

function useBreadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return { crumbs: [], page: "Home" };
  const crumbs = segments.slice(0, -1).map((s, i) => ({
    title: SEGMENT_TITLES[s] ?? s,
    href: "/" + segments.slice(0, i + 1).join("/"),
  }));
  const last = segments[segments.length - 1];
  return { crumbs, page: SEGMENT_TITLES[last] ?? last };
}

export function RootLayout() {
  const { crumbs, page } = useBreadcrumbs();
  return (
    <div className="flex h-svh flex-col">
      <TopNav />
      <SidebarProvider className="min-h-0 flex-1">
        <AppSidebar />
        <SidebarInset className="relative min-w-0 min-h-0 overflow-hidden">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border transition-[width,height] ease-in-out-quart group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  {crumbs.map((c, i) => (
                    <span key={c.href} className="contents">
                      {i > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink asChild><Link to={c.href}>{c.title}</Link></BreadcrumbLink>
                      </BreadcrumbItem>
                    </span>
                  ))}
                  {crumbs.length > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                  <BreadcrumbItem><BreadcrumbPage>{page}</BreadcrumbPage></BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex w-full flex-1 flex-col gap-6 overflow-y-auto px-17 pt-6">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
```

### Starter `TopNav`

```tsx
// src/components/top-nav.tsx
import { Bell, ChevronsUpDown, Monitor, Moon, Search, Sun } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useThemeStore, type Theme } from "@/stores/theme-store";

const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
];

export function TopNav() {
  const { theme, setTheme } = useThemeStore();
  return (
    <header className="flex h-(--top-nav-height) shrink-0 items-center justify-between  bg-top-nav px-4">
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-2 px-2">
          <div className="flex size-6 items-center justify-center rounded-md bg-berry-600" />
        </div>
        <Button variant="ghost" size="sm" className="gap-1.5 text-sm font-medium">
          Acme Inc <ChevronsUpDown className="size-3.5 text-muted-foreground" />
        </Button>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="size-8"><Search className="size-4" /></Button>
        <Button variant="ghost" size="icon" className="size-8"><Bell className="size-4" /></Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8 rounded-full">
              <Avatar className="size-6">
                <AvatarImage src="/avatars/shadcn.jpg" alt="me" />
                <AvatarFallback className="text-[10px]">CN</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-56 rounded-lg" align="end" sideOffset={8}>
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">Theme</DropdownMenuLabel>
            <DropdownMenuGroup>
              {themeOptions.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={theme === opt.value ? "font-medium text-foreground" : "text-muted-foreground"}
                >
                  <opt.icon /> {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
```

### Starter `AppSidebar`

```tsx
// src/components/app-sidebar.tsx
import type { ComponentProps } from "react";
import { BarChart3, ChevronRight, Inbox, Search, Users } from "lucide-react";
import { Link } from "react-router";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarRail,
  SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";

const quickAccess = [
  { title: "Inbox", url: "/inbox", icon: Inbox },
  { title: "Search", url: "/search", icon: Search },
];

const groups = [
  {
    name: "People", url: "/people", icon: Users,
    items: [
      { title: "All", url: "/people" },
      { title: "Teams", url: "/people/teams" },
    ],
  },
  { name: "Analytics", url: "/analytics", icon: BarChart3 },
];

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupLabel>Quick Access</SidebarGroupLabel>
          <SidebarMenu>
            {quickAccess.map((i) => (
              <SidebarMenuItem key={i.title}>
                <SidebarMenuButton asChild tooltip={i.title}>
                  <Link to={i.url}><i.icon /><span>{i.title}</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarMenu>
            {groups.map((g) => g.items ? (
              <Collapsible key={g.name} asChild className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={g.name}>
                      <g.icon /><span>{g.name}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 ease-out-quint group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {g.items.map((s) => (
                        <SidebarMenuSubItem key={s.title}>
                          <SidebarMenuSubButton asChild>
                            <Link to={s.url}>{s.title}</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ) : (
              <SidebarMenuItem key={g.name}>
                <SidebarMenuButton asChild tooltip={g.name}>
                  <Link to={g.url}><g.icon /><span>{g.name}</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
      <SidebarRail />
    </Sidebar>
  );
}
```

## 4. Component conventions

- `cn()` helper combines `clsx` + `tailwind-merge`. Use it everywhere.
- CVA for variants — expose `variant` and `size` via `VariantProps`.
- `asChild` + Radix `Slot` for polymorphic composition (e.g. wrapping a `<Link>` in a `Button`).
- Every primitive gets `data-slot="..."`, `data-variant`, `data-size`, `data-state` for CSS targeting.

### Sizing / spacing defaults

| Component | Base |
|---|---|
| Button (default) | `h-9 px-4 py-2 rounded-md text-sm font-medium` |
| Button sizes | `xs` h-6, `sm` h-8, `default` h-9, `lg` h-10 |
| Icon buttons | `size-6 / size-8 / size-9 / size-10` |
| Button press | `active:scale-[0.97]` |
| Focus ring | `ring-[3px] ring-ring/50 focus-visible:border-ring` |
| Input | `h-9 rounded-md border border-input bg-transparent px-3`, `dark:bg-input/30`, `aria-invalid:border-destructive` |
| Card | `rounded-xl border bg-card py-4 gap-6`; sections use `px-6` |
| Badge | `rounded-full px-2 py-0.5 text-xs font-medium` |
| Dropdown content | `rounded-md border bg-popover p-1 shadow-md` |
| Dropdown item | `rounded-sm px-2 py-1.5 text-sm focus:bg-accent` |
| Avatar sizes | `size-6 / size-8 / size-10`, `rounded-full` |

### Icon rules

- Lucide icons default to `size-4` via `[&_svg:not([class*='size-'])]:size-4`.
- Buttons use `has-[>svg]:px-3` (etc.) to tighten padding when they contain an icon.

### Key patterns to reuse

- **Container queries** for internal card layouts: `@container/card-header`.
- **State-driven styling** via `data-state=open`, `group-data-[state=open]/collapsible:rotate-90`, etc.
- **Sidebar collapse** uses CSS vars + data attributes (no JS reflow).
- **Focus** uses semi-transparent rings (`ring/50`) and a thicker 3px ring.
- **Mobile-first**: `hidden md:block` to show desktop-only chrome (e.g. breadcrumb items).

## 5. File/folder layout

```
src/
├── app/
│   ├── layout.tsx          ← RootLayout
│   └── providers.tsx       ← QueryClientProvider + TooltipProvider
├── components/
│   ├── app-sidebar.tsx
│   ├── top-nav.tsx
│   ├── nav-main.tsx        ← flat sidebar list
│   ├── nav-projects.tsx    ← collapsible sidebar trees
│   ├── nav-user.tsx        ← sidebar footer user card
│   └── ui/                 ← shadcn primitives
├── features/<feature>/
│   ├── pages/
│   ├── components/
│   ├── api/                ← React Query hooks
│   ├── types.ts
│   └── constants.ts
├── stores/                 ← Zustand stores (theme, page-title, etc.)
├── lib/utils.ts            ← cn() helper
├── index.css               ← tokens live here
└── main.tsx                ← router + Providers entry
```

## 6. Bootstrap checklist (do in this exact order)

1. **Scaffold**: `npm create vite@latest my-app -- --template react-ts`, then `cd my-app`.
2. **Install** the dependencies from section 1's "Minimal install" block.
3. **Config files**:
   - Replace `vite.config.ts` with the version in section 1.
   - Add `"baseUrl": "."` and `"paths": { "@/*": ["./src/*"] }` to **both** `tsconfig.json` and `tsconfig.app.json`.
4. **shadcn**: run `npx shadcn@latest init` accepting defaults (style=new-york, baseColor=neutral, CSS variables=yes). Then overwrite the generated `components.json` with the exact version in section 1.
5. **Add primitives**: `npx shadcn@latest add sidebar button dropdown-menu avatar breadcrumb separator tooltip input card badge tabs collapsible sheet skeleton`.
6. **Tokens**: overwrite `src/index.css` verbatim with section 2's CSS.
7. **Utils**: create `src/lib/utils.ts` from section 1.
8. **Stores**: create `src/stores/theme-store.ts` from section 2.
9. **Providers**: create `src/app/providers.tsx` from section 1.
10. **Shell**: create `src/app/layout.tsx`, `src/components/top-nav.tsx`, `src/components/app-sidebar.tsx` from section 3. Adapt the sidebar nav items / breadcrumb segment titles to the new app.
11. **Entry**: replace `src/main.tsx` with the version in section 1. Confirm `import "@/stores/theme-store";` is present (this triggers the initial `apply()` for dark mode).
12. **Run**: `npm run dev`. Walk through section 8's verification checklist.

Note: step 11 does not add any pages. Create routes under `src/features/<feature>/pages/` (or wherever makes sense for the app) and wire them into the `createBrowserRouter` children array.

---

## 7. Troubleshooting / do-not-do

**If the page renders unstyled (no Tailwind classes work)**
- Make sure `@tailwindcss/vite` is in `vite.config.ts` `plugins: [react(), tailwindcss()]`.
- Make sure `src/index.css` starts with `@import "tailwindcss";` and is imported once in `main.tsx`.
- There is no `tailwind.config.js` — do not create one.

**If `@/...` imports fail at build but work in the editor (or vice versa)**
- The alias must exist in both `vite.config.ts` (runtime) and `tsconfig.json`/`tsconfig.app.json` (types).

**If dark mode "flashes" light before going dark**
- You didn't import `@/stores/theme-store` in `main.tsx` before `<RouterProvider>`. The `apply()` side effect at module load is what prevents FOUC.

**If the sidebar overlaps the top nav**
- Missing `[data-slot="sidebar-container"]` rule in `index.css`. Re-add it.

**If the sidebar toggle does nothing**
- You forgot to wrap the app in `<SidebarProvider>`. Only descendants of the provider can call `<SidebarTrigger>`.

**If dropdown/tooltip/modal animations feel wrong**
- Make sure `tw-animate-css` is installed and `@import "tw-animate-css";` is in `index.css`. shadcn components rely on its classes (`animate-in`, `animate-out`, `fade-in-0`, etc.).

**If focus rings look too thin or wrong-colored**
- Check the base layer rule `* { @apply border-border outline-ring/50; }` and that the semantic tokens in section 2 are present. Rings are 3px by convention (`ring-[3px] ring-ring/50`).

**If icons inside buttons look oversized**
- Don't hand-size every icon. Let the button's `[&_svg:not([class*='size-'])]:size-4` rule handle defaults. Only add `className="size-X"` on the icon when you genuinely need a non-default size.

**If you get `Module not found: @radix-ui/react-slot`**
- This repo uses the `radix-ui` meta-package. Change the import to `import { Slot } from "radix-ui"` and use `Slot.Root` (not `<Slot>`).

**If `createBrowserRouter` or `RouterProvider` throws**
- Make sure you're importing from `"react-router"` (not `"react-router-dom"`). v7 ships both under `react-router`.

**If `<SidebarTrigger />` works but toggling does nothing visible on mobile**
- `useIsMobile` hook + `Sheet` are required by the generated `sidebar.tsx`. Make sure `sheet` and the `use-mobile` hook were added via `shadcn add sidebar` (they're auto-added).

**If you see a hydration/ref warning from `<Button asChild>`**
- The child must be a single element, not a fragment. `<Button asChild><Link to="/x">Label</Link></Button>` ✅. `<Button asChild><><Icon /> Label</></Button>` ❌ — put the icon inside the Link instead.

**Do NOT**
- Don't install `react-router-dom`. It's `react-router` (v7).
- Don't install `tailwindcss@3` or create a `tailwind.config.js`.
- Don't add `"use client"` to any component — this isn't Next.js.
- Don't use `next/link`, `next/image`, or `next/navigation`.
- Don't swap the color base from `neutral` in `components.json`. The `stone-*` tokens in section 2 are the source of truth; shadcn's base color picker is only used at `init` time and is irrelevant once tokens are in place.
- Don't re-generate tokens via `shadcn add theme` — the tokens in section 2 are custom and will be clobbered.
- Don't rename CSS variables (`--background`, `--sidebar`, `--top-nav`, `--berry-*`, etc.). Every component reads them.

## 8. Quick verify

After install, the app should:
1. Boot with `npm run dev` on Vite's default port.
2. Render the top nav (48px tall, stone-100 background, border-bottom).
3. Render the sidebar at full-height minus top nav, with collapsible icon rail.
4. Render an inner header with a sidebar trigger and breadcrumbs.
5. Toggle `.dark` on `<html>` when you pick Dark from the avatar menu, and every color should invert smoothly.
6. No console errors about missing Tailwind utilities, missing `cn`, or missing `@/...` modules.
