---
phase: 10-apple-health-and-articles
plan: "04"
subsystem: articles-ui
tags: [articles, flatlist, pubmed, webBrowser, navigation, dashboard, typescript]
dependency_graph:
  requires:
    - src/lib/articleService.ts  # Wave 1 — loadCachedArticles, refreshArticlesIfStale, forceRefreshArticles
  provides:
    - src/components/ArticleCard.tsx
    - src/screens/ArticlesScreen.tsx
  affects:
    - src/navigation/AppNavigator.tsx  # Articles route added
    - src/screens/DashboardScreen.tsx  # Research CTA card added
tech_stack:
  added: []
  patterns:
    - "Stale-while-revalidate FlatList: load cached immediately, background refresh, pull-to-refresh force refresh"
    - "Out-of-range relevance tag: useMemo Set<string> from BIOMARKERS.optMin/optMax"
    - "WebBrowser.openBrowserAsync for PubMed SafariViewController launch"
    - "uploadCard pattern reuse for Research CTA (style composition)"
key_files:
  created:
    - src/components/ArticleCard.tsx
    - src/screens/ArticlesScreen.tsx
  modified:
    - src/navigation/AppNavigator.tsx
    - src/screens/DashboardScreen.tsx
decisions:
  - "onPress callback passed from ArticlesScreen to ArticleCard — WebBrowser import stays in ArticlesScreen, not ArticleCard"
  - "StoredEntry defined inline in ArticlesScreen (same pattern as articleService.ts) to avoid circular dependency risk"
  - "cancelled flag in useEffect to prevent state updates on unmounted component"
  - "outOfRangeSet computed via useMemo([entries]) matching articleService.ts rankByOutOfRange logic"
  - "Research CTA inserted between exerciseCard block and Today's protocol sectionHdr per plan insertion point"
metrics:
  duration: "~8 minutes"
  completed: "2026-06-03"
  tasks_completed: 2
  tasks_total: 2
  files_created: 2
  files_modified: 2
---

# Phase 10 Plan 04: Articles UI Summary

**One-liner:** FlatList ArticlesScreen with stale-while-revalidate load + ArticleCard (relevance tags, PubMed WebBrowser) wired from Dashboard Research CTA via AppNavigator stack route.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create ArticleCard component and ArticlesScreen | ed0f704 | src/components/ArticleCard.tsx, src/screens/ArticlesScreen.tsx |
| 2 | Wire Articles into AppNavigator and add Research CTA card to DashboardScreen | b4111f6 | src/navigation/AppNavigator.tsx, src/screens/DashboardScreen.tsx |

## What Was Built

### Task 1: ArticleCard + ArticlesScreen

**ArticleCard** (`src/components/ArticleCard.tsx`, 118 lines):
- Props: `{ article: Article; onPress: () => void; isRelevant?: boolean; relevantBiomarkerName?: string }`
- Layout: eyebrow row (journal name + date at `Typography.sizes.xs`, `Colors.Beige.textMuted`) → title (2 lines, weight 600) → abstract snippet (3 lines, weight 400) → meta row (relevance tag left + "Read article →" right)
- Relevance tag: `Colors.status.reviewBg/reviewBorder/reviewText` pill shown only when `isRelevant && relevantBiomarkerName`
- `Haptics.impactAsync(Light)` on press; `onPress` callback from parent (WebBrowser stays in ArticlesScreen)
- No hardcoded hex values; `StyleSheet` named `s`; TypeScript strict

**ArticlesScreen** (`src/screens/ArticlesScreen.tsx`, 170 lines):
- Load sequence: `loadCachedArticles` on mount → show cached immediately or stay in loading state → `refreshArticlesIfStale` in background
- Pull-to-refresh: `forceRefreshArticles` (ignores 24h gate)
- `outOfRangeSet` via `useMemo([entries])` — mirrors `rankByOutOfRange` in articleService
- `renderItem` computes `isRelevant` + `relevantBiomarkerName` per article
- Opens `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` via `WebBrowser.openBrowserAsync`
- Loading state: centred `ActivityIndicator` in `Colors.primary`
- Empty state: body text per copywriting contract
- Top bar: back chevron (← `Colors.textMuted`), "RESEARCH" eyebrow (`Typography.letterSpacing.widest`)

### Task 2: AppNavigator + DashboardScreen

**AppNavigator** (`src/navigation/AppNavigator.tsx`):
- `Articles: undefined` added to `RootStackParamList`
- `ArticlesScreen` imported and registered as `Stack.Screen name="Articles" options={{ presentation: 'card' }}`

**DashboardScreen** (`src/screens/DashboardScreen.tsx`):
- Research CTA `TouchableOpacity` inserted between exerciseCard block and `sectionHdr` ("Today's protocol")
- Uses `style={[s.uploadCard, s.researchCard]}` — `researchCard` overrides only `backgroundColor: Colors.primaryBg`
- Content: 📄 icon, "Longevity Research" title, "Personalised PubMed articles for your biomarker profile" subtitle, → arrow
- `onPress`: haptic Light + `nav.navigate('Articles')`
- Added `researchCard` and `researchIcon` to StyleSheet `s`
- No existing DashboardScreen logic, state, or other UI modified

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None. ArticlesScreen wires directly to `articleService.loadCachedArticles` / `refreshArticlesIfStale` / `forceRefreshArticles`. No placeholder data flows to UI.

## Threat Flags

None — no new network endpoints, auth paths, or trust boundaries introduced beyond what the plan's threat model documented. PubMed URL is constructed from `pmid` (plan T-10-09, mitigated).

## Self-Check: PASSED

- FOUND: src/components/ArticleCard.tsx
- FOUND: src/screens/ArticlesScreen.tsx
- FOUND: src/navigation/AppNavigator.tsx (Articles route present)
- FOUND: src/screens/DashboardScreen.tsx (Research CTA present)
- FOUND commit: ed0f704 (Task 1)
- FOUND commit: b4111f6 (Task 2)
- tsc --noEmit exits 0
- Articles: undefined count = 1 in AppNavigator
- navigate('Articles') count = 1 in DashboardScreen
- openBrowserAsync count = 1 in ArticlesScreen
- pubmed.ncbi.nlm.nih.gov count = 1 in ArticlesScreen
- No hardcoded hex values in any new/modified file
- No deletions in either commit
