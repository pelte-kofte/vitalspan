import type { Biomarker } from '../data/biomarkers';
import {
  DOMAIN_STATE_LABELS,
  bloodDomainEngine,
  fitnessDomainEngine,
  lifestyleDomainEngine,
  nutritionDomainEngine,
  recoveryDomainEngine,
  sleepDomainEngine,
  type DomainMetric,
  type HealthDomainState,
  type MetricInterpretation,
  type MetricProvenance,
} from '../domain/health';
import {
  buildLivingSphereRendererContract,
  createLivingSphereInput,
  type LivingSphereRendererContract,
  type VisualClarity,
} from '../domain/livingSphere';
import type { StoredEntry } from '../types/biomarkerEntry';
import { classifyStoredEntry } from './biomarkerInterpretation';
import type { HealthData } from './healthkit';

export interface HealthLivingSphereModel {
  contract: LivingSphereRendererContract;
  currentState: string;
  evidenceClarity: string;
  primaryInsight: string;
}

const CLARITY_LABELS: Readonly<Record<VisualClarity, string>> = {
  obscured: 'Insufficient',
  muted: 'Limited',
  partial: 'Moderate',
  clear: 'High',
  crystalline: 'Very High',
};

function laboratoryProvenance(entry: StoredEntry): MetricProvenance {
  const manual = /manual|entered/i.test(entry.source);
  return {
    source: manual ? 'manual_entry' : 'laboratory',
    provider: entry.source.trim() || (manual ? 'Manual Entry' : 'Laboratory'),
    reliability: manual ? 'self_reported' : 'clinically_verified',
    recordedAt: entry.date,
    sourceRecordId: entry.id,
  };
}

function laboratoryInterpretation(
  marker: Biomarker,
  entry: StoredEntry,
): MetricInterpretation | undefined {
  const status = classifyStoredEntry(entry);
  if (status !== 'within_reported_range' && status !== 'outside_reported_range') return undefined;
  const within = status === 'within_reported_range';
  return {
    state: within ? 'stable' : 'needs_review',
    observation: `${marker.name} is ${within ? 'within' : 'outside'} its source-reported laboratory range.`,
    basis: 'validated_threshold',
    basisDescription: 'Compared only with the lower and upper bounds supplied by the source laboratory.',
    consistency: 'unknown',
  };
}

function bloodCapability(marker: Biomarker): DomainMetric<'blood'>['capability'] {
  if (marker.category === 'inflammation') return 'inflammation';
  if (marker.category === 'cardio' || marker.category === 'metabolic') return 'cardiometabolic';
  return 'biomarkers';
}

function bloodMetrics(
  biomarkers: readonly Biomarker[],
  entries: readonly StoredEntry[],
  asOf: string,
): DomainMetric<'blood'>[] {
  const definitions = new Map(biomarkers.map(marker => [marker.id, marker]));
  return entries.flatMap(entry => {
    const marker = definitions.get(entry.biomarkerId);
    const observedAt = Date.parse(entry.date);
    const value = entry.reportedValue ?? entry.value;
    if (!marker || !Number.isFinite(observedAt) || observedAt > Date.parse(asOf)
      || !Number.isFinite(value)) return [];
    return [{
      id: entry.id,
      capability: bloodCapability(marker),
      label: marker.name,
      value,
      unit: entry.reportedUnit ?? entry.unit ?? marker.unit,
      collectionId: entry.date.slice(0, 10),
      observedAt: entry.date,
      provenance: [laboratoryProvenance(entry)],
      interpretation: laboratoryInterpretation(marker, entry),
    }];
  });
}

function healthProvenance(data: HealthData, recordedAt: string): MetricProvenance {
  const appleHealth = data.source !== 'wearable';
  return {
    source: appleHealth ? 'apple_health' : 'wearable',
    provider: appleHealth ? 'Apple Health' : 'Connected Wearable',
    reliability: 'device_recorded',
    recordedAt,
    integrationId: appleHealth ? 'healthkit' : 'wearable',
  };
}

function deviceMetric<D extends 'sleep' | 'recovery' | 'fitness'>(input: {
  domain: D;
  capability: DomainMetric<D>['capability'];
  label: string;
  value: number;
  unit: string;
  observedAt: string;
  provenance: MetricProvenance;
}): DomainMetric<D> {
  return { id: `${input.domain}:${String(input.capability)}:${input.observedAt}`,
    capability: input.capability, label: input.label, value: input.value, unit: input.unit,
    collectionId: input.observedAt.slice(0, 10), observedAt: input.observedAt,
    provenance: [input.provenance] };
}

