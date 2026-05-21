# Scheduling agent — decisions log

A running log of design choices made while building the Recruiting coordination agent. Format: **Decision** → **Reason** → **What we considered and rejected**. Newest at the top.

---

## Scope param on agent runs (applicationId / stageId)

**Decision**: `useSchedulingAgent.run(prompt, scope?)` accepts an optional `{candidateId, applicationId, stageId}` scope. The `Schedule with AI` button passes it; `lookupCandidateForAgent` honors it when resolving.

**Reason**: A candidate can have multiple applications. The "schedule with AI" button on a specific application's row should target THAT application, not whichever was most recently created.

**Considered**: encoding the scope into the prompt text. Rejected because the model sometimes paraphrased the IDs away. A structured side-channel is more reliable.

---

## Single unified agent loop (no regex routing)

**Decision**: Every chat message goes through one agent loop. The model decides which tool to call based on system prompt + tool descriptions. No regex layer.

**Reason**: Regex routing doesn't scale — every new phrasing requires a code change. It's also a smell ("the harness is making routing decisions the model should make").

**Considered**: Keeping `SCHEDULING_INTENT_RE` as a fallback, narrowing it to "clearly scheduling phrases". Rejected — once you have a regex layer at all, you keep extending it. Better to delete it entirely and lean on tool descriptions.

**Lost**: The `create a req with AI` chat flow (which used `/api/parse-req` + a structured form dialog). Phase 7 deliberately broke this; it could be re-added as a single agent tool later.

---

## Tool descriptions are policy, equal weight to the system prompt

**Decision**: When the agent's behavior needs to change, update both the system prompt AND the relevant tool descriptions.

**Reason**: Discovered by running the agent: the system prompt said "recruiter's explicit instruction overrides the count heuristic," but the `send_scheduling_request` tool description still read "Use `template='self_schedule'` when the stage has 1 interview…". The model anchored on the tool description and ignored the system prompt. Lesson: **tool descriptions feel like documentation but are load-bearing prompt instructions**.

---

## Explicit user intent always overrides default heuristics

**Decision**: When the recruiter says "send an availability request to X," the agent uses `template='availability_request'` regardless of how many interviews are in X's stage.

**Reason**: A designer (the user) felt the agent doing the "right thing per the spec" but the wrong thing per their intent. The system prompt now front-loads the intent check; the count rule is explicitly labeled a "fallback heuristic, not a hard constraint."

**Considered**: keeping the count rule strict for consistency. Rejected — the recruiter is in charge; the agent is an assistant, not a policy enforcer.

---

## Agent emits no preambles

**Decision**: System prompt instructs the agent to never write "I'll proceed by…", "Let me check…", etc. Just call the first tool.

**Reason**: First demo run, the model said "Here's a draft for the availability request email for Jordan Kim:" and then stopped without calling any tools. The loop saw zero tool calls and exited. Classic GPT-4o failure mode.

**Considered**: Forcing `tool_choice: "required"`. Rejected because sometimes the agent legitimately needs to ask a clarifying question (not call a tool). Prompt-level guidance is more flexible.

---

## Canonical email templates rendered by the system, not the agent

**Decision**: `send_scheduling_request` takes only `candidate_id` and `template`. The system generates the subject and body. The agent does NOT draft scheduling email text.

**Reason**: The visual style of the email (used in the candidate inbox) needs to match the existing manual flow exactly. Letting the agent draft HTML created visual drift across runs.

**Tradeoff**: The agent loses creative control over scheduling emails. But the user controls the wording by editing the template, and the agent still drafts non-scheduling emails freely (`present_email_draft`). This split feels right.

---

## Non-scheduling emails: agent drafts HTML inline

**Decision**: `present_email_draft` takes `body_html` as an arg. The agent generates the HTML itself based on the recruiter's intent.

**Reason**: For arbitrary outreach (offer letters, rejections, follow-ups), there is no canonical template. The agent has to write. This matches Cursor / Claude Code patterns where the model produces content and tools just render it.

---

## All agent activity persists to localStorage

**Decision**: `scheduling-state` and `scheduling-rules` are Zustand stores with the `persist` middleware → survives page reload.

**Reason**: Demos run across multiple tabs (recruiter view, candidate inbox, two Slack views). State has to be shared. localStorage is the simplest cross-tab sync that works without a backend.

