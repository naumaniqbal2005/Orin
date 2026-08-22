# Orin Companion Scheduler Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this roadmap task by task. Track implementation with checkbox items and review each milestone before starting the next.

**Goal:** Turn Orin into a calm, adaptive day companion that helps people make realistic plans, recover without guilt when life changes, and learn from each week.

**Architecture:** Presets are protected weekly templates. Applying one materializes private, dated schedule instances; the live timeline edits those instances, check-ins record reality, and reports compare plan with reality without rewriting history. Appwrite remains the system of record, while TanStack Query and a small MMKV-backed outbox make the mobile experience resilient.

**Tech Stack:** Expo SDK 57, React Native 0.86, Expo Router, Appwrite TablesDB/Auth/Storage/Functions/Messaging, TanStack Query, MMKV, expo-secure-store, expo-notifications, expo-dev-client, optional expo-haptics, Jest, React Native Testing Library, Maestro, EAS Development Builds and Internal Distribution.

**Spec:** creative_direction/blueprint/userStories.txt, creative_direction/blueprint/schema.json, all files in creative_direction/images/, and the existing Orin implementation under orin/.

**Plan date:** 2026-08-21
**Last progress review:** 2026-08-23
**Planning horizon:** first dependable vertical slice, then a complete v1, then deliberate retention features.

## Current decision record and execution plan — 2026-08-23

The product owner approved the guest-first authentication direction and a private, non-unique V1 handle. This supersedes the custom handle/password design that appeared in the first roadmap draft.

1. [x] Use the existing Appwrite project and its single existing database so the design stays within the Free-plan database allowance.
2. [x] Start with an Appwrite anonymous session; the Appwrite account ID is Orin's stable owner ID from the first write onward.
3. [x] Treat `profiles.handle` as private display identity, not a login identifier. It is required but non-unique; no `handleKey` or `auth_handles` table is provisioned.
4. [x] Upgrade the same guest account with `account.updateEmail({ email, password })`. Do not create a second account and do not migrate rows.
5. [x] If an email is already registered, preserve the anonymous session and all guest data; offer another email and defer account merging to a separately designed recovery flow.
6. [x] Allow normal app use before email verification. Explain that recovery and dependable cross-device sign-in require a verified email, then send verification without blocking planning.
7. [x] Finalize and validate the ten-table V2 manifest against the user stories and current Appwrite CLI contract.
8. [x] Render that manifest deterministically into `appwrite.config.json`, test drift detection, and push the tables into the existing empty database.
9. [x] Add Expo SDK 57 lint, formatting, Jest, and React Native Testing Library checks; correct the React Native Appwrite client setup.
10. [x] Verify the remote tables, rerun Expo dependency/doctor checks, and record exact completion evidence in this planner.

No CLI script may create a second database or push automatically. Rendering and pushing remain separate, reviewable commands.

---



## 1. Executive read

Orin should not become another habit tracker with prettier colors. Its distinctive role is a forgiving day navigator for people who often plan sincerely and then meet a messier reality. The product loop should be: prepare a reusable week, materialize it into editable days, see one clear next action, repair the plan quickly when it slips, reflect lightly at night, and learn on Sunday. The present creative direction already has the right emotional ingredients—mint, cream, peach, rounded forms, friendly illustration—but the interaction model is still template-first and modal-heavy. The most important engineering move is to separate reusable preset templates from dated schedule instances. The most important product move is to reward recovery and learning rather than uninterrupted streaks. The most important delivery move is to secure Appwrite data and adopt Expo development builds before expanding the UI.

The proposed identity is:

> **Plan kindly. Adapt honestly. Learn weekly.**

Orin is not a judge, a productivity scoreboard, or an AI that takes control. It is the calm voice that helps the user answer three questions:

1. What matters now?
2. What is the gentlest useful adjustment?
3. What did this week teach me?

---



## 2. What was reviewed



### 2.1 Complete creative-direction inventory

Every file in creative_direction was read or visually inspected:


| Artifact                                     | What it contributed                                                                                                                                             |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| blueprint/userStories.txt                    | The intended audience, core loop, non-coercive tone, multi-step flow, full-screen navigation preference, build order, and desired technology direction.         |
| blueprint/schema.json                        | The current Appwrite project export and the starting user, activities, and presets tables. It also exposed a critical data-isolation issue described below.     |
| images/current.png                           | The current working composition: cream devices, peach and teal schedule cards, a clear linear timeline, and an early one-screen approach.                       |
| images/minty.webp                            | The strongest color and atmosphere reference: cream canvas, mint focal cards, lavender accents, large illustration moments, and rounded bento-like information. |
| images/9472476_4176148.jpg                   | Direct habit-list clarity, day selection, progress comparison, and a restrained pink/teal flat-illustration language.                                           |
| images/9427330_4176342.jpg                   | Dedicated goal and report screens, large illustration fields, and progress bars; useful as a warning about low contrast and oversized decoration.               |
| images/4ae955ed1608f48bda594d2e25f86efd.webp | Emotional gradients, translucent layers, mood input, and a multi-screen wellness journey; useful selectively, not as the density model.                         |
| images/9852111_4283151.jpg                   | A focused active-session screen and dedicated analytics view; useful for the current-activity hero and report hierarchy.                                        |
| images/9472483_4185103.jpg                   | Strong separation between a bold activity context and a white detail panel; useful for full-screen activity and check-in flows.                                 |




### 2.2 Current implementation audit

The repo already contains:

- Expo Router authentication guards and Appwrite sessions.
- Activity create/list/delete.
- A substantial weekly preset editor with per-day slots and copy-to-day behavior.
- A timeline that reads the selected weekday directly from a preset.
- Wake and sleep preferences.
- Early local activity-start notification code.
- Schedule and check-in service files that are not yet wired to screens or represented in the supplied schema.

The important gaps are:

- The timeline never materializes dated schedule records, so runtime edits, history, nightly check-ins, and honest reports cannot work.
- Presets store activity names and parallel arrays of serialized JSON rather than stable activity IDs and normalized slot rows.
- Activity creation, preset selection, activity selection, and copy flows use modal overlays even though the creative brief explicitly asks for independent screens.
- Registration is a single email/password form rather than a guided, handle-first setup.
- There is no check-in screen, weekly report, proof flow, achievement engine, query cache, offline outbox, pagination, test suite, or deployment profile.
- The current code uses Poppins. This planner introduces Sentic Display only as an optional expressive-font candidate; it is not named by the supplied brief or images.
- The earlier package mix was not aligned; the app is now on Expo SDK 57 with Expo-compatible dependencies.



### 2.3 Research scope

The research focused on a procrastination-prone individual using Orin for personal routines over the next 4–12 weeks. It looked at:

- Why plans become unrealistic.
- What makes rescheduling feel safe rather than shameful.
- Which reflection patterns have evidence behind them.
- How current planning products separate recurrence from an individual occurrence.
- How Expo SDK 57 should be tested when native features are involved.
- How Appwrite permissions, indexes, relationships, and transactions affect the architecture.

Observed evidence and product precedents are separated from Orin-specific inferences throughout this document. No claim is made that Orin will “solve procrastination” without its own outcome research.

### 2.4 Step-by-step research method

This is the sequence used to produce the roadmap, and it should be repeatable when the direction changes:

1. Inventory and read every blueprint artifact; inspect every image at full size and record what is signal versus decoration.
2. Trace the existing app from routes to services, Appwrite client, schema export, package versions, and notification behavior.
3. Turn mismatches into research questions: template versus occurrence, realistic planning, compassionate repair, native notification reliability, private-data isolation, and offline durability.
4. Verify technical answers in primary documentation for Expo SDK 57, Appwrite, Android, Apple, TanStack Query, and MMKV.
5. Compare current product precedents for recurrence editing, workload visibility, flexible time windows, and daily planning.
6. Grade claims: research evidence, observed product pattern, repo fact, or Orin-specific inference. Do not present one category as another.
7. Synthesize findings into product principles, a vertical slice, architecture decisions, phased gates, and explicit non-goals.
8. Run an independent read-only review against the brief, then repair contradictions and unsafe migration assumptions before handoff.

---



## 3. What the research says



### 3.1 Evidence-backed observations

