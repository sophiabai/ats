# Scheduling agent — SPEC

The Recruiting coordination agent is an AI assistant embedded in an Applicant Tracking System (ATS). It helps recruiters coordinate interviews end-to-end and drafts non-scheduling outreach.

## Purpose

Replace the manual workflow where a recruiter:
1. Picks an outreach mode (self-schedule vs request availability)
2. Drafts emails to candidates
3. Sends reminders when the candidate goes quiet
4. Resolves calendar conflicts with interviewers over Slack
5. Books interviews once everyone agrees
6. Drafts other outreach (offer letters, rejections, follow-ups)

…with one chat where the recruiter describes intent in natural language and the agent executes.

## Capabilities

### Skill 1 — Send scheduling request
Trigger: a candidate enters a schedule-able stage, OR the recruiter asks to schedule.

1. Decide template (`self_schedule` or `availability_request`):
   - **Recruiter's explicit instruction wins.** ("Send an availability request to X" → availability_request, regardless of stage).
   - **Fallback heuristic** when not specified: 1 interview in stage → self_schedule, >1 → availability_request.
2. Fetch suggested slots for the next 5 days (expanded to 10 if too few). Apply stored scheduling rules (interviewer-approved overrides).
3. Send the scheduling email via the canonical template — system generates the body, agent does not draft scheduling email text.
4. Reminder cycle: 48h with no reply → reminder; repeat to 10 days; then propose reject.

### Skill 2 — Schedule candidate after reply
Trigger: candidate replied (picked a slot or sent availability windows).

1. If self-schedule: slot is already chosen → propose to scheduler.
2. If availability request:
   a. Get suggestions matched to candidate's stated availability.
   b. Take the soonest conflict-free option; else take soonest 1-conflict option.
   c. For each conflict, Slack the interviewer with accept/reject. If accepted, optionally promote to a rule. If rejected, iterate.
3. Notify the scheduler with the proposed schedule; on approval, book.

### Capability 2 — Draft non-scheduling emails
Trigger: recruiter asks the agent to email a candidate for any reason that isn't scheduling (offer, rejection, follow-up).

1. Look up candidate.
2. Agent drafts body HTML inline (warm, brief, professional).
3. Present an editable email-draft card in the chat for the recruiter to review and send.

### Capability 3 — General recruiting assistance
Conversational answers grounded in ATS data (candidate lookups, stage info, pipeline questions). No tools needed when a direct answer suffices.

## Inputs

| Input | Source |
|---|---|
| Recruiter chat messages | AI chat panel (in-product) |
| Candidate identity | Supabase `candidates` table |
| Pipeline state | Supabase `applications`, `req_stages`, `req_interviews` |
| Calendar / conflict data | Synthetic hardcoded slots (no real calendar integration) |
| Candidate replies | Candidate-facing scheduling pages write back to `scheduling-state` localStorage |
| Interviewer Slack responses | Mock Slack UI buttons mutate `scheduling-state.slackDMs` |
| Scope context (optional) | `applicationId` / `stageId` passed when triggered from a candidate page |

## Outputs

| Output | Destination |
|---|---|
| Scheduling request emails | `scheduling-state.requests` → rendered in `/candidate-email` inbox |
| Reminder emails | Same as above |
| Interviewer conflict DMs | `scheduling-state.slackDMs` → rendered in `/slack-interviewer` |
| Recruiter notifications | `scheduling-state.schedulerInbox` + DM to scheduler → rendered in `/slack-recruiter` |
| Bookings | `scheduling-state.bookings` (with synthetic event_id, video_link, optional HackerRank link) |
| Scheduling rules | `scheduling-rules` localStorage (structured `{interviewer_id, event_pattern, can_override, reason}`) |
| Non-scheduling email drafts | `chat-store` message with `email_draft` metadata → rendered as `EmailDraftCard` |

## Edge cases

| Scenario | Behavior |
|---|---|
| Candidate ghosts ≥10 days | Notify scheduler with `reject_suggestion`, reason "Stopped responding" |
| No conflict-free or 1-conflict slot fits candidate's availability | Notify scheduler, propose alternative dates |
| All conflicts rejected by interviewers | Notify scheduler for manual resolution |
| Candidate rejects proposed schedule | Restart Skill 2 with their stated availability, or Skill 1 if none provided |
| Candidate not found in Supabase | Surface the error in chat; do not invent data |
| Two outstanding requests for same candidate | `send_scheduling_request` errors; agent must cancel/complete the old one first |

## Non-goals

- Real Gmail / Google Calendar / Slack / HackerRank integration (everything is stubbed)
- Multi-candidate batch scheduling
- Cross-tenant data (single-workspace assumption)
- Offer letter generation with structured comp fields (just free-text emails for now)

## Trigger surfaces

| Surface | How |
|---|---|
| AI chat panel (docked or full) | Natural language message → agent loop |
| `Schedule with AI` button on candidate detail page | Sends pre-filled prompt with candidate name + stage |
| Scenario panel (`Demo controls`) | Time-travel buttons fire the agent with `[Simulation: ...]` prefixes |

## Surfaces the agent reads back from

- `/candidate-email` — candidate's fake Gmail (writes `candidate_reply`, `candidate_availability`, `candidate_picked_slot` to `scheduling-state`)
- `/slack-interviewer` — Accept/Reject buttons mutate `slackDM.status` + `.reply`
- `/slack-recruiter` — composer messages re-fire the agent
