import { BIOMARKERS } from '../data/biomarkers';
import type { ExerciseLogEntry } from '../data/exercises';
import type { AdvisorContext } from './advisorContext';
import { classifyStoredEntry } from './biomarkerInterpretation';
import type { ClinicalPhenoAgePresentation } from './clinicalPhenoAgePresentation';
import type { ClinicalPhenoAgeRequirementPresentationSource } from './clinicalPhenoAgeProduct';
import type { StoredEntry } from '../types/biomarkerEntry';
import type { ProtocolState, TimeSlot } from '../types/protocol';
import {
  parseProtocolDoseCount,
  protocolDayKey,
  protocolDoseId,
} from './protocolPersistence';

export type TodayDestination =
  | 'AIAdvisor'
  | 'BiomarkerDetail'
  | 'BiomarkerEntry'
  | 'Biomarkers'
  | 'GuidedFirstRun'
  | 'InteractionChecker'
  | 'LongevityScore'
  | 'Profile'
  | 'Protocol';

export interface TodayAction {
  destination: TodayDestination;
  params?: Record<string, unknown>;
}

export type TodayPriorityKind =
  | 'profile_setup'
  | 'complete_labs'
  | 'repeat_stale_lab'
  | 'review_outside_range'
  | 'protocol_action'
  | 'no_action';

export interface TodayPriorityCandidate {
  id: string;
  kind: TodayPriorityKind;
  rank: number;
  title: string;
  reason: string;
  sourceLabel: string;
  freshnessLabel: string;
  confidenceLanguage: string;
  whyThis: string;
  evidence: string;
  ctaLabel: string;
  action: TodayAction;
  canDecline: boolean;
  requirements?: readonly TodayRequirementChecklistItem[];
}

export interface TodayRequirementChecklistItem {
  biomarkerId: string;
  label: string;
  status: ClinicalPhenoAgeRequirementPresentationSource['status'];
}

export interface TodaySafetyAlert {
  id: string;
  title: string;
  body: string;
  sourceLabel: string;
  action: TodayAction;
}

export interface DailyHealthBrief {
  doOneThing: string;
  watch: string;
  opportunity: string;
  askContext: string;
}

export type TodayProtocolKind = 'medication' | 'supplement' | 'exercise' | 'habit';
export type TodayProtocolState = 'due' | 'done';

export interface TodayProtocolItem {
  id: string;
  title: string;
  detail?: string;
  kind: TodayProtocolKind;
  timeLabel: string;
  state: TodayProtocolState;
  canToggle: boolean;
  safetyWarning?: string;
}

export type ChangedSignalKind =
  | 'laboratory_range'
  | 'contextual_change'
  | 'stale_data'
  | 'resolved_range_issue';

export interface ChangedSignal {
  id: string;
  biomarkerId: string;
  title: string;
  detail: string;
  occurredAt: string;
  valueAndUnit: string;
  source: string;
  kind: ChangedSignalKind;
}

export interface TodayHealthState {
  status: 'valid' | 'insufficient_data' | 'no_profile';
  bloodPhenotypicAge: number | null;
  chronologicalAge: number | null;
  lastCalculated: string | null;
  presentCount: number;
  totalRequired: number;
  historyLabel: 'Stable trend' | 'Insufficient longitudinal history';
  summary: string;
  contributor?: string;
  wearableStatus: 'connected' | 'not_connected';
  wearableSummary: string;
  futureDomains?: Array<{ id: string; label: string; state: string }>;
  agingVelocity?: number;
  recoveryVelocity?: number;
}

export interface TodayExperienceInput {
  profile: { age?: number; medications?: string[] } | null;
  entries: StoredEntry[];
  phenoResult: ClinicalPhenoAgePresentation | null;
  protocol: ProtocolState;
  exerciseLogs: ExerciseLogEntry[];
  advisorContext: AdvisorContext | null;
  now?: Date;
  dismissedPriorityIds?: ReadonlySet<string>;
  wearableConnected?: boolean;
}

export interface TodayExperience {
  safetyAlert: TodaySafetyAlert | null;
  priority: TodayPriorityCandidate;
  brief: DailyHealthBrief;
  protocolItems: TodayProtocolItem[];
  healthState: TodayHealthState;
  changedSignals: ChangedSignal[];
  changedSignalsEmptyMessage: string | null;
}

