# Handoff — interview scheduling

Everything needed to rebuild the interview scheduling feature set in another prototype. Written for a coding agent picking this up cold.

## Start here

| Doc | What it is | Read it when |
|---|---|---|
| [prd-interview-scheduling.md](prd-interview-scheduling.md) | **Product requirements.** All 12 features (F1–F12) across recruiter, candidate, interviewer, and AI-agent surfaces. Behavior, copy, defaults, edge cases, acceptance criteria. No implementation detail. | You are building the feature from scratch, or need to know what a screen is supposed to do |
| [scheduling-calendar-components.md](scheduling-calendar-components.md) | **Component inventory and port guide.** The four calendars, exact file paths and line ranges, what's reusable vs. welded into pages, shared CSS/asset dependencies, recommended order, verification checklist. | You are moving the existing calendar code into another repo |

The two are complementary: the PRD says what to build, the port guide says what already exists and how to lift it.

## Suggested reading order

1. **PRD §1–3** — goals, personas, the feature map. Ten minutes, and everything else makes sense afterward.
2. **PRD Part B (§8–11)** — the candidate experience, if that's your scope.
3. **Port guide §1** — the calendar inventory. Three standalone components, all ready to copy.
4. **Port guide §6–7** — substrate and order of operations.

## Things that will bite you

Both documented in detail, flagged here because they're easy to miss:

- **The candidate pages get their entire brand palette from a CSS block outside the component files** (`.customer-brand` in `src/index.css`). Copy the components without it and they render in ATS colors.
- **The recruiter's "Preview as a candidate" panel and the real candidate page used to be two separate implementations and had drifted** — different slot sets for the same date. They now share one slot-rule module, so the preview is guaranteed accurate. Keep it that way: change slot rules in `self-schedule-slots.ts`, never in a host.

## Related context in this repo

Not part of the handoff, but useful background:

| Path | What |
|---|---|
| [`docs/agents/scheduling-agent/`](../agents/scheduling-agent/) | The AI agent's own spec, system prompt, tool list, and a decisions log. **The decisions log is worth reading** — it records *why* several agent rules exist, including why the agent deliberately does not draft scheduling email copy. |
| [`docs/agent-demo-scripts.md`](../agent-demo-scripts.md) | Five staged end-to-end demo scenarios |
| [`docs/blog/interview-scheduling.md`](../blog/interview-scheduling.md) | Narrative writeup of the two scheduling paths and why both exist |

## Open questions

The PRD closes with ten open questions (§18) — six candidate-side, four recruiter-side. Several are visible controls with no flow behind them (self-schedule's "Suggest time", the language selector, reschedule/cancel). Worth resolving with the product owner before building those surfaces rather than inferring an answer.
