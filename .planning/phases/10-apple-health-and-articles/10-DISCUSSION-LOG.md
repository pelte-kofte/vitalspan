# Phase 10: Apple Health + Articles - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-02
**Phase:** 10-Apple Health + Articles
**Areas discussed:** HealthKit package, Permission flow, Article feed placement, Article personalization

---

## HealthKit Package

| Option | Description | Selected |
|--------|-------------|----------|
| expo-health | Stays in managed workflow; already referenced in mock comments; needs SDK 54 compat check | ✓ |
| react-native-health | Broader data coverage; requires bare workflow / expo prebuild | |
| You decide | Researcher verifies and recommends | |

**User's choice:** expo-health

---

| Option | Description | Selected |
|--------|-------------|----------|
| Same 8 data types as mock | HRV, resting HR, VO₂max, sleep, respiratory rate, steps, mindful minutes, glucose — clean swap, no interface change | ✓ |
| Subset — HRV, sleep, glucose only | Fewer permissions = higher grant rate | |
| You decide | Researcher determines from orbital consumption analysis | |

**User's choice:** Same 8 data types (all the mock data types)

---

| Option | Description | Selected |
|--------|-------------|----------|
| EAS build only | Test via EAS preview builds like Phase 9's verification step | ✓ |
| Add expo-dev-client | Enables local Xcode testing; better HK debug iteration speed | |
| You decide | Researcher recommends based on expo-health SDK 54 requirements | |

**User's choice:** EAS build only — no dev client needed

---

## Permission Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Auto on first launch — after onboarding | App.tsx requests permissions right after onboarding; maximum activation rate | |
| First visit to LongevityScore | In-context permission request; user sees WHY; matches ROADMAP criterion | ✓ |
| Explicit CTA only | User must tap "Connect Apple Health"; current mock behavior; lowest activation rate | |

**User's choice:** First visit to LongevityScore

---

| Option | Description | Selected |
|--------|-------------|----------|
| Show demo data + 'Demo' badge | Current mock behavior; engaging on first visit | |
| Show empty orbitals with 'Connect Health' prompt | Honest about state; less engaging | ✓ |
| You decide | Planner chooses based on UX context | |

**User's choice:** Empty orbitals with "Connect Health" prompt (not demo data)

---

| Option | Description | Selected |
|--------|-------------|----------|
| Connect Health prompt with Settings deep-link | Matches ROADMAP success criterion; `Linking.openURL('app-settings:')` | ✓ |
| Connect Health prompt — no Settings link | Simpler; user navigates to Settings manually | |
| Silently fall back to demo data | Show demo badge; no prompt | |

**User's choice:** "Connect Health" prompt with Settings deep-link CTA

---

## Article Feed Placement

| Option | Description | Selected |
|--------|-------------|----------|
| New 6th tab — 'Research' | Always accessible; requires 6th SVG tab icon | |
| Stack screen from Dashboard | 'Research' card on Dashboard → ArticlesScreen; no tab bar change | ✓ |
| Modal from LongevityScore | Contextually linked to longevity score | |
| Section within Dashboard | Articles embedded inline on Dashboard | |

**User's choice:** Stack screen from Dashboard (no new tab)

---

| Option | Description | Selected |
|--------|-------------|----------|
| Title + journal + date + abstract snippet | Matches ROADMAP success criterion | ✓ |
| Title + journal + date only | Minimal; taps go straight to PubMed | |
| Title + biomarker tag + abstract snippet | More visible personalization signal | |

**User's choice:** Title + journal + date + abstract snippet

---

| Option | Description | Selected |
|--------|-------------|----------|
| Open PubMed URL in SafariViewController | `WebBrowser.openBrowserAsync()`; no new screen | ✓ |
| Detail screen with full abstract in-app | New ArticleDetailScreen + 'Read on PubMed' button | |
| You decide | Planner chooses based on implementation complexity | |

**User's choice:** Open PubMed URL in SafariViewController

---

## Article Personalization

| Option | Description | Selected |
|--------|-------------|----------|
| Keyword queries per biomarker | NCBI eSearch with per-biomarker query strings; PMIDs cached by PMID in Supabase | ✓ |
| Fixed MeSH term longevity pool | Curated MeSH terms; shared pool; harder post-fetch ranking | |
| You decide | Researcher determines best PubMed API approach | |

**User's choice:** Keyword queries per biomarker

---

| Option | Description | Selected |
|--------|-------------|----------|
| Sort by user's out-of-range biomarkers first | Clinically meaningful; uses existing BIOMARKERS range data | ✓ |
| Sort by most recent biomarker entries | Recency of interest rather than clinical urgency | |
| No ranking — chronological by PubMed date | Simple; less personalized | |

**User's choice:** Out-of-range biomarkers sorted to top

---

| Option | Description | Selected |
|--------|-------------|----------|
| On app open if >24 hours since last fetch | Background refresh; shows cached data immediately; matches v3.0 arch note | ✓ |
| Pull-to-refresh only | User-triggered; simplest | |
| Background fetch every 24 hours | expo-background-fetch; additional entitlement; most complex | |

**User's choice:** On app open if >24 hours since last fetch

---

## Claude's Discretion

None — all gray areas had explicit user choices.

## Deferred Ideas

None — discussion stayed within phase scope.
