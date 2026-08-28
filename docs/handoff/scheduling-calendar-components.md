# Scheduling calendar components — inventory and port guide

**Audience:** a coding agent with access to this repo, tasked with rebuilding the scheduling calendars in another prototype.
**Companion doc:** [prd-interview-scheduling.md](prd-interview-scheduling.md) — what these screens are *supposed* to do. This doc is about what the code currently *is* and how to move it.

**Read this before writing any code.** All four calendars are now standalone components — there are really only **three**, since the fourth was a duplicate and has been folded into #2. The set depends on CSS and date helpers that live outside the component files.

> **Changed 2026-08-28:** both outstanding refactors are done.
> #3 (the availability week grid) was extracted into
> [`availability-week-grid.tsx`](../../src/features/candidates/components/scheduling/availability-week-grid.tsx).
> #4 was deleted and folded into #2, which now drives both the candidate self-schedule page and
> the recruiter preview from one shared slot-rule module — the drift between them is fixed.
> **The port is now a straight file copy.**

---

## 1. The four calendars

| # | Calendar | File | Used by | Whose flow |
|---|---|---|---|---|
| 1 | **Stacked interviewer day grid** — one column per person, timezone hatching, event blocks | [`interviewer-calendar-grid.tsx`](../../src/features/candidates/components/scheduling/interviewer-calendar-grid.tsx) (302 ln) | Manual schedule dialog; self-schedule dialog (private preview) | Recruiter |
| 2 | **Month calendar + slot list** | [`candidate-date-slot-picker.tsx`](../../src/features/candidates/components/scheduling/candidate-date-slot-picker.tsx) (453 ln) | Recruiter preview panel **and** `/candidate-schedule-acme-ai` | Both |
| 3 | **Availability week grid** — drag / resize / move / merge | [`availability-week-grid.tsx`](../../src/features/candidates/components/scheduling/availability-week-grid.tsx) (1124 ln) | `/candidate-availability-acme-ai` | **Candidate** |
| ~~4~~ | ~~Self-schedule month grid~~ | **Deleted** — folded into #2 | — | — |

**#3 is the candidate availability flow; #2 now serves both the candidate self-schedule page and the recruiter's in-dialog preview of it.** #1 is recruiter-only.

### Port status at a glance

| # | Status | Work required |
|---|---|---|
| 1 | ✅ Standalone, fully props-driven | Copy verbatim |
| 2 | ✅ Standalone, props-driven, three export levels | Copy verbatim |
| 3 | ✅ **Extracted — standalone, props-driven** | Copy verbatim |
| ~~4~~ | ✅ Gone — consolidated into #2 | Nothing to do |

---

## 2. #1 — Stacked interviewer day grid

**Copy as-is.** No data imports; the caller supplies everything.

```
props: selectedDate, interviewers, calendarEvents?, onPrev?, onNext?, className?
imports: avatar, button, select, tooltip, cn, scheduling-types
```

Behavior worth preserving: the grid spans a full 24-hour cycle starting at 8am (so SF + Bangalore panels are visible at once), shades each person's non-business hours with a hatch pattern using their own `businessStart`/`businessEnd`, and renders events in three styles — `interview` (blue), `conflict` (red), `busy` (grey).

---

## 3. #2 — Month calendar + slot list

**Copy as-is.** Now the single implementation behind both the candidate self-schedule page and the
recruiter's "Preview as a candidate" panel.

Three levels of granularity:

| Export | What |
|---|---|
| `CandidateCalendarGrid` | Month grid alone |
| `CandidateSlotList` | Slot list alone — including multi-day options |
| `CandidateDateSlotPicker` | The two composed |

### Variant props

Added so one component can serve a 440px preview panel and a full page without a second copy:

| Prop | On | Values | Purpose |
|---|---|---|---|
| `size` | both | `sm` (default) / `md` | Preview panel vs. full page type scale and spacing |
| `navLayout` | grid | `split` (default) / `grouped` | `grouped` puts prev+next together on the left (the candidate page's arrangement) |
| `compactHeader` | grid | boolean | Hides the Today button |
| `tone` | list | `outline` (default) / `accent` | `accent` gives filled, wider slot buttons — the mobile touch affordance |
| `showHeading` | list | boolean (default true) | Suppress the day heading when the host already shows the date |
| `selectMode` | list | `direct` (default) / `confirm` | `confirm` reveals an inline **Select** button beside the tapped slot — the mobile two-tap guard |
| `hideMultiDay` | list | boolean | Mobile slot screen shows single-day options only |

The composed picker also takes `windowStart`, `windowEnd`, `generateSlots`, `initialDate`,
`initialSlot`, `onSelectionChange`, and the three `className` hooks.

## 4. #3 — Availability week grid (candidate)

**Copy as-is.** This was welded into the page; it has since been extracted into
[`availability-week-grid.tsx`](../../src/features/candidates/components/scheduling/availability-week-grid.tsx),
alongside the other reusable calendars. The page dropped from 1160 lines to 317 and is now just
branding, the 3-step flow, and the agent handoff.

This is the drag-to-paint availability grid described as F5 in the PRD.

### API

Same three-level shape as #2:

| Export | What |
|---|---|
| `useAvailabilityGrid(options?)` | All state and config |
| `AvailabilityWeekHeader` | Week title, month popover, prev / Today / next |
| `AvailabilityWeekGrid` | The grid itself |
| `AvailabilityWeekPicker` | The two composed |

Also exports the types `AvailabilitySlot`, `AvailabilityDayGroup`, `AvailabilityGridState`, and the
helpers `getMonday`, `addBusinessDays`, `dateKey`, `formatSlotForHandoff`.

Both components take `state={...}`, so the host owns the hook and can read `selections`,
`isValid`, and `groupedSelections` from it.

### Options — all formerly hardcoded

| Option | Default | Was |
|---|---|---|
| `durationMinutes` | 210 (3h30m) | `DURATION_SLOTS = 14`, module const |
| `startHour` / `endHour` | 8 / 18 | `HOURS = [8…18]`, module const |
| `windowStart` / `windowEnd` | 2 business days out, +13 days | Module consts computed at **module load** |
| `minSelections` | 2 | Hardcoded `selections.length >= 2` |
| `slotHeight` | 48 | `SLOT_HEIGHT = 48`, module const |
| `timezoneLabel` | `"PST"` | Hardcoded in the range formatter |
| `initialSelections` | `[]` | — |

The window is now computed per mount inside the hook rather than at module load, so it is
testable and overridable. Defaults reproduce the original behavior exactly — a host that passes
no options gets the same grid as before.

One latent bug was fixed in passing: the hover ghost had the label `"Available 3h 30m"`
hardcoded, so it would have lied at any other duration. It now derives from `durationSlots`.

### Behavior the component owns

Preserved verbatim from the page, and worth re-verifying after any port:

- **Snap-up:** a drag shorter than the duration expands to the full duration. A candidate cannot draw a window too short to hold the loop.
- **Merge:** two overlapping windows on the same day collapse into one.
- **Move across days:** dragging a window body relocates it to another day column.
- **Resize from either edge**, top or bottom.
- **Keyboard:** Delete/Backspace removes the selected window, Escape deselects.
- **Ghost suppression:** for ~1s after a delete, the hover preview is suppressed so the deleting click doesn't redraw a window under the cursor.
- **Clamping:** no window may extend past the end of the day; the final hour band is a hatched, unselectable tail.
- **Touch parity:** create, move, resize, and delete all work by touch.

### What stayed in the page

`step` / `note` flow state, branding, layouts, and the agent handoff. The page composes them:

```
function useAvailabilityPageState() {
  const grid = useAvailabilityGrid()
  const [step, setStep] = useState(1)
  const [note, setNote] = useState("")
  return { ...grid, step, setStep, note, setNote }
}
```

Use `formatSlotForHandoff(slot)` to render a selection as `"Wed May 27 12pm – 2pm"` — the shape
the recruiter's stage view and the AI agent consume.

## 5. #4 — Self-schedule month grid — **done, deleted**

#4 was a second implementation of #2 and has been removed. Nothing to port.

### What the drift was

The recruiter's "Preview as a candidate" panel and the real candidate page were separate code and
had diverged:

| | #4 (candidate page) | #2 (recruiter preview) |
|---|---|---|
| Slots | 9:00, 10:00, 10:30, 11:00, 11:30, 1:00, 1:30, 2:00, 2:30 | 9:00 am, 10:00 am, 1:00 pm |
| Multi-day | Yes | Supported by the component, absent from its default generator |

A recruiter checking the preview saw different times than the candidate would get.

### How it was fixed

The slot rules moved into
[`self-schedule-slots.ts`](../../src/features/candidates/components/scheduling/self-schedule-slots.ts),
which is now the single source of truth:

| Export | What |
|---|---|
| `createSelfScheduleWindow(from?)` | The bookable window — opens 2 business days out, runs 14 days |
| `isSelfScheduleDate(date, window)` | Weekday + in-window check |
| `makeSelfScheduleSlotGenerator(window)` | Returns the generator: nine weekday times, plus a multi-day option when the next day is also bookable |

`CandidateDateSlotPicker` **defaults** to these rules, so the preview and the page cannot drift
again without someone deliberately passing a different generator.

Date helpers common to both calendars moved to
[`scheduling-date-utils.ts`](../../src/features/candidates/components/scheduling/scheduling-date-utils.ts)
(`DAY_SHORT`, `DAY_LONG`, `MONTH_NAMES`, `dateKey`, `addBusinessDays`, `getCalendarGrid`) — a
separate module so the slot rules and the components can share them without importing each other.

The candidate page went from 682 lines to 502; its `CalendarGrid`, `getCalendarGrid`,
`generateSlots`, `isAvailableDate`, `addBusinessDays`, `dateKey`, and duplicated month/day
constants are all gone.

The window is now computed per mount rather than at module load — the same fix applied to #3.

### Both caveats resolved

The two things flagged as "won't fold in cleanly" were handled with variant props rather than by
keeping a bespoke screen:

- **Mobile two-tap confirm** → `selectMode="confirm"` + `onConfirmSlot`
- **Type scale / touch styling** → `size="md"` + `tone="accent"`, which reproduce the original
  mobile buttons exactly (`bg-accent`, `px-6 py-2.5`)

## 6. Shared substrate

Copying the components without this yields unstyled boxes.

**Code**

- [`scheduling-types.ts`](../../src/features/candidates/components/scheduling/scheduling-types.ts) (32 ln) — `Interviewer`, `CalendarEvent`, `InterviewSlot`, `ScheduleDateOption`
- [`scheduling-date-utils.ts`](../../src/features/candidates/components/scheduling/scheduling-date-utils.ts) (53 ln) — day/month names, `dateKey`, `addBusinessDays`, `getCalendarGrid`. **Required by #2 and #3.**
- [`self-schedule-slots.ts`](../../src/features/candidates/components/scheduling/self-schedule-slots.ts) (95 ln) — the self-schedule window and slot rules. **Required by #2.**
- [`scheduling-demo-data.ts`](../../src/features/candidates/components/scheduling/scheduling-demo-data.ts) (379 ln) — `DEMO_INTERVIEWERS`, `DEMO_SCHEDULE_DATES`, `parseTimeToHour`, `shortDate`. Needed by #1's callers, not by #1 itself.

**shadcn/ui**

```bash
npx shadcn@latest add avatar badge button calendar checkbox collapsible label popover select tooltip
```

**CSS — from [`src/index.css`](../../src/index.css), easy to forget**

| Lines | What | Why it matters |
|---|---|---|
| 258–279 | `.customer-brand` token block | The candidate pages get their entire brand palette from this. Without it they render in ATS colors. |
| 220–247 | `cand-fade-up`, `cand-slide-up`, `cand-fade-in` keyframes + classes | Step transitions on both candidate pages |
| — | `--ease-out-quint` | Referenced by all of the above |

**Assets:** `public/customer-logo.svg`, `public/scheduled.svg`

**Stack:** Tailwind v4 (`@tailwindcss/vite`, OKLCH color tokens), `react-day-picker` (for `ui/calendar`), `lucide-react`. The components use v4 syntax throughout — porting into a Tailwind v3 project means a conversion pass.

---

## 7. Recommended order

1. **Set up the substrate first** — Tailwind v4 + shadcn components, then paste the `.customer-brand` and `cand-*` CSS blocks. Do this before copying any calendar.
2. Copy the four support modules: `scheduling-types.ts`, `scheduling-date-utils.ts`, `self-schedule-slots.ts`, `scheduling-demo-data.ts`.
3. Copy the three calendars: `interviewer-calendar-grid.tsx`, `candidate-date-slot-picker.tsx`, `availability-week-grid.tsx`.
4. Render each against the demo data and work through §8.

No extraction or refactoring remains — every calendar is a standalone, props-driven component.

**Net for the candidate flows:** two calendars — the availability week grid (#3) and the
month-and-slots picker (#2).

---

## 8. Verification checklist

Port is done when:

- [ ] #1 renders a multi-person day with correct per-person business-hour hatching across two time zones
- [ ] #2 renders a month grid and slot list, including a multi-day option
- [ ] #2 at `size="md"` / `navLayout="grouped"` matches the full candidate page; at defaults it matches the recruiter preview panel
- [ ] The recruiter preview and the candidate self-schedule page show **identical slots** for the same date
- [ ] The availability grid snaps a short drag up to the full loop duration
- [ ] Two overlapping windows on one day merge into one
- [ ] A window can be moved to a different day, resized from both edges, and deleted by keyboard
- [ ] Deleting a window does not immediately draw a new one under the cursor
- [ ] Create / move / resize / delete all work by touch
- [ ] Mobile slot selection still requires the second inline **Select** tap, and mobile slot buttons keep their filled accent styling
- [ ] The mobile slot screen hides multi-day options
- [ ] Candidate pages render in the *hiring company's* brand color, not the ATS palette
