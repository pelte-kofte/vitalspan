# Vitalspan Today Experience

**Status:** Approved for implementation planning

**Document role:** Canonical product specification for the Today experience

**Canonical parents:** `PRODUCT_BIBLE.md`, `SCREEN_BIBLE.md`, `FEATURE_BIBLE.md`

## Purpose

Today is Vitalspan's personalized daily health briefing.

It answers one question:

> What should I focus on today?

Today is not a dashboard, health-history screen, protocol checklist, research feed, AI destination, or collection of feature shortcuts.

Within five seconds, the user should understand:

1. How they are doing today.
2. Whether they are moving in the right direction.
3. What one action matters most.

The experience should feel complete after one normal scroll. A user should be able to leave within one or two minutes feeling informed, capable, and ready to continue their day.

## Product Principles

- The Daily Health Brief explains.
- Top Priorities act.
- One action is visually dominant.
- Understanding comes before action.
- Facts, interpretation, and recommendations remain distinct.
- Governed scientific output remains authoritative.
- Missing information never becomes an invented conclusion.
- Progress encourages consistency rather than perfection.
- Silence is preferable to filler.
- AI improves language and synthesis but is never a hard dependency.
- Premium increases personalization, not content density.
- Deep analysis belongs in Health, action management belongs in Plan, and education belongs in Learn.

## Content Priority

When multiple items compete for attention, Today uses this order:

1. Governed safety concerns
2. Today's highest-impact opportunity
3. Relevant long-term health trends
4. Positive progress worth recognizing
5. Routine reminders

Safety is the only conditional content permitted to appear before the Daily Health Brief.

Account notices, promotions, setup prompts, research, and Premium messaging must not outrank the Daily Health Brief unless they block safe use.

## Screen Hierarchy

The normal hierarchy is:

1. Context Header
2. Daily Health Brief
3. Top Priorities
4. Key Insight, when supported
5. Today's Progress
6. Quick Actions, when useful

A governed safety notice may appear between the Context Header and Daily Health Brief.

Optional sections are omitted when they have no useful content. The screen must not preserve empty sections to maintain visual symmetry.

## Context Header

The header establishes the moment without competing with the briefing.

It may contain:

- A time-aware greeting
- The current date
- The user's preferred name when it can be presented naturally

It must not contain:

- Health interpretation
- Account management
- Settings
- Repetitive instructional copy
- Promotional messaging

## Safety Notice

A Safety Notice answers:

> Is there something I should review before continuing?

It is shown only for a current, governed, actionable safety concern.

It contains:

- A calm title
- A concise explanation
- Relevant uncertainty
- The appropriate next action
- Professional-care language when required

Safety presentation must:

- Remain available regardless of Premium status
- Avoid prescription-change recommendations
- Avoid implying that no detected interaction guarantees safety
- Avoid alarming colors or language unless governed urgency requires them
- Consolidate multiple related concerns rather than stacking warnings
- Remain operational when AI is unavailable

Presentation preferences or dismissed priorities must never suppress new governed safety information.

## Daily Health Brief

The Daily Health Brief answers:

> How am I doing today?

It is the first normal content section and the narrative anchor of Today.

The Brief explains the user's current health picture. It should not routinely end by repeating the action already shown in Top Priorities.

The Brief explains. Top Priorities act.

An action may appear inside the Brief only when it is necessary to understand an urgent governed safety issue.

The Brief may describe:

- The current overall health picture
- Supported direction over time
- The most relevant contributing context
- Important limitations
- Data completeness or freshness when it materially affects interpretation

The Brief should:

- Use approximately two to four short sentences
- Lead with meaning rather than metrics
- Use plain, calm language
- Distinguish unavailable information from reassuring information
- State uncertainty honestly
- Avoid generic motivational filler
- Avoid unexplained scores
- Avoid duplicating the primary priority

If direction is unsupported, the Brief says that history is insufficient or that direction cannot yet be determined. It never infers improvement, decline, stability, or risk from an ungoverned signal.

The user may request a focused explanation of the Brief. Deeper source, confidence, and limitation information belongs behind progressive disclosure or in the owning destination.

## Top Priorities

Top Priorities answers:

> What should I do?

It contains:

- Exactly one Primary Focus
- Up to two Secondary Priorities

### Primary Focus

The Primary Focus contains:

- A verb-led title
- One concise reason
- Timing or effort when known
- One primary action
- A “Why this?” explanation

It must:

- Be supported by current available information
- Route directly to the relevant task
- Avoid invented urgency
- Avoid invented treatment
- Avoid fabricated exercise, habit, or schedule information
- Avoid repeating the Daily Health Brief

Completing the Primary Focus updates only the affected Today content.

### Secondary Priorities

Secondary Priorities are optional, compact, and visually subordinate.

They must:

- Never compete with the Primary Focus
- Never display additional primary buttons
- Never exist merely to fill space
- Route directly to the relevant context

An educational item may appear only when it directly supports the current health picture or priority.

### Priority Preference

Users may indicate that a non-safety priority does not fit today.

Possible reasons include:

- Not relevant
- Already completed elsewhere
- Cannot do today
- Prefer another valid option

This changes presentation only. It does not alter scientific history, remove underlying data, or claim that the issue is resolved.

## Key Insight

Key Insight answers:

> What is the one thing worth understanding today?

Key Insight should not appear every day.

It should only appear when there is something genuinely worth understanding.

Silence is preferable to filler.

The section must be omitted when no supported insight exists.

A supported Key Insight may describe:

- A governed trend
- A meaningful stable pattern
- A positive achievement
- A newly available result
- A supported cross-domain relationship
- A relevant limitation in data quality

Rules:

- Show exactly one insight or none.
- Explain why it matters.
- Route to Health or Learn for depth.
- Never infer a trend from one measurement.
- Never present ungoverned attribution.
- Never use anxiety to manufacture relevance.

## Today's Progress

Today's Progress answers:

> What have I completed today?

It may contain:

- A plain-language completion summary
- A lightweight progress indicator
- The next due saved-plan action
- One inline completion control when supported
- A route to the full Plan

It must:

- Emphasize consistency rather than perfection
- Avoid guilt, pressure, and streak anxiety
- Avoid confetti or exaggerated celebration for routine medication adherence
- Avoid fabricating an action when no plan exists
- Keep health outcomes distinct from task completion
- Preserve medication and supplement safety information

Today does not own editing, scheduling, or managing the complete plan. Those responsibilities belong to Plan.

## Quick Actions

Quick Actions are contextual tools.

They are not feature shortcuts.

The list should change naturally over time.

Users should never feel that they are browsing app functionality.

Quick Actions must not duplicate the Primary Focus.

Rules:

- Show no more than four.
- Select actions according to current relevance.
- Omit the section when no actions are useful.
- Do not reserve a permanent shortcut for every feature.
- Route directly to the task rather than a generic feature landing page when possible.

Possible actions include:

- Add a result
- Import a laboratory PDF
- Log movement
- Open today's plan
- Connect health data
- Complete profile information

When adding a result, manual entry is the primary option and laboratory PDF import is secondary.

## Entry States

### Cold Launch

A Cold Launch begins at the top of Today.

Behavior:

- Show a structure-matched loading state while initial local context is restored.
- Present reliable content as soon as it is available.
- Resolve the Daily Health Brief, Priority, Insight, and Progress from one consistent snapshot.
- Do not show stale account, Premium, or AI state while access and identity are still being restored.
- Do not block essential safety content on AI or Premium resolution.

### Resume

Resume returns the user to their previous Today position when the session remains contextually valid.

Behavior:

- Refresh time-sensitive content when the day, relevant data, or plan state changed.
- Preserve the user's reading position when no material change occurred.
- Avoid replaying entrance animations.
- Announce only material state changes.

If the local day changed, Today refreshes daily actions and completion without rewriting historical completion.

### Notification Entry

A notification opens the exact relevant destination or context.

Behavior:

- A safety notification opens the relevant safety review.
- A plan notification opens the relevant plan item or Plan context.
- A health update opens the relevant Health detail.
- An insight notification opens the relevant insight explanation.

A notification must never dump the user at the generic top of Today when a precise destination exists.

Back navigation should return to the expected prior application context. If the app was cold-launched, back should return to an appropriate stable root rather than a dead end.

### Deep Link Entry

A deep link opens the exact metric, action, explanation, or content destination it identifies.

Behavior:

- Do not require a pass through the generic Today top.
- Restore required authentication or access state before revealing protected content.
- Preserve the intended destination through access restoration.
- Back navigation follows the expected application hierarchy.
- Invalid or obsolete links resolve to a calm unavailable state with an appropriate next destination.

### Plan Completion Return

Returning after completing a Plan action refreshes only:

- Top Priorities, if the completed action affected priority selection
- Today's Progress
- Daily Health Brief, only if the completion materially changes its interpretation
- Key Insight, only if the completion creates or invalidates a supported insight

The screen should preserve its prior scroll position and acknowledge completion calmly.

It must not immediately replace every completed task with another demand.

### Health Update Return

Returning from Health refreshes the Daily Health Brief, Top Priorities, Key Insight, and Today's Progress only when relevant data changed.

Behavior:

- Use the new governed Health state.
- Preserve unchanged content and scroll position.
- Do not animate unchanged sections.
- Do not infer that a changed value represents improvement or decline unless a governed trend supports it.
- Route unresolved source conflicts back to the exact Health context.

## User Flows

### Daily Arrival

1. The user opens Today.
2. The Context Header establishes the moment.
3. A governed Safety Notice appears if required.
4. The user reads the Daily Health Brief.
5. The user identifies the Primary Focus.
6. The user acts, asks why, or continues.
7. The user sees a supported Key Insight when one exists.
8. The user reviews Today's Progress.
9. The user uses a contextual Quick Action or leaves.

### Completing the Primary Focus

1. The user selects the Primary Focus.
2. The exact relevant destination opens.
3. The user completes the task.
4. Returning to Today refreshes affected sections only.
5. Completion is acknowledged calmly.
6. A new focus appears only when another valid focus genuinely matters.

### Exploring Why

1. The user opens “Why this?”
2. A concise explanation separates:
   - Observed fact
   - Interpretation
   - Suggested action
3. The user may continue to Health or Learn for depth.

### Reviewing Progress

1. The user understands completion at a glance.
2. The next supported item may be completed inline.
3. The user opens Plan for editing, scheduling, or the full list.

## Interactions

### Primary Actions

- Use clear verb-led labels.
- Provide immediate pressed feedback.
- Use haptics only as supplementary feedback.
- Prevent duplicate submissions.
- Explain disabled actions.

### Why This

- Expand a concise rationale without leaving Today.
- Do not expose technical provenance by default.
- Provide a route to source, confidence, and limitations when appropriate.
- Announce expanded and collapsed state.

### Completion

- Use a visible, explicit control.
- Make completion reversible when the owning Plan behavior permits it.
- Announce state changes.
- Update progress without requiring a full-screen reload.

### Refresh

- Preserve existing valid content.
- Replace content only when newer valid information is ready.
- Do not destroy the briefing when one source fails.

### Navigation

- Do not use hidden gesture-only actions.
- Do not create dead ends.
- Open exact destinations whenever possible.
- Preserve expected back behavior.
- Keep settings and account management in You.

## Deterministic Fallback

When AI is unavailable, Today must still feel complete.

The briefing is generated from governed product rules.

AI only improves language and synthesis.

It never becomes a hard dependency.

### Governed Inputs

The fallback may use authorized presentation states from:

- The current user profile, limited to relevant available fields
- Governed laboratory-range interpretation
- Governed scientific result availability and requirement states
- Approved trend outputs
- Data freshness
- Saved Plan items and today's completion state
- Governed safety candidates
- Verified connected-health availability and authorized summaries
- Completed movement records

The fallback must consume presentation-ready states. It must not calculate or reinterpret scientific results.

### Brief Construction

The deterministic Brief should:

1. State the most relevant supported current health picture.
2. State supported direction when a governed trend exists.
3. State uncertainty or missing context when direction is unavailable.
4. Avoid repeating the Primary Focus.

The fallback uses calm, predefined product language. It must not expose an empty AI placeholder or suggest that AI analysis occurred.

### Direction and Uncertainty

Direction may be expressed only when supplied by an approved trend output.

Otherwise use bounded language such as:

- Direction cannot yet be determined.
- More history is needed to describe change.
- Current information is incomplete.
- The latest available information is older and may not reflect today.

The fallback must never derive direction from a single measurement or compare values that are not scientifically comparable.

### Missing Data

Missing information is described as a limitation, not a health problem.

The fallback may:

- State which category of understanding is unavailable
- State what additional information would help
- Route to the exact relevant collection flow

