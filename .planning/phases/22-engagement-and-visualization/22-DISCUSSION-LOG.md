# Phase 22: Engagement & Visualization - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-17
**Phase:** 22-engagement-and-visualization
**Areas discussed:** Streak storage & rules, Streak UI placement, Chart range band style, Data limit banner

---

## Streak Storage & Rules

### Storage model

| Option | Description | Selected |
|--------|-------------|----------|
| Running counters in ProtocolState | Add currentStreak, bestStreak, lastCompleteDate to @vitalspan_protocol | ✓ |
| New AsyncStorage key @vitalspan_streak | Separate key keeps ProtocolState smaller | |
| Daily adherence log (ring buffer) | 90-day pass/fail log; enables future heatmap | |

**User's choice:** Running counters in ProtocolState (Recommended)

### "Complete day" definition

| Option | Description | Selected |
|--------|-------------|----------|
| All visible items taken | Hidden meds excluded; 0-item day = pause not break | ✓ |
| All items including hidden | Hidden meds count toward required total | |
| Any items taken (partial) | Even 1 item keeps streak alive | |

**User's choice:** All visible items taken (Recommended)

### New items added mid-day

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — must mark new item taken | New items immediately part of today's required set | ✓ |
| No — grandfather existing taken state | If already complete before add, day stays complete | |
| You decide | Let planner pick simpler implementation | |

**User's choice:** Yes — must mark new item taken (Recommended)

### Streak evaluation timing

| Option | Description | Selected |
|--------|-------------|----------|
| On daily reset when ProtocolScreen loads | Evaluate before resetting taken[] at existing reset point | ✓ |
| When user marks the last item taken | Increment immediately at completion | |
| You decide | Let planner pick timing | |

**User's choice:** On daily reset when ProtocolScreen loads (Recommended)

---

## Streak UI Placement

### Position on Protocol screen

| Option | Description | Selected |
|--------|-------------|----------|
| Compact stat row below progress pill | Two inline stats: "🔥 N-day streak" + "Best: N days" | ✓ |
| Dedicated streak card above the lists | BreathingCard-style with flame icon, more visual weight | |
| Inline with section header row | Small badge appended to header label | |

**User's choice:** Compact stat row below progress pill (Recommended)

### First-time / zero-streak display

| Option | Description | Selected |
|--------|-------------|----------|
| Show '0-day streak' with encouraging subtext | "Start your streak today!" motivates first completion | ✓ |
| Hide streak section until streak > 0 | Cleaner on first use; feature invisible until earned | |
| Show row but leave values blank | Neutral; slightly confusing | |

**User's choice:** Show '0-day streak' with encouraging subtext (Recommended)

---

## Chart Range Band Style

### Range band visual approach

| Option | Description | Selected |
|--------|-------------|----------|
| Shaded SVG rect band | Translucent green Rect between optMin/optMax using react-native-svg | ✓ |
| Two dashed reference lines | Horizontal lines at optMin and optMax bounds only | |
| Color-coded dots only | Dots colored green/amber/red per status; no band | |

**User's choice:** Shaded SVG rect band (Recommended)

### 30/90/365-day toggle style

| Option | Description | Selected |
|--------|-------------|----------|
| Segmented pill (same as Rutinim/Keşfet) | Three-segment pill: 30D / 90D / 365D; consistent with Phase 21 | ✓ |
| Small filter chips row | Like exercise category filter chips | |
| You decide | Let planner pick toggle style | |

**User's choice:** Segmented pill — same as Rutinim/Keşfet in Phase 21 (Recommended)

### Insufficient data placeholder

| Option | Description | Selected |
|--------|-------------|----------|
| Empty state with text message | "Add at least 2 entries to see your trend." No chart rendered | ✓ |
| Show chart with single point + label | Chart visible but not informative | |
| You decide | Let planner handle edge case | |

**User's choice:** Empty state with text message (Recommended)

---

## Data Limit Banner

### When to show upgrade banner

| Option | Description | Selected |
|--------|-------------|----------|
| Only when hidden entries exist | Banner only when >30-day data present; no false alarm for new users | ✓ |
| Always shown to non-premium users | Persistent upgrade prompt regardless of data age | |
| You decide | Let planner pick conditional logic | |

**User's choice:** Only when entries older than 30 days exist (Recommended)

### Banner position in BiomarkerDetailScreen

| Option | Description | Selected |
|--------|-------------|----------|
| Below chart, above history list | Contextual — sits where hidden data would be | ✓ |
| At the bottom of the history list | After all visible entries; requires scrolling | |
| Sticky footer above the tab bar | Fixed position; intrudes on layout | |

**User's choice:** Below the chart, above the history list (Recommended)

### Upgrade banner tap action

| Option | Description | Selected |
|--------|-------------|----------|
| Navigate to existing Adapty paywall screen | Reuses Phase 16 infrastructure; no new flow | ✓ |
| Inline upsell sheet (mini-paywall) | Contextual but duplicates paywall content | |
| You decide | Let planner pick navigation target | |

**User's choice:** Navigate to the existing Adapty paywall screen (Recommended)

---

## Claude's Discretion

- Default selected time window tab (30D vs. 90D) — planner picks based on typical biomarker tracking frequency
- Exact color/opacity for SVG range band rect — `Colors.status.optimalBg` at ~15% opacity suggested
- Streak row typography and color — follow existing `s.progressTxt` style; green for active streak, muted for zero
- PROT-05 dose bucketing threshold ratios (±25% = standard) and fallback behavior (omit if dose can't be parsed)

## Deferred Ideas

- Streak calendar heatmap — requires daily adherence log storage model; future phase
- Streak push notification ("7-day streak!") — belongs in Phase 23 with push notification infra
- Biomarker trend comparison across users — requires Supabase aggregate pipeline; future milestone
- Chart export (PDF/CSV) — out of scope for v5.0