function supportedDeviceStates(
  data: HealthData | null,
  asOf: string,
): [HealthDomainState<'sleep'>, HealthDomainState<'recovery'>, HealthDomainState<'fitness'>] {
  const observedAt = data?.lastSynced && Number.isFinite(Date.parse(data.lastSynced))
    && Date.parse(data.lastSynced) <= Date.parse(asOf) ? data.lastSynced : null;
  if (!data || !observedAt) return [sleepDomainEngine.build({ asOf }),
    recoveryDomainEngine.build({ asOf }), fitnessDomainEngine.build({ asOf })];
  const provenance = healthProvenance(data, observedAt);
  const sleep: DomainMetric<'sleep'>[] = data.sleepHours === undefined
    || !Number.isFinite(data.sleepHours) ? [] : [deviceMetric({
    domain: 'sleep', capability: 'duration', label: 'Sleep duration', value: data.sleepHours,
    unit: 'hours', observedAt, provenance,
  })];
  const recovery: DomainMetric<'recovery'>[] = [
    data.hrv === undefined || !Number.isFinite(data.hrv) ? null : deviceMetric({ domain: 'recovery', capability: 'hrv',
      label: 'Heart-rate variability', value: data.hrv, unit: 'ms', observedAt, provenance }),
    data.restingHeartRate === undefined || !Number.isFinite(data.restingHeartRate) ? null : deviceMetric({ domain: 'recovery',
      capability: 'resting_heart_rate', label: 'Resting heart rate', value: data.restingHeartRate,
      unit: 'bpm', observedAt, provenance }),
    data.recovery === undefined || !Number.isFinite(data.recovery) ? null : deviceMetric({ domain: 'recovery', capability: 'recovery_score',
      label: 'Source recovery score', value: data.recovery, unit: 'score', observedAt, provenance }),
  ].filter((metric): metric is DomainMetric<'recovery'> => metric !== null);
  const fitness: DomainMetric<'fitness'>[] = [
    data.vo2max === undefined || !Number.isFinite(data.vo2max) ? null : deviceMetric({ domain: 'fitness', capability: 'vo2max',
      label: 'VO₂max', value: data.vo2max, unit: 'mL/kg/min', observedAt, provenance }),
    data.steps === undefined || !Number.isFinite(data.steps) ? null : deviceMetric({ domain: 'fitness', capability: 'activity',
      label: 'Average steps', value: data.steps, unit: 'steps/day', observedAt, provenance }),
  ].filter((metric): metric is DomainMetric<'fitness'> => metric !== null);
  return [sleepDomainEngine.build({ asOf, metrics: sleep }),
    recoveryDomainEngine.build({ asOf, metrics: recovery }),
    fitnessDomainEngine.build({ asOf, metrics: fitness })];
}

function presentation(
  contract: LivingSphereRendererContract,
  domains: readonly HealthDomainState[],
): Omit<HealthLivingSphereModel, 'contract'> {
  const represented = domains.filter(domain => domain.dataCompleteness.state !== 'none');
  const dominant = contract.state.dominantInfluence
    ? represented.find(domain => domain.id === contract.state.dominantInfluence) : undefined;
  const interpretable = represented.filter(domain => domain.currentState.state !== 'unknown');
  const state = dominant ?? (interpretable.length === 1 ? interpretable[0] : undefined);
  const currentState = state
    ? `${state.title}: ${DOMAIN_STATE_LABELS[state.currentState.state]}`
    : represented.length > 0 ? 'Current state is still forming' : 'Current state unavailable';
  const insightDomain = dominant ?? represented[0];
  const primaryInsight = insightDomain
    ? insightDomain.currentState.state === 'unknown'
      ? insightDomain.evidenceSummary.text
      : insightDomain.primaryDriver.text
    : 'No supported domain evidence is available yet.';
  return { currentState, evidenceClarity: CLARITY_LABELS[contract.state.overallEvidenceClarity],
    primaryInsight };
}

/** App integration boundary. The returned renderer contract contains no raw values. */
export function buildHealthLivingSphere(input: {
  asOf: string;
  biomarkers: readonly Biomarker[];
  entries: readonly StoredEntry[];
  healthData: HealthData | null;
  reduceMotion: boolean;
}): HealthLivingSphereModel {
  const blood = bloodDomainEngine.build({ asOf: input.asOf,
    metrics: bloodMetrics(input.biomarkers, input.entries, input.asOf) });
  const [sleep, recovery, fitness] = supportedDeviceStates(input.healthData, input.asOf);
  const nutrition = nutritionDomainEngine.build({ asOf: input.asOf });
  const lifestyle = lifestyleDomainEngine.build({ asOf: input.asOf });
  const contract = buildLivingSphereRendererContract(createLivingSphereInput({ asOf: input.asOf,
    domains: [blood, sleep, recovery, fitness, nutrition, lifestyle], reduceMotion: input.reduceMotion }));
  return { contract, ...presentation(contract, [blood, sleep, recovery, fitness, nutrition, lifestyle]) };
}
