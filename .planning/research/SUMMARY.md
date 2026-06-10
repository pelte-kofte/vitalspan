# Research Summary — v4.0 Monetization & Intelligence

**Project:** Vitalspan
**Milestone:** v4.0 — Monetization & Intelligence (Adapty paywall, Claude AI Advisor, Exercise Photos)
**Researched:** 2026-06-10
**Confidence:** HIGH

---

## Stack Additions

### react-native-adapty
- **Version:** 3.17.1
- **Install:** `npx expo install react-native-adapty && npx expo prebuild --clean && cd ios && pod install`
- **Constraints:** Native module — Expo Go incompatible. Add `["react-native-adapty", {}]` to `plugins` in `app.json`. RN >= 0.73.0 required (project is on 0.81.5 — compatible). Add `EXPO_PUBLIC_ADAPTY_PUBLIC_KEY` to `.env`.

### Claude API
- **Approach:** Supabase Edge Function proxy — do **NOT** install `@anthropic-ai/sdk` in the Expo project
- **Why:** Official SDK README explicitly states React Native is an unsupported runtime (missing `ReadableStream`/WHATWG APIs in Hermes). Beyond the runtime issue, any `EXPO_PUBLIC_ANTHROPIC_API_KEY` is embedded in the compiled JS bundle and extractable from any IPA. The Edge Function runs on Deno (officially supported runtime), holds `ANTHROPIC_API_KEY` as a Supabase secret, and is gated behind Supabase JWT auth.

### Exercise Photos
- **Correct repo:** `yuhonas/free-exercise-db` (owner is `yuhonas` — PROJECT.md had a typo: `yunohas`)
- **Asset format:** JPG only — no GIFs, no WebP. 873 exercises, exactly 2 static JPGs per exercise (start + end position).
- **CDN URL:** `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/{photoKey}/0.jpg`
- **Consumption:** Remote CDN, no local bundling (97 MB repo). ~60 Vitalspan exercises ≈ 120 JPGs ≈ 5 MB, lazy-loaded and disk-cached. Manual `photoKey` mapping required (Vitalspan numeric IDs ≠ free-exercise-db name-based IDs).

### expo-image
- **Needed:** Yes
- **Why:** Persistent disk caching (`cachePolicy="disk"`), progressive loading. Better than core `<Image>` for remote images.

---

## Feature Table Stakes

### Paywall

**Apple-mandated requirements:**
- Price clearly displayed before tapping
- Billing period explicit ("billed monthly" / "billed annually")
- Free trial shown as a visual timeline (Day 1–7 free, Day 8 billed) — toggle UI is banned by Apple as of 2024
- **Restore Purchases button** — top App Store rejection cause if missing
- Privacy Policy and Terms links visible
- `adapty.logShowPaywall(paywall)` called every time paywall is shown (required for Adapty analytics)

**Soft gate strategy:** Free tier is fully functional (biomarkers, PhenoAge, protocol, exercise log). Paywall appears only when user taps the AI Advisor entry — high-intent moment. Hard-gating core features drives 60–80% abandonment and risks App Store rejection.

### AI Advisor

**Report structure (card hierarchy):**
1. Score Summary — biological age delta, PhenoAge trend, 1-sentence assessment
2. Priority Findings — 2–4 ranked bullets, color-coded red/amber/green
3. Biomarker Analysis — per-category breakdown with longevity target and gap
4. Supplement & Medication Review — protocol evaluated against findings
5. Recommendations — top 3–5 actions with evidence grade (A/B/C) and timeframe
6. Follow-up Chat entry point

**Chat scope:** Scoped to the current generated report — not a standalone health chatbot. System prompt includes the full report as context. Conversation history is ephemeral (not persisted).

**Edge Function requirement:** Mandatory. All Claude calls route through `supabase/functions/ai-advisor/index.ts`. Validates Supabase JWT, enforces per-user rate limits (5 reports/day, 20 chat messages/day), calls Anthropic server-side.

### Exercise Photos

**ID mapping:** Add `photoKey?: string` to the `Exercise` interface — holds free-exercise-db name string (e.g. `"Barbell_Deadlift"`), not Vitalspan's numeric ID. Manual one-time mapping.

**Fallback chain:** photo → SVG illustration (Phase 12) → placeholder. Both fallback layers already exist.

**Coverage estimate:** 70–80% for standard compound lifts.

---

## Architecture Decision Record

### Build Order: Exercise Photos → Adapty → AI Advisor

| Phase | Why |
|-------|-----|
| Exercise Photos first | Zero dependencies. No native modules, no backend. Fast visual win, validates EAS pipeline before `expo prebuild` changes. |
| Adapty second | Must precede AI Advisor — `SubscriptionContext.isPremium` gates AI Advisor access. Flushes `expo prebuild` requirement in a simpler context. |
| AI Advisor last | Depends on `SubscriptionContext` (Adapty) + Supabase auth session (Edge Function). Edge Function and UI can parallelize once Adapty is done. |

### SubscriptionContext Pattern

`src/contexts/SubscriptionContext.tsx` — exposes `isPremium`, `isLoadingSubscription`, `showPaywall()`. Reads from `adapty.getProfile()` on mount; listens to `adapty.addEventListener('onLatestProfileLoad', ...)`. No screen makes direct `getProfile()` calls. Do NOT persist `isPremium` in AsyncStorage — Adapty owns subscription state.

### Edge Function Data Flow

```
iOS app → supabase.functions.invoke('ai-advisor', { body: anonymizedContext })
  [Supabase JWT auto-attached]
→ Deno Edge Function
  → validates JWT + per-user rate limit
  → @anthropic-ai/sdk with ANTHROPIC_API_KEY (Supabase secret)
  → returns { report } or { message }
→ AIAdvisorScreen renders response
```

`src/lib/advisorContext.ts` builds anonymized context from `@vitalspan_*` AsyncStorage keys. Never includes: user name, exact birthdate, raw lab timestamps, Supabase user ID. Age is bucketed (e.g. `'46-60'`). PhenoAge is derived score only.

### CDN Discrepancy Resolution

PITFALLS flagged `raw.githubusercontent.com` rate-limit risk. **Resolution:** Use it for v4.0 — URL is isolated behind `exercisePhotoUrl(photoKey)` in a single utility file. Swap to Supabase Storage in one line if throttling occurs in production.

---

## Watch Out For

1. **Adapty activation race** — Activate with no `customerUserId`; call `adapty.identify(user.id)` only after Supabase `getUser()` resolves. Wire to `onAuthStateChange` login and sign-out events.
2. **Anthropic API key in bundle** — Never `EXPO_PUBLIC_ANTHROPIC_API_KEY`. Never install `@anthropic-ai/sdk` in Expo project. Supabase Edge Function only.
3. **Missing Restore Purchases = App Store rejection** — Wire `adapty.restorePurchases()` in PaywallScreen; show explicit feedback when no subscription is found.
4. **No per-user rate limiting on Edge Function** — Enforce daily quota before every Anthropic call; return 429 with user-readable message; set spend alert in Anthropic Console.
5. **expo prebuild overwrites native config** — Audit `ios/` before `npx expo prebuild --clean`. HealthKit entitlements must be in `app.json` config plugins or they will be lost.

---

## Corrections for PROJECT.md

- `yuhonas` (not `yunohas`) — correct GitHub username for free-exercise-db
- Assets are JPGs, not GIFs — 2 static JPGs per exercise, no animations
- Do not install `@anthropic-ai/sdk` in the Expo project — use Supabase Edge Function proxy

---

*Research completed: 2026-06-10 | Ready for roadmap: yes*
