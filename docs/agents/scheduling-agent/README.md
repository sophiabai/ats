# Scheduling agent

Canonical source-of-truth folder for the Recruiting coordination agent — the AI assistant that schedules interviews, drafts emails, and helps with general recruiter tasks inside the ATS prototype.

## Files

| File | What it is | When to read |
|---|---|---|
| [SPEC.md](SPEC.md) | What the agent does, inputs/outputs, edge cases | Start here. Anytime you need to know what's in/out of scope. |
| [PROMPT.md](PROMPT.md) | The system prompt (markdown mirror of `system-prompt.ts`) | When iterating on agent behavior / personality |
| [TOOLS.md](TOOLS.md) | All 14 tools, their purpose, side effects, design rules | When adding a new tool or debugging tool-call behavior |
| [DECISIONS.md](DECISIONS.md) | Running log of design choices and why | Before changing anything load-bearing — read the relevant entry first |

## Code

| Path | What |
|---|---|
| [`src/features/scheduling-agent/`](../../../src/features/scheduling-agent/) | All agent implementation (loop, tools, stores, hooks, components) |
| [`src/features/slack-mock/`](../../../src/features/slack-mock/) | Recruiter and interviewer Slack UIs that read agent state |
| [`src/features/scheduling/candidate-*.tsx`](../../../src/features/scheduling/) | Candidate-facing scheduling pages that write replies back |

## Demo scripts

[`docs/agent-demo-scripts.md`](../../agent-demo-scripts.md) — five staged scenarios for running this end-to-end.

## How the surfaces use this folder

- **Claude Code** opens this folder directly; iteration, debugging, refactors happen here.
- **Cowork** treats this folder as project context for end-to-end runs and scheduled tasks.
- **Chat** projects upload `SPEC.md` + `PROMPT.md` + `DECISIONS.md` for brainstorming and prompt iteration.

## Handoff discipline

- End each session by updating the relevant file (usually `DECISIONS.md` or `PROMPT.md`).
- Start each session by reading `SPEC.md` + `DECISIONS.md` — don't re-explain.
- The folder is the agent's memory. Chat threads are scratchpads.
