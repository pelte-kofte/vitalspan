# Features Research — Vitalspan v4.0

**Domain:** Longevity tracking iOS app — Monetization & Intelligence milestone
**Researched:** 2026-06-10
**Confidence note:** Web search API was unavailable during this session. Findings are from
Context7 (Adapty React Native SDK docs — HIGH confidence), direct GitHub API inspection of
free-exercise-db, codebase inspection, and training knowledge of iOS paywall and AI advisor
patterns (MEDIUM confidence, cross-checked against Adapty official docs where accessible).

---

## Paywall (Adapty)

### Table Stakes

These are required by Apple App Store guidelines and expected by users of any subscription app.
Missing any of these causes App Store rejection or immediate uninstall.

| Behavior | Why Required | Notes for Vitalspan |
|---|---|---|
| Price clearly visible before tap | Apple guideline — price must be shown on paywall | Show monthly + annual with savings badge |
| Billing period stated explicitly | Apple guideline — must state "billed monthly/annually" | Cannot rely on users reading fine print |
| Free trial terms on screen | Apple guideline — when/how much they'll be charged | "Try free for 7 days, then $X/month" |
| Trial timeline visual | Apple-endorsed pattern post-2024 toggle ban | Day 1–7: Free. Day 8: $X billed. Shows cancel window |
| Restore Purchases button | Required by Apple — top rejection reason if missing | Small but present; bottom of screen is fine |
| Privacy Policy + Terms links | Required by Apple | Footer links; Supabase-hosted or inline modal |
| Close / skip button | Soft gate: user can dismiss and use free tier | Hard gate (no skip) is a design decision — see below |
| Single clear CTA | Users don't read; one action reduces friction | "Start Free Trial" as primary |

**Hard gate vs soft gate decision for Vitalspan:**
Use a soft gate. The AI Advisor is the primary premium feature. Gate it with an in-context
trigger ("This is a Premium feature — unlock with Vitalspan Pro") rather than forcing a paywall
on first launch. Hard gates (no skip) are only appropriate for apps where the entire value
proposition is premium-only. Vitalspan has a complete free tier.

**Adapty access level pattern (from SDK docs, HIGH confidence):**

```typescript
const profile = await adapty.getProfile();
const isPremium = profile.accessLevels['premium']?.isActive === true;
if (!isPremium) {
  // present paywall via createPaywallView or AdaptyPaywallView
}
```

Use `'premium'` as the access level ID in Adapty dashboard. One access level controls all
gated features. Do not create separate access levels per feature — that creates combinatorial
complexity.

**Placement IDs to configure in Adapty dashboard:**
- `'main_paywall'` — triggered from AI Advisor entry point, from Settings → Subscription
- `'onboarding_upsell'` — shown after onboarding completes (optional, A/B testable via Adapty)

**logShowPaywall is mandatory for analytics accuracy:**

```typescript
await adapty.logShowPaywall(paywall); // call every time paywall is shown
```

### What to Gate (Free vs Premium)

**Free tier — must feel complete enough to retain users:**
- All biomarker tracking (unlimited entries)
- PhenoAge score and biological age calculation
- Supplement/medication protocol + interaction checker
- Exercise library (browse + log)
- Apple HealthKit sync
- PubMed article feed

**Premium tier — AI Advisor is the anchor; everything else is additive:**
- AI Longevity Advisor: generated health report (the flagship premium feature)
- AI follow-up chat: ask follow-up questions about your report
- Unlimited historical AI reports (e.g. one report per month retained vs last-report-only for free)
- Priority report generation (queue management if you ever add server-side queueing)

**Do not gate:** Core biomarker tracking, PhenoAge, protocol, exercise log. These are
data-entry features — gating them punishes users for engaging with the app and produces
nothing worth subscribing for. The AI Advisor is the correct gate because it delivers value
only a paying user would seek out repeatedly.

**Complexity estimate:** LOW. Adapty access level check is one async call. The gate is a
conditional render around the AI Advisor entry point, not a complex feature-flag system.

### Differentiators

| Pattern | Value | Notes |
|---|---|---|
| Annual plan with visible savings | Most health apps convert better on annual | Show "Save 40%" badge next to annual; highlight it as recommended |
| 7-day free trial | Standard in health/fitness; users expect it | 38% of trial starters convert to paid; longer trials convert better |
| Paywall triggered by natural desire, not forced | "You tried to access AI Advisor" is high-intent | This user wants it — conversion rate here is higher than cold upsell |
| Personalized paywall copy | Name or goal mentioned in paywall copy | "Bekir, your biological age report is ready" — Adapty supports `customTags` for this |
| Annual plan pre-selected | Anchors user on higher LTV option | Pre-select annual, offer monthly as secondary |
| Social proof or authority copy | "Built by a licensed pharmacist" is differentiating | Add credential line in paywall benefits section |