**Tradeoff**: State doesn't survive `npm run dev` restart in a different browser profile. Fine for prototype; later migration to Supabase is straightforward — same store shapes.

---

## Supabase for candidate identity, hardcoded stubs for everything else

**Decision**: `get_candidate_info` / `get_stage_interviews` query Supabase. Calendar conflicts, slot suggestions, interviewer directory, Slack DMs, sent emails — all stubbed.

**Reason**: Hardcoded candidates created a "two worlds" problem — the screen showed Jordan from Supabase but the agent only knew about hardcoded Priya/Andy. Migrating candidate lookup to Supabase fixed the coherence. The other integrations don't have a real source (no Slack workspace, no Google Calendar), so they stay stubbed.

---

## Two Slack URLs, not a viewer toggle

**Decision**: `/slack-recruiter` and `/slack-interviewer` are separate routes. No in-app viewer switcher.

**Reason**: For the conflict-resolution demo, you need both Slack views visible side-by-side (recruiter sees the proposal, interviewer sees the conflict DM). A toggle would force the demoer to context-switch mid-flow.

**Considered**: One route with `?as=<user>` query param. Workable, but separate URLs let you open them in different browser windows with persistent positioning.

---

## Scenario panel uses discrete time-travel buttons

**Decision**: A floating "Demo controls" panel offers `48h passed` / `Candidate replied` / `Ghosted 10d` / `Accept conflict` / `Reject conflict` buttons.

**Reason**: Demo audiences don't watch 48 hours pass. They watch what the agent does AT key moments. Discrete buttons let the demoer trigger each moment reliably and reproducibly.

**Considered**: Real timers (compressed time, e.g., "48h" = 30 seconds). Rejected — adds spinners to the demo, harder to replay specific moments.

---

## Scenario buttons fire the agent with `[Simulation: ...]` prefixes

**Decision**: When the user clicks "48h passed," the agent runs with a message like `[Simulation: 48 hours have passed since you sent the availability_request to Jane Warren.] Check whether they've replied; if not, send the next reminder...`

**Reason**: The bracket convention signals to the model that the prefix is a system-injected fact, not user instruction. Reliable across runs. The trailing imperative tells the agent what to do.

**Considered**: Just setting state and asking the user to type "check the reply" themselves. Rejected — too many steps for a demo flow.

---

## Reset action in two places

**Decision**: `Reset demo data` exists in the user-menu dropdown AND in the scenario panel.

**Reason**: Both are reachable from any page, but the user menu is easy to discover and the scenario panel is fast during a demo (it's already open).

---

## Mini-harness from scratch instead of extending existing chat handlers

**Decision** (early, Phase 1): Built a new `scheduling-agent` feature folder with its own agent loop, instead of extending the existing `useEmailIntent` / `useParseRequisition` parallel-handler architecture.

**Reason**: The existing chat had regex-routed handlers and no agent loop. Bolting tool-calling onto that architecture would have been more code than starting clean. The mini-harness pattern (one agent, all tools, one prompt) is what production agents look like.

**Later** (Phase 7): unified everything into this loop and deleted the parallel handlers. The early "build alongside" decision turned out to be the right move — the parallel architecture wasn't worth saving.

---

## Stub the candidate-side first, real integrations later

**Decision**: The candidate-facing scheduling pages (`/candidate-availability-acme-ai`, `/candidate-schedule-acme-ai`) write back to `scheduling-state` when the candidate submits. The agent reads from that store via `check_candidate_reply`.

**Reason**: This closes the demo loop entirely with localStorage — no email replies, no calendar webhooks, no async polling. Demos work end-to-end in one browser.

---

## The lessons that generalize beyond this agent

1. **Tool descriptions are part of the policy surface.** Treat them like prompt text, not docstrings.
2. **Defaults vs. overrides matter.** Hard rules in prompts can override user intent in unwanted ways. Reframe defaults as "fallback when not specified."
3. **The model is the router; don't put intent detection in the harness.** Regex layers don't scale and they smell.
4. **State is the contract between the agent and the UI.** Once the agent writes to a store, every surface that reads that store is part of the demo loop "for free."
5. **Scenario triggers > timers** for demos. Specific moments, not waiting.
6. **Designers should feel the model's behavior on their own task.** A mini-harness with your own tools and your own prompt is the only way to develop intuition that transfers to real product decisions.
