import type { Biomarker } from '../data/biomarkers';
import type { HealthData } from './healthkit';
import type { ClinicalPhenoAgePresentation } from './clinicalPhenoAgePresentation';
import { classifyStoredEntry } from './biomarkerInterpretation';
import type { StoredEntry } from '../types/biomarkerEntry';

export type BodySystemId =
  | 'cardiovascular'
  | 'brain'
  | 'metabolic'
  | 'immune'
  | 'liver'
  | 'kidney'
  | 'muscle'
  | 'hormones'
  | 'nutrition'
  | 'research';

export type HealthTrend = 'improving' | 'stable' | 'needs_review' | 'insufficient_history';
export type HealthInputState =
  | 'no_labs'
  | 'partial_labs'
  | 'old_labs'
  | 'only_wearables'
  | 'only_healthkit'
  | 'only_manual'
  | 'complete';

/** Extensible multimodal inputs. These are contracts only; no cross-domain age score is calculated yet. */
export type HealthDomainId =
  | 'sleep'
  | 'recovery'
  | 'wearables'
  | 'fitness'
  | 'nutrition'
  | 'body_composition'
  | 'smoking'
  | 'alcohol'
  | 'medication'
  | 'supplements'
  | 'mental_health'
  | 'genetics';

export interface HealthDomainDefinition {
  id: HealthDomainId;
  name: string;
  /** Kept explicit so a future source can be added without changing the overview component. */
  status: 'planned' | 'available';
}

export interface HealthDomainModel extends HealthDomainDefinition {
  signalCount: number;
}

export interface HealthOverviewModel {
  bloodPhenotypicAge: ClinicalPhenoAgePresentation;
  lastLabDate: string | null;
  completeness: number;
  overallTrend: HealthTrend;
  limitations: readonly string[];
  futureDomains: readonly HealthDomainModel[];
}

export interface BodySystemDefinition {
  id: BodySystemId;
  name: string;
  markerIds?: readonly string[];
  categories?: readonly Biomarker['category'][];
  researchOnly?: boolean;
}

export interface BodySystemModel extends BodySystemDefinition {
  biomarkers: Biomarker[];
  currentEntries: StoredEntry[];
  state: string;
  driver: string;
  changed: string;
  confidence: 'High' | 'Moderate' | 'Low';
  trend: HealthTrend;
  openActions: number;
  nextAction?: string;
}

export interface HealthEmptyStateCopy {
  title: string;
  known: string;
  unknown: string;
  action: string;
  actionLabel: string;
}

export interface HealthExperience {
  inputState: HealthInputState;
  lastLabDate: string | null;
  overallTrend: HealthTrend;
  systems: BodySystemModel[];
  emptyState: HealthEmptyStateCopy;
  overview: HealthOverviewModel;
  domains: readonly HealthDomainModel[];
}

export const HEALTH_DOMAINS: readonly HealthDomainDefinition[] = [
  { id: 'sleep', name: 'Sleep', status: 'planned' },
  { id: 'recovery', name: 'Recovery', status: 'planned' },
  { id: 'wearables', name: 'Wearables', status: 'planned' },
  { id: 'fitness', name: 'Fitness', status: 'planned' },
  { id: 'nutrition', name: 'Nutrition', status: 'planned' },
  { id: 'body_composition', name: 'Body composition', status: 'planned' },
  { id: 'smoking', name: 'Smoking', status: 'planned' },
  { id: 'alcohol', name: 'Alcohol', status: 'planned' },
  { id: 'medication', name: 'Medication', status: 'planned' },
  { id: 'supplements', name: 'Supplements', status: 'planned' },
  { id: 'mental_health', name: 'Mental health', status: 'planned' },
  { id: 'genetics', name: 'Genetics', status: 'planned' },
] as const;

