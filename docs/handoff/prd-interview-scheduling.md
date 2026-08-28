# PRD — Interview Scheduling

**Product:** ACME AI Applicant Tracking System (ATS)
**Scope:** Everything related to getting a candidate from "ready to interview" to a confirmed, booked interview — recruiter flows, candidate flows, interviewer flows, and the AI scheduling agent.
**Status:** Specification for a rebuild. This document describes required behavior only; implementation approach is left to the builder.

---

## 1. Background and goals

Scheduling an interview loop is one of the most painful parts of recruiting. A single onsite can involve four or five interviewers across time zones, back-to-back sessions, room bookings, and a candidate whose availability arrives as unstructured prose ("I'm free Tue 2–4, Wed morning, or late Thursday"). Recruiters end up doing calendar math by hand and chasing people over Slack and email.

The candidate side is just as bad. The candidate is usually employed, interviewing at several companies, and receiving scheduling emails that ask them to write out their availability in prose — which then gets misread, forcing another round trip. Every extra round trip is a chance to lose them.

**Primary goal:** get from "ready to interview" to a confirmed schedule in as few steps as possible, for both sides, without taking judgment away from the recruiter.

**Design principles**

1. **The recruiter is in charge.** Software does the calendar math and the chasing; the recruiter approves the outcome. Automation proposes, humans decide.
2. **Ask the candidate once, in structured form.** Never ask a candidate to describe availability in prose. Every candidate response must come back as data the system can reconcile automatically.
3. **The candidate never sees the ATS.** Candidate pages are public, unauthenticated, mobile-first, and branded to the *hiring company* — not to the ATS vendor.
4. **A candidate cannot make an invalid choice.** The candidate-facing surfaces constrain input so that anything submittable is actually schedulable.

**Success criteria**

| Criterion | Target |
|---|---|
| Recruiter effort to send a scheduling request | Under 60 seconds, one dialog |
| Candidate effort to respond | One screen, no prose, no back-and-forth |
| Candidate response is machine-readable | 100% — structured windows or a picked slot, never free text |
| Availability reconciliation | Automatic — recruiter never manually compares calendars |
| Recruiter visibility into automated actions | Every action visible and auditable; no black box |
| Interviewer conflict resolution | Handled in Slack, without the recruiter mediating |

---

## 2. Users and surfaces

| Persona | Who | Where they work |
|---|---|---|
| **Recruiter / scheduler** | Owns the pipeline, decides who gets scheduled and when. Named "Anne Montgomery" in demo data. | ATS candidate page, AI chat panel, Slack |
| **Candidate** | Employed, busy, interviewing elsewhere. Receives an email, responds on a public web page, often on a phone. Never logs into the ATS and never creates an account. | Email inbox → public scheduling link |
| **Interviewer** | Sits on the interview panel. Only involved when there is a calendar conflict on their side. | Slack |

**Surfaces to build**

1. **ATS candidate detail page** — the recruiter's launch point for all scheduling.
2. **Three recruiter dialogs** — Manual schedule, Request availability, Candidate self-schedule.
3. **Two public candidate pages** — an availability picker and a slot picker. No app shell, no login, company-branded, desktop and mobile layouts.
4. **A candidate email inbox mockup** — a fake Gmail where the candidate sees and opens the emails the system sent, with working links.
5. **AI chat panel** — docked and full-screen; where the scheduling agent runs.
6. **Two Slack mockups** — one for the recruiter, one for interviewers.
7. **A demo control panel** — time-travel simulation for demos (see §14).

---

## 3. Feature overview

| # | Feature | Actor | Summary |
|---|---|---|---|
| F1 | Scheduling entry points and status | Recruiter | A per-stage "Schedule" menu with four options; stage shows scheduling status |
| F2 | Manual schedule (3-step wizard) | Recruiter | Pick ranked date option → confirm session details → send confirmation |
| F3 | Request availability | Recruiter | Set loop rules, send a pre-filled email with a candidate link |
| F4 | Candidate self-schedule setup | Recruiter | Set loop rules, preview the candidate experience, send a self-schedule link |
| **F5** | **Candidate availability page** | **Candidate** | **Drag windows on a week calendar, add a note, submit** |
| **F6** | **Candidate self-schedule page** | **Candidate** | **Pick a date and time slot, add a note, confirm** |
| **F7** | **Candidate email inbox** | **Candidate** | **Fake Gmail showing sent scheduling emails with working links** |
| F8 | Email templates | Recruiter | Five canonical templates with editable variable chips |
| F9 | AI scheduling agent | Recruiter | Natural-language scheduling, end to end, with visible actions |
| F10 | Interviewer conflict resolution | Interviewer | Slack DM with accept/reject; agent learns from the answer |
| F11 | Recruiter notifications | Recruiter | Slack DMs and an inbox from the agent — proposals, blockers, bookings |
| F12 | Demo controls | Demoer | Time-travel buttons to simulate replies, reminders, ghosting, conflicts |

---

