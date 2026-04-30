# Interview scheduling

## The problem

Scheduling an onsite is one of the most painful parts of recruiting. A single loop can involve four or five interviewers, back-to-back sessions, room bookings, and a candidate who lives in another timezone — all squeezed into a week where every calendar looks like Tetris.

Recruiters end up doing the work a machine should do: scanning calendars, guessing at a good time, rewriting Slack threads, copy-pasting Zoom links, and hoping nobody says "actually, can we move it?"

The goal: **get from "ready to interview" to a confirmed schedule in as few clicks as possible — without sacrificing the recruiter's judgment.**

## The solutions

We shipped two paths, because not every loop is the same. Simple phone screens want speed. Complex onsites want control.

### 1. Manual schedule — for when the recruiter knows best

The hardest part of manual scheduling isn't finding a time on *our* side — it's getting the candidate's availability in a format we can actually use. Email threads like "I'm free Tue 2–4, Wed morning, or late Thursday" are a parsing nightmare, and the back-and-forth can stretch a simple booking into three days.

So we optimized the request-availability flow end-to-end:

1. **Ask once, structured.** The recruiter sets the loop rules (duration, earliest/latest times, buffer, timezone) and we generate a pre-filled email with a single link. The candidate picks windows on a calendar — no prose, no ambiguity.
2. **Auto-compare availability.** The moment the candidate submits, we overlay their windows against every interviewer's calendar and surface the top options, ranked by best fit — fewest conflicts, tightest loop, fewest context switches for interviewers.
3. **Confirm in one screen.** The recruiter sees ranked options on the left and a stacked interviewer calendar on the right. Pick a time, tweak session order or rooms, and send a pre-filled confirmation email in a single click.

The flow collapses three typically-painful steps — collecting availability, reconciling it against interviewers, and sending confirmations — into a single continuous surface. Recruiters stay in control; the software handles the calendar math.

### 2. Candidate self-schedule — for when flexibility wins

Sometimes the candidate's calendar is the bottleneck, not ours. Self-schedule flips the flow: the recruiter defines the *rules* of the loop (duration, interviewers, time windows, buffers), and the candidate picks the slot.

The dialog is a split view:

- **Left:** the recruiter configures schedule details and the interview plan — once.
- **Right:** a live "Preview as a candidate" panel shows exactly what the candidate will see, plus a private "this is the schedule they'd actually land on" view so the recruiter can sanity-check every possible outcome.

One click sends a self-schedule link. The candidate picks a time that works for them, and the loop materializes on everyone's calendar automatically.

## Why two?

Manual is for precision. Self-schedule is for scale. Both share the same primitives — interview plans, interviewer calendars, email composer — so recruiters can switch between them without relearning the product.

The win isn't replacing the recruiter's judgment. It's giving them a surface where that judgment turns into a confirmed schedule in under a minute.