It must not:

- Impute values
- Substitute population averages
- Treat missing data as normal
- Treat missing data as abnormal
- Estimate a blocked scientific output

### Safety

Safety remains fully operational without AI.

Governed Safety Notices:

- Continue to appear before the Brief
- Preserve their approved meaning and priority
- Route to the exact review context
- Never depend on generated language to remain understandable

### Priorities

Priority selection remains fully operational without AI.

Priorities are selected from authorized, available actions. AI may improve explanation language but may not create, rank, suppress, or upgrade a safety or scientific priority.

### Stale Data

When staleness materially affects interpretation, the fallback:

- Identifies that the information is older
- Provides the relevant date or understandable age of the information
- Explains that it may not represent the current state
- Offers an update or retest action when appropriate

It must not describe stale data as deterioration.

### Prohibited Inferences

The deterministic fallback must never infer:

- Diagnosis
- Prognosis
- Individual disease risk
- Improvement or decline without a governed trend
- Scientific confidence
- Causal attribution
- A most-important biological contributor
- Planned exercise or habits that do not exist
- Treatment or prescription changes
- Safety from the absence of a detected interaction

### Fallback UI

The user sees the normal Daily Health Brief component populated with deterministic language.

The UI must not show:

- An empty AI card
- A broken personalized-insight placeholder
- Technical AI errors
- A request to retry AI before Today becomes useful

If richer explanation is temporarily unavailable, the core briefing, safety, priority, progress, and navigation remain usable.

## Loading States

### Initial Loading

Show a structure-matched skeleton for:

1. Context Header
2. Daily Health Brief
3. Primary Focus
4. Key Insight or Today's Progress

The skeleton must not imply that optional sections will appear.

### Partial Loading

- Show reliable sections as soon as possible.
- A deterministic Brief may appear while richer synthesis is pending.
- Delay only the optional content that is unresolved.
- Avoid layout jumps that move the Primary Focus unexpectedly.

### Refreshing

- Preserve existing content.
- Show a lightweight refresh indicator.
- Update only changed sections.

### AI Unavailable

Use the Deterministic Fallback. Do not show an AI-specific empty or loading state.

### Access Resolution

- Do not show a paywall or Premium content before entitlement is known.
- Do not block essential safety or the basic Brief.

## Empty and Partial States

### New User

Use a hopeful introduction and one highest-value setup action.

Possible actions:

- Complete the health profile
- Connect Apple Health
- Add laboratory results
- Log a first activity

Do not show multiple empty sections.

### No Laboratory Data

- Explain that blood-based interpretation is not yet available.
- Offer Add Result.
- Make manual entry primary and PDF import secondary.
- Do not estimate Blood phenotypic age.

### Partial Required Laboratory Data

- Describe progress neutrally.
- Make the next useful missing measurement actionable.
- Keep the complete requirement checklist available through progressive disclosure or Health.
- Do not describe missing data as a health concern.

### No Connected-Health Data

- Do not infer sleep, recovery, activity, or readiness.
- Explain that those parts of the picture are unavailable.
- Offer connection as a contextual Quick Action when useful.
- Preserve valid laboratory interpretation.

### No Plan

- Do not show an empty protocol list.
- State that no daily plan is configured.
- Offer a route to create or review a Plan.

### No Supported Key Insight

Omit Key Insight.

Do not display “No insight today,” “Nothing changed,” or another filler state.

### Everything Complete

- Acknowledge completion calmly.
- Do not manufacture another task.
- Offer optional relevant learning only when genuinely useful.

### No Action Required

The Primary Focus may state that no action is required from the currently available information.

Provide one short explanation and an optional route to Health or Learn.

## AI Integration

AI is present through intelligence, not branding.

AI may:

- Improve the language and synthesis of the Daily Health Brief
- Explain why an authorized priority matters
- Connect supported relationships across domains
- Adapt explanation depth to the user
- Suggest relevant follow-up questions
- Personalize a supported Key Insight

AI may not:

- Calculate scientific output
- Select or suppress governed safety independently
- Create a scientific status
- Change confidence
- Fill missing scientific context
- Infer an unsupported trend
- Diagnose
- Recommend prescription changes
- Invent evidence
- Turn weak evidence into certainty
- Create urgency for engagement
- Replace deterministic fallback behavior