## 4. F1 — Scheduling entry points and status

### Where scheduling starts

The candidate detail page shows the candidate's application as a pipeline of **milestones** (Application, Screen, Final interview, Offer, Offer accepted), each containing **stages** (e.g. "Recruiter screen", "Hiring manager screen", "Onsite"). Each stage contains one or more **interviews** (e.g. "System Design", 60 min, Jerome Bell).

On the **current stage** of an **active** application, when not every interview in that stage is already scheduled, show a **Schedule** button that opens a menu with exactly four options, in this order:

1. **Schedule with AI** (marked with a sparkle icon) — hands the stage to the AI agent (F9)
2. **Schedule** — opens the manual 3-step wizard (F2)
3. **Request availability** — opens the availability request dialog (F3)
4. **Candidate self-schedule** — opens the self-schedule setup dialog (F4)

The menu must not appear on past or upcoming stages, on closed applications, or once all interviews in the stage are scheduled.

### Scheduling status

Each application shows one of three scheduling statuses, as a colored badge and as inline state on the current stage:

| Status | Label | Color | Meaning |
|---|---|---|---|
| `to_be_scheduled` | To be scheduled | neutral | Nothing sent yet |
| `pending_availability` | Pending candidate availability | amber | Request sent, no reply yet |
| `availability_received` | Availability received | green | Candidate responded |

**Pending state** shows the send date and an overflow menu with **Copy availability link** and **Resend**.

**Received state** shows the received date and is **expandable** — expanding reveals the candidate's submitted windows grouped by day (e.g. "Tue, May 6 → 10:00 AM – 1:30 PM, 2:00 PM – 5:30 PM"). Two quick actions sit next to it: **Copy availabilities** and **Request new availability**.

Sending any scheduling request moves the status to pending. A candidate response moves it to received.

### Scheduled interviews

Once an interview is scheduled, its row in the stage shows the scheduled date and time, and its overflow menu offers **Add note**, **Reschedule interview**, and **Cancel interview**.

---

## 5. F2 — Manual schedule (3-step wizard)

A full-screen dialog titled *"Scheduling interview for {candidate} — {role}"*. Three steps, with a persistent footer showing Back/Cancel on the left and the forward action on the right.

### Step 1 of 3: Find a time

**Left panel (fixed width, ~460px, muted background):** a scrollable list of **date options**, each a card showing:

- The full date ("Monday, May 5, 2025")
- Every session in the loop, with time range, session title, participant badges, and room badge
- A participant badge turns red and appends "(Conflict)" when that interviewer has a calendar conflict
- A **Select** button, which becomes a "Selected" badge on the chosen card

Above the list: a **Sort by: Best fit** control and a **Preference** button. Best fit ranks options by fewest conflicts, tightest loop, and fewest context switches for interviewers.

**Right panel (fills remaining width):** a **stacked interviewer calendar** for the selected date:

- One column per person, including a column for the candidate
- Each column header shows avatar, name, location, and time zone
- Hours run as a vertical axis; the grid spans a full 24-hour cycle starting at 8am so that cross-time-zone panels (e.g. San Francisco + Bangalore) are visible in one view
- Hours outside a person's local business hours are shaded with a hatch pattern; business hours are configurable per person (the Bangalore interviewers use a different window than the SF ones)
- Events render as blocks in three visual styles: **interview** (blue), **conflict** (red), **busy** (grey)
- Previous/next arrows step through date options and scroll the matching card into view on the left

**Footer:** Cancel · **Next: Confirm details**

### Step 2 of 3: Confirm details

**Left panel:** an **Add to calendar** selector (Recruiting / Personal / Team), then an editable **interview plan** — one card per session, each allowing edits to:

- Start time (dropdown of times)
- Duration (15 / 30 / 45 / 60 / 90 min)
- Room
- Participants

**Right panel:** the same stacked calendar, live-updating as sessions are edited — moving a session in the plan moves its block on every affected calendar column.

**Footer:** Back · **Next: Send confirmation**

### Step 3 of 3: Send confirmation

Full-width, centered. Shows the **email composer** (F8) pre-loaded with the **Interview confirmation** template, addressed to the candidate, with the job title, company, and recruiter name filled in.

**Footer:** Back · a **split button**:
- Primary action: **Schedule and send** → books the interviews and sends the confirmation. Success message: "Interview scheduled and confirmation sent."
- Secondary action in the dropdown: **Schedule now and send message later**

On completion, the dialog closes and each scheduled session appears on the candidate's stage with its date and time.

---

## 6. F3 — Request availability

A full-screen dialog titled *"Request availability from {candidate} — {role}"*, split into two columns.

**Left — Request details.** A **schedule details form** (shared with F4) with these fields:

| Field | Options | Default |
|---|---|---|
| Interview duration | 1h, 1h30, 2h, 2h30, 3h, 3h15, 4h (total loop length) | 3h 15m |
| Share availability window | Next 1 / 2 / 3 / 4 calendar weeks | 2 weeks |
| Start time | 7, 8, 9, 10 AM | 8:00 AM |
| End time | 4, 5, 6, 7 PM | 5:00 PM |
| Timezone | LA / New York / Chicago / London / Kolkata | America/Los Angeles |
| Minimum time slots to share | 1–5 | 2 |
| Minimum days to share | 1–5 | 2 |

These settings are the contract for F5: the duration determines the minimum window the candidate can draw, the window determines which dates are selectable, the start/end times determine the grid bounds, and the minimums determine when the candidate's Continue button unlocks.

**Right — Request email.** The email composer (F8) pre-loaded with the **Request availability default** template. The email contains a locked, non-editable block reading *"Enter your availability here >>"* with the helper text *"Send the email to generate the scheduling link. (Only visible to you)"* — the link is generated at send time, so the recruiter cannot break it by editing.

**Footer:** Cancel · **Send** (split button). Sending moves the application to `pending_availability`.

---

## 7. F4 — Candidate self-schedule setup

A full-screen dialog titled *"Candidate self-schedule for {candidate} — {role}"*, split 50/50.

**Left column (muted background), two sections:**

1. **Schedule details** — the same form as F3, plus three extra controls that only appear here:
   - **Add break between interviews**: 0 / 5 / 10 / 15 / 30 min
   - Checkbox: **Ignore order of interviews**
   - Checkbox: **Ignore interviewers' daily and weekly interview limit**

2. **Interview plan** — subtitle shows the computed total duration ("Interview duration: 3 hours 15 minutes", recalculated live). One card per session, each **editable** (duration, room, participants) and **reorderable by drag**. Date/time controls are hidden here, because the candidate chooses the date.

**Right column (card background), two sections:**

1. **Preview as a candidate** — a live, embedded replica of exactly what the candidate will see in F6: a compact month calendar beside a list of time slots. A header shows **Total day slots** and **Total time slots** counts, a refresh control, and a display-timezone selector. This must be the same component the candidate sees, not a lookalike, so the two can never drift.