export const TODAY_PRIORITY_RANKING = {
  reviewOutsideRange: 500,
  repeatStaleLab: 450,
  completeLabs: 400,
  profileSetup: 350,
  protocolAction: 300,
  noAction: 0,
} as const;

export const TODAY_HOME_ORDER = [
  'safety_alert',
  'todays_priority',
  'daily_health_brief',
  'todays_protocol',
  'health_state',
  'changed_signals',
  'weekly_research',
] as const;

const SLOT_ORDER: Record<string, number> = {
  morning: 0,
  afternoon: 1,
  evening: 2,
  night: 3,
  anytime: 4,
  completed: 5,
};

const SLOT_LABEL: Record<TimeSlot, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  night: 'Night',
};

function doseTimeLabels(count: number): string[] {
  if (count === 2) return ['Morning', 'Evening'];
  if (count === 3) return ['Morning', 'Afternoon', 'Evening'];
  if (count === 4) return ['Morning', 'Afternoon', 'Evening', 'Night'];
  return Array.from({ length: count }, (_, index) => `Dose ${index + 1}`);
}

function daysSince(iso: string, now: Date): number | null {
  const timestamp = Date.parse(iso);
  if (!Number.isFinite(timestamp)) return null;
  return Math.max(0, Math.floor((now.getTime() - timestamp) / 86_400_000));
}

function freshnessLabel(iso: string | undefined, now: Date): string {
  if (!iso) return 'Date unavailable';
  const days = daysSince(iso, now);
  if (days === null) return 'Date unavailable';
  if (days === 0) return 'Updated today';
  if (days === 1) return 'Updated yesterday';
  return `Updated ${days} days ago`;
}

function latestEntries(entries: StoredEntry[]): Map<string, StoredEntry> {
  const latest = new Map<string, StoredEntry>();
  for (const entry of entries) {
    const current = latest.get(entry.biomarkerId);
    if (!current || entry.date > current.date) latest.set(entry.biomarkerId, entry);
  }
  return latest;
}

function biomarkerLabel(id: string): string {
  return BIOMARKERS.find(marker => marker.id === id)?.name ?? id;
}

function entryUnit(entry: StoredEntry): string {
  return entry.reportedUnit ?? entry.unit ?? BIOMARKERS.find(marker => marker.id === entry.biomarkerId)?.unit ?? '';
}

function valueLabel(entry: StoredEntry): string {
  const value = entry.reportedValue ?? entry.value;
  return `${value}${entryUnit(entry) ? ` ${entryUnit(entry)}` : ''}`;
}

function requirementPriority(requirements: readonly ClinicalPhenoAgeRequirementPresentationSource[]): ClinicalPhenoAgeRequirementPresentationSource | undefined {
  const order: Record<ClinicalPhenoAgeRequirementPresentationSource['status'], number> = {
    stale: 0,
    unit_incompatible: 1,
    invalid: 2,
    missing: 3,
    present: 4,
  };
  return [...requirements]
    .filter(requirement => requirement.status !== 'present')
    .sort((a, b) => order[a.status] - order[b.status])[0];
}

export function buildSafetyAlert(context: AdvisorContext | null): TodaySafetyAlert | null {
  const conflict = context?.timingConflicts.find(item => item.slot === 'any');
  if (!conflict) return null;
  return {
    id: `safety:${conflict.item1}:${conflict.item2}`,
    title: 'Possible interaction needs review',
    body: `${conflict.item1} and ${conflict.item2} may interact. Review the existing interaction guidance before taking them together.`,
    sourceLabel: 'Current medication and supplement protocol',
    action: { destination: 'InteractionChecker' },
  };
}