1. **People systematically underestimate task time.** The classic planning-fallacy studies found that people focus on an ideal future scenario and underuse their own relevant history. In one study, estimates became more realistic when participants explicitly connected past experience to the current task.
  Source: [Buehler, Griffin, and Ross — Exploring the Planning Fallacy](https://bear.warrington.ufl.edu/brenner/mar7588/Papers/buehler-et-al-1994.pdf)
2. **Progress monitoring helps, particularly when it is recorded.** A meta-analysis covering 138 randomized studies and 19,951 participants found that interventions increasing progress monitoring also improved goal attainment. This supports recording plan and reality, but not turning that record into a punitive score.
  Source: [Does monitoring goal progress promote goal attainment?](https://pubmed.ncbi.nlm.nih.gov/26479070/)
3. **Specific if–then plans are useful.** A 2024 meta-analysis spanning 642 tests found implementation intentions effective across cognitive, emotional, and behavioral outcomes, with stronger results for explicit contingent plans. This supports an optional “soft start” cue such as “When 7 pm begins, I will open the chapter for ten minutes.”
  Source: [The when and how of planning](https://www.tandfonline.com/doi/abs/10.1080/10463283.2024.2334563)
4. **Procrastination is not only a calendar problem.** Current research treats it as a self-regulation problem with emotional and executive components. Orin should therefore make repair easy and reduce threat; it should not imply that stricter alarms or brighter overdue badges are the answer.
  Source: [Procrastination and the priority of short-term mood regulation](https://www.nature.com/articles/s44159-024-00341-w)
5. **Self-monitoring, goal setting, and cues are common ingredients in digital habit interventions.** A 2024 systematic review found these among the most frequently used components. This is descriptive evidence, not proof that every component works alone.
  Source: [Digital behavior-change interventions for habitual behavior](https://pmc.ncbi.nlm.nih.gov/articles/PMC11161714/)
6. **A compassionate approach is credible but should not be oversold.** A small systematic review found self-compassion interventions at least comparable with other behavior-change techniques for health self-regulation. A separate procrastination study linked self-forgiveness with less subsequent procrastination, but this is not enough to claim causation for an app feature.
  Sources: [Self-compassion interventions and health behavior](https://pubmed.ncbi.nlm.nih.gov/28810473/), [Forgive yourself, stop procrastinating](https://www.sciencedirect.com/science/article/pii/S0191886910000474)



### 3.2 Product precedents worth adapting

These products are references for interaction rules, not visual templates:


| Precedent                                                                                                                            | Useful pattern for Orin                                                                                                                       | What not to copy                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [Sunsama timeboxing](https://help.sunsama.com/docs/getting-started/basics/timeboxing-the-basics/)                                    | Estimate first, then put work on a calendar; planned duration controls the block.                                                             | Its work-productivity density and desktop-first mental model.      |
| [Sunsama daily planning](https://help.sunsama.com/docs/usage-guides/daily-planning/)                                                 | Guided reflection, workload prediction, and an explicit warning when the day exceeds the chosen capacity.                                     | A long daily ritual before the user can reach the main screen.     |
| [Todoist recurring dates](https://www.todoist.com/help/articles/introduction-to-recurring-dates-YUYVJJAV)                            | Rescheduling one occurrence can leave the recurrence rule intact. This is the cleanest precedent for protected preset plus editable instance. | Natural-language recurrence complexity in the first Orin release.  |
| [Reclaim flexible habits](https://help.reclaim.ai/en/articles/4129152-habits-overview-auto-schedule-flexible-time-for-your-routines) | Preferred window, minimum/maximum duration, ideal time, and an explicit conflict outcome.                                                     | Automatic scheduling before Orin has enough trusted personal data. |




### 3.3 Research inference for Orin

The strongest opportunity is not “more reminders.” It is a closed learning loop:

- Record the intended time.
- Preserve the original intent.
- Make the live occurrence easy to move, shrink, skip, or complete.
- Record actual duration and an optional reason.
- Feed the user’s own history back into future estimates.

That turns the planning fallacy into a useful product mechanic: Orin can eventually say, “Reading sessions like this usually take about 35 minutes,” but only after enough personal observations exist. Before that threshold, it should show no false confidence.

---



## 4. Product direction



### 4.1 Three possible directions


| Direction                     | Strength                                                                                             | Risk                                                                                           | Decision                        |
| ----------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------- |
| **A. Adaptive day companion** | Owns the full plan → adapt → reflect → learn loop; matches the brief and creates a distinct product. | Requires a sound dated-instance model before visual polish.                                    | **Recommended.**                |
| B. Pastel habit tracker       | Faster to ship and familiar to users.                                                                | Becomes interchangeable with dozens of checklists; streak pressure conflicts with the tone.    | Do not choose.                  |
| C. AI auto-scheduler          | Visually impressive and potentially useful later.                                                    | High trust cost, opaque changes, calendar-integration scope, and weak personal data at launch. | Explore only after v1 evidence. |




### 4.2 Product principles

1. **Reality is information, not failure.**
2. **The live day may change without silently changing the reusable plan.**
3. **The timeline answers “now” before it answers “everything.”**
4. **Every interruption should offer a repair action.**
5. **Reflection is optional, quick, and useful on its own.**
6. **Progress is visible without streak anxiety.**
7. **Illustration creates warmth at moments of transition, not decoration over useful data.**
8. **No private note or sensitive activity name belongs in a lock-screen notification by default.**



### 4.3 Core loop

The loop is successful when a user can recover from disruption without abandoning the entire week.

---



## 5. Feature decisions



### 5.1 The first dependable vertical slice

The first slice should prove one complete behavior, not several disconnected tabs:

1. Create or select an activity.
2. Add it to a preset using a stable activity ID.
3. Apply the preset to a real week.
4. Open Today and see a dated schedule instance.
5. Move that instance without altering the preset.
6. Mark it done, partial, moved, missed, or intentionally skipped.
7. Reopen the app and see the same state.

Everything else should wait until this loop is reliable, secure, and testable.

### 5.2 v1 scope


| Include in v1                                                                                              | Why it belongs                                                 |
| ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Activity library with edit, archive, category, icon, color token, default duration, and optional start cue | Presets and reports need durable identity and usable defaults. |
| Weekly presets and preset slots                                                                            | The central planning promise.                                  |
| Apply-preset preview and dated schedule instances                                                          | Protects templates and enables history.                        |
| Interactive Today timeline                                                                                 | The main face of Orin.                                         |
| Move, shrink, swap, release, undo                                                                          | The recovery experience is the differentiator.                 |
| Start reminder and nightly reflection reminder                                                             | Closes the daily loop without requiring remote push.           |
| Fast nightly check-in with optional reasons                                                                | Creates useful plan-vs-reality data.                           |
| Sunday postcard plus deeper report                                                                         | Closes the weekly loop.                                        |
| Handle-first, multi-step onboarding                                                                        | Establishes tone and a first usable schedule.                  |
| Time zone, wake/sleep bounds, quiet hours, notification preferences                                        | Required for safe scheduling.                                  |
| Offline read cache and durable mutation outbox                                                             | A check-in must not disappear because connectivity is poor.    |
| Accessibility and reduced-motion support                                                                   | Part of quality, not post-launch polish.                       |




### 5.3 After v1


| Feature                       | Timing and guardrail                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------------------- |
| Activity sets/bundles         | Add after the single-activity preset model is stable; normalize with set and set-item rows. |
| Proof photos and notes        | Add as a private “Proof Garden,” not a public feed by default.                              |
| Achievements                  | Celebrate recovery, firsts, and accumulated effort; avoid consecutive-day streak loss.      |
| Flexible scheduling windows   | Add after users understand exact blocks; never silently move a fixed commitment.            |
| Personal duration suggestions | Require a minimum sample count and show the basis plainly.                                  |
| Calendar import               | Read-only preview first, then controlled two-way sync after conflict semantics are proven.  |
| Remote push                   | Use for report-ready or cross-device events, not every local activity.                      |
| AI planning suggestions       | Suggest and explain; never autonomously rewrite a live week.                                |




### 5.4 Explicitly not now

- Social feed, follower counts, leaderboards, or public proof.
- Subscription/billing.
- Cloudflare or Redis/Upstash.
- Full automatic scheduling.
- Chatbot as the main interface.
- Complex natural-language recurrence.
- Streak loss, red overdue counters, or guilt copy.

---



## 6. Creative product bets

These are Orin-specific design inferences. They should be validated with prototypes and small tests rather than described as proven behavior.

### 6.1 Day Pulse

The Today screen opens with one prominent current-activity card:

- Progress through the current time block.
- A small “next” preview.
- One primary action: Start, Continue, or Check in.
- Secondary repair actions: Later today, Tomorrow, Next preferred window, Pick a time.
- A calm free-time/buffer indicator.

The full timeline remains below it, but the user never has to scan the entire day to know what matters now.

### 6.2 Breathing Room

Before applying or saving a plan, show:

- Planned minutes.
- Fixed commitments.
- Flexible activity minutes.
- Unplanned buffer.

If the day is over capacity, avoid a red error. Offer three choices: **shrink**, **move**, or **keep as an aspiration**. This adapts Sunsama’s workload visibility to Orin’s gentler tone.

### 6.3 Soft Start

An activity may carry one optional start cue:

> When the activity begins, I will open the document and work for ten minutes.

The cue appears only on the live card and can be dismissed. It applies implementation-intention research without turning activity creation into a questionnaire.

### 6.4 Recovery Credit

Instead of rewarding an unbroken streak, track:

- Returned after a missed day.
- Rescheduled and later completed.
- Adjusted an unrealistic duration.
- Reflected after a difficult day.
- Tried a new weekly experiment.

This makes adaptation a success state.

### 6.5 Plan/Reality Glass

Reports should show a subtle paired band:

- Pale band: planned time.
- Solid band: actual time.
- Small marker: moved, shrunk, or skipped intentionally.

The report says what happened before interpreting why. Color is always paired with a label or icon.

### 6.6 Sunday Postcard

The default weekly report is a short, warm narrative:

- One specific win.
- One pattern Orin observed.
- One user-chosen experiment for next week.
- A button for the deeper statistical report.

Example:

> You protected three reading sessions this week, including one you moved instead of abandoning. Mornings were easier to start than evenings. Want to try moving one evening block earlier next week?



### 6.7 Proof Garden

Proof images become a private memory collection grouped by activity and month. The visual metaphor is growth and accumulation, not proof demanded by a judge. Each item can contain a photo, caption, and the associated completed instance. Privacy defaults to private; deletion is always available.

### 6.8 Energy Weather, not an energy score

An optional one-tap morning state—clear, mixed, low, or skip—can change how Orin phrases suggestions. It must never automatically delete plans or pretend to diagnose the user. This belongs after the core loop because it adds interpretation risk.

---



## 7. Information architecture and screen flow



### 7.1 Recommended primary navigation


| Tab          | Role                                                                             |
| ------------ | -------------------------------------------------------------------------------- |
| **Today**    | Day Pulse, dated timeline, repair actions, quick check-in.                       |
| **Plan**     | Presets, activities, apply-to-week, and later sets.                              |
| **Insights** | Sunday postcard, detailed reports, and later achievements/proof.                 |
| **You**      | Identity, wake/sleep bounds, notifications, accessibility, privacy, and account. |


This replaces separate top-level Presets and Activities tabs with one coherent planning home. Activities still get full, independent screens.

### 7.2 Route map

Suggested route ownership:

- app/onboarding/welcome.jsx
- app/onboarding/identity.jsx
- app/onboarding/day-bounds.jsx
- app/onboarding/starter-activities.jsx
- app/onboarding/first-week.jsx
- app/onboarding/notifications.jsx
- app/(tabs)/today.jsx
- app/(tabs)/plan.jsx
- app/(tabs)/insights.jsx
- app/(tabs)/you.jsx
- app/you/settings.jsx
- app/activity/new.jsx
- app/activity/[activityId].jsx
- app/preset/new.jsx
- app/preset/[presetId].jsx
- app/preset/[presetId]/apply.jsx
- app/schedule/[localDate].jsx
- app/schedule/[slotId]/reschedule.jsx
- app/check-in/[localDate].jsx
- app/report/[weekStart].jsx

System permission prompts and native time pickers may still be platform dialogs. Product creation, selection, editing, and reporting should be full routes or inline states—not blurred-card overlays.

### 7.3 Legacy route migration

Rename the navigation atomically; do not leave old and new tabs visible at the same time.


| Existing route or owner             | New destination                                                                      | Migration rule                                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| app/index.jsx → /timeline or /login | /today for an authenticated, onboarded user; /onboarding/welcome or /login otherwise | Update the root redirect in the same change that introduces the new routes.                   |
| app/(auth)/_layout.jsx              | /today after a valid session                                                         | Gate on onboardingVersion so a new account cannot skip setup.                                 |
| app/(auth)/login.jsx                | /today, or the incomplete onboarding step                                            | Replace every router.replace('/timeline'); retain no stale deep link.                         |
| app/(auth)/register.jsx             | Handle-first onboarding/auth decision from Section 13.1                              | Replace the current single form only after the Phase 0 auth gate is resolved.                 |
| app/(tabs)/timeline.jsx             | app/(tabs)/today.jsx                                                                 | Keep /timeline as a hidden Redirect to /today for one release, then remove it.                |
| app/(tabs)/presets.jsx              | app/(tabs)/plan.jsx?section=presets plus app/preset/*                                | Keep a hidden redirect; move edit/create UI to full routes.                                   |
| app/(tabs)/activities.jsx           | app/(tabs)/plan.jsx?section=activities plus app/activity/*                           | Keep a hidden redirect; move edit/create UI to full routes.                                   |
| app/(tabs)/profile.jsx              | app/(tabs)/you.jsx                                                                   | Rename the tab and update all links.                                                          |
| app/(tabs)/settings.jsx             | app/you/settings.jsx                                                                 | Keep /settings as a hidden redirect for one release because profile currently pushes to it.   |
| app/(tabs)/_layout.jsx              | Today / Plan / Insights / You                                                        | Replace tab declarations together; set every legacy route href to null while redirects exist. |
| Notification/deep-link targets      | /check-in/[localDate] and dated schedule routes                                      | Version notification data so already-scheduled legacy taps can safely fall back to /today.    |


Before removing the compatibility redirects, search the repo, notification ledger, analytics taxonomy, and external test instructions for old route names. Test cold-start, authenticated, unauthenticated, incomplete-onboarding, and notification-tap entry paths.

### 7.4 Key screen behavior



#### Today

1. Compact week/date strip.
2. Day Pulse current card.
3. “Next” and breathing-room summary.
4. Timeline centered near the current time.
5. Past items visually quieter but still readable.
6. Upcoming, active, done, moved, and intentionally skipped states use labels and form—not color alone.
7. Empty day offers useful choices: Apply a preset, add one activity, or keep the day open.



#### Preset editor

Use a short, multi-step flow:

1. Name and intent: “What kind of week is this?”
2. Day bounds and desired buffer.
3. Add activities with default durations.
4. Copy or vary days.
5. Feasibility preview.
6. Save template.

An experienced user can jump directly to the full week editor. A first-time user gets the guided path.

#### Apply preset

Show a preview before writing dated instances:

- Target week.
- Existing dated items.
- Conflicts.
- Apply remaining days or full week.
- Keep existing, replace, or merge.
- Clear statement: “Changes to this week will not change Normal Week.”



#### Nightly reflection

Page one is fast:

- Done.
- Partly done.
- Moved.
- Missed.
- Chose not to do.

Page two is optional:

- Time got eaten.
- Task felt heavy.
- Energy was low.
- Needed more time.
- Priority changed.
- Something else.
- Leave blank.

End with one observed win and one optional note for tomorrow. Never force a reason.

#### Weekly report

Default “Simple” view:

- One win.
- Planned versus actual time.
- Recovered activities.
- Most workable time window.
- One next-week experiment.

Optional “Deep” view:

- Completion by activity and day.
- Planned versus actual duration.
- Move-to-completion rate.
- Voluntary friction reasons.
- Trend confidence and sample size.

Completion percentage should not be the hero metric.

---



## 8. Visual and interaction system



### 8.1 What to keep

- Creamy off-white canvas.
- Mint as the primary active state.
- Peach for warmth and planned/upcoming states.
- Lavender for reflection and insight accents.
- Rounded cards and airy spacing.
- Flat illustration at welcome, empty, transition, and celebration moments.
- Strong full-screen separation between planning, doing, reflecting, and learning.



### 8.2 What to change

- Reduce decorative illustration inside information-dense timeline and report screens.
- Replace translucent text-on-pastel combinations that do not meet contrast.
- Use fewer simultaneous card containers; hierarchy should come from spacing and type as well as borders.
- Replace generic sparkle/calendar icons with semantically accurate Lucide icons.
- Stop using modals for full workflows.
- Unify app name, light appearance, status bar, and native splash colors.



### 8.3 Candidate semantic palette

These are art-direction candidates, not approved production tokens. Verify every text, icon, chart, focus, and disabled-state pairing before shipping.


| Token       | Candidate | Role                                             |
| ----------- | --------- | ------------------------------------------------ |
| canvas      | #F7F4EC   | Main cream background.                           |
| surface     | #FFFCF8   | Cards and input surfaces.                        |
| peach       | #FFDCC2   | Planned and welcoming moments.                   |
| mint        | #78CFC3   | Active focus and primary brand field.            |
| sky         | #CBE8EF   | Informational secondary field.                   |
| lavender    | #D8C7F2   | Reflection and insight field.                    |
| ink         | #243331   | Primary text on light fields.                    |
| muted-ink   | #5D6C69   | Supporting text.                                 |
| success-ink | #276D64   | Completed status and accessible text accent.     |
| repair-ink  | #8A513C   | Conflict/repair state without alarm-red framing. |


Target [WCAG 2.2](https://www.w3.org/TR/WCAG22/) AA: 4.5:1 for normal text, 3:1 for large text, and 3:1 for meaningful non-text controls. Do not rely on the attractive low-contrast combinations in the references as production-ready.

### 8.4 Typography

- **Poppins remains the production default** for body copy, inputs, times, labels, dense reports, and headings until a second family proves worthwhile.
- **Sentic Display is an optional candidate introduced by this planner**, not a requirement found in the source folder. If licensed and tested, limit it to welcome, screen titles, Sunday postcard headlines, and rare expressive numbers.
- Use tabular numerals where time and durations align.
- Never fake bold with unsupported weights.

Sentic Display is a commercial family. Embedding it in iOS/Android requires an app license, not merely a desktop or web license. Confirm the license and add the font assets before evaluating it in a build.
Source: [Sentic Display licensing](https://www.myfonts.com/collections/sentic-display-font-headfirst/)

### 8.5 Illustration and motion

- Create one consistent Orin illustration family: same outline weight, skin-tone diversity, mint/peach/lavender palette, and restrained backgrounds.
- Use illustrations at emotional transitions, not as permanent wallpaper behind data.
- Prefer a 180–240 ms ease-out for route and state transitions.
- If user testing supports it, install the SDK-compatible expo-haptics package and use a light selection haptic for moving a slot and a success haptic for check-in. Provide an app-level off switch and never use repetitive warning vibration.
- Respect reduced motion and platform font scaling.
- Minimum interactive target: 44 points on iOS and 48 dp on Android where layout allows.

Source: [Expo SDK 57 Haptics](https://docs.expo.dev/versions/v57.0.0/sdk/haptics/)

---



## 9. Data architecture



### 9.1 Security blocker in the supplied schema

The current schema grants authenticated users table-level create/read/update/delete and sets rowSecurity to false. Appwrite documents that row-level permissions apply only when row security is enabled, and table-level permissions grant access across the table. As exported, an authenticated user can potentially access another user’s rows. This must be fixed before inviting testers or adding sensitive reflection/proof data.

Required rule for every private table:

- Row Security: ON.
- Direct client-write tables: authenticated CREATE only at table level; owner row permissions are mandatory.
- Function-owned tables such as schedule_applications, weekly_reports, and server-only credentials: no client table permission. The trusted Function creates rows and grants the owner only the reads/updates the product needs.
- No table-level READ, UPDATE, or DELETE for all users.
- Each new row: owner-only read/update/delete permissions.
- Server Functions derive the authenticated user; never trust a userId submitted by the client as authorization.

Sources: [Appwrite database permissions](https://appwrite.io/docs/products/databases/permissions), [Appwrite permissions patterns](https://appwrite.io/docs/advanced/security/permissions)

### 9.2 Final V2 schema — deployed 2026-08-23

Schema V2 is final for the beginning of Phase 1. The machine-readable source of truth is `creative_direction/blueprint/schema.v2.json`; the gatekeeping copy is `appwrite-schema-copy/manifests/orin.schema.v2.json`.

| Table | Purpose | Writer and access |
| --- | --- | --- |
| profiles | Private handle, locale, time zone, planning bounds, active preset, onboarding version | Function-created; owner read/update |
| activities | Durable activity identity and defaults | Client create; owner read/update/delete |
| presets | Protected reusable weekly template metadata | Client create; owner read/update/delete |
| preset_slots | Normalized weekday/time/activity rows for a preset | Client create; owner read/update/delete |
| schedule_applications | Idempotent record of applying a preset to a week | Function-created; owner read |
| schedule_slots | Dated runtime plan, snapshots, move chain, status, and mutation identity | Function-created; owner read/update |
| checkins | Per-slot outcome, actual duration, optional reasons and note | Function-created; owner read/update/delete |
| daily_reflections | One nightly reflection and optional note for tomorrow | Function-created; owner read/update/delete |
| notification_preferences | One account-scoped notification/privacy preference row | Function-created; owner read/update |
| weekly_reports | Versioned Sunday summary and deterministic metrics snapshot | Function-created; owner read |

There is deliberately no `auth_handles` table. The Appwrite account ID is stable from anonymous creation through email/password upgrade, and `profiles.handle` is non-unique private display identity.

All ten tables have row security enabled. Only `activities`, `presets`, and `preset_slots` grant authenticated table-level create; no table grants broad read, update, or delete. Owner row grants are attached at row creation. Reference fields are indexed `varchar(36)` IDs rather than native relationship columns because Appwrite rejected indexes on relationship attributes; Functions/services enforce same-owner references and archive/delete behavior.

Appwrite Cloud Free allows one database and does not include encrypted columns. V2 therefore reuses `orin-database-dev` (`6a4bead3002f1426a8ee`) and relies on TLS plus least-privilege row permissions for server data. Sensitive offline notes still require the separately planned client-side encryption. Field-level database encryption can be reconsidered on Pro.

Sources: [Appwrite Free-plan limits](https://appwrite.io/docs/advanced/billing/free), [Appwrite plan comparison](https://appwrite.io/pricing), [Appwrite database encryption](https://appwrite.io/docs/advanced/security/encryption), [Appwrite TLS](https://appwrite.io/docs/products/network/tls)

Live verification after push: 10 tables, 89 columns, 17 indexes, zero column/index problems, row security on for every table, and a second push reported no drift. The provisioner has seven passing contract tests and refuses database creation, non-final manifests, unsafe permissions, Free-plan-incompatible encrypted columns, and rendered-config drift.

Mobile baseline verification: strict ESLint with zero warnings, Prettier checking, six Jest tests, Expo dependency alignment, and all 21 Expo Doctor checks pass. React Native Appwrite uses one deduplicated Expo FileSystem 57 dependency; a checked-in `patch-package` compatibility patch selects Expo's explicit legacy FileSystem entrypoint required by the current SDK upload implementation.

Dependency-audit note: npm currently reports 11 moderate advisories through the Expo toolchain's transitive `uuid` chain. The suggested forced remediation would move Orin off the approved Expo SDK 57 line, so it was deliberately not applied. Track the upstream Expo dependency resolution and keep `npm audit`, Expo dependency checking, and Expo Doctor in the release gate.

### 9.2A Historical schema draft — superseded


| Table                                                      | Essential fields                                                                                                                                                                                                                                                                                                                 | Key indexes and constraints                                                                                                        |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| auth_handles (only if Section 13.1 exact auth is approved) | Row ID = handleKey; registrationRequestId; accountId; passwordHash; hashVersion; registrationState; recoveryState; createdAt; updatedAt                                                                                                                                                                                          | Unique registrationRequestId; unique accountId; server-only with no client permissions.                                            |
| profiles                                                   | Row ID = account ID; handle; handleKey; timeZone; locale; wakeMinute; sleepMinute; weekStartsOn; activePresetId; onboardingVersion                                                                                                                                                                                               | Unique handleKey; profile row ID is the account ID.                                                                                |
| activities                                                 | userId; name; description; category; iconKey; colorToken; defaultDurationMin; startCue; archivedAt                                                                                                                                                                                                                               | userId + archivedAt + name.                                                                                                        |
| presets                                                    | userId; name; description; colorToken; revision; archivedAt                                                                                                                                                                                                                                                                      | userId + archivedAt + name.                                                                                                        |
| preset_slots                                               | userId; presetId; activityId; weekday; startMinute; durationMin; flexibility; windowStartMinute; windowEndMinute; position                                                                                                                                                                                                       | presetId + weekday + startMinute; reject overlaps in the service.                                                                  |
| schedule_applications                                      | userId; presetId; targetWeekStart; presetRevision; strategy; requestId; status; createdAt                                                                                                                                                                                                                                        | Unique userId + requestId; userId + targetWeekStart.                                                                               |
| schedule_slots                                             | userId; localDate; timeZone; startsAt; endsAt; startMinute; durationMin; activityId nullable; activityNameSnapshot; categorySnapshot; iconKeySnapshot; colorTokenSnapshot; sourcePresetId; sourcePresetSlotId; applicationId; materializationKey; rootSlotId; supersedesSlotId; moveSequence; status; revision; clientMutationId | Unique userId + materializationKey; unique userId + clientMutationId; userId + localDate + startMinute; rootSlotId + moveSequence. |
| checkins                                                   | userId; scheduleSlotId; outcome; actualDurationMin; reasonCodes; note; occurredAt; clientMutationId                                                                                                                                                                                                                              | Unique scheduleSlotId for one canonical check-in; userId + occurredAt; unique clientMutationId.                                    |
| daily_reflections                                          | userId; localDate; noteForTomorrow; completedAt                                                                                                                                                                                                                                                                                  | Unique userId + localDate.                                                                                                         |
| notification_preferences                                   | Row ID = account ID; activityStartsEnabled; nightlyEnabled; weeklyEnabled; quietStartMinute; quietEndMinute; privacyMode; hapticsEnabled                                                                                                                                                                                         | Account row ID.                                                                                                                    |
| weekly_reports                                             | userId; weekStartLocalDate; generatedAt; dataVersion; summary; metricsJson                                                                                                                                                                                                                                                       | Unique userId + weekStartLocalDate. Store only after report generation moves server-side.                                          |


Later additions:

- activity_sets and set_items.
- proof_files metadata plus a private Appwrite Storage bucket.
- achievements only if materializing unlock state improves latency.



### 9.3 Historical manifest prose — superseded by the final JSON contract above

Phase 1 must create `orin/appwrite/schema.v2.json` as the single machine-readable manifest consumed by the provisioning script and validated in CI. Do not hand-create production columns from this prose. In the manifest, every column declares Appwrite type, size, required/null, default, array, and relationship behavior; every index declares its name, type, ordered columns, and sort directions.

Notation below: `!` is required, `?` is nullable, and `=value` is the default. Service validation must enforce the ranges because a database type alone does not express all product rules.


| Table                      | Column contract                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| auth_handles (conditional) | `$id=handleKey`; `registrationRequestId:string(64)!`; `accountId:string(36)!`; `passwordHash:string(255)!`; `hashVersion:int!=1`; `registrationState:enum(reserved,user_created,profile_created,active,cleanup_pending)!=reserved`; `recoveryState:enum(none,email_pending,email_verified)!=none`; `createdAt:datetime!`; `updatedAt:datetime!`. The encoded Argon2id hash contains its unique salt and parameters. This table is server-only: row security on, no client table or row permissions.                                                                                                                                                                                                                                      |
| profiles                   | `$id=accountId`; `handle:string(24)!`; `handleKey:string(24)!`; `timeZone:string(64)!`; `locale:string(16)!=en`; `wakeMinute:int!=420`; `sleepMinute:int!=1380`; `weekStartsOn:int!=1`; `activePresetId:relationship?`; `onboardingVersion:int!=0`. `handleKey` is lower-case ASCII `[a-z0-9_]{3,24}` after trimming; keep a separate future display name if broader Unicode identity is wanted.                                                                                                                                                                                                                                                                                                                                         |
| activities                 | `userId:string(36)!`; `name:string(120)!`; `description:string(2000)!=\"\"`; `category:string(40)!=other`; `iconKey:string(40)!=circle`; `colorToken:string(32)!=mint`; `defaultDurationMin:int!=30` (1–720); `startCue:string(240)?`; `archivedAt:datetime?`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| presets                    | `userId:string(36)!`; `name:string(120)!`; `description:string(1000)!=\"\"`; `colorToken:string(32)!=mint`; `revision:int!=1`; `archivedAt:datetime?`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| preset_slots               | `userId:string(36)!`; `presetId:relationship!`; `activityId:relationship!`; `weekday:int!` (0–6); `startMinute:int!` (0–1439); `durationMin:int!` (1–720); `flexibility:enum(fixed,window)!=fixed`; `windowStartMinute:int?`; `windowEndMinute:int?`; `position:int!`. Window fields are both null for fixed slots and both present for flexible slots.                                                                                                                                                                                                                                                                                                                                                                                  |
| schedule_applications      | `userId:string(36)!`; `presetId:string(36)!`; `targetWeekStart:string(10)!`; `presetRevision:int!`; `strategy:enum(merge,replace,remaining)!`; `requestId:string(64)!`; `status:enum(staged,committed,failed)!`; `createdAt:datetime!`. This is Function-owned.                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| schedule_slots             | `userId:string(36)!`; `localDate:string(10)!`; `timeZone:string(64)!`; `startsAt:datetime!`; `endsAt:datetime!`; `startMinute:int!`; `durationMin:int!`; `activityId:relationship?`; `activityNameSnapshot:string(120)!`; `categorySnapshot:string(40)!`; `iconKeySnapshot:string(40)!`; `colorTokenSnapshot:string(32)!`; `sourcePresetId:string(36)?`; `sourcePresetSlotId:string(36)?`; `applicationId:string(36)?`; `materializationKey:string(160)!`; `rootSlotId:string(36)!`; `supersedesSlotId:string(36)?`; `moveSequence:int!=0`; `status:enum(planned,completed,partial,moved,missed,intentionally_skipped,canceled)!=planned`; `revision:int!=1`; `clientMutationId:string(64)!`. “Active” is derived from time, not stored. |
| checkins                   | `userId:string(36)!`; `scheduleSlotId:relationship!`; `outcome:enum(completed,partial,missed,intentionally_skipped)!`; `actualDurationMin:int?` (0–1440); `reasonCodes:string(40)[]!=[]` (maximum five); `note:string(2000)?`; `occurredAt:datetime!`; `clientMutationId:string(64)!`.                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| daily_reflections          | `userId:string(36)!`; `localDate:string(10)!`; `noteForTomorrow:string(1000)?`; `completedAt:datetime!`; `clientMutationId:string(64)!`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| notification_preferences   | `$id=accountId`; `activityStartsEnabled:boolean!=false`; `nightlyEnabled:boolean!=false`; `weeklyEnabled:boolean!=false`; `quietStartMinute:int!=1320`; `quietEndMinute:int!=420`; `privacyMode:enum(generic,title)!=generic`; `hapticsEnabled:boolean!=true`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| weekly_reports             | `userId:string(36)!`; `weekStartLocalDate:string(10)!`; `generatedAt:datetime!`; `dataVersion:int!`; `summary:string(4000)!`; `metricsJson:string(16000)!`. This is Function-owned and must validate serialized data against a versioned report schema.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |




Exact indexes to encode in that manifest:

- `auth_handles_request_uq`: unique `(registrationRequestId)` and `auth_handles_account_uq`: unique `(accountId)` when custom auth is enabled; the row ID itself uniquely reserves handleKey.
- `profiles_handle_key_uq`: unique `(handleKey)`.
- `activities_owner_archive_name_idx`: key `(userId, archivedAt, name)`.
- `presets_owner_archive_name_idx`: key `(userId, archivedAt, name)`.
- `preset_slots_preset_day_position_uq`: unique `(presetId, weekday, position)`; `preset_slots_preset_day_start_idx`: key `(presetId, weekday, startMinute)`.
- `applications_owner_request_uq`: unique `(userId, requestId)`; `applications_owner_week_idx`: key `(userId, targetWeekStart)`.
- `schedule_owner_materialization_uq`: unique `(userId, materializationKey)`; `schedule_owner_mutation_uq`: unique `(userId, clientMutationId)`; `schedule_owner_date_start_idx`: key `(userId, localDate, startMinute)`; `schedule_owner_status_date_idx`: key `(userId, status, localDate)`; `schedule_root_move_uq`: unique `(rootSlotId, moveSequence)`.
- `checkins_owner_slot_uq`: unique `(userId, scheduleSlotId)`; `checkins_owner_mutation_uq`: unique `(userId, clientMutationId)`; `checkins_owner_time_idx`: key `(userId, occurredAt)`.
- `reflections_owner_date_uq`: unique `(userId, localDate)`; `reports_owner_week_uq`: unique `(userId, weekStartLocalDate)`.

Relationship and deletion rules:

- `profiles.activePresetId → presets`: set null.
- `preset_slots.presetId → presets`: cascade only when an unreferenced preset is permanently purged; normal user action archives the preset.
- `preset_slots.activityId → activities`: restrict. Activities are archive-only in v1; hard delete is blocked while referenced.
- `schedule_slots.activityId → activities`: set null. Snapshot fields keep history intelligible.
- `checkins.scheduleSlotId → schedule_slots`: restrict. Historical schedule chains are not hard-deleted through the client.
- No relationship may cross owners; the Function/service verifies both row permissions and equal owner IDs.



### 9.4 Modeling rules

1. Presets and preset slots are timeless templates.
2. The client generates one requestId for an apply attempt. Replaying it returns the same schedule_application; the Function does not create another batch.
3. Applying a preset copies the relevant fields and activity snapshots into concrete dates. Each generated slot gets deterministic `materializationKey = preset|userId|localDate|sourcePresetSlotId`; the unique index makes a retry or second apply harmless.
4. A manual slot uses `materializationKey = manual|userId|clientMutationId`. Never make retry safety depend only on a transaction.
5. Allocate each initial slot ID before staging its create and set rootSlotId to that same ID. A move is a state transition, not an in-place time rewrite: in one transaction mark the current leaf `moved`, create a successor with the same rootSlotId, set supersedesSlotId to the prior leaf, and increment moveSequence. Only one non-terminal leaf may exist per root.
6. Reports count a root chain once: the root is the original planned baseline, the latest leaf is the current promise, and its canonical check-in supplies the outcome/actual duration. A move never doubles planned or completed totals.
7. Runtime edits affect only a dated chain. “Update the preset too” is a separate, explicit action with a before/after preview and its own mutation ID.
8. Activity name, category, icon, color, and original planned duration are snapshotted at materialization. Activities and applied presets are archive-only in v1, so later edits or archival cannot erase historical meaning.
9. Store localDate plus IANA timeZone and UTC timestamps. Never derive every local day by splitting a UTC ISO string.
10. Use integer minutes for local planning inputs, not free-form time strings; use stable IDs, not names, for relationships.
11. Use short Appwrite transactions for preset application, moves, and check-in plus schedule-status updates. Refetch and retry transaction conflicts using the same idempotency key.
12. Add an index for each real query pattern; Appwrite recommends compound indexes for multi-column filters.

Sources: [Appwrite tables and indexes](https://appwrite.io/docs/products/databases/tables), [relationships](https://appwrite.io/docs/products/databases/relationships), [transactions](https://appwrite.io/docs/products/databases/transactions)

### 9.5 Migration approach

Do not mutate the current arrays in place while the app is live.

1. Export a backup and run a scripted preflight that records every legacy row ID, claimed userId, current permissions, and inferred account owner; stop on missing, conflicting, or unknown owners.
2. Provision new v2 tables with row security, the writer-specific table permissions from Section 9.1, owner-only row grants, and exact indexes from the start.
3. Write a dry-run migration that parses existing activities/timings/daySlots arrays and reports malformed or mismatched groups.
4. Map activity names to IDs; flag ambiguous duplicates for manual resolution.
5. Create preset rows and normalized preset-slot rows while deriving ownership from trusted account context, not a submitted userId.
6. Verify counts, owner permissions, and representative weeks for each migrated user; record the permission changes needed for rollback and run the two-account isolation suite before exposing v2 reads.
7. Switch the app to v2 reads behind a schema-version flag.
8. For legacy tables, use a controlled maintenance step: assign and verify owner R/U/D grants, enable row security, rerun two-account tests, then remove broad table R/U/D. If any check fails, restore the recorded permissions before reopening writes.
9. Remove old access only after the rollback window closes and a restore rehearsal succeeds.

---



## 10. Backend and frontend boundaries



### 10.1 Appwrite services

Keep Appwrite as the primary platform:

- Auth and session management.
- TablesDB for private product data.
- Storage for later proof images.
- Functions for server-trusted work.
- Messaging for later remote push.

Suggested Functions:

1. **apply-preset-to-week** — validate ownership, stage schedule-slot creation and active-preset update in one transaction, and return conflicts clearly.
2. **generate-weekly-report** — aggregate the previous local week, write a versioned snapshot, and generate only evidence-based observations.
3. **send-report-ready** — later, publish a remote push without exposing provider credentials to the client.
4. **delete-account-data** — later, remove private rows and files as a deliberate privacy workflow.

Local activity and nightly reminders do not need a backend round trip.

### 10.2 Frontend organization

Keep Expo Router route files thin. Move behavior into focused feature folders:

- features/activities/
- features/presets/
- features/schedule/
- features/checkins/
- features/reports/
- features/notifications/
- features/auth/
- providers/QueryProvider.jsx
- storage/mmkv.js
- sync/outbox.js
- constants/theme.js

Each feature owns its API functions, query keys, hooks, validation, components, and tests. Split the current presets.jsx and timeline.jsx rather than adding more state to files that are already difficult to reason about.

### 10.3 Query and offline model

1. Add TanStack Query only when screens migrate to feature hooks.
2. Include the account ID in every private query key.
3. Persist small read models and the notification ledger in MMKV.
4. Keep writes in an explicit durable outbox with clientMutationId, entity revision, createdAt, and retry count.
5. Apply optimistic UI immediately.
6. Flush FIFO on reconnect.
7. Treat duplicate delivery as success through idempotency.
8. Show a conflict screen for meaningful schedule edits; do not silently use last-write-wins.
9. Clear private cache, outbox, and notification ledger on logout or account switch.
10. Exclude reflection notes, free-text reasons, and proof metadata from the general persisted query cache. Keep only the minimal dated/outcome fields needed to render offline state.
11. Encrypt an offline outbox entry that contains a reflection note with a per-install MMKV key held in expo-secure-store; purge the key and data on logout/account switch. SecureStore holds the small key, not large payloads.
12. Never persist API keys, raw session secrets, or unencrypted proof images. Proof media is not an offline-v1 feature.

TanStack’s persisted mutations require a default mutation function after restart because functions themselves are not serializable. An explicit outbox is easier to audit for this product.
Sources: [TanStack React Native guidance](https://tanstack.com/query/latest/docs/framework/react/react-native), [network modes](https://tanstack.com/query/latest/docs/framework/react/guides/network-mode), [persisted queries](https://tanstack.com/query/latest/docs/framework/react/plugins/createAsyncStoragePersister), [MMKV](https://github.com/mrousavy/react-native-mmkv), [Expo SDK 57 SecureStore](https://docs.expo.dev/versions/v57.0.0/sdk/securestore/)

### 10.4 Cloudflare and Redis decision

Do not add Cloudflare or Upstash/Redis in the first three phases. Appwrite already covers the current authentication, data, transaction, storage, scheduled-function, and messaging needs. A second backend would create more secrets, retry paths, tenant checks, and observability work without a measured bottleneck.

Reconsider only when evidence exists:

- Cloudflare Workers: public edge endpoint, webhook verification, abuse protection, or geographically distributed custom API behavior.
- Redis/Upstash: server-side hot cache, distributed ephemeral lock, or rate limiter that Appwrite cannot satisfy.
- QStash: retry/delivery workflows that Appwrite scheduled or delayed Functions cannot meet.

---



## 11. Notifications and native testing



### 11.1 Correct the current assumption

Expo SDK 57 documents that local notifications remain available in Expo Go. Remote push notifications are unavailable in Expo Go on Android from SDK 53 and require a development build. Even so, Orin should use development builds as the default because notification configuration, MMKV, native identifiers, deep links, and release behavior need the real native app.

Source: [Expo SDK 57 notifications](https://docs.expo.dev/versions/v57.0.0/sdk/notifications/)

### 11.2 Notification architecture

- Keep expo-notifications aligned to the SDK 57-compatible version using Expo’s installer.
- Add the expo-notifications config plugin.
- Define Android package and iOS bundle identifiers.
- Register the same platform IDs in Appwrite and call client.setPlatform.
- Create an Android notification channel before requesting permission.
- Ask for permission in context, after explaining the value.
- Store a local notification ledger keyed by scheduleSlotId plus revision.
- Reconcile that ledger with the OS on app launch.
- Cancel and recreate only affected future reminders.
- Never browse a past date and accidentally schedule its activity for tomorrow.
- Add deep-link data so a nightly notification opens the correct check-in route.
- Keep notification copy concise and private.
- Respect quiet hours and provide a one-tap disable path.

Apple’s guidance says notifications should be timely and high value, should avoid repetition, and should avoid sensitive content.
Source: [Apple notification guidance](https://developer.apple.com/design/human-interface-guidelines/notifications)

### 11.3 Android exact-timing policy

V1 reminders are helpful prompts, not an alarm-clock guarantee. Use ordinary OS-scheduled notifications by default and do **not** declare `USE_EXACT_ALARM` merely to make marketing copy sound precise. The Today screen remains the source of truth if Android batches a reminder.

During internal testing, measure scheduled-versus-delivered drift. If users demonstrate that minute-exact calendar reminders are core to Orin:

1. Add `SCHEDULE_EXACT_ALARM`, not the auto-granted restricted alternative, and explain the special access in context.
2. Check exact-alarm capability before scheduling; treat denied or later-revoked access as a normal state.
3. Fall back to an inexact reminder plus the in-app Day Pulse. Never silently drop the slot or repeatedly ask for access.
4. Test Android 12–15 with access allowed, denied, revoked, after reboot, and after backup/restore.
5. Consider `USE_EXACT_ALARM` only after confirming Google Play eligibility and completing the required declaration; record that decision in the release checklist.

Android documents that exact-alarm special access is needed on Android 12+ and is denied by default for many fresh installs targeting Android 13+.
Sources: [Android exact-alarm guidance](https://developer.android.com/develop/background-work/services/alarms), [Android 14 default behavior](https://developer.android.com/about/versions/14/changes/schedule-exact-alarms), [Google Play exact-alarm policy](https://support.google.com/googleplay/android-developer/answer/9888170)

### 11.4 Recommended build workflow

1. **Expo Go:** quick layout and pure-JavaScript smoke checks only.
2. **Development build:** install SDK-compatible expo-dev-client, create the native app, and use it as the normal environment for notifications, SecureStore, MMKV, deep links, and haptics.
3. **Preview/internal distribution:** production-like build for trusted testers without a development server.
4. **Production build:** store-signed release gate.

On Windows:

- Use npx expo run:android for local native builds when the Android toolchain is available.
- Use EAS cloud builds for iOS and repeatable team builds.
- Do not plan around eas build --local on Windows.

Sources: [Expo development builds](https://docs.expo.dev/develop/development-builds/introduction/), [using a development build](https://docs.expo.dev/develop/development-builds/use-development-builds/), [internal distribution](https://docs.expo.dev/build/internal-distribution/)

---



## 12. Step-by-step delivery roadmap



### Phase 0 — Lock product decisions and create a trustworthy baseline

**Outcome:** The team knows what v1 is, the current app can be evaluated reliably, and no private tester data is exposed.

- [x] Adopt the “adaptive day companion” direction and v1 scope in this document.
- [x] Decide the guest-first authentication path described in Section 13.1.
- [ ] Keep Poppins by default; evaluate Sentic Display only if the optional art-direction candidate is approved and mobile-app licensing is confirmed.
- [ ] Android and iOS both use `com.naumaniqbal2005.orin`; register/verify both Appwrite platforms before the next native build.
- [x] Align dependencies to Expo SDK 57 and install expo-dev-client; expo-secure-store remains pending until the encrypted offline outbox begins.
- [ ] Record the Android exact-alarm decision and fallback from Section 11.3.
- [x] Add strict zero-warning ESLint, Prettier checking, Jest, React Native Testing Library, and guest-auth service tests. TypeScript remains a staged migration.
- [ ] Capture current key screens as a visual baseline.
- [x] Reset the early test tables, retain a local pre-V2 config backup, and provision every V2 table with row security and no broad private-data grants. Two-account row tests remain required once Functions create rows.

**Exit gate:**

- Two test accounts cannot read, update, or delete each other’s rows.
- The app launches in a development build.
- Dependency compatibility checks pass.
- Current activity, preset, and settings smoke tests are repeatable.



### Phase 1 — Build the v2 schema and data services

**Outcome:** Orin has a safe model for activities, templates, dated schedule instances, and check-ins.

- [x] Implement and test the Appwrite guest-session and in-place email-upgrade service core; custom handle authentication and `auth_handles` are explicitly rejected.
- [x] Finalize, render, and provision profiles, activities, presets, preset_slots, schedule_applications, schedule_slots, checkins, daily_reflections, notification_preferences, and weekly_reports from Schema V2.
- [x] Deploy all 17 named indexes, scalar reference-ID rules, row security, and writer-specific table permissions. Owner row grants are enforced when the upcoming services/Functions create rows.
- [ ] Add schema constants and runtime validation in the app.
- [ ] Implement idempotent profile initialization.
- [ ] Replace preset parallel arrays with normalized slot rows.
- [ ] Implement v2 activity and preset APIs using IDs.
- [ ] Implement preset application as an atomic, request-idempotent operation with deterministic slot materialization keys.
- [x] Record that no row migration is required because the early database was intentionally reset; preserve `appwrite.config.pre-orin-v2.json` as the config rollback artifact.

**Exit gate:**

- The chosen auth promise is implemented and security-tested; the app does not disguise email login as handle login.
- A preset can be applied twice without duplicate schedule slots.
- A malformed legacy preset is reported, not silently corrupted.
- Deleting or archiving an activity does not erase historical meaning.
- DST and time-zone boundary tests pass.



### Phase 2 — Prove the complete vertical slice

**Outcome:** One user can plan, adapt, and check in across an app restart.

- [ ] Build full-screen activity create/edit/archive.
- [ ] Build full-screen preset create/edit with overlap validation.
- [ ] Build apply-preset preview and conflict choices.
- [ ] Replace the timeline’s direct preset read with a dated schedule query.
- [ ] Build Day Pulse and accessible timeline states.
- [ ] Add move, shrink, swap, release, and undo.
- [ ] Build a minimal check-in route with canonical outcomes.
- [ ] Persist through restart and verify on two devices/accounts.

**Exit gate:**

- Moving today’s occurrence does not change the preset.
- “Update preset too” is explicit and previewed.
- The live timeline reloads the same state after restart.
- Every repair action is possible without a modal workflow.



### Phase 3 — Close the daily loop

**Outcome:** Notifications lead to a useful, low-pressure reflection.

- [ ] Add Android channel and notification permission education.
- [ ] Add a durable notification ledger and startup reconciliation.
- [ ] Schedule start reminders only for future dated slots.
- [ ] Schedule the nightly reflection after the final planned activity, bounded by quiet hours.
- [ ] Route notification taps to the correct date.
- [ ] Add the optional reason step and note for tomorrow.
- [ ] Add offline check-in outbox and idempotent synchronization.

**Exit gate:**

- No duplicate reminders after app restart or preset reapplication.
- Editing/canceling a slot reconciles the OS reminder.
- A check-in completed offline survives app termination and synchronizes once.
- Denied notification permission never blocks the product loop.



### Phase 4 — Close the weekly loop

**Outcome:** Sunday produces insight without becoming a scorecard.

- [ ] Implement deterministic weekly aggregations with unit tests.
- [ ] Build Simple and Deep report views.
- [ ] Add Recovery Credit and plan-versus-reality visuals.
- [ ] Let the user choose one experiment for the next week.
- [ ] Add an Appwrite Function for versioned report snapshots.
- [ ] Add a weekly notification only after the report exists.

**Exit gate:**

- Report totals reconcile with raw schedule slots and check-ins.
- Every generated observation identifies its data basis and sample size.
- Missing data produces neutral copy, not invented insight.
- The report never mutates a preset automatically.



### Phase 5 — Guided onboarding and visual cohesion

**Outcome:** A new user reaches a believable first week without encountering a generic account wall.

- [ ] Build the handle-first multi-step onboarding flow.
- [ ] Let the user choose day bounds and a starter intention.
- [ ] Offer starter activities as editable seeds, not permanent hidden defaults.
- [ ] Generate a first-week preview with visible breathing room.
- [ ] Ask for notifications only after showing the exact benefit.
- [ ] Apply semantic color and typography tokens across every route.
- [ ] Add illustration only to welcome, empty, transition, and celebration states.
- [ ] If haptics tested well, install expo-haptics through Expo’s installer, respect hapticsEnabled, and verify supported/unsupported-device behavior.
- [ ] Test 200% font scaling, screen readers, color-independent states, reduced motion, and small devices.

**Exit gate:**

- Median first-plan completion in usability tests is under five minutes.
- Users can explain the difference between a preset and this week.
- All primary text and controls meet the target contrast.
- No primary workflow depends on a blurred overlay modal.



### Phase 6 — Internal release

**Outcome:** Orin is installed and exercised in production-like conditions.

- [ ] Add development, preview, and production profiles in eas.json.
- [ ] Configure Android APK internal distribution and iOS ad hoc/TestFlight path.
- [ ] Complete the Section 14.4 provider/retention/consent decision; if the decision is “none,” ship no telemetry SDK.
- [ ] If approved, add error reporting and the minimal analytics events only after automated redaction tests pass.
- [ ] Run the complete test matrix in Section 15.
- [ ] Publish a rollback checklist and data-backup procedure.
- [ ] Invite a small cohort and run two complete weekly loops before expanding.

**Exit gate:**

- Preview builds install without a development server.
- Cross-user security tests pass in the production-like Appwrite project.
- A seven-day dogfood cycle produces a correct Sunday report.
- No P0/P1 crash, data-loss, notification-duplication, or privacy issue remains.



### Phase 7 — Deliberate retention features

Add one at a time and measure whether it helps the user’s real behavior:

1. Sets/bundles.
2. Proof Garden.
3. Recovery achievements.
4. Flexible activity windows.
5. Personal duration suggestions.
6. Calendar import.
7. Remote report-ready push.
8. Explainable AI suggestions.

---



## 13. Decisions that must be explicit



### 13.1 Handle-first authentication

**Decision: approved and partially implemented on 2026-08-23.**

1. On the first useful entry path, create an Appwrite anonymous session with `account.createAnonymousSession()` and keep its account ID as the permanent Orin owner ID.
2. Ask for a private handle during guided setup. It is display identity only, allows duplicates, and is never used to log in.
3. Let the guest plan immediately. Before a logout, device transfer, or other risky action, explain that an unlinked guest account cannot be recovered.
4. At the first saved plan or “Sync & protect my progress,” collect email and password and call `account.updateEmail({ email, password })`. This upgrades the current anonymous account in place; it does not create a second user, change the ID, or migrate data.
5. If Appwrite returns an email conflict, keep the guest session and every guest-owned row intact. Offer another email. Do not automatically log into the existing account and do not attempt an implicit merge.
6. Send verification after upgrade but do not block normal app use. Recovery and dependable cross-device sign-in remain gated by clear verification messaging.
7. Existing verified users sign in with Appwrite email/password sessions. A future explicit account-merge flow requires its own threat model and is not part of V1.

The tested auth core now covers existing-session reuse, anonymous-session creation only after a 401, propagation of server/network errors, in-place email upgrade, deferred verification, and guest preservation on a 409 email conflict. The multi-step handle/profile UI and Function-owned profile initializer remain Phase 1 work.

Sources: [Appwrite anonymous login](https://appwrite.io/docs/products/auth/anonymous), [Appwrite email/password](https://appwrite.io/docs/products/auth/email-password), [Appwrite Account API](https://appwrite.io/docs/references/cloud/client-react-native/account)

### 13.2 Exact versus flexible time

Default to exact blocks in v1 because they are understandable and match the current editor. Add flexible windows later with an explicit fixed/flexible control. Never infer flexibility from the activity name.

### 13.3 Missed versus intentionally skipped

These must be separate. “Missed” means intention remained but execution did not happen. “Chose not to do” is a valid decision and should not count as a broken promise in the same way.

### 13.4 Report generation

Compute reports deterministically from raw records first. Add generated natural-language copy only from a constrained set of tested templates. If AI narrative is explored later, every statement must be traceable to metrics and must never offer mental-health diagnosis.

---



## 14. Success metrics and anti-metrics



### 14.1 Product metrics

- Time from onboarding start to first applied week.
- Percentage of applied weeks with at least one completed or repaired activity.
- Start rate within 15 minutes of the planned block.
- Reschedule-to-completion rate.
- Plan abandonment rate.
- Nightly reflection completion when prompted.
- Sunday report open rate and experiment selection.
- Voluntary four-week return.
- Self-reported pressure versus clarity after reflection.



### 14.2 Quality metrics

- Duplicate notification rate.
- Offline mutation recovery rate.
- Sync conflict rate.
- Cross-user authorization failures in automated tests.
- Crash-free development/preview sessions.
- Report reconciliation errors.
- Accessibility audit pass rate.



### 14.3 Anti-metrics

Do not optimize:

- Notification count.
- Time spent inside Orin.
- Number of activities scheduled.
- Streak length.
- Completion percentage without context.
- Photos uploaded.

More app engagement can mean the planner is demanding attention rather than helping the user live.

Privacy-safe events may include onboarding_completed, preset_applied, schedule_repaired, checkin_completed, weekly_report_opened, and weekly_experiment_selected. Never send activity names, reflection notes, reason text, or image metadata to analytics.

### 14.4 Telemetry and retention gate

No analytics or crash provider is selected by this roadmap, so collection defaults to **off**. Before inviting testers, write a one-page telemetry decision naming the provider—or explicitly choosing none—and include:

- Exact event/error fields, purpose, lawful/consent basis, access list, deletion path, and a privacy-notice update.
- Raw product-event retention of at most 30 days for the internal cohort, followed by deletion or aggregation; crash payload retention of at most 14 days.
- Session replay, screenshots, view hierarchies, request/response bodies, console breadcrumbs containing user content, and automatic network capture disabled.
- A tested scrubber for account identifiers, route parameters, activity titles, free-text notes, reason text, notification data, and proof metadata.
- General persisted queries exclude sensitive reflection text. An encrypted offline note exists only until successful sync; logout, account switch, or account deletion purges it and its SecureStore-held key.
- A tester-facing diagnostics control to view whether telemetry is enabled and opt out without disabling Orin’s core loop.

Production retention and consent must be decided from actual legal/market requirements, not copied from these internal-test limits.

---



## 15. Verification matrix



### 15.1 Automated

- Schema-manifest validation and a dry-run that fails on production drift in columns, indexes, permissions, or relationship deletion rules.
- Service unit tests for time parsing, overlap rules, apply-request replay, deterministic materialization, move chains, weekly ranges, chain de-duplication, report aggregation, and mutation idempotency.
- React Native Testing Library tests for onboarding, legacy redirects, apply preview, Day Pulse, repair, check-in, and report states.
- Appwrite integration tests with two users attempting list/get/update/delete on each other’s guessed row IDs, forged userId creates, and cross-owner relationships.
- Guest-first auth tests: existing-session reuse, 401-only anonymous creation, non-auth error propagation, stable-ID email upgrade, verification request, email-conflict guest preservation, logout warning, and eventual end-to-end recovery/cross-device tests.
- Migration tests for empty, malformed, mismatched, duplicate-name, and partially migrated legacy presets.
- Offline tests for cached launch, encrypted pending note, queued write, restart, reconnect, duplicate delivery, conflict, logout purge, and account switch.
- Expo dependency/config compatibility in CI.

Expo’s official test stack is Jest plus React Native Testing Library; React 19 projects should not use the deprecated react-test-renderer.
Source: [Expo unit testing](https://docs.expo.dev/develop/unit-testing/)

### 15.2 Physical-device notification matrix


| State                             | iOS                                                            | Android                                                                             |
| --------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Permission not asked              | Explain value, then request in context.                        | Create channel before the Android 13 permission request.                            |
| Permission denied                 | Product remains usable; show settings path only when relevant. | Same.                                                                               |
| Exact-alarm access denied/revoked | Not applicable.                                                | Fall back to ordinary scheduling; no crash, repeated prompt, or missing dated slot. |
| Foreground                        | Subtle in-app update, no duplicate banner behavior.            | Same.                                                                               |
| Background                        | Correct reminder and deep link.                                | Correct channel, reminder, and deep link.                                           |
| Terminated                        | Tap opens the correct dated route.                             | Tap opens the correct dated route.                                                  |
| Edited/canceled slot              | Old reminder removed; new one exists once.                     | Same.                                                                               |
| Time-zone/DST change              | Reconcile future triggers.                                     | Reconcile future triggers.                                                          |
| Device reboot                     | Verify platform persistence and startup reconciliation.        | Verify platform persistence and startup reconciliation.                             |


Run notification tests in both debug development builds and release-like preview builds.

### 15.3 Manual product QA

- Small phone, large phone, and tablet-width behavior.
- 200% system font size.
- Screen reader names and action hints.
- Reduced motion.
- Color-blind simulation and grayscale.
- Slow network, airplane mode, server 401/409/429/500.
- Empty, one-item, dense-day, overnight, overlapping, and all-day-free schedules.
- Monday/Sunday week boundaries and multiple time zones.
- Logout/account switch with cached private data.

---



## 16. File map for implementation



### Existing files likely to change

- orin/app.json
- orin/package.json
- orin/app/_layout.jsx
- orin/app/(tabs)/_layout.jsx
- orin/app/(tabs)/timeline.jsx
- orin/app/(tabs)/presets.jsx
- orin/app/(tabs)/activities.jsx
- orin/app/(auth)/register.jsx
- orin/lib/appwrite.js
- orin/lib/auth.js
- orin/lib/user.js
- orin/lib/activities.js
- orin/lib/presets.js
- orin/lib/schedule.js
- orin/lib/checkins.js
- orin/lib/notifications.js
- orin/types/index.js
- orin/constants/color.js

Keep creative_direction/blueprint/schema.json as the reviewed legacy export; create a versioned v2 manifest instead of overwriting the source artifact.

### New files/directories to introduce deliberately

- orin/eas.json
- orin/constants/theme.js
- orin/providers/QueryProvider.jsx
- orin/storage/mmkv.js
- orin/storage/secureKey.js
- orin/sync/outbox.js
- orin/appwrite/schema.v2.json
- orin/scripts/provision-appwrite.*
- orin/scripts/preflight-legacy-permissions.*
- orin/scripts/migrate-schema-v2.*
- orin/features/activities/
- orin/features/presets/
- orin/features/schedule/
- orin/features/checkins/
- orin/features/reports/
- orin/features/notifications/
- orin/app/onboarding/
- orin/app/activity/
- orin/app/preset/
- orin/app/schedule/
- orin/app/check-in/
- orin/app/report/
- orin/app/(tabs)/today.jsx
- orin/app/(tabs)/plan.jsx
- orin/app/(tabs)/insights.jsx
- orin/app/(tabs)/you.jsx
- orin/app/you/settings.jsx
- orin/functions/auth-handle/ if the exact brief is approved
- orin/functions/apply-preset-to-week/
- orin/functions/generate-weekly-report/
- orin/**tests**/ or co-located feature tests
- orin/e2e/

The exact language for provisioning and Functions should follow the repo’s chosen server runtime; do not add multiple runtimes.

---



## 17. Immediate first ten work items

This is the recommended implementation queue:

1. [ ] Back up the pre-V2 config and repair Appwrite row security are complete; prove two-account row isolation after the Function-owned row creators exist.
2. [x] Align Expo SDK 57 packages and create EAS development/preview/production profiles; produce the next development build after Appwrite platform registration.
3. [x] Decide and document the guest-first, in-place email/password upgrade approach with a private non-unique handle.
4. [x] Write and provision the normalized v2 schema manifest, scalar reference rules, least-privilege permissions, and 17 named indexes.
5. [ ] Add tests for request idempotency, deterministic materialization, move chains, report de-duplication, and template/runtime isolation.
6. [ ] Implement activity/preset v2 services and migrate a sample preset.
7. [ ] Apply a preset into dated schedule slots transactionally using an application request ID and deterministic materialization keys.
8. [ ] Replace the timeline’s template read with dated Day Pulse data.
9. [ ] Add one repair action and one check-in outcome end to end, including offline restart.
10. [ ] Add the nightly notification ledger and physical-device test gate.

Only after item 10 should the team expand report visuals, onboarding illustration, Proof Garden, or achievements.

---



## 18. Source map



### Behavior and product design

- [Planning fallacy paper](https://bear.warrington.ufl.edu/brenner/mar7588/Papers/buehler-et-al-1994.pdf) — supports bringing personal past duration into future estimates.
- [Goal-monitoring meta-analysis](https://pubmed.ncbi.nlm.nih.gov/26479070/) — supports recorded progress while not prescribing a punitive score.
- [Implementation-intention meta-analysis](https://www.tandfonline.com/doi/abs/10.1080/10463283.2024.2334563) — supports optional if–then “soft starts.”
- [Current procrastination review](https://www.nature.com/articles/s44159-024-00341-w) — supports treating procrastination as more than poor calendar discipline.
- [Digital habit-intervention review](https://pmc.ncbi.nlm.nih.gov/articles/PMC11161714/) — maps common intervention components.
- [Self-compassion review](https://pubmed.ncbi.nlm.nih.gov/28810473/) — supports a cautious non-punitive direction.
- [Sunsama timeboxing](https://help.sunsama.com/docs/getting-started/basics/timeboxing-the-basics/) — estimate-driven calendar blocks.
- [Sunsama daily planning](https://help.sunsama.com/docs/usage-guides/daily-planning/) — workload preview and reflection ritual.
- [Todoist recurring dates](https://www.todoist.com/help/articles/introduction-to-recurring-dates-YUYVJJAV) — occurrence edit versus recurrence rule.
- [Reclaim flexible habits](https://help.reclaim.ai/en/articles/4129152-habits-overview-auto-schedule-flexible-time-for-your-routines) — flexible windows and explicit conflict behavior.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) — contrast, control, and scalable-text targets.
- [Apple notification design](https://developer.apple.com/design/human-interface-guidelines/notifications) — timely, private, non-repetitive notification behavior.



### Expo and delivery

- [Expo SDK 57 notifications](https://docs.expo.dev/versions/v57.0.0/sdk/notifications/)
- [Expo SDK 57 SecureStore](https://docs.expo.dev/versions/v57.0.0/sdk/securestore/)
- [Expo SDK 57 Haptics](https://docs.expo.dev/versions/v57.0.0/sdk/haptics/)
- [Expo development builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [Use a development build](https://docs.expo.dev/develop/development-builds/use-development-builds/)
- [Expo internal distribution](https://docs.expo.dev/build/internal-distribution/)
- [Expo unit testing](https://docs.expo.dev/develop/unit-testing/)
- [Android exact-alarm guidance](https://developer.android.com/develop/background-work/services/alarms)
- [Google Play exact-alarm policy](https://support.google.com/googleplay/android-developer/answer/9888170)



### Authentication and privacy

- [Appwrite anonymous login](https://appwrite.io/docs/products/auth/anonymous)
- [Appwrite email/password](https://appwrite.io/docs/products/auth/email-password)
- [OWASP password storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)



### Appwrite and offline data

- [React Native quick start](https://appwrite.io/docs/quick-starts/react-native)
- [Database permissions](https://appwrite.io/docs/products/databases/permissions)
- [Tables and indexes](https://appwrite.io/docs/products/databases/tables)
- [Rows](https://appwrite.io/docs/products/databases/rows)
- [Relationships](https://appwrite.io/docs/products/databases/relationships)
- [Transactions](https://appwrite.io/docs/products/databases/transactions)
- [Scheduled Functions](https://appwrite.io/docs/products/functions/functions)
- [Messaging providers](https://appwrite.io/docs/products/messaging/providers)
- [TanStack Query for React Native](https://tanstack.com/query/latest/docs/framework/react/react-native)
- [TanStack persisted query client](https://tanstack.com/query/latest/docs/framework/react/plugins/createAsyncStoragePersister)
- [React Native MMKV](https://github.com/mrousavy/react-native-mmkv)

---



## 19. Final recommendation

Build Orin from the loop outward, not from the tab bar inward.

First secure the data. Then make a preset produce private, dated instances. Then make one instance easy to understand, repair, and check in. Then let a week of those records teach the user something specific. Only after that should Orin add proof, achievements, flexible automation, or AI.

If this order is followed, the pastel visual language will have something meaningful to express: not perfection, but a plan that can bend without breaking.