export const BODY_SYSTEMS: readonly BodySystemDefinition[] = [
  { id: 'cardiovascular', name: 'Cardiovascular', categories: ['cardio'] },
  { id: 'brain', name: 'Brain & Cognition', markerIds: ['homocysteine', 'omega3index', 'b12', 'folate'] },
  { id: 'metabolic', name: 'Metabolic', categories: ['metabolic'] },
  { id: 'immune', name: 'Immune & Inflammation', categories: ['inflammation', 'cbc'] },
  { id: 'liver', name: 'Liver', categories: ['liver'], markerIds: ['albumin', 'alp'] },
  { id: 'kidney', name: 'Kidney', categories: ['kidney'], markerIds: ['creatinine'] },
  { id: 'muscle', name: 'Muscle & Performance', markerIds: ['vo2max', 'gripStrength', 'creatinine', 'testosterone'] },
  { id: 'hormones', name: 'Hormones', categories: ['hormones', 'thyroid'] },
  { id: 'nutrition', name: 'Nutrition', categories: ['vitamins'], markerIds: ['ferritin', 'omega3index', 'albumin'] },
  { id: 'research', name: 'Longevity Research', markerIds: ['nad'], researchOnly: true },
] as const;

export const TREND_LABELS: Record<HealthTrend, string> = {
  improving: 'Improving',
  stable: 'Stable',
  needs_review: 'Needs review',
  insufficient_history: 'Insufficient history',
};

export const TREND_TONES: Record<HealthTrend, 'attention' | 'neutral' | 'positive'> = {
  improving: 'positive',
  stable: 'neutral',
  needs_review: 'attention',
  insufficient_history: 'neutral',
};

export const EMPTY_STATE_COPY: Record<HealthInputState, HealthEmptyStateCopy> = {
  no_labs: {
    title: 'Your physiology map is waiting for data',
    known: 'We know your profile information, if provided.',
    unknown: 'We cannot assess body systems or calculate Blood Phenotypic Age without laboratory results.',
    action: 'Import a recent laboratory report or enter a result manually.',
    actionLabel: 'Add laboratory data',
  },
  partial_labs: {
    title: 'A partial view of your body',
    known: 'Available results are organized into the body systems they inform.',
    unknown: 'Some systems and the Blood Phenotypic Age model remain incomplete.',
    action: 'Add the missing measurements shown in the overview.',
    actionLabel: 'Complete laboratory data',
  },
  old_labs: {
    title: 'Your laboratory view is out of date',
    known: 'Historical results still provide context and remain available in each system.',
    unknown: 'They may not reflect the current state of your body.',
    action: 'Add a recent laboratory report before acting on old patterns.',
    actionLabel: 'Update laboratory data',
  },
  only_wearables: {
    title: 'Wearable signals, without laboratory context',
    known: 'Connected devices can describe daily physiology and recovery patterns.',
    unknown: 'Blood-based systems and Blood Phenotypic Age cannot be assessed yet.',
    action: 'Add laboratory data to connect short-term signals with longer-term physiology.',
    actionLabel: 'Add laboratory data',
  },
  only_healthkit: {
    title: 'Apple Health signals, without laboratory context',
    known: 'Vitalspan can read the HealthKit signals you have chosen to share.',
    unknown: 'Blood-based systems and Blood Phenotypic Age cannot be assessed yet.',
    action: 'Add laboratory data to build the blood-based layer of your health map.',
    actionLabel: 'Add laboratory data',
  },
  only_manual: {
    title: 'A manually entered view',
    known: 'Your entries can begin mapping the systems they relate to.',
    unknown: 'Source laboratory ranges and report context may be missing, which limits interpretation.',
    action: 'Upload the original report when available to preserve laboratory context.',
    actionLabel: 'Upload original report',
  },
  complete: {
    title: 'Core blood model complete',
    known: 'All nine required Blood Phenotypic Age measurements are current and compatible.',
    unknown: 'This blood model does not represent every dimension of health or aging.',
    action: 'Review changes by body system and keep source reports current.',
    actionLabel: 'Review body systems',
  },
};

const DAY_MS = 86_400_000;

function daysOld(date: string, now: Date): number {
  const value = Date.parse(date);
  return Number.isFinite(value) ? Math.max(0, (now.getTime() - value) / DAY_MS) : Number.POSITIVE_INFINITY;
}

