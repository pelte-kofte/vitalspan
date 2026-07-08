import { AdvisorContext } from './advisorContext';
import { BIOMARKERS } from '../data/biomarkers';

export type InsightPriority = 'critical' | 'warning' | 'info';

export type InsightScreen = 'AIAdvisor' | 'BiomarkerDetail' | 'Protocol' | 'Biomarkers';

export type InsightAction =
  | { type: 'navigate'; screen: InsightScreen; params?: Record<string, unknown> }
  | { type: 'none' };

export interface ProactiveInsight {
  id: string;
  priority: InsightPriority;
  title: string;
  body: string;
  action: InsightAction;
  generatedAt: string;
}

function wasDismissedToday(insightId: string, dismissed: Record<string, string>): boolean {
  const date = dismissed[insightId];
  if (!date) return false;
  return date.slice(0, 10) === new Date().toISOString().slice(0, 10);
}

/**
 * Pure, side-effect-free function. Evaluates the user's current context and
 * returns the single highest-priority insight to surface, or null if none qualify.
 *
 * @param lastReportTs - ISO timestamp of the last successfully generated AI report,
 *   sourced from AsyncStorage key @vitalspan_last_report_ts (supplied by caller).
 */
export function computeProactiveInsight(
  context: AdvisorContext,
  dismissedInsights: Record<string, string>,
  lastReportTs?: string | null,
): ProactiveInsight | null {
  const now = new Date().toISOString();

  // ── Priority 1 — critical: pharmacodynamic conflict (slot === 'any') ─────────
  // Never suppressed by dismissal — these are safety-critical signals.
  const criticalConflicts = context.timingConflicts.filter(c => c.slot === 'any');
  if (criticalConflicts.length > 0) {
    const first = criticalConflicts[0];
    return {
      id: `interactionConflict:${first.item1}:${first.item2}`,
      priority: 'critical',
      title: 'Interaction Alert',
      body: `Possible interaction: ${first.item1} + ${first.item2} — review in AI Advisor`,
      action: { type: 'navigate', screen: 'AIAdvisor' },
      generatedAt: now,
    };
  }

  // ── Priority 2 — warning: biomarker declining (trend computed vs. prior entry) ─
  // Sort by status severity (Critical > Suboptimal > Optimal), then by oldest daysAgo,
  // so the most urgent declining biomarker is surfaced when multiple are declining.
  // MIN_DATA_POINTS_FOR_TREND: defense-in-depth guard, mirroring the one in
  // advisorContext.ts — a declining-trend insight must never fire off a brand-new
  // account, a single reading, or a two-point blip from a bulk lab-PDF import.
  const MIN_DATA_POINTS_FOR_TREND = 3;
  const STATUS_SEVERITY: Record<string, number> = { Critical: 2, Suboptimal: 1, Optimal: 0 };
  const decliningBiomarkers = (context.biomarkers ?? [])
    .filter(b => b.trend === 'declining' && (b.dataPointCount ?? 0) >= MIN_DATA_POINTS_FOR_TREND)
    .sort((a, b) => {
      const sevDiff = (STATUS_SEVERITY[b.status] ?? 0) - (STATUS_SEVERITY[a.status] ?? 0);
      if (sevDiff !== 0) return sevDiff;
      return (b.daysAgo ?? 0) - (a.daysAgo ?? 0);
    });
  for (const declining of decliningBiomarkers) {
    const id = `biomarkerDeclining:${declining.name}`;
    if (!wasDismissedToday(id, dismissedInsights)) {
      const bmData = BIOMARKERS.find(b => b.name === declining.name);
      const readingCount = declining.dataPointCount ?? MIN_DATA_POINTS_FOR_TREND;
      return {
        id,
        priority: 'warning',
        title: `${declining.name} Trending Down`,
        body: `${declining.name} is trending down across your last ${readingCount} readings`,
        action: bmData
          ? { type: 'navigate', screen: 'BiomarkerDetail', params: { biomarkerId: bmData.id } }
          : { type: 'navigate', screen: 'Biomarkers' },
        generatedAt: now,
      };
    }
  }

  // ── Priority 2 — warning: protocol adherence below 50% (today's data only) ───
  // adherenceRate is only set to a percentage when takenDate === today (see advisorContext.ts).
  if (context.adherenceRate !== 'unknown') {
    const rate = parseInt(context.adherenceRate, 10);
    if (!isNaN(rate) && rate < 50) {
      const id = 'lowAdherence';
      if (!wasDismissedToday(id, dismissedInsights)) {
        return {
          id,
          priority: 'warning',
          title: 'Low Protocol Adherence Today',
          body: "You've taken less than half of today's scheduled items",
          action: { type: 'navigate', screen: 'Protocol' },
          generatedAt: now,
        };
      }
    }
  }

  // ── Priority 3 — info: biomarker data older than 90 days ─────────────────────
  const staleBiomarker = context.biomarkers.find(
    b => b.daysAgo !== undefined && b.daysAgo > 90,
  );
  if (staleBiomarker) {
    const id = `staleData:${staleBiomarker.name}`;
    if (!wasDismissedToday(id, dismissedInsights)) {
      const months = Math.floor((staleBiomarker.daysAgo ?? 91) / 30);
      return {
        id,
        priority: 'info',
        title: 'Lab Data Getting Old',
        body: `${staleBiomarker.name} hasn't been updated in ${months} month${months !== 1 ? 's' : ''} — consider retesting`,
        action: { type: 'navigate', screen: 'Biomarkers' },
        generatedAt: now,
      };
    }
  }

  // ── Priority 3 — info: AI report older than 30 days ──────────────────────────
  if (lastReportTs) {
    const daysSince = Math.floor(
      (Date.now() - new Date(lastReportTs).getTime()) / 86_400_000,
    );
    if (daysSince > 30) {
      const id = 'reportStale';
      if (!wasDismissedToday(id, dismissedInsights)) {
        return {
          id,
          priority: 'info',
          title: 'Longevity Report Outdated',
          body: `Your last AI analysis was ${daysSince} days ago — worth running again`,
          action: { type: 'navigate', screen: 'AIAdvisor' },
          generatedAt: now,
        };
      }
    }
  }

  return null;
}
