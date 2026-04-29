---
name: cursor-pointer
description: Use `cursor: pointer` on all clickable elements throughout the ATS site. Applies when adding or reviewing interactive UI — buttons, links, tabs, menu items, clickable rows/cards/icons, Radix triggers, or any element with an onClick handler. Do not change elements that already specify a different cursor (text input, grab, not-allowed, etc.).
---

# Cursor pointer on clickable elements

Every interactive element should show the pointer cursor on hover. This matches the pre-Tailwind-v4 default and makes clickability discoverable.

## How it is enforced globally

A base-layer rule in `src/index.css` sets `cursor: pointer` on common interactive elements (runs everywhere automatically):

```css
@layer base {
  button:not(:disabled),
  [role="button"]:not([aria-disabled="true"]),
  [role="tab"]:not([aria-disabled="true"]),
  [role="menuitem"]:not([aria-disabled="true"]),
  [role="menuitemcheckbox"]:not([aria-disabled="true"]),
  [role="menuitemradio"]:not([aria-disabled="true"]),
  [role="option"]:not([aria-disabled="true"]),
  [role="switch"]:not([aria-disabled="true"]),
  [role="checkbox"]:not([aria-disabled="true"]),
  [role="radio"]:not([aria-disabled="true"]),
  [role="combobox"]:not([aria-disabled="true"]),
  a[href],
  summary,
  label[for],
  select:not(:disabled),
  input[type="submit"]:not(:disabled),
  input[type="button"]:not(:disabled),
  input[type="reset"]:not(:disabled),
  input[type="checkbox"]:not(:disabled),
  input[type="radio"]:not(:disabled),
  input[type="color"]:not(:disabled),
  input[type="file"]:not(:disabled) {
    cursor: pointer;
  }
}
```

Utility classes (`cursor-text`, `cursor-not-allowed`, `cursor-grab`, `cursor-default`, etc.) win via higher specificity, so the base rule never overrides intentional choices.

## When to add `cursor-pointer` manually

The base rule covers native buttons, anchors with `href`, form controls, and Radix-style elements that carry an ARIA role. For **any other element made clickable via an `onClick` handler** (a `div`, `tr`, `td`, `li`, `span`, `img`, `Card`, custom wrapper, etc.), add `cursor-pointer` on the `className` explicitly:

```tsx
<TableRow className="cursor-pointer" onClick={handleClick}>...</TableRow>

<Card
  className="cursor-pointer transition-colors hover:bg-muted/50"
  onClick={onSelect}
>
  ...
</Card>

<div className="cursor-pointer" onClick={handleToggle}>...</div>
```

React's `onClick` prop does **not** emit an `onclick` HTML attribute, so a selector like `[onclick]` cannot catch these — the class is required.

Prefer semantic elements (`<button>`, `<a>`) over clickable `div`s when possible; they get the cursor for free and are accessible by default.

## When NOT to add `cursor-pointer`

Keep the correct cursor for non-pointer interactions:

| Interaction | Cursor utility |
|-------------|---------------|
| Text input fields (`<input type="text">`, `<textarea>`) | default text cursor — do nothing |
| Disabled buttons / controls | `disabled:cursor-not-allowed` (or rely on `:disabled` excluding the base rule) |
| Drag handles, sortable rows | `cursor-grab` / `active:cursor-grabbing` |
| Resize handles | `cursor-col-resize` / `cursor-row-resize` |
| Read-only / display-only content | no cursor class |

## Review checklist

When adding or reviewing UI:

- [ ] Every `onClick` on a non-button / non-link / non-role element has `cursor-pointer` in its `className`.
- [ ] Disabled states use `disabled:cursor-not-allowed` (or equivalent) when they visibly differ.
- [ ] Drag / resize / text / read-only surfaces use the correct explicit cursor.
- [ ] No element has `cursor-default` unless deliberately suppressing the pointer.