export function formatHealthDate(date: string | null): string {
  if (!date) return 'No laboratory date';
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function freshnessLabel(date: string, now = new Date()): string {
  const age = daysOld(date, now);
  if (age <= 120) return 'Current';
  if (age <= 365) return 'Aging';
  return 'Out of date';
}

function rangeDistance(entry: StoredEntry): number | null {
  const range = entry.sourceLabRange;
  const value = entry.reportedValue ?? entry.value;
  if (!range || !Number.isFinite(value)) return null;
  if (range.lowerBound !== undefined && value < range.lowerBound) return range.lowerBound - value;
  if (range.upperBound !== undefined && value > range.upperBound) return value - range.upperBound;
  return 0;
}

export function deriveEntryTrend(history: readonly StoredEntry[]): HealthTrend {
  const [latest, previous] = history;
  if (!latest) return 'insufficient_history';
  if (classifyStoredEntry(latest) === 'outside_reported_range') return 'needs_review';
  if (!previous) return 'insufficient_history';
  const latestDistance = rangeDistance(latest);
  const previousDistance = rangeDistance(previous);
  if (latestDistance !== null && previousDistance !== null && latestDistance < previousDistance) return 'improving';
  return 'stable';
}

function markerSelection(definition: BodySystemDefinition, biomarkers: readonly Biomarker[]): Biomarker[] {
  const ids = new Set(definition.markerIds ?? []);
  const categories = new Set(definition.categories ?? []);
  return biomarkers.filter(marker => ids.has(marker.id) || categories.has(marker.category));
}

function systemModel(
  definition: BodySystemDefinition,
  biomarkers: readonly Biomarker[],
  historyMap: Map<string, StoredEntry[]>,
  now: Date,
): BodySystemModel {
  const selected = markerSelection(definition, biomarkers);
  const currentEntries = selected
    .map(marker => historyMap.get(marker.id)?.[0])
    .filter((entry): entry is StoredEntry => Boolean(entry));
  const current = currentEntries.filter(entry => daysOld(entry.date, now) <= 365);
  const outside = current.filter(entry => classifyStoredEntry(entry) === 'outside_reported_range');
  const classified = current.filter(entry => classifyStoredEntry(entry) === 'within_reported_range');
  const trends = selected.map(marker => deriveEntryTrend(historyMap.get(marker.id) ?? []));
  const trend: HealthTrend = outside.length > 0
    ? 'needs_review'
    : trends.includes('improving')
      ? 'improving'
      : trends.includes('stable')
        ? 'stable'
        : 'insufficient_history';
  const driverEntry = outside[0] ?? current[0];
  const driverMarker = driverEntry ? selected.find(marker => marker.id === driverEntry.biomarkerId) : undefined;
  const rangedCount = current.filter(entry => Boolean(entry.sourceLabRange)).length;
  const confidence = current.length >= 3 && rangedCount >= 2 ? 'High' : current.length > 0 ? 'Moderate' : 'Low';

  let state = 'No assessment yet';
  if (definition.researchOnly && current.length > 0) state = 'Research data only';
  else if (currentEntries.length > 0 && current.length === 0) state = 'Data out of date';
  else if (outside.length > 0) state = 'Needs review';
  else if (classified.length > 0) state = 'Within reported ranges';
  else if (current.length > 0) state = 'Context incomplete';

  const driver = driverMarker
    ? outside.length > 0
      ? `${driverMarker.name} is outside its reported laboratory range`
      : `${driverMarker.name} is the most recent signal`
    : 'No assessment yet';
  const nextAction = current.length === 0 && definition.id === 'cardiovascular'
    ? 'Add a recent laboratory result'
    : outside.length > 0
      ? 'Review laboratory context'
      : undefined;
  const changed = trend === 'improving'
    ? 'A result moved toward its reported range'
    : trend === 'stable'
      ? 'No material range change detected'
      : trend === 'needs_review'
        ? 'A current result needs clinical context'
        : 'More than one collection is needed';
  const openActions = current.length === 0 ? 0 : outside.length;

  return { ...definition, biomarkers: selected, currentEntries, state, driver, changed, confidence, trend, openActions, nextAction };
}

export function sortBodySystems(systems: readonly BodySystemModel[]): BodySystemModel[] {
  const rank = (system: BodySystemModel): number => {
    if (system.trend === 'needs_review') return 0;
    if (system.trend === 'improving') return 1;
    if (system.trend === 'stable') return 2;
    return 3;
  };
  return [...systems].sort((a, b) => rank(a) - rank(b));
}

function overallTrend(systems: readonly BodySystemModel[]): HealthTrend {
  const active = systems.filter(system => system.currentEntries.length > 0 && !system.researchOnly);
  if (active.some(system => system.trend === 'needs_review')) return 'needs_review';
  if (active.some(system => system.trend === 'improving')) return 'improving';
  if (active.some(system => system.trend === 'stable')) return 'stable';
  return 'insufficient_history';
}

function domainModels(entries: readonly StoredEntry[], biomarkers: readonly Biomarker[], healthData: HealthData | null): HealthDomainModel[] {
  const idsByCategory = (category: Biomarker['category']) => new Set(
    biomarkers.filter(marker => marker.category === category).map(marker => marker.id),
  );
  const hasCategory = (category: Biomarker['category']) => {
    const ids = idsByCategory(category);
    return entries.some(entry => ids.has(entry.biomarkerId));
  };
  const signals: Record<HealthDomainId, number> = {
    sleep: healthData?.sleepHours === undefined ? 0 : 1,
    recovery: healthData?.recovery === undefined && healthData?.hrv === undefined ? 0 : 1,
    wearables: healthData ? Object.keys(healthData).filter(key => key !== 'lastSynced' && key !== 'isDemoMode' && key !== 'source').length : 0,
    fitness: healthData?.vo2max === undefined ? 0 : 1,
    nutrition: hasCategory('vitamins') ? 1 : 0,
    body_composition: 0,
    smoking: 0,
    alcohol: 0,
    medication: 0,
    supplements: 0,
    mental_health: 0,
    genetics: 0,
  };
  return HEALTH_DOMAINS.map(definition => ({
    ...definition,
    // Availability is deliberately conservative. These signals are not folded into age.
    status: signals[definition.id] > 0 ? 'available' : definition.status,
    signalCount: signals[definition.id],
  }));
}

function resolveInputState(
  entries: readonly StoredEntry[],
  phenoAge: ClinicalPhenoAgePresentation,
  healthData: HealthData | null,
  healthDataSource: 'healthkit' | 'wearable',
  now: Date,
): HealthInputState {
  if (entries.length === 0) {
    if (healthData) return (healthData.source ?? healthDataSource) === 'wearable' ? 'only_wearables' : 'only_healthkit';
    return 'no_labs';
  }
  const newest = [...entries].sort((a, b) => b.date.localeCompare(a.date))[0];
  if (!newest || daysOld(newest.date, now) > 365) return 'old_labs';
  const manualOnly = entries.every(entry => /manual|entered/i.test(entry.source));
  if (manualOnly) return 'only_manual';
  if (phenoAge.status === 'available') return 'complete';
  return 'partial_labs';
}

export function buildHealthExperience(input: {
  biomarkers: readonly Biomarker[];
  entries: readonly StoredEntry[];
  phenoAge: ClinicalPhenoAgePresentation;
  healthData: HealthData | null;
  healthDataSource?: 'healthkit' | 'wearable';
  now?: Date;
}): HealthExperience {
  const now = input.now ?? new Date();
  const historyMap = new Map<string, StoredEntry[]>();
  for (const entry of input.entries) {
    const history = historyMap.get(entry.biomarkerId) ?? [];
    history.push(entry);
    historyMap.set(entry.biomarkerId, history);
  }
  for (const history of historyMap.values()) history.sort((a, b) => b.date.localeCompare(a.date));
  const systems = BODY_SYSTEMS.map(definition => systemModel(definition, input.biomarkers, historyMap, now));
  const lastLabDate = input.entries.reduce<string | null>(
    (latest, entry) => !latest || entry.date > latest ? entry.date : latest,
    null,
  );
  const inputState = resolveInputState(
    input.entries,
    input.phenoAge,
    input.healthData,
    input.healthDataSource ?? 'healthkit',
    now,
  );
  const domains = domainModels(input.entries, input.biomarkers, input.healthData);
  const overview: HealthOverviewModel = {
    bloodPhenotypicAge: input.phenoAge,
    lastLabDate,
    completeness: input.phenoAge.totalRequired > 0
      ? Math.round((input.phenoAge.presentCount / input.phenoAge.totalRequired) * 100)
      : 0,
    overallTrend: overallTrend(systems),
    limitations: input.phenoAge.limitations,
    futureDomains: domains,
  };
  return {
    inputState,
    lastLabDate,
    overallTrend: overallTrend(systems),
    systems,
    emptyState: EMPTY_STATE_COPY[inputState],
    overview,
    domains,
  };
}