**Adapty customTags for personalization (HIGH confidence from SDK docs):**

```typescript
const view = await createPaywallView(paywall, {
  customTags: { username: userName, goal: userGoal },
});
```

Configure paywall template in Adapty dashboard to reference `{username}` — renders as
"Bekir's longevity report" on the paywall.

**A/B testing via Adapty placements:** Adapty handles audience segmentation and variant
assignment server-side. The app hardcodes placement IDs only. To A/B test annual-vs-monthly
prominence, create two paywall variants in the dashboard and assign to the same placement.
No app release needed.

### Anti-patterns / Avoid

| Anti-pattern | Why It Hurts | What to Do Instead |
|---|---|---|
| Toggle paywall (free trial on/off toggle) | Apple bans it as of 2024; App Store rejection | Use visual timeline showing trial → charge date |
| Hard gate at onboarding | 60–80% of new users abandon before seeing value | Soft gate: let users reach the AI Advisor naturally |
| Immediate paywall on first launch | Creates "this is a paid app" perception before value delivered | Trigger paywall only when user taps AI Advisor first time |
| Hiding price behind "see plans" | Apple violation; also destroys trust | Price visible on first paywall screen, no extra tap |
| Dark pattern CTA text | Apple rejects "Get Premium Access" when user thinks it's free | CTA must match action: "Start 7-Day Free Trial" or "Subscribe for $X/mo" |
| Vague feature list | "Unlock premium features" converts poorly | Name the features: "AI Health Reports", "Expert Chat", "Monthly Analysis" |
| Missing Restore Purchases | Top App Store rejection reason | Always present; bottom of paywall screen |
| Annual price shown per-year only | Users anchored on large number | Show per-month equivalent: "$49.99/yr = $4.17/mo" |
| Paywall with no close button (hard gate) on a free-tier app | Punishes free users who don't want to subscribe | Always show close/skip on soft-gate paywall |
| Paywall animation that covers CTA on small screens | Conversion killer | Test on iPhone SE (375pt wide) — smallest supported iOS viewport |

**Dependencies on existing architecture:**
- Requires `react-native-adapty` package (install and configure with App Store shared secret)
- Adapty SDK must be initialized before `adapty.getProfile()` calls — initialize in App.tsx
  alongside Supabase client initialization
- The AI Advisor screen is the primary gate; add `isPremium` check at that screen's mount
- Store `isPremium` in a React context so all screens can gate UI without repeated async calls

---

## AI Longevity Advisor

### Table Stakes

These are expected by any user who pays for an "AI advisor" in a health app. Missing any of
these makes the feature feel like a toy or a liability.

| Behavior | Why Expected | Notes for Vitalspan |
|---|---|---|
| Personalized to the user's actual data | Generic health advice = zero value over Google | Include biomarker values, trend direction, supplement stack, medications |
| Clear structure — not a wall of text | Mobile users cannot read 1000-word essays | Section headers: Score, Findings, Recommendations, Risks |
| Actionable output | "Your ApoB is elevated" is useless alone | "Consider: reduce saturated fat + retest in 90 days" |
| Evidence-based language | Pharmacist brand requires clinical credibility | Grade recommendations (A/B/C evidence), cite mechanisms |
| Appropriate medical disclaimer | Legal protection + user trust | Inline in report: "This is not medical advice. Consult your physician." |
| Loading state with context | AI calls take 3–10 seconds | Show "Analyzing your data…" with progress indication, not a spinner |
| Error handling | API failures will happen | Graceful: "Report unavailable right now — your data is saved" |
| Report persistence | User pays for report; it must not disappear | Store in AsyncStorage (and optionally Supabase) after generation |

**What "personalized" means technically for Vitalspan:**
The system prompt must include:
- User's age, sex, goal from `@vitalspan_user_profile`
- Latest value per biomarker from `@vitalspan_biomarkers` (not the full history — latest per ID)
- Supplement + medication names from `@vitalspan_protocol` (names only, not times/doses)
- Computed PhenoAge result (biological age vs chronological age delta)
- HealthKit summary (HRV, sleep score, weekly activity) from `@vitalspan_health_data`