export function buildProtocolItems(
  profile: TodayExperienceInput['profile'],
  protocol: ProtocolState,
  exerciseLogs: ExerciseLogEntry[],
  context: AdvisorContext | null,
  now: Date,
): TodayProtocolItem[] {
  const today = protocolDayKey(now);
  const taken = protocol.takenDate === today ? new Set(protocol.taken) : new Set<string>();
  const hidden = new Set(protocol.hiddenMeds ?? []);
  const conflicts = context?.timingConflicts ?? [];
  const warningFor = (name: string): string | undefined => {
    const conflict = conflicts.find(item => item.item1 === name || item.item2 === name);
    return conflict ? 'Interaction guidance available' : undefined;
  };

  const medicationItems: TodayProtocolItem[] = (profile?.medications ?? [])
    .filter(name => !hidden.has(name))
    .map(name => {
      const timing = protocol.medTimes?.[name];
      return {
        id: name,
        title: name,
        kind: 'medication' as const,
        timeLabel: timing ? SLOT_LABEL[timing] : 'Time not set',
        state: taken.has(name) ? 'done' as const : 'due' as const,
        canToggle: true,
        safetyWarning: warningFor(name),
      };
    });

  const supplementItems: TodayProtocolItem[] = (protocol.supplements ?? []).flatMap(item => {
    const displayDose = item.personalDose ?? item.dose;
    const count = parseProtocolDoseCount(displayDose);
    if (count === 1) {
      return [{
        id: item.id,
        title: item.name,
        detail: displayDose,
        kind: 'supplement' as const,
        timeLabel: item.timing ? SLOT_LABEL[item.timing] : 'Time not set',
        state: taken.has(item.id) || taken.has(`${item.name}_dose_0`) ? 'done' as const : 'due' as const,
        canToggle: true,
        safetyWarning: warningFor(item.name),
      }];
    }
    return doseTimeLabels(count).map((timeLabel, index) => {
      const id = protocolDoseId(item.name, index);
      return {
        id,
        title: `${item.name} · dose ${index + 1}`,
        detail: displayDose,
        kind: 'supplement' as const,
        timeLabel,
        state: taken.has(id) ? 'done' as const : 'due' as const,
        canToggle: true,
        safetyWarning: warningFor(item.name),
      };
    });
  });

  const exerciseItems: TodayProtocolItem[] = exerciseLogs
    .filter(log => log.date === today)
    .map(log => ({
      id: `exercise:${log.id}`,
      title: log.exerciseName,
      detail: log.durationMin ? `${log.durationMin} min` : log.category,
      kind: 'exercise' as const,
      timeLabel: 'Completed',
      state: 'done' as const,
      canToggle: false,
    }));

  return [...medicationItems, ...supplementItems, ...exerciseItems].sort((a, b) => {
    const aSlot = a.timeLabel.toLowerCase().replace('time not set', 'anytime');
    const bSlot = b.timeLabel.toLowerCase().replace('time not set', 'anytime');
    const slotDifference = (SLOT_ORDER[aSlot] ?? 4) - (SLOT_ORDER[bSlot] ?? 4);
    if (slotDifference !== 0) return slotDifference;
    if (a.state !== b.state) return a.state === 'due' ? -1 : 1;
    return a.title.localeCompare(b.title);
  });
}

