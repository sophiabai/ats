# Recruiting coordination agent — demo scripts

Five staged scenarios you can run end-to-end during a demo. Each takes 1–3 minutes.

## Before any demo

1. Start the dev server: `npm run dev`
2. Open **two browser tabs** side by side:
   - Tab A: `http://localhost:5174/candidates/c0000000-0000-0000-0000-000000000005` (Jordan Kim's candidate page) — the recruiter view
   - Tab B: `http://localhost:5174/candidate-email` — the candidate's Gmail inbox
3. Optional Tab C: `http://localhost:5174/slack-recruiter` — Anne's Slack
4. Optional Tab D: `http://localhost:5174/slack-interviewer` — interviewer Slack (auto-picks who has the active conflict)
5. **Reset state** before each scenario — bottom-right "Demo controls" pill → **Reset all demo data**

The floating **Demo controls** panel (bottom-right) is your time-machine. Open it once and leave it open during scenarios 2–4.

---

## Scenario 1 — Self-schedule, happy path (~90 seconds)

**Use this to open every demo.** The simplest path: agent picks the right template based on stage, sends an email, candidate picks a slot, agent books.

### Steps

1. **Tab A**: scroll to Interview stages, find **Hiring manager screen** (the current stage), click **Schedule → Schedule with AI**
2. *Watch the chat panel slide in* — agent looks up Jordan, sees 1 interview in stage, picks self-schedule, sends the email
3. **Tab B**: refresh — the agent's email is now at the top of the inbox ("Schedule your interview — Machine Learning Engineer"). Open it.
4. *Point out*: this is the same template the manual flow uses — personalized to Jordan, role pulled from his Supabase req
5. Click **Schedule your interview here >>** → existing scheduling UI
6. Pick a slot (any one) → confirmation screen
7. **Back in Tab A's chat**: type `check Jordan's reply and proceed`
8. *Watch*: agent calls `check_candidate_reply`, sees the picked slot, calls `book_interview`, calls `notify_scheduler`
9. **Optional Tab C** (`/slack-recruiter`): show the booking confirmation appearing in the Recruiting coordination agent app

### Audience callouts
- The agent decides which template to use based on stage data, not regex
- The tool call log in chat shows every action live — no black box
- Every action that "would" send an email/Slack message is captured in localStorage; the UI surfaces it across the candidate inbox, both Slack views, etc.

---

## Scenario 2 — Conflict resolution, accept path (~3 minutes)

**The showcase scenario.** Shows the full multi-party coordination: candidate, agent, interviewer, recruiter.

### Steps

1. **Reset** demo data
2. **Tab A chat**: type `send Jordan Kim an availability request` *(explicit override — agent uses availability_request even though Jordan has 1 interview in stage)*
3. *Watch*: agent sends the availability request email
4. **Demo controls** → **Active requests** → **Jordan Kim** → **Candidate replied**
5. Fill in a narrow window that forces a conflict: `Wed, May 27 12pm – 2pm PT`
6. Click **Simulate reply**
7. *Watch the chat*: agent calls `get_automatic_suggestions` with Jordan's narrow window, sees the only matching slot (Wed 1pm) has a 1-conflict with Leslie's "1:1 weekly with manager", calls `resolve_conflict`
8. **Tab D** (`/slack-interviewer`): the interviewer view shows Leslie's Slack with the conflict DM
9. *Point out*: this is what the interviewer sees — Slack DM from the Recruiting coordination agent app, with Accept / No buttons
10. **Demo controls** → **Pending conflict DMs** → **Leslie** → **Accept**
   - (Alternatively, click "Yes, I can move it" in the interviewer Slack — same effect)
11. **Tab A chat**: type `Leslie accepted — please proceed`
12. *Watch*: agent calls `update_scheduling_rules` (remembers "Leslie's 1:1 weekly is overridable"), then `book_interview`, then `notify_scheduler`
13. **Tab C** (`/slack-recruiter`): booking confirmation appears

### Audience callouts
- Recruiter's explicit instruction ("availability request") overrode the default ("1 interview → self-schedule"). System prompt + tool descriptions enforce this.
- The agent **learns** — `update_scheduling_rules` writes a structured rule to localStorage. Re-run `get_automatic_suggestions` later and the Wed slot would now be conflict-free.
- Inspect localStorage → `scheduling-rules` to show the rule shape.

---

## Scenario 3 — Conflict rejected, agent iterates (~2 minutes)

**Same as Scenario 2 but Leslie says no — the agent has to recover.**

### Steps

1. **Reset** demo data
2. **Tab A chat**: `send Jordan Kim an availability request`
3. **Demo controls** → **Jordan Kim** → **Candidate replied** with a *broader* window: `Mon, May 25 9am – 5pm PT\nTue, May 26 9am – 5pm PT`
4. **Submit** — agent finds multiple 1-conflict slots
5. *Watch*: agent picks the soonest 1-conflict (Mon 11:30am — Javier's Product Demo), sends conflict DM to Javier
6. **Demo controls** → **Javier** → **Reject**
7. **Tab A chat**: `Javier rejected — what's next?`
8. *Watch*: agent moves to the next 1-conflict option, sends another `resolve_conflict` DM (likely to Leslie for Tue 2pm)
9. **Demo controls** → accept this one
10. Chat: `Leslie accepted, proceed`
11. Agent books and notifies

### Audience callouts
- Agent doesn't give up on first rejection — it iterates through 1-conflict options
- Each interviewer rejection is captured per-DM; agent reads the state and decides
- Real production behavior: agent would auto-poll for responses. Here we simulate via Demo controls.

---

## Scenario 4 — Candidate ghosts, reject suggestion (~90 seconds)

**Shows the reminder cycle and the failure mode.**

### Steps

1. **Reset** demo data
2. **Tab A chat**: `schedule Jordan Kim`
3. *Watch*: agent sends self-schedule email
4. **Demo controls** → **Jordan Kim** → **48h passed**
5. *Watch*: agent calls `check_candidate_reply` (no reply), then `send_scheduling_reminder` — reminder count goes to 1
6. **Demo controls** → **48h passed** again
7. Agent sends reminder #2
8. **Demo controls** → **Ghosted 10d**
9. *Watch*: agent calls `notify_scheduler` with `type: reject_suggestion`, suggested reject reason: "Stopped responding"
10. **Tab C** (`/slack-recruiter`): the reject suggestion appears as a notification from the agent

### Audience callouts
- The reminder cadence is in the system prompt (48h, up to 10 days). Easy to tune.
- The agent doesn't auto-reject — it proposes, recruiter decides
- Reject reasons are surfaced as structured data, so the recruiter can act with one click in a real product

---

## Scenario 5 — Generic email drafting (~60 seconds)

**Shows the agent isn't just for scheduling — same chat handles outreach too.**

### Steps

1. **Reset** demo data
2. **Tab A chat**: `email Jane Warren about the offer letter`
3. *Watch*: agent calls `get_candidate_info` for Jane, then `present_email_draft`
4. An email draft card appears in the chat with subject + body, plus a Send button
5. *Point out*: the agent **wrote** the body — no template lookup, no hardcoded text. The HTML is structured for the existing EmailComposer.
6. Click the email card to expand and review
7. Optionally type back: `make it shorter` → agent calls `present_email_draft` again with a tighter draft

### Audience callouts
- This used to be a parallel regex-routed flow with its own `/api/draft-email` endpoint. Now it's just another tool. Adding a new capability is "add a tool + a sentence in the system prompt."
- The agent decided when to use this vs. `send_scheduling_request` based on the recruiter's wording — no routing rule needed.

---

## What to have ready

### Tabs to pre-open
| Tab | URL | What it shows |
|---|---|---|
| A | `/candidates/c0000000-0000-0000-0000-000000000005` | Jordan Kim (recruiter view) |
| B | `/candidate-email` | Candidate's fake Gmail |
| C | `/slack-recruiter` | Anne Montgomery's Slack |
| D | `/slack-interviewer` | Interviewer Slack (auto-picks who has the conflict) |

### Demo candidates that work out of the box

| Candidate ID | Name | Stage | Best for scenario |
|---|---|---|---|
| `c0000000-...0005` | Jordan Kim | Hiring manager screen (1 interview) | All five |
| `c0000000-...0026` | Jane Warren | varies | Scenario 5 (email drafting) |

Most other seeded candidates also work — agent looks them up by name from Supabase. Names that work: Emily Zhang, Jane Warren, Jordan Kim, Priya Sharma, Cameron Park.

### If something feels off mid-demo

- **Agent picks the wrong template** → quickly reset and use the explicit override phrasing ("send an availability request")
- **Tool log shows "Couldn't find <name>"** → that candidate isn't in Supabase; switch to one of the demo names above
- **Agent stops or seems stuck** → check `agent.isPending` in DevTools or just reset; rare but possible if the model returns malformed JSON
- **Candidate inbox doesn't show the agent's email** → make sure you ran the agent on the same browser/profile (state is localStorage-scoped)

---

## Closing the demo

Common ending: open localStorage → `scheduling-state` → show the audience the structured data captured during the flow (sent emails, slack DMs, bookings, scheduler inbox). This drives home "the agent isn't doing magic — every tool call is a real product surface a recruiter can audit."
