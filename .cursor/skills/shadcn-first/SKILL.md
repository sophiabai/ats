---
name: shadcn-first
description: Enforce shadcn/ui as the default component library for all UI work. Guides component selection, composition, and custom component creation. Use when building UI, adding components, creating pages, or implementing designs.
---

# shadcn-first

## Project setup

- **Style:** new-york
- **Icons:** lucide-react
- **UI primitives:** `src/components/ui/` (shadcn-managed, do not hand-edit)
- **Custom components:** `src/components/custom/`
- **Config:** `components.json`

## Decision flow

When implementing any UI element, follow this order strictly:

### 1. Use an existing shadcn component

Check `src/components/ui/` first. If a shadcn primitive (or composition of primitives) covers the need, use it directly. Prefer composing multiple shadcn primitives over building something new.

### 2. Install a missing shadcn component

If shadcn offers the component but it's not yet installed, install it:

```bash
npx shadcn@latest add <component-name>
```

Browse the full registry at https://ui.shadcn.com/docs/components.

### 3. Evaluate whether a custom component is needed

Only consider a custom component when **no shadcn component or composition** fits. Before building anything, answer:

- **Is this a common UX pattern** (e.g., data table with filters, file upload zone, multi-step form)?
  - Yes → propose a reusable custom component. **Ask the user before creating it.**
- **Is this a one-off layout concern?**
  - Yes → implement it inline in the page/feature. No new component needed.

### 4. Build the custom component

When approved by the user:

- Place it in `src/components/custom/`.
- Build **on top of** shadcn primitives — wrap and compose, don't reimplement.
- Accept the same prop patterns shadcn uses (`variant`, `size`, `className`, `asChild`).
- Use `cva` (class-variance-authority) for variant styling, matching shadcn conventions.
- Forward refs with `React.forwardRef` when the component wraps a native element.
- Export from a single file named after the component (kebab-case).

## Rules

1. **Never** hand-edit files in `src/components/ui/`. Those are shadcn-managed.
2. **Never** add a CSS framework, component library, or design system alongside shadcn (no MUI, Ant, Chakra, etc.).
3. **Never** use inline hex colors or arbitrary Tailwind values when a CSS variable / design token exists.
4. **Never** create a custom component without asking the user first.
5. **Always** use Tailwind utility classes — avoid custom CSS files for component styling.
6. **Always** use `cn()` from `@/lib/utils` to merge class names.

## Examples

**Good — compose shadcn primitives:**

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

function UserCard({ user }: { user: User }) {
  return (
    <Card>
      <CardHeader>
        <Avatar>
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{user.initials}</AvatarFallback>
        </Avatar>
        <CardTitle>{user.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="outline" size="sm">View profile</Button>
      </CardContent>
    </Card>
  )
}
```

**Good — custom component wrapping shadcn:**

```tsx
// src/components/custom/status-badge.tsx
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", {
  variants: {
    status: {
      active: "bg-green-100 text-green-700",
      inactive: "bg-neutral-100 text-neutral-500",
      error: "bg-red-100 text-red-700",
    },
  },
  defaultVariants: { status: "active" },
})

interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  return <span className={cn(badgeVariants({ status }), className)} {...props} />
}
```

**Bad — reimplementing a button from scratch:**

```tsx
// Don't do this. Use <Button> from @/components/ui/button instead.
function MyButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
      {children}
    </button>
  )
}
```