export function buildPriorityCandidates(
  input: TodayExperienceInput,
  protocolItems: TodayProtocolItem[],
): TodayPriorityCandidate[] {
  const now = input.now ?? new Date();
  const latest = latestEntries(input.entries);
  const candidates: TodayPriorityCandidate[] = [];

  for (const entry of latest.values()) {
    if (classifyStoredEntry(entry) !== 'outside_reported_range') continue;
    const name = biomarkerLabel(entry.biomarkerId);
    candidates.push({
      id: `outside-range:${entry.biomarkerId}:${entry.date}`,
      kind: 'review_outside_range',
      rank: TODAY_PRIORITY_RANKING.reviewOutsideRange,
      title: `Review your ${name} result`,
      reason: `${valueLabel(entry)} is outside the reference interval reported with this result.`,
      sourceLabel: `${entry.source || 'Laboratory result'} · reported laboratory range`,
      freshnessLabel: freshnessLabel(entry.date, now),
      confidenceLanguage: 'High confidence in the range comparison; clinical meaning needs context.',
      whyThis: 'A new result outside its own laboratory interval deserves context before lower-priority optimization tasks.',
      evidence: 'This comparison uses only the source laboratory range stored with the result. It is not an emergency classification or diagnosis.',
      ctaLabel: 'Review result',
      action: { destination: 'BiomarkerDetail', params: { biomarkerId: entry.biomarkerId } },
      canDecline: true,
    });
  }

  const unmet = input.phenoResult?.requirements.filter(item => item.status !== 'present') ?? [];
  const nextRequirement = requirementPriority(unmet);
  if (nextRequirement?.status === 'stale') {
    candidates.push({
      id: `stale-lab:${nextRequirement.inputId}`,
      kind: 'repeat_stale_lab',
      rank: TODAY_PRIORITY_RANKING.repeatStaleLab,
      title: `Update ${nextRequirement.label}`,
      reason: 'This required Blood phenotypic age input is outside the current freshness window.',
      sourceLabel: 'Blood phenotypic age input requirements',
      freshnessLabel: freshnessLabel(nextRequirement.collectedAt ?? now.toISOString(), now),
      confidenceLanguage: 'Certain about data freshness; no clinical deterioration is inferred.',
      whyThis: 'A stale required input prevents a current Blood phenotypic age calculation.',
      evidence: 'Vitalspan currently requires every input to be no more than 365 days old. This is a conservative product freshness rule.',
      ctaLabel: 'Update measurement',
      action: { destination: 'BiomarkerEntry', params: { biomarkerId: nextRequirement.biomarkerId } },
      canDecline: true,
    });
  }

  if (input.phenoResult && input.phenoResult.presentCount < input.phenoResult.totalRequired) {
    const missingCount = input.phenoResult.totalRequired - input.phenoResult.presentCount;
    candidates.push({
      id: `complete-labs:${input.phenoResult.presentCount}`,
      kind: 'complete_labs',
      rank: TODAY_PRIORITY_RANKING.completeLabs,
      title: `Complete ${missingCount} required blood ${missingCount === 1 ? 'input' : 'inputs'}`,
      reason: `Blood phenotypic age cannot be calculated from ${input.phenoResult.presentCount} of ${input.phenoResult.totalRequired} required inputs.`,
      sourceLabel: 'Clinical PhenoAge v1.0.0 input requirements',
      freshnessLabel: `${input.phenoResult.presentCount}/${input.phenoResult.totalRequired} current and compatible`,
      confidenceLanguage: 'High confidence about data completeness; no age estimate is inferred.',
      whyThis: 'Completing the validated input set is more useful than showing a partial or speculative score.',
      evidence: 'The published model requires chronological age and all nine specified blood measurements.',
      ctaLabel: input.entries.length === 0 ? 'Add laboratory data' : 'Complete inputs',
      action: {
        destination: 'BiomarkerEntry',
        params: { biomarkerId: nextRequirement?.biomarkerId },
      },
      canDecline: true,
      requirements: input.phenoResult.requirements.map(requirement => ({
        biomarkerId: requirement.biomarkerId,
        label: requirement.label,
        status: requirement.status,
      })),
    });
  }

  if (!input.profile?.age || input.profile.age <= 0) {
    candidates.push({
      id: 'profile-age-missing',
      kind: 'profile_setup',
      rank: TODAY_PRIORITY_RANKING.profileSetup,
      title: 'Complete your health profile',
      reason: 'Chronological age is required before Blood phenotypic age can be evaluated.',
      sourceLabel: 'Profile data',
      freshnessLabel: 'Chronological age missing',
      confidenceLanguage: 'Certain about the missing profile field.',
      whyThis: 'Vitalspan cannot interpret the blood-age model without chronological age.',
      evidence: 'Chronological age is an explicit input in the published PhenoAge equation.',
      ctaLabel: 'Review profile',
      action: { destination: 'Profile' },
      canDecline: true,
    });
  }

  const nextProtocol = protocolItems.find(item => item.state === 'due');
  if (nextProtocol) {
    candidates.push({
      id: `protocol:${nextProtocol.id}`,
      kind: 'protocol_action',
      rank: TODAY_PRIORITY_RANKING.protocolAction,
      title: `${nextProtocol.timeLabel}: ${nextProtocol.title}`,
      reason: `This ${nextProtocol.kind} is the next incomplete item in your existing protocol.`,
      sourceLabel: 'Your saved protocol',
      freshnessLabel: 'Due today',
      confidenceLanguage: 'High confidence that it is scheduled; appropriateness is not reassessed here.',
      whyThis: 'It is already part of your plan and is the next actionable item ordered by its saved time.',
      evidence: 'This is presentation of your existing protocol, not a new treatment recommendation.',
      ctaLabel: 'View today’s protocol',
      action: { destination: 'Protocol' },
      canDecline: true,
    });
  }

  candidates.push({
    id: 'no-action-required',
    kind: 'no_action',
    rank: TODAY_PRIORITY_RANKING.noAction,
    title: 'No action required today',
    reason: 'Vitalspan found no higher-priority task in the data currently available.',
    sourceLabel: 'Current laboratory and protocol data',
    freshnessLabel: 'Checked today',
    confidenceLanguage: 'Limited to the data available in Vitalspan.',
    whyThis: 'A calm no-action state is more honest than manufacturing a task.',
    evidence: 'No safety conflict, outside-range review, incomplete model input, or due protocol item was selected.',
    ctaLabel: 'Review health state',
    action: { destination: 'LongevityScore' },
    canDecline: false,
  });

  return candidates;
}