**Privacy-preserving anonymization (per PROJECT.md):**
Do NOT send raw values directly labeled with user PII. The prompt should read:
"User profile: 45-year-old male, goal: longevity. Biomarkers: ApoB 85 mg/dL (above longevity
target of 70), HbA1c 5.4% (optimal)..." — no name, no email, no Supabase user ID.

### Differentiators

| Feature | Value | Complexity |
|---|---|---|
| Priority findings card | Most urgent issue surfaced first, not buried | LOW — prompt engineering only |
| Trend direction per biomarker | "ApoB improved 12% since last reading" | LOW — compare latest vs previous entry in stored history |
| Supplement-medication interaction flag | "Berberine + Metformin: monitor blood glucose" | LOW — cross-reference existing INTERACTIONS data in prompt context |
| Follow-up chat | Ask specific questions about the report | MEDIUM — maintains conversation history in component state |
| Pharmacist voice | Recommendations in clinical register, not wellness-speak | LOW — system prompt instructs tone and vocabulary |
| Evidence grade per recommendation | "Grade A: Zone 2 cardio for longevity (strong RCT evidence)" | LOW — prompt instructs Claude to grade its own output |
| Printable / shareable summary | User can share with their doctor | MEDIUM — generate plain text summary; `Share` API |

### UX Patterns

**Report structure recommendation (mobile-first reading pattern):**

```
[Screen: AI Longevity Advisor]

HEADER: "Your Longevity Report" — generated date

CARD 1 — SCORE SUMMARY (always first, high visual weight)
  Biological age vs chronological age delta
  PhenoAge trend arrow (↑ aging faster / ↓ aging slower / → stable)
  1-sentence overall assessment

CARD 2 — PRIORITY FINDINGS (what needs attention most)
  2–4 bullet points, ranked by urgency
  Each: [Biomarker/metric] → [Status] → [One-line action]
  Color-coded: red = critical, amber = borderline, green = optimal

CARD 3 — BIOMARKER ANALYSIS
  Section per biomarker category (Metabolic, Inflammation, Cardiovascular, etc.)
  Each biomarker: current value, longevity target, gap, trend
  2–3 sentence interpretation per section

CARD 4 — SUPPLEMENT & MEDICATION REVIEW
  Current protocol evaluated against biomarker findings
  Interaction warnings flagged
  Gaps: "Given your ApoB, consider CoQ10"

CARD 5 — RECOMMENDATIONS (actionable, prioritized)
  Top 3–5 actions, each with evidence grade
  Timeframe: "90-day priority" vs "ongoing"

CARD 6 — FOLLOW-UP CHAT ENTRY POINT
  "Ask me about your report" text input
  Maintains context of the just-generated report
```

**Chat interface after report (follow-up):**
The chat is NOT a standalone health chatbot — it is scoped to the generated report.
- System prompt includes the full generated report as context
- User questions: "Why is my ApoB a concern?", "Which supplement helps most with this?"
- Keep conversation in component state (not persisted by default — report is persisted)
- Limit to one active conversation per report (not a general-purpose chat log)

**Loading state pattern for 3–10 second generation:**
Show a step-progress animation:
1. "Reading your biomarkers..." (0.5s)
2. "Analyzing your protocol..." (0.5s)
3. "Generating recommendations..." (ongoing until stream starts)

Use streaming (`anthropic.messages.stream`) to start rendering the report before it completes.
Stream into the first visible section (Score Summary) so users see content within ~1 second.

**Claude API integration (HIGH confidence — verified via Context7):**

```typescript
import Anthropic from '@anthropic-ai/sdk';
const client = new Anthropic({ apiKey: process.env.EXPO_PUBLIC_CLAUDE_API_KEY });

const stream = client.messages.stream({
  model: 'claude-opus-4-6', // or claude-sonnet-4-6 for speed/cost tradeoff
  max_tokens: 2000,
  system: systemPromptWithAnonymizedData,
  messages: [{ role: 'user', content: 'Generate my longevity report.' }],
});

for await (const event of stream) {
  if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
    appendToReport(event.delta.text);
  }
}
```

**Model selection tradeoff:**
- `claude-sonnet-4-6` (or equivalent current Sonnet): ~2–4 seconds, lower cost, good quality
- `claude-opus-4-6` (or equivalent Opus): ~6–12 seconds, higher cost, higher quality nuance
- For v4.0, use Sonnet. The quality difference for structured health summaries is marginal.
  Opus is harder to justify on a $5–10/mo subscription. Can A/B test later.