2. **Schedule details (Candidate won't see this)** — the recruiter's private sanity check. When the recruiter clicks a date and time in the preview above, this panel shows **the exact loop the candidate would land on** for that choice: every session shifted so the loop starts at the picked time, on the picked date. Toggle between **list view** (the option card from F2) and **calendar view** (the stacked interviewer calendar from F2). Before a selection is made it shows: *"Select a date and time above to preview the schedule the candidate would land on."*

**Footer:** Cancel · **Send self-schedule link**. Sending moves the application to `pending_availability`.

---

# Part B — The candidate experience

## 8. Candidate journey and shared rules

### 8.1 The two journeys

Everything the candidate sees is one of two paths, decided by the recruiter (or by the agent) when the request is sent.

**Path A — Availability request** (used when the loop is long or multi-session, or when the recruiter explicitly asks for it):

```
Email lands in candidate's inbox
  → opens email, sees role + loop breakdown + duration
  → clicks "Enter your availability here >>"
  → lands on the availability page (F5)
  → paints time windows on a week grid          [Step 1]
  → optionally writes a note to the recruiter   [Step 2]
  → sees confirmation of what they submitted    [Step 3]
  → may return and update until the interview is scheduled
```

**Path B — Self-schedule** (used when the loop is a single interview, or when the recruiter explicitly asks for it):

```
Email lands in candidate's inbox
  → opens email, sees role + loop breakdown + duration
  → clicks "Schedule your interview here >>"
  → lands on the self-schedule page (F6)
  → picks a date, then a time slot              [Step 1]
  → optionally writes a note to the recruiter   [Step 2]
  → sees "Your interview is scheduled!"         [Step 3]
  → may reschedule or cancel from that screen
```

The difference in outcome matters: **Path A ends in a promise** ("you'll get a confirmation once your meeting is scheduled"), because the recruiter still has to reconcile against interviewer calendars. **Path B ends in a booking** ("you will get an email confirmation with a calendar invite"), because the slot was already known to be free.

### 8.2 Rules that apply to every candidate page

These are requirements for both F5 and F6.

**Identity and access**
- Public and unauthenticated. No login, no account creation, no password.
- The link identifies which request it belongs to, so the page knows the candidate's name, the role, and the loop.
- Opening the page must work from an email client, on any device, in a fresh browser with no prior session.
- The candidate's first name is used throughout ("Hi Jordan,"). If the name is unavailable, fall back gracefully to a neutral greeting rather than showing an empty slot or a placeholder.

**Branding**
- Styled as the **hiring company**, not the ATS: company logo, the company's primary color, a decorative branded background. The candidate should not be able to tell which ATS is behind it.

**The persistent summary panel (desktop)**
A fixed left panel, present through the picking step, showing:
- The company logo
- "Hi {first name}," followed by the headline — *"Share your availability to meet with {Company}"* (F5) or *"Schedule your interview with {Company}"* (F6)
- Three facts, each with an icon: **Duration** (e.g. "3 hours 30 minutes"), **Display time zone** (e.g. "Pacific Daylight Time"), **Display language** (e.g. "EN (US)")
- Time zone and language are presented as changeable

**The same three facts on mobile** collapse into a compact row of colored pills: duration, time zone, language.

**Step 2 — the optional note (identical on both paths)**
- Heading: *"Add an optional note to the recruiter"*
- A single free-text area, and nothing else
- **The primary button changes with the field's content:** empty → a de-emphasized *"Skip and {action}"*; non-empty → a solid *"{action}"*. The candidate is never blocked here and never has to think about whether the note is required.
- A Back button returns to the picking step with the selection intact

**Responsive behavior**
- Desktop: a split layout — summary panel beside the picking surface — with a fixed bottom action bar.
- Mobile: the same steps as full-screen sequential screens, each with a back chevron in the header, a full-width primary button, and the info pills under the heading. The page forces a white background and light theme color on mobile so it renders correctly in email-client in-app browsers.
- The breakpoint is a single narrow-viewport switch; there is no third tablet layout.

**Motion.** Steps fade and slide in; the bottom bar slides up. Movement should be quick and subtle — this is a form, not a presentation.

**Submission.** Submitting records the candidate's answer against the originating request, marks the request as replied, and flips the recruiter's view to `availability_received`. Submission must happen exactly once even if the confirmation screen re-renders.

---

## 9. F5 — Candidate availability page

The candidate paints the times they're free onto a week grid. This is the flow that replaces "I'm free Tuesday afternoon and maybe Thursday."

### Step 1 — The availability grid

**Grid shape**
- Columns: **Monday–Friday only**. Weekends are never shown as selectable.
- Rows: **8am–6pm** in **15-minute** increments.
- Selectable date range: starts **2 business days from today** and runs **14 days**. Anything outside is disabled and visibly inert.
- Week navigation with previous/next controls, plus a month-calendar popover for jumping to a specific week. Weeks outside the allowed range cannot be navigated into.

**Creating a window**
- **Drag vertically** on a day column to create an availability window.
- **A drag shorter than the required interview duration automatically snaps up to that duration.** The candidate physically cannot draw a window too short to hold the loop. (With a 3h30m loop, a 30-minute drag becomes a 3h30m window.)
- A window can never extend past the end of the day.
- While dragging, a live preview of the window renders under the cursor.

**Editing a window**
- **Drag the body** to move it — including onto a different day.
- **Drag either edge** to resize from the top or the bottom.
- **Click to select**; then **Delete** or **Backspace** removes it, and **Escape** deselects.
- A per-window delete control is also available for pointer and touch users.
- **Two windows that overlap on the same day merge into one automatically.** The candidate never ends up with a stack of duplicate or nested windows.
- Immediately after a delete, suppress the hover "ghost" preview briefly, so the click that deleted a window doesn't instantly draw a new one under the cursor.

**Labeling.** Each window shows "Available" and its duration.

**Validation.** The candidate must have **at least 2 windows** before continuing. While below the minimum, the Continue button is disabled and a badge explains why: *"Select at least 2 time slots to continue."* The requirement is stated up front, not surfaced as an error after a failed attempt.

**Touch support.** Create, move, resize, and delete must all work by touch, not only by mouse.

### Step 2 — Optional note

As described in §8.2. Submit label: **Submit**; skip label: **Skip and submit**.

### Step 3 — Confirmation

- An illustration, then the heading **"Thanks for sharing your availability!"**
- Body: *"You will get a confirmation once your meeting is scheduled. Looking forward to meeting with you!"*
- A read-back of every submitted window, grouped by day, in the same day-then-ranges shape the recruiter sees
- Footnotes: *"All times displayed in America/Los_Angeles."* and *"You can update your availability until the interview is scheduled."*
- An **Update availability** button that returns to Step 1 with the previous selection intact

**The promise made here is binding on the rest of the system:** the candidate is told they may update their availability until the interview is scheduled, so returning to the link must remain possible while the request is open.

### How the answer reaches the recruiter

Each window is submitted as a structured, human-readable range — day, start, end (e.g. "Wed May 27 12pm – 2pm") — one per window, plus the optional note. This is what the recruiter's stage view lists, and what the AI agent reconciles against interviewer calendars. **It is never free-text prose.**

---

## 10. F6 — Candidate self-schedule page

The candidate picks a specific slot and the loop books itself.

### Step 1 — Pick a date and a time

**Left — month calendar.**
- Weekends and dates outside the allowed window are disabled.
- Month navigation forward and back.
- The available window starts a fixed number of business days out, same as F5.

**Right — time slots for the selected date.**
- Before a date is chosen: *"Select a date to see available times"*.
- After: a heading with the chosen weekday and date, then the slots as a vertical list of buttons; the chosen one is filled with the brand color.
- Typical slots: 9:00am, then 10:00–11:30am and 1:00–2:30pm in half-hour steps.

**Multi-day options.** When the following day is also available, the list may include a **multi-day option** — a single choice that splits the loop across two days. It renders under the label *"Multi-day options starting on this day"* and shows both days explicitly:

```
Day 1: Mon, May 5     Day 2: Tue, May 6
9:00 am - 10:00 am    9:00 am - 10:30 am
11:00 am - 12:00 pm
```

Selecting it selects the whole two-day arrangement, not an individual range within it.

**Escape hatch.** The bottom bar carries *"None of these work?"* with a **Suggest time** action, so a candidate who can't use any offered slot has a path forward instead of abandoning the page or replying by email.

**Continue** is disabled until a slot is selected.

### Step 2 — Optional note

As described in §8.2. Submit label: **Schedule**; skip label: **Skip and schedule**. On mobile, the note screen's subtitle repeats the chosen date and time, so the candidate confirms what they're about to book without going back.

### Step 3 — Confirmation

- An illustration, then the heading **"Your interview is scheduled!"**
- Body: *"You will get an email confirmation with a calendar invite. Looking forward to meeting with you!"*
- The booked details, grouped by day (multi-day bookings show both days)
- Footnote: *"All times displayed in America/Los_Angeles."*
- Two actions: **Reschedule** and **Cancel interview**

### Mobile flow

Four sequential screens rather than three: **calendar → time slots → note → confirmation**. Tapping a date advances straight to the slot list. In the slot list, tapping a slot reveals an inline **Select** button next to it, which advances — a two-tap confirm that prevents mis-taps on a small target from booking an interview.

---

## 11. F7 — Candidate email inbox

A convincing Gmail replica at a public route. This is a **demo surface**, not a product surface, but it must be faithful enough to demo with: it is how anyone watching sees that the candidate's side of the loop actually closes.

**Chrome.** Gmail-style top bar (menu, "Gmail" wordmark, search field, help/settings, avatar), a left sidebar with Compose and the standard labels (Inbox, Starred, Snoozed, Sent, Drafts) with an unread count on Inbox, and a message list.

**Contents.** The inbox mixes:
- **Live emails** — every scheduling request the system has actually sent, newest first, with the real subject and body, relative timestamps ("Just now", "45m", "3h", "2d", then a date), and unread styling until the candidate has replied
- **Static filler** — a handful of realistic non-recruiting emails (Google account notices, LinkedIn job alerts, a newsletter) so the inbox reads as a real person's, not a staged one

**Opening an email** shows the full message: subject, sender name and address, "to me", timestamp, and the rendered body. Scheduling emails spell out what the candidate is being asked for:

- The role, in bold
- The **total loop duration** ("3 hours 30 minutes")
- **The full session breakdown as a list** — each session's title, duration, and interviewer ("System Design (60 min) — Jerome Bell & Marvin McKinney", "Break (15 min)", …)
- The action link: **"Enter your availability here >>"** for an availability request, **"Schedule your interview here >>"** for a self-schedule
- A closing line inviting a reply with questions, and the recruiter's sign-off

Telling the candidate the loop's shape *before* they open the scheduler is deliberate — it's what lets them pick a realistic window on the first attempt.

**Links must actually work.** Following a link opens the matching candidate page (F5 or F6) carrying the identity of the originating request, so the submission flows back to the right place. Individual emails are addressable by URL so a demo can deep-link to one.

---

## 12. F8 — Email templates and composer

A rich email composer used by every recruiter-facing send. It provides:

- **Template selection** from five canonical templates
- **Variable chips** — inline, non-editable pills for Candidate name, Candidate email, Job title, Company name, Sender name, Recruiter name. Each chip has a delete affordance. Chips render as bold values in read-only contexts such as the activity log.
- **Locked blocks** — non-editable regions standing in for content generated at send time (the scheduling link, the interview details). Marked "(Only visible to you)". A recruiter cannot accidentally delete or corrupt the candidate's link.
- Free editing of everything else.

**The five templates:**

| Template | Used by | Contains |
|---|---|---|
| Request availability default | F3, agent availability requests | Availability link block |
| Request availability follow-up | Reminders | Availability link block |
| Interview confirmation | F2 step 3, booking | Interview details block |
| Interview reminder | Pre-interview nudge | — |
| Candidate rejection | Rejections | — |

Copy must be warm, brief, and professional. Scheduling emails follow these canonical templates exactly — **the AI agent never writes scheduling email copy** (see §13), so the candidate's experience is identical whether a human or the agent sent the email.

---

# Part C — Automation

## 13. F9 — AI scheduling agent

An AI assistant embedded in the ATS chat panel that coordinates interviews end to end, and drafts other candidate outreach. It replaces the manual sequence of: choose an outreach mode → draft the email → chase the candidate → reconcile availability → negotiate conflicts with interviewers → book.

### 13.1 Operating principles

These are product requirements, not implementation notes — they were learned by running the agent and are load-bearing.

1. **No preambles.** The agent never writes "I'll proceed by…" or "Let me check…". It acts, and the recruiter watches the actions stream by. Text output is reserved for: asking a clarifying question, summarizing finished work, or surfacing a failure that needs a human.
2. **Every action is visible.** Each action appears in chat as a short past-tense log line naming the person involved ("Sent availability request email to Jordan Kim", "Booked Jordan Kim for Mon, May 25 9:00am"). No black box.
3. **Explicit recruiter intent always beats the default heuristic.** If the recruiter says "send an availability request to X", that is what happens — regardless of what the stage data would have suggested.
4. **The agent never invents data.** Calendar availability, candidate replies, interviewer answers — all must come from a real lookup. If a candidate can't be found, say so; fabricate nothing.
5. **The agent proposes; the recruiter decides.** It never auto-rejects a candidate and never books without approval.
6. **The agent does not write scheduling emails.** Those use the canonical templates (F8), so what the candidate receives is identical whether a human or the agent sent it. The agent *does* freely write non-scheduling emails, where no canonical template exists.

### 13.2 Capability 1 — Send the scheduling request

**Trigger:** the recruiter asks to schedule someone, or uses **Schedule with AI** on a stage.

1. **Choose the outreach mode.**
   - Recruiter said "availability request" / "ask for availability" → **availability request** (candidate path A).
   - Recruiter said "self-schedule" / "let the candidate pick" → **self-schedule** (candidate path B).
   - Recruiter didn't specify → fall back to the stage's interview count: **1 interview → self-schedule; more than 1 → availability request**. This is a fallback, never a hard constraint.
2. **Check slot supply.** Look at suggested slots for the next 5 days. If there are fewer than 5 open slots, widen to 10 days. If self-schedule still has too few, switch to an availability request — a self-schedule page with almost no slots is a worse candidate experience than being asked for availability.
3. **Send** using the canonical template.
4. **Start the reminder cycle** (below).

### 13.3 Capability 2 — Schedule the candidate after they reply

**Trigger:** the candidate picked a slot or submitted availability windows (F5/F6).

1. If they **self-scheduled**, the slot is already decided — go to step 5.
2. If they **sent availability**, find slots that overlap their stated windows.
3. **Take the soonest conflict-free option.** Go to step 5.
4. If no conflict-free option exists, **take the soonest option with exactly one conflict**, and resolve it:
   - Slack the conflicting interviewer asking whether they can move that specific event (F10).
   - **If they accept:** ask whether it's generally safe to schedule over events like that one, and if so **record a rule** (see 13.5). Proceed.
   - **If they reject:** move to the next single-conflict option and repeat. The agent does not give up after one rejection.
5. **Propose the schedule to the recruiter** and wait for approval.
6. **On approval, book:** create the calendar event, send the candidate a confirmation email, and send calendar invites to everyone. Optionally attach a coding-assessment link when the loop calls for one. Booking closes out the request.

### 13.4 Reminder cycle and ghosting

- **48 hours with no reply** → send a reminder. Increment a visible reminder count.
- Repeat every 48 hours, **up to 10 days**.
- **At 10 days with no reply** → notify the recruiter with a **suggestion to reject**, reason "Stopped responding". The agent never rejects the candidate itself.

### 13.5 Scheduling rules — the agent learns

When an interviewer accepts a conflict override and confirms it's repeatable, the agent records a durable rule capturing: **which interviewer**, **what kind of event** (a pattern like "1:1 weekly" or "Team Meeting"), **whether it can be overridden**, and **why**.

From then on, slots are filtered against stored rules: a conflict already approved by rule no longer counts as a conflict, and that interviewer must not be asked about it again. The agent must consult stored rules **before** raising any new conflict.

### 13.6 Capability 3 — Drafting non-scheduling emails

When the recruiter asks for any email that isn't scheduling (offer, rejection, follow-up, general outreach), the agent looks up the candidate, **writes the body itself** — warm, professional, 2–4 short paragraphs, opening with a first-name greeting and closing with the recruiter's sign-off — and presents an **editable draft card** in chat with subject, body, and a Send button. The recruiter can reply "make it shorter" and get a revised draft.

### 13.7 Capability 4 — General recruiting assistance

Conversational answers about candidates, stages, and pipeline, grounded in real ATS data. No formal action needed when a direct answer suffices.

### 13.8 Where the agent can be triggered

| Surface | How |
|---|---|
| Chat panel (docked or full-screen) | Free-text message |
| **Schedule with AI** on a stage | Sends a pre-filled instruction naming the candidate and stage, and targets *that specific application* — important because a candidate may have several |
| Recruiter's Slack | A message to the agent re-enters the same loop |
| Demo controls | Simulated events (F12) |

### 13.9 Failure and edge cases

| Scenario | Required behavior |
|---|---|
| Candidate stops responding for 10 days | Notify recruiter with a reject suggestion, reason "Stopped responding" |
| No slot fits the candidate's stated availability | Notify recruiter, propose alternative dates |
| Every interviewer rejects their conflict | Notify recruiter that manual resolution is needed |
| Candidate rejects the proposed schedule | Restart from their stated availability; if none given, restart from the request step |
| Candidate can't be found | Say so plainly in chat; invent nothing |
| A request is already outstanding for that candidate | Refuse to send a second one; the existing request must be completed or cancelled first |
| An action fails | Decide whether to retry, take a different path, or surface the problem — don't just narrate the error |

### 13.10 Tone

- **Emails to candidates:** canonical templates for scheduling; warm, brief, professional for everything else.
- **Slack to interviewers:** short and direct. Always name the candidate, role, proposed time, and the specific conflicting event. Always ask for an explicit yes/no.
- **Notifications to the recruiter:** factual. What was done, what's proposed, what input is needed.

---

## 14. F10–F12 — Interviewer, recruiter, and demo surfaces

### F10 — Interviewer conflict resolution (Slack)

A Slack mockup showing the interviewer's view, automatically focused on whichever interviewer currently has an unanswered conflict request.

The interviewer sees a DM from the scheduling agent naming the candidate, role, proposed time, and the specific event being asked about, with two buttons: **"Yes, I can move it"** and **"No"**. A free-text reply is also possible. The default rejection reads "Sorry, I can't move that one." Answering updates the request state, which the agent reads to continue.

### F11 — Recruiter notifications (Slack)

A second Slack mockup showing the recruiter's view, with DMs and a dedicated app surface (Home / Messages / About tabs).

| Notification type | When | Carries |
|---|---|---|
| **Proposal** | A schedule is ready for approval | Proposed slot, interviewers, conflicts resolved |
| **Stuck** | Blocked, needs a human | What's blocking |
| **Reject suggestion** | Candidate ghosted | A suggested reject reason |
| **Info** | Status update | — |
| **Approved** | A booking completed | Booking details |

Every notification appears in **both** the recruiter's Slack DMs and an in-product inbox. Replying in Slack re-enters the agent loop.

### F12 — Demo controls

A floating **Demo controls** pill, reachable from any page, acting as a time machine. Demo audiences won't wait 48 hours — they need to see what the system does *at* key moments, reproducibly.

**Active requests** — one row per outstanding request showing candidate name, mode, status, age, and reminder count, with three buttons:

- **48h passed** — simulates elapsed time; the agent checks for a reply and sends the next reminder
- **Candidate replied** — opens a text field pre-filled with a plausible reply (a picked slot for self-schedule, availability windows one per line for an availability request); submitting records the reply and fires the agent. **This must produce state indistinguishable from the candidate actually submitting on F5/F6**, so a demo can use either.
- **Ghosted 10d** — marks the request ghosted and fires the reject-suggestion path

**Pending conflict DMs** — one row per unanswered interviewer conflict, with **Accept** and **Reject** buttons producing exactly the same result as the interviewer clicking in Slack.

**Reset all demo data** — clears every request, message, booking, and learned rule and restores the seed state. Also available from the user menu, so it is reachable both quickly (mid-demo) and discoverably.

Simulated events must be clearly marked as system-injected facts rather than recruiter instructions, so the agent treats them correctly.

---

## 15. Data the system must track

Described conceptually — storage choice is the builder's.

**Scheduling request** — one per outreach attempt: which candidate, which application, which stage, the mode (self-schedule / availability request), the email subject and body sent, the interview details included, when sent, when last reminded, how many reminders, and a status of `sent` / `reminded` / `replied` / `completed` / `ghosted` / `cancelled`. Once the candidate responds it also holds their reply text, their availability windows, and/or the slot they picked. **This record is the join between the recruiter's view, the candidate's link, and the agent** — the candidate page is reached by way of it, and writes back into it.

**Interviewer message** — recipient, role, whether it's a conflict request or a plain notification, the message, when sent, and a status of `sent` / `accepted` / `rejected` / `replied` plus any reply text.

**Recruiter notification** — type (proposal / stuck / reject suggestion / info / approved), title, body, the candidate concerned, read state, and for proposals: slot, interviewers, conflict count.

**Booking** — candidate, interviewers, slot, duration, calendar event reference, video link, optional assessment link, and when it was booked.

**Scheduling rule** — interviewer, event pattern, whether it can be overridden, the reason, and when it was learned.

**Interview definitions** — each stage of a requisition defines its interviews: title, type (standard, technical, behavioral, presentation, case study, pair programming, portfolio review, reference check, other), duration, and interviewer. When a candidate reaches that stage these are instantiated per-application and gain a scheduled time, location, meeting link, and a status of `pending` / `scheduled` / `completed` / `cancelled` / `no_show`.

**Panel and calendar data** — interviewers with location, time zone, and local business hours; and their calendar events classified as interview, busy, or conflict.

---

## 16. Non-goals

- Real Gmail, Google Calendar, Slack, or coding-assessment integrations. Every external system is mocked; mocks must return realistic-looking results so swapping in a real integration later changes nothing the user sees.
- Candidate accounts, logins, or a candidate portal. Candidate access is by link only.
- Candidate-side timezone auto-detection. Times are shown in a stated fixed zone with a visible selector.
- Scheduling multiple candidates in one batch.
- Multi-tenant / cross-workspace data. Single workspace is assumed.
- Structured offer letters with compensation fields. Offers are free-text emails for now.
- A full interviews management page. A placeholder ("Interview scheduling and management will live here") is acceptable.

---

## 17. Acceptance criteria

**F1** — The Schedule menu appears only on the current stage of an active application with unscheduled interviews, and offers exactly the four options in order. Status badge and inline stage state track sent/received correctly. Received availability is expandable and shows windows grouped by day.

**F2** — All three steps navigate forward and back without losing edits. Editing a session's time in step 2 visibly moves its block on every affected calendar column. Conflicted participants are visibly marked. Completing the flow writes scheduled times onto the candidate's stage.

**F3** — Every form field persists while the dialog is open. The email link block cannot be edited or deleted. Sending moves the application to pending.

**F4** — The candidate preview is the same component the candidate sees. Selecting a date and time in the preview renders the exact resulting loop in the private panel, in both list and calendar views, with sessions shifted to the chosen start. Sessions can be reordered by drag and the total duration updates live.

**F5** —
- Weekends, out-of-window dates, and out-of-range weeks are unreachable.
- A drag shorter than the loop duration snaps up to the full duration.
- Two overlapping windows on one day merge into one.
- A window can be moved to a different day, resized from either edge, and deleted by keyboard and by control.
- Continue is blocked below two windows and the reason is shown before the candidate tries.
- Create, move, resize, and delete all work by touch.
- The confirmation reads back every submitted window grouped by day, and Update availability returns with the selection intact.
- The submitted answer reaches the recruiter as structured day/start/end ranges, never prose.

**F6** —
- Slots appear only on available dates; a date must be chosen before slots render.
- A multi-day option renders both days with their labels and ranges, and selects as one unit.
- Continue is disabled until a slot is chosen.
- "None of these work? / Suggest time" is present.
- The confirmation reads "Your interview is scheduled!" and offers Reschedule and Cancel.
- Mobile runs as four screens, and a slot requires the second inline Select tap to advance.

**F5 + F6 shared** — Both pages load with no session, on a phone, from a cold browser. Both are company-branded, not ATS-branded. Both show duration, time zone, and language up front. On both, the note step's button reads "Skip and …" while empty and "{action}" once written. Submission happens exactly once.

**F7** — Live sent emails appear newest-first with relative timestamps and unread styling, mixed with static filler mail. Scheduling emails show the role, total duration, and the full session breakdown. Links open the correct candidate page carrying the request identity, and a submission on that page flows back to the recruiter's view.

**F9** — The agent never emits a preamble before acting. Explicit phrasing overrides the count heuristic (verifiable: a candidate with one interview in stage, asked for "an availability request", gets an availability request). Every action appears as a log line in chat. A second concurrent request for the same candidate is refused. Scheduling emails are identical to the manual flow's templates.

**F10 / F11** — An interviewer's answer in Slack and the equivalent demo-control button produce identical state. A learned rule measurably changes later slot suggestions: the previously conflicted slot comes back clean and the interviewer is not asked again.

**F12** — Every simulation button is reproducible from a reset state. A simulated candidate reply is indistinguishable from a real submission on F5/F6. Reset genuinely clears all requests, messages, bookings, and rules.

---

## 18. Open questions for the builder

**Candidate-side**

1. **Time zone.** Candidate pages display a fixed zone (America/Los_Angeles) with a selector that is presented as changeable. Should the selector actually re-render times, and should the zone default to the candidate's device?
2. **"Suggest time."** F6 offers this escape hatch but its flow is unspecified. Does it open a free-text field, switch the candidate to the F5 availability grid, or email the recruiter?
3. **Reschedule and cancel.** Both appear on the F6 confirmation and on the recruiter's stage menu, but neither flow is specified — particularly what the candidate can do unilaterally versus what needs recruiter approval.
4. **Updating availability after submission.** F5 promises the candidate can update "until the interview is scheduled". The rule for when that link stops working needs defining, along with what the candidate sees when it has.
5. **Expired or already-used links.** No specified behavior for a candidate who opens a link after the request was cancelled, completed, or superseded.
6. **Language selector.** Presented as changeable on both candidate pages; no localization exists behind it.

**Recruiter-side**

7. **Best-fit ranking.** The factors (fewest conflicts, tightest loop, fewest context switches) are stated but not weighted.
8. **Interviewer load limits.** The self-schedule form exposes an "ignore daily and weekly interview limit" checkbox, but the limits themselves are not defined anywhere.
9. **Timezone baseline.** Interviewer calendars pin to a Pacific baseline with per-person business hours overlaid. Should the recruiter be able to switch the baseline?
10. **Approval step.** The agent proposes and waits for approval, which currently happens conversationally. Should the proposal notification carry a one-click approve action?