export function selectTodayPriority(
  candidates: TodayPriorityCandidate[],
  dismissedIds: ReadonlySet<string> = new Set(),
): TodayPriorityCandidate {
  const eligible = candidates.filter(candidate => !dismissedIds.has(candidate.id));
  return [...(eligible.length > 0 ? eligible : candidates)].sort((a, b) => {
    if (a.rank !== b.rank) return b.rank - a.rank;
    return a.id.localeCompare(b.id);
  })[0];
}

export function buildChangedSignals(entries: StoredEntry[], now = new Date()): ChangedSignal[] {
  const grouped = new Map<string, StoredEntry[]>();
  for (const entry of entries) {
    const group = grouped.get(entry.biomarkerId) ?? [];
    group.push(entry);
    grouped.set(entry.biomarkerId, group);
  }

  const signals: Array<ChangedSignal & { rank: number }> = [];
  for (const [biomarkerId, group] of grouped) {
    const sorted = [...group].sort((a, b) => b.date.localeCompare(a.date));
    const latest = sorted[0];
    if (!latest) continue;
    const name = biomarkerLabel(biomarkerId);
    const currentStatus = classifyStoredEntry(latest);
    const ageDays = daysSince(latest.date, now);

    if (currentStatus === 'outside_reported_range') {
      signals.push({
        rank: 400,
        id: `outside:${biomarkerId}:${latest.date}`,
        biomarkerId,
        title: `${name} is outside its reported laboratory range`,
        detail: 'Laboratory-range issue; clinical meaning depends on context.',
        occurredAt: latest.date,
        valueAndUnit: valueLabel(latest),
        source: latest.source || 'Source not recorded',
        kind: 'laboratory_range',
      });
    }

    if (ageDays !== null && ageDays > 365) {
      signals.push({
        rank: 300,
        id: `stale:${biomarkerId}:${latest.date}`,
        biomarkerId,
        title: `${name} data is stale`,
        detail: 'Freshness issue; no worsening is inferred.',
        occurredAt: latest.date,
        valueAndUnit: valueLabel(latest),
        source: latest.source || 'Source not recorded',
        kind: 'stale_data',
      });
    }

    const prior = sorted.find(entry => entry.date < latest.date && entryUnit(entry) === entryUnit(latest));
    if (!prior) continue;
    const priorStatus = classifyStoredEntry(prior);
    if (priorStatus === 'outside_reported_range' && currentStatus === 'within_reported_range') {
      signals.push({
        rank: 350,
        id: `resolved:${biomarkerId}:${latest.date}`,
        biomarkerId,
        title: `${name} is now within its reported laboratory range`,
        detail: 'Resolved laboratory-range issue; this is not a universal target claim.',
        occurredAt: latest.date,
        valueAndUnit: valueLabel(latest),
        source: latest.source || 'Source not recorded',
        kind: 'resolved_range_issue',
      });
      continue;
    }

    const previousValue = prior.reportedValue ?? prior.value;
    const latestValue = latest.reportedValue ?? latest.value;
    if (!Number.isFinite(previousValue) || previousValue === 0) continue;
    const percentChange = Math.abs((latestValue - previousValue) / previousValue) * 100;
    if (percentChange < 10) continue;
    signals.push({
      rank: 200,
      id: `change:${biomarkerId}:${latest.date}`,
      biomarkerId,
      title: `${name} ${latestValue > previousValue ? 'rose' : 'fell'} since the prior comparable result`,
      detail: `${Math.round(percentChange)}% numerical change; contextual signal, not a clinical severity label.`,
      occurredAt: latest.date,
      valueAndUnit: valueLabel(latest),
      source: latest.source || 'Source not recorded',
      kind: 'contextual_change',
    });
  }

  return signals
    .sort((a, b) => b.rank - a.rank || b.occurredAt.localeCompare(a.occurredAt))
    .slice(0, 3)
    .map(({ rank: _rank, ...signal }) => signal);
}