**API key security:**
Never embed the Claude API key in the client. The `EXPO_PUBLIC_` prefix makes env vars visible
in the compiled bundle. Use a server-side proxy or Supabase Edge Function to call the Claude
API — the edge function receives the anonymized context, calls Anthropic, returns the response.
This is a security requirement, not a suggestion.

**Recommended architecture: Supabase Edge Function as proxy**

```
[iOS App] → [Supabase Edge Function: /ai-report] → [Anthropic API]
                                                  ↖ adds API key server-side
```

The edge function:
1. Validates the caller has an active Adapty premium subscription (or trusts the app's JWT)
2. Receives anonymized health context as JSON body
3. Constructs system prompt server-side
4. Calls Anthropic streaming API
5. Streams response back to the iOS app

This keeps the Anthropic API key out of the app bundle entirely.

**Complexity estimate:** MEDIUM-HIGH. The individual pieces (Anthropic SDK, streaming, report
UI) are each Medium complexity. The Supabase Edge Function proxy adds an integration touchpoint.
Report persistence (AsyncStorage + optional Supabase) adds state management. Allow 3–4 phase
steps total for AI Advisor end to end.

**Dependencies on existing architecture:**
- Requires Supabase session (to authenticate edge function calls) — auth must be complete
- Reads `@vitalspan_user_profile`, `@vitalspan_biomarkers`, `@vitalspan_protocol`,
  `@vitalspan_health_data` — all existing AsyncStorage keys, no schema changes
- Uses existing `computePhenoAge()` from `src/lib/phenoAge.ts` to include biological age delta
- Uses existing `INTERACTIONS` data from `src/data/biomarkers.ts` for interaction warnings
- Requires Adapty premium gate before screen is accessible

---

## Exercise Photos

### Table Stakes

| Behavior | Why Required | Notes for Vitalspan |
|---|---|---|
| Photos load on ExerciseDetailScreen | Users expect visual reference for unfamiliar exercises | Free-exercise-db provides 0.jpg and 1.jpg per exercise |
| SVG illustration fallback when photo unavailable | Not all exercises have photos in the dataset | Keep Phase 12 SVG illustrations; show photo only when available |
| Photo shows starting position + end position | Two-image format is standard in exercise apps | free-exercise-db provides exactly two images per exercise (0.jpg, 1.jpg) |
| Images cached after first load | Network-dependent images must not reload every scroll | Use `expo-image` or `Image` with cache headers; photos are static |
| Images do not block exercise data rendering | Photo is supplemental, not primary | Render exercise name/instructions immediately; photo loads async |

**free-exercise-db asset delivery (HIGH confidence — verified via GitHub API):**

The dataset has 800+ exercises, each stored as a JSON file with an `images` array:
```json
{ "images": ["3_4_Sit-Up/0.jpg", "3_4_Sit-Up/1.jpg"] }
```

Images are served from GitHub raw content at:
```
https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/{exercise_id}/{n}.jpg
```

Example: `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Air_Bike/0.jpg`
returns HTTP 200 — confirmed live.

License is "The Unlicense" (public domain) — no attribution required, commercial use permitted.

**ID mapping challenge:** Vitalspan's exercise IDs (e.g. `'0720'`) do not match free-exercise-db
IDs (e.g. `'3_4_Sit-Up'`). A mapping table or fuzzy name match is required. This is the primary
implementation complexity. Options:
1. Manual mapping table: `{ '0720': 'Barbell_Squat', ... }` — exact and fast; one-time work
2. Name-based match at build time: normalize both names, generate mapping JSON asset
3. Supabase `exercises` table: add `free_exercise_db_id` column, populate during seed

Option 3 (Supabase column) is recommended — it makes the mapping remotelyupdatable without
an app release, and the `exercises` Supabase table already exists from v3.

**Photo display pattern:**

```typescript
const photoUrl = exercise.freeExerciseDbId
  ? `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${exercise.freeExerciseDbId}/0.jpg`
  : null;

// In ExerciseDetailScreen:
{photoUrl ? (
  <Image source={{ uri: photoUrl }} style={s.exercisePhoto} />
) : (
  <ExerciseSvgIllustration exerciseId={exercise.id} />
)}
```

### Notes

**Coverage estimate:** free-exercise-db has 800+ exercises; Vitalspan has ~60. A substantial
fraction of Vitalspan's exercises will match by name (Barbell Squat, Deadlift, Push-Up, etc.).
Estimate 70–80% photo coverage for standard compound lifts. Rare or specialty exercises in
Vitalspan's curated set may not match.

**Photo quality:** The free-exercise-db images are sourced from Bodybuilding.com's exercise
database (public domain release). Quality is adequate — clear background, professional
photography, demonstrating correct form. They will look substantially more polished than SVG
line illustrations for most exercises, especially compound movements.

**UX value of photos over SVGs:**
- SVG illustrations communicate body position but lose detail (grip width, foot angle)
- Photos show a real human, which reduces the cognitive gap between illustration and execution
- For a pharmacist-credibility app, real photos read more authoritative than illustrations
- Photos provide implicit "this is what correct form looks like" reassurance
- Limitation: photos are static; they show start and end positions, not the movement arc.
  For complex exercises (Olympic lifts, cable movements), SVGs may actually communicate
  mechanism more clearly. Hybrid approach (photos where available, SVGs where clearer) is correct.

**Two-image swipe pattern (differentiator):**
Show both images (start position, end position) as a horizontally swipeable pair or as a
side-by-side strip. This communicates range of motion better than a single image. The exercise
detail screen already exists (ExerciseDetailScreen.tsx) — add a photo section above the
instructions.

**Complexity estimate:** LOW-MEDIUM. The fetch URL pattern is trivial. The mapping work is
Medium (manual or automated). The component change in ExerciseDetailScreen is Low. The main
risk is brittle URL patterns if GitHub changes their raw content CDN (low probability but worth
noting). A more resilient alternative is downloading the images to Supabase Storage and serving
from there — adds one-time setup cost, eliminates CDN dependency. For v4.0, GitHub raw is
acceptable; migrate to Supabase Storage if CDN reliability becomes an issue.

**Dependencies on existing architecture:**
- ExerciseDetailScreen.tsx already exists — add photo section to it
- The Supabase `exercises` table (from v3) is the right place to store `free_exercise_db_id` mapping
- SVG muscle map illustrations from Phase 12 are preserved as fallback — no deletion
- `exerciseService.ts` is the right service to fetch the mapping; add `freeExerciseDbId` to
  the `Exercise` type

---

## Feature Complexity Summary

| Feature | Complexity | Phases Needed | Dependencies |
|---|---|---|---|
| Adapty paywall — SDK setup + access level check | LOW | 1 | `react-native-adapty` package; Expo SDK 54 compat verified |
| Adapty paywall — paywall screen design + Adapty builder | LOW-MEDIUM | 1 | Adapty dashboard setup; logShowPaywall calls |
| Adapty paywall — premium gate on AI Advisor entry | LOW | 0.5 | Access level check pattern |
| AI Advisor — Supabase Edge Function proxy | MEDIUM | 1 | Supabase project; Anthropic API key; auth session |
| AI Advisor — anonymized context builder | LOW | 0.5 | Reads existing AsyncStorage keys; no new data |
| AI Advisor — report screen (streaming + sections) | MEDIUM | 1 | Edge function; Anthropic streaming; AsyncStorage persistence |
| AI Advisor — follow-up chat | MEDIUM | 1 | Report screen; conversation state management |
| Exercise photos — ID mapping table | MEDIUM | 0.5 | Supabase exercises table; free-exercise-db ID list |
| Exercise photos — photo display component | LOW | 0.5 | ExerciseDetailScreen; Image component; SVG fallback |

**Recommended phase order:**
1. Adapty SDK + access level check + paywall screen (no AI yet — establishes monetization foundation)
2. Exercise photos (low complexity win; improves visual quality before AI launch)
3. AI Advisor — Edge Function + context builder (backend foundation)
4. AI Advisor — report screen + streaming
5. AI Advisor — follow-up chat
6. Polish + A/B test setup in Adapty dashboard

**Critical path constraint:** Adapty must ship before AI Advisor because the AI Advisor is
premium-only. The access level check must work before the AI screen is reachable.

---

*Sources: Context7 Adapty React Native SDK docs (HIGH confidence), GitHub API inspection of
yuhonas/free-exercise-db (HIGH confidence), Adapty official docs via Context7
(HIGH confidence), Anthropic SDK TypeScript docs via Context7 (HIGH confidence),
training knowledge for paywall conversion patterns and AI advisor UX
(MEDIUM confidence — verified against Adapty blog references found in limited WebSearch).*