Free users receive:

- A useful basic Daily Health Brief
- One clear Primary Focus
- Essential safety information
- Today's Progress
- Core contextual actions

Premium may provide:

- Deeper personalization
- Cross-domain synthesis
- More relevant explanations
- Long-term pattern recognition
- Better continuity across visits

Premium must not add more sections or hide essential safety information.

## Motion

Motion explains state change and maintains orientation.

Permitted motion:

- Brief crossfade after a material update
- Completion checkmark transition
- Progress update
- Disclosure expansion
- Press feedback
- Calm transition when the Primary Focus changes

Avoid:

- Staggered card entrances
- Continuous pulsing
- Decorative background motion
- Animated numbers without meaning
- Celebration effects for medication adherence
- Motion that delays reading

When Reduce Motion is enabled, use opacity changes or immediate updates and disable pulsing or shimmer.

## Accessibility

### Structure

- Use one screen title and semantic headings for visible sections.
- Match reading order to visual priority.
- Announce Safety Notices before ordinary content.
- Do not create heading gaps for omitted sections.

### Text

- Support system text scaling.
- Do not truncate essential content.
- Let cards grow vertically.
- Support long names and localized text.

### VoiceOver

Every interactive element communicates:

- What it is
- Current state
- Result of activation
- Why it matters when necessary

### Touch and Motor Access

- Use at least 44-point interaction targets.
- Provide adequate spacing.
- Avoid gesture-only controls.
- Separate completion from destructive or dismissive actions.

### Color and Contrast

- Never communicate meaning by color alone.
- Pair status color with text or iconography.
- Use neutral styling for missing information.
- Meet accessible contrast requirements.

### Motion and Sensory Access

- Respect Reduce Motion.
- Use haptics only as supplementary feedback.
- Avoid flashing and attention-seeking loops.

### Cognitive Accessibility

- Use plain language.
- Keep paragraphs short.
- Present one primary action.
- Preserve a consistent section order.
- Avoid unexplained abbreviations and technical labels.

## Edge Cases

### Multiple Safety Concerns

Consolidate related concerns into one Safety Notice with one review action.

### Safety and Priority Conflict

Safety appears first. The ordinary Primary Focus remains available but visually secondary until the concern is reviewed.

### Conflicting Sources

Do not select the value that produces the strongest message. State that sources disagree and route to Health for resolution.

### Stale Information

State that interpretation is based on older information. Recommend an update without claiming deterioration.

### Future-Dated or Invalid Data

Exclude it from the Brief and route correction to the owning screen.

### One Measurement

Do not describe direction or trend.

### Missing Scientific Inputs

Preserve unavailable output. Never substitute averages or estimates.

### Unavailable Domain

Omit it from synthesis and narrow the Brief. Do not represent the domain as healthy.

### Offline

Show the most recent valid Brief with understandable last-updated context. Explain which actions require connectivity.

### AI Failure

Use the Deterministic Fallback. Do not display raw errors or fabricated content.

### Data Updated Elsewhere

Refresh only affected Today sections on return.

### Day Rollover

Update daily priorities and completion for the new local day without rewriting history.

### Long or Localized Content

Use flexible vertical layouts. Never reduce text below accessible sizes to preserve fixed card height.

### No Relevant Quick Actions

Omit Quick Actions.

## Success Criteria

The Today experience is successful when:

- Users understand today's health picture within seconds.
- Users identify one meaningful focus without searching.
- The Brief and Primary Focus do not duplicate each other.
- Supported insights appear only when genuinely useful.
- Quick Actions feel contextual rather than navigational.
- Completing an action updates only relevant content.
- Precise entry points open precise destinations.
- Today remains complete when AI is unavailable.
- Safety, scientific limitations, and missing information remain accurate.
- Users feel informed and hopeful rather than judged or overwhelmed.
- The screen remains useful without encouraging longer screen time.

## Anti Goals

Today must never:

- Become a dashboard
- Display every metric
- Duplicate Health or Plan
- Show a daily Key Insight by obligation
- Use Quick Actions as a feature menu
- Require AI to function
- Invent scientific interpretation
- Encourage endless scrolling
- Create anxiety through excessive alerts
- Use guilt, streak pressure, or artificial urgency
- Prioritize promotions over health understanding
- Dump notification or deep-link users at a generic destination when precise context exists
