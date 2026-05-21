# Scheduling agent — tools

**Source of truth**: [`src/features/scheduling-agent/tools/handlers.ts`](../../../src/features/scheduling-agent/tools/handlers.ts) (definitions + JSON schemas live there).

All tools are **stub implementations**. The agent doesn't know they're stubs — they return realistic shapes, and side effects write to Zustand stores (`scheduling-state`, `scheduling-rules`) backed by `localStorage`. Real integrations (Slack, Gmail, Google Calendar, HackerRank) would swap the handler bodies; the schemas would stay the same.

## Identity & lookup

| Tool | Purpose | Source |
|---|---|---|
| `get_candidate_info` | Resolve a candidate by name or UUID. Returns identity, active application, current stage, stage interviews. | Supabase (`candidates`, `applications`, `req_stages`, `req_interviews`) |
| `get_stage_interviews` | Just the interviews defined for the candidate's current stage — count drives the default template choice. | Supabase |

## Slot suggestions & conflict logic

| Tool | Purpose | Source |
|---|---|---|
| `get_automatic_suggestions` | Returns ~7 slots over 5d (or 9 over 10d) with conflict info per slot. Filters out conflicts that have been pre-approved via stored rules. | Hardcoded `SLOTS_5_DAY` + `SLOTS_10_DAY_EXTRA` (synthetic calendar) |
| `get_scheduling_rules` | Read structured rules. Use BEFORE `resolve_conflict` to avoid re-asking about approved overrides. | `scheduling-rules` localStorage |
| `update_scheduling_rules` | Record `{interviewer_id, event_pattern, can_override, reason}` after a successful conflict resolution. | `scheduling-rules` localStorage |

## Outreach

| Tool | Purpose | Side effect |
|---|---|---|
| `send_scheduling_request` | Send the canonical scheduling email. Agent picks `template` (self_schedule / availability_request); system generates the body, agent does NOT draft scheduling email text. | Writes a `SchedulingRequest` to `scheduling-state.requests` → surfaces in `/candidate-email` |
| `send_scheduling_reminder` | 48-hour reminder email. | Increments `reminder_count`, updates `last_reminder_at`, status → `reminded` |
| `check_candidate_reply` | Look up whether the candidate has replied; returns parsed availability/picked-slot if any. | Read-only |
| `present_email_draft` | Show an editable email-draft card in the chat. Agent generates `body_html` itself. For non-scheduling emails only. | Adds a `chat-store` message with `email_draft` metadata |

## Interviewer coordination

| Tool | Purpose | Side effect |
|---|---|---|
| `resolve_conflict` | Slack an interviewer to ask if they can move a specific conflicting event. | Writes a `SlackDM` with `type: conflict_resolution` to `scheduling-state.slackDMs` → surfaces in `/slack-interviewer` |
| `slack_interviewer` | Ad-hoc Slack DM (not a conflict resolution). | Writes a SlackDM with `type: notification` |

## Recruiter coordination

| Tool | Purpose | Side effect |
|---|---|---|
| `notify_scheduler` | Structured notification to the recruiter (`proposal` / `stuck` / `reject_suggestion` / `info` / `approved`). | Writes BOTH a `SchedulerInboxItem` and a `SlackDM` to `scheduling-state` → surfaces in `/slack-recruiter` |
| `slack_scheduler` | Conversational ad-hoc Slack DM to the recruiter. | Writes a `SlackDM` |

## Booking

| Tool | Purpose | Side effect |
|---|---|---|
| `book_interview` | Final booking — creates the calendar event, sends invites, includes optional HackerRank link. | Writes an `InterviewBooking`; marks the request as `completed`; surfaces in `/slack-recruiter` |

## Tool design rules we learned

1. **Tool descriptions are policy.** They override the system prompt for tool-specific decisions. If you change the agent's rules, change both the system prompt and the tool descriptions. (Discovered the hard way — see DECISIONS.md.)
2. **Stub tools return realistic shapes.** They look like real API responses (status fields, IDs, timestamps). Real integrations later swap the handler body without changing the schema.
3. **Side effects go through Zustand stores.** Every tool that "sends" something writes to `scheduling-state` / `chat-store` / `scheduling-rules`. Those stores back the UI (`/candidate-email`, `/slack-*`, in-product chat) so the same data is visible everywhere the agent acted.
4. **Tool `summarize` callbacks** produce the one-line label that appears in the tool-call log card in the chat UI. Keep them short, action-past-tense, with the candidate or interviewer name.
5. **Async handlers are fine.** Use `await` for Supabase queries inside the handler. The agent runner awaits each tool result before continuing.

## Auth / environment notes

- Supabase: anon client (read-only candidate lookups). Real production would proxy through an authenticated server.
- OpenAI: dev mode calls `api.openai.com` directly from the browser with `VITE_OPENAI_API_KEY` and `dangerouslyAllowBrowser: true`. **Not for production.** Prod path is `/api/chat` (currently unused — needs tool-calling support added before re-enabling).
- No external API keys for Slack / Gmail / Calendar / HackerRank — those are all stubs.

## Adding a new tool

1. Add an entry to `schedulingTools` in `handlers.ts` with `name`, `description`, `parameters`, `handler`, optional `summarize`.
2. Update PROMPT.md (and `system-prompt.ts`) if the tool's existence changes when the agent should call other tools.
3. If the tool has a side effect on a user-visible surface, update the store schema and the corresponding rendering component.
4. Test by typing a natural-language request that should invoke it. Observe the tool-call log in the chat.