export function buildHealthState(
  profile: TodayExperienceInput['profile'],
  phenoResult: ClinicalPhenoAgePresentation | null,
  wearableConnected = false,
): TodayHealthState {
  const wearableFields = {
    wearableStatus: wearableConnected ? 'connected' as const : 'not_connected' as const,
    wearableSummary: wearableConnected
      ? 'Wearable data is connected, but it is not included in Blood phenotypic age.'
      : 'No wearable connection. Sleep and recovery state cannot be interpreted here.',
  };
  if (!profile?.age) {
    return {
      ...wearableFields,
      status: 'no_profile',
      bloodPhenotypicAge: null,
      chronologicalAge: null,
      lastCalculated: null,
      presentCount: phenoResult?.presentCount ?? 0,
      totalRequired: phenoResult?.totalRequired ?? 9,
      historyLabel: 'Insufficient longitudinal history',
      summary: 'Chronological age is missing, so Blood phenotypic age cannot be calculated.',
    };
  }

  if (!phenoResult || phenoResult.status !== 'available' || phenoResult.valueYears === null) {
    return {
      ...wearableFields,
      status: 'insufficient_data',
      bloodPhenotypicAge: null,
      chronologicalAge: profile.age,
      lastCalculated: null,
      presentCount: phenoResult?.presentCount ?? 0,
      totalRequired: phenoResult?.totalRequired ?? 9,
      historyLabel: 'Insufficient longitudinal history',
      summary: phenoResult?.failure?.detail
        ?? `Blood phenotypic age needs all ${phenoResult?.totalRequired ?? 9} current, valid, unit-compatible inputs.`,
    };
  }

  return {
    ...wearableFields,
    status: 'valid',
    bloodPhenotypicAge: phenoResult.valueYears,
    chronologicalAge: profile.age,
    lastCalculated: phenoResult.calculatedAt,
    presentCount: phenoResult.presentCount,
    totalRequired: phenoResult.totalRequired,
    historyLabel: 'Insufficient longitudinal history',
    summary: 'A blood-based estimate calculated from chronological age and nine measurements.',
  };
}

function buildBrief(
  priority: TodayPriorityCandidate,
  safetyAlert: TodaySafetyAlert | null,
  input: TodayExperienceInput,
  signals: ChangedSignal[],
): DailyHealthBrief {
  const watch = safetyAlert
    ? 'A possible protocol interaction is awaiting review.'
    : signals[0]?.title ?? 'No meaningful laboratory change is available to review.';
  const opportunity = !input.wearableConnected
    ? 'Wearable data is not connected; no recovery or sleep interpretation is shown.'
    : input.phenoResult?.status !== 'available'
      ? 'Completing the blood input set would unlock a valid Blood phenotypic age estimate.'
      : 'Continue measuring before drawing conclusions about change over time.';
  return {
    doOneThing: priority.title,
    watch,
    opportunity,
    askContext: `${priority.title}. ${priority.reason}`,
  };
}

export function buildTodayExperience(input: TodayExperienceInput): TodayExperience {
  const now = input.now ?? new Date();
  const protocolItems = buildProtocolItems(
    input.profile,
    input.protocol,
    input.exerciseLogs,
    input.advisorContext,
    now,
  );
  const safetyAlert = buildSafetyAlert(input.advisorContext);
  const priority = selectTodayPriority(
    buildPriorityCandidates({ ...input, now }, protocolItems),
    input.dismissedPriorityIds,
  );
  const changedSignals = buildChangedSignals(input.entries, now);
  return {
    safetyAlert,
    priority,
    brief: buildBrief(priority, safetyAlert, input, changedSignals),
    protocolItems,
    healthState: buildHealthState(input.profile, input.phenoResult, input.wearableConnected),
    changedSignals,
    changedSignalsEmptyMessage: changedSignals.length === 0
      ? 'Nothing meaningful has changed in the comparable data available today.'
      : null,
  };
}

export type TodayLayout = 'compact' | 'regular';

export function getTodayLayout(width: number): { mode: TodayLayout; horizontalPadding: number } {
  return width < 360
    ? { mode: 'compact', horizontalPadding: 14 }
    : { mode: 'regular', horizontalPadding: 20 };
}
