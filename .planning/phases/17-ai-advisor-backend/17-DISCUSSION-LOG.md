# Phase 17: AI Advisor — Backend - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-13
**Phase:** 17-ai-advisor-backend
**Areas discussed:** Report JSON schema, Edge Function architecture, Context assembly scope, Rate limit storage

---

## Report JSON Schema

### Schema upfront vs flexible

| Option | Description | Selected |
|--------|-------------|----------|
| Design schema now | Define 6-section JSON contract now. Edge Function enforces via prompt. Phase 18 plans against known shape. | ✓ |
| Leave flexible | Edge Function returns raw text or loose JSON. Phase 18 adapts. | |

**User's choice:** Design schema now (Recommended)

---

### Evidence grades (A/B/C) source

| Option | Description | Selected |
|--------|-------------|----------|
| Claude generates them | Prompt instructs Claude to assign A/B/C grades based on evidence quality. | |
| App-side lookup | App maps recommendation text to grades from supplement/drug database. | ✓ |
| No evidence grades in report | Drop grades from AI report — supplement/drug screens already show them. | |

**User's choice:** App-side lookup

---

### Score Summary source

| Option | Description | Selected |
|--------|-------------|----------|
| PhenoAge from local computation | Pass computed biologicalAge from phenoAge.ts in context. Claude includes it verbatim. | ✓ |
| Claude computes separate score | Claude derives its own longevity score from context. Risk of conflicting scores. | |
| No numeric score — narrative only | Section 1 is qualitative only. Simpler prompt. | |

**User's choice:** PhenoAge from local computation (Recommended)

---

### Report storage

| Option | Description | Selected |
|--------|-------------|----------|
| Ephemeral — fresh each time | No storage. Phase 18 holds in React state. Closing starts fresh. | ✓ |
| Cache in AsyncStorage | Most recent report with timestamp. Avoids re-generation but risks stale data. | |
| Store in Supabase | Persist per user. Enables history. Adds schema complexity — better later. | |

**User's choice:** Ephemeral (Recommended)

---

## Edge Function Architecture

### One function vs two

| Option | Description | Selected |
|--------|-------------|----------|
| One function with action param | Single `ai-advisor` function. `action: 'report' \| 'chat'`. One deploy surface. | ✓ |
| Two separate functions | `ai-advisor-report` + `ai-advisor-chat`. Cleaner separation but doubles deploy + rate limit logic. | |

**User's choice:** One function with action param (Recommended)

---

### Conversation state management

| Option | Description | Selected |
|--------|-------------|----------|
| App sends full history each turn | Phase 18 holds messages[] in React state. Each request sends full array + new message. Standard Claude multi-turn. | ✓ |
| Server tracks session state | Edge Function stores conversation in Supabase per session ID. Stateful, more complex. | |

**User's choice:** App sends full history each turn (Recommended)

---

### Claude model selection

| Option | Description | Selected |
|--------|-------------|----------|
| claude-haiku-4-5 for both | Cheapest, fastest. Less nuanced analysis. | |
| claude-sonnet-4-6 for report, haiku for chat | Report uses smarter model (premium feature). Chat uses cheaper model (conversational). | ✓ |
| claude-sonnet-4-6 for both | Best quality for all. Higher cost but manageable given daily limits. | |

**User's choice:** claude-sonnet-4-6 for report, claude-haiku-4-5 for chat (Recommended)

---

## Context Assembly Scope

### Health data sources

| Option | Description | Selected |
|--------|-------------|----------|
| Include HealthKit + exercise | HRV, sleep, recovery, exercise frequency in addition to biomarkers and protocol. | ✓ |
| Biomarkers + protocol only | Simpler. Avoids demo-mode HealthKit misleading Claude. | |
| Claude decides | Claude picks most clinically meaningful subset. | |

**User's choice:** Include HealthKit + exercise (Recommended)
**Notes:** HealthKit excluded if `isDemoMode: true` in @vitalspan_health_data — added as D-12 by Claude.

---

### Biomarker status bucketing

| Option | Description | Selected |
|--------|-------------|----------|
| 3-tier: Optimal / Suboptimal / Critical | Maps to existing longevity-optimized ranges in biomarkers.ts. Simple and clinically meaningful. | ✓ |
| 4-tier: Optimal / Borderline / Elevated / Critical | More granularity. Requires new threshold definitions. | |
| Named ranges from existing data | Use existing range label strings from biomarkers.ts. No new mapping logic. | |

**User's choice:** 3-tier: Optimal / Suboptimal / Critical (Recommended)

---

### Age bucketing

| Option | Description | Selected |
|--------|-------------|----------|
| 5-year bands: 25–29, 30–34, 35–39... | Common epidemiological bucketing. Good precision without revealing exact age. | ✓ |
| Decade bands: 20s, 30s, 40s, 50s+ | Coarser. Less useful for longevity interventions. | |
| Send PhenoAge biological age | Skip chronological age, send computed biological age only. | |

**User's choice:** 5-year bands (Recommended)

---

## Rate Limit Storage

### Counter storage mechanism

| Option | Description | Selected |
|--------|-------------|----------|
| Supabase table | `ai_usage` table with user_id, date, report_count, chat_count. Natural fit — already in stack. | ✓ |
| Supabase Redis (Upstash) | Atomic counters with TTL. More robust but adds paid service for 5 req/day use case. | |
| JWT claim / trust client | Client reports count. Insecure — bypassable. | |

**User's choice:** Supabase table (Recommended)

---

### Reset timezone and message

| Option | Description | Selected |
|--------|-------------|----------|
| UTC day, "You've reached your daily limit. Try again tomorrow." | Simple, globally consistent, no count exposure. | ✓ |
| UTC day, show remaining count | Transparent but exposes limit number. | |
| User local timezone | Personalized reset time but requires timezone in every request. | |

**User's choice:** UTC day + plain message (Recommended)

---

### Who gets rate limited

| Option | Description | Selected |
|--------|-------------|----------|
| Authenticated users only — anonymous blocked at premium gate | Phase 16 isPremium check prevents anonymous users from reaching the function. | ✓ |
| Rate limit anonymous users too | IP/device fingerprint. Unnecessary given premium gate. | |

**User's choice:** Authenticated users only (Recommended)

---

## Claude's Discretion

- Demo-mode HealthKit exclusion logic (D-12) — Claude added this rule; user implicitly accepted it by choosing "Include HealthKit + exercise."
- System prompt exact wording — pharmacist-framed persona established in Specifics; exact prompt text left to planner/researcher.
- Atomicity implementation for rate limit upsert — planner decides exact Supabase query pattern.

## Deferred Ideas

- Report history / past reports view — v5.0
- Report sharing / PDF export — out of scope for Phase 17/18
- Adaptive rate limits by subscription tier — later phase
- Streaming Claude responses (SSE) — deferred; start non-streaming
- PhenoAge computation server-side — not needed, client is correct
