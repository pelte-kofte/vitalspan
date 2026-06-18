/**
 * advisorContext.ts — Anonymized health context assembler for the AI Advisor.
 *
 * Privacy boundary (D-09): Converts raw AsyncStorage data into a zero-PII payload
 * that is safe to send to the Supabase Edge Function / Claude API.
 *
 * Security guarantees:
 *   - Chronological age bucketed into 5-year bands; exact age never included.
 *   - Biomarker values mapped to status categories (Optimal/Suboptimal/Critical);
 *     raw numeric values never included in the output.
 *   - No user name, no exact birthdate, no Supabase user ID, no device ID.
 *   - HealthKit fields excluded when isDemoMode:true (D-12).
 *   - Exercise frequency summarized as "Nx/week" for the last 7 calendar days (D-08).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { BIOMARKERS } from '../data/biomarkers';
import { ExerciseLogEntry } from '../data/exercises';
import { computePhenoAge, PHENO_AGE_BIOMARKER_MAP, PhenoAgeInputs } from './phenoAge';
import { ProtocolItem } from '../types/protocol';
import { SUPPLEMENT_DATABASE } from '../data/supplementTimings';

// ── Exported types ────────────────────────────────────────────────────────────

export type BiomarkerStatus = 'Optimal' | 'Suboptimal' | 'Critical';

export interface AdvisorContext {
  ageBand: string;                   // e.g. "35–39" (D-11)
  biologicalAge: number | null;      // from computePhenoAge() (D-03)
  sex: string;
  goal: string;
  medications: string[];             // names only (D-09)
  supplements: string[];             // names only (D-09) — preserved for backward compat
  /** Phase 22 PROT-05: richer per-supplement data with dose bucketing. Raw dose never included (pharmacist-liability). */
  supplementDetails?: Array<{
    name: string;
    timing?: string;
    doseBucket?: 'high' | 'standard' | 'low';
  }>;
  biomarkers: Array<{
    name: string;
    status: BiomarkerStatus;
  }>;
  healthDataAvailable: boolean;      // false when isDemoMode:true (D-12)
  hrv?: number;                      // omit if healthDataAvailable:false
  sleepScore?: number;               // omit if healthDataAvailable:false
  recovery?: number;                 // omit if healthDataAvailable:false
  exerciseFrequency?: string;        // e.g. "3x/week" — omit if no logs in last 7 days (D-08)
}

// ── Internal types (not exported) ────────────────────────────────────────────

interface StoredEntry {
  id: string;
  type: string;
  value: number;
  unit: string;
  date: string;
}

interface UserProfile {
  age: number;
  sex: string;
  goal: string;
  conditions: string[];
  medications: string[];
}

interface CustomSupplement {
  id: string;
  name: string;
  dose: string;
  timing?: string;
  notes?: string;
  addedAt: string;
}

interface ProtocolState {
  supplements?: ProtocolItem[];
  addedSupplements?: string[];           // legacy — for backward compat during migration window
  customSupplements?: CustomSupplement[];  // legacy — for backward compat
  medTimes: Record<string, string>;
  taken: string[];
  takenDate: string;
  hiddenMeds?: string[];
}

interface HealthData {
  hrv: number | null;
  sleepScore: number | null;
  recovery: number | null;
  isDemoMode: boolean;
}

// ── Age bucketing (D-11) ─────────────────────────────────────────────────────

function bucketAge(age: number): string {
  const lowerBound = Math.floor(age / 5) * 5;
  const upperBound = lowerBound + 4;
  return `${lowerBound}–${upperBound}`;
}

// ── Biomarker status bucketing (D-10) ────────────────────────────────────────
//
// Rules:
//   value >= optMin && value <= optMax          → 'Optimal'
//   For biomarkers with optMin === 0 (lower-bound only):
//     value <= optMax                            → 'Optimal'
//     value <= optMax * 1.5                      → 'Suboptimal'
//     otherwise                                  → 'Critical'
//   For biomarkers with optMin > 0 (two-sided range):
//     deviation < 40% above optMax OR below optMin → 'Suboptimal'
//     greater deviation                           → 'Critical'

function bucketBiomarkerStatus(value: number, optMin: number, optMax: number): BiomarkerStatus {
  if (optMin === 0) {
    // One-sided range — only upper bound matters
    if (value <= optMax) return 'Optimal';
    if (value <= optMax * 1.5) return 'Suboptimal';
    return 'Critical';
  }

  // Two-sided range
  if (value >= optMin && value <= optMax) return 'Optimal';

  // Check deviation magnitude
  const aboveOptMax = value > optMax ? (value - optMax) / optMax : 0;
  const belowOptMin = value < optMin ? (optMin - value) / optMin : 0;
  const deviation = Math.max(aboveOptMax, belowOptMin);

  if (deviation < 0.4) return 'Suboptimal';
  return 'Critical';
}

// ── Safe AsyncStorage reader ──────────────────────────────────────────────────

async function safeGetItem<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

// ── Main assembler ────────────────────────────────────────────────────────────

export async function assembleAdvisorContext(): Promise<AdvisorContext> {
  try {
    // Read all five AsyncStorage keys in parallel (established pattern from hooks)
    const [
      userProfile,
      storedEntries,
      protocolState,
      healthData,
      exerciseLog,
    ] = await Promise.all([
      safeGetItem<UserProfile>('@vitalspan_user_profile'),
      safeGetItem<StoredEntry[]>('@vitalspan_biomarkers'),
      safeGetItem<ProtocolState>('@vitalspan_protocol'),
      safeGetItem<HealthData>('@vitalspan_health_data'),
      safeGetItem<ExerciseLogEntry[]>('@vitalspan_exercise_log'),
    ]);

    // ── Age bucketing ──────────────────────────────────────────────────────
    const age = userProfile?.age ?? 0;
    const ageBand = age > 0 ? bucketAge(age) : '0–4';

    // ── Latest entry per biomarker type ───────────────────────────────────
    const latestEntries = new Map<string, StoredEntry>();
    if (storedEntries && Array.isArray(storedEntries)) {
      for (const entry of storedEntries) {
        const existing = latestEntries.get(entry.type);
        if (!existing || entry.date > existing.date) {
          latestEntries.set(entry.type, entry);
        }
      }
    }

    // ── Biomarker status mapping (D-10) — name + status only, no raw values ─
    const biomarkerStatusList: Array<{ name: string; status: BiomarkerStatus }> = [];
    for (const biomarker of BIOMARKERS) {
      const entry = latestEntries.get(biomarker.id);
      if (entry !== undefined) {
        const status = bucketBiomarkerStatus(entry.value, biomarker.optMin, biomarker.optMax);
        biomarkerStatusList.push({ name: biomarker.name, status });
      }
    }

    // ── PhenoAge calculation ───────────────────────────────────────────────
    const phenoInputs: PhenoAgeInputs = { age };
    for (const [biomarkerId, phenoKey] of Object.entries(PHENO_AGE_BIOMARKER_MAP)) {
      const entry = latestEntries.get(biomarkerId);
      if (entry !== undefined) {
        phenoInputs[phenoKey] = entry.value;
      }
    }
    const phenoResult = computePhenoAge(phenoInputs);
    const biologicalAge = phenoResult.biologicalAge;

    // ── Supplements — new schema: read from supplements[]; backward compat fallback ─
    // Phase 22 PROT-05: build supplementDetails (name + timing + doseBucket) first,
    // then derive the backward-compat supplements: string[] from it.
    // Raw personalDose string is NEVER placed in the output (pharmacist-liability, D-07/T-22-06).
    type DoseBucket = 'high' | 'standard' | 'low';
    interface SupplementDetail { name: string; timing?: string; doseBucket?: DoseBucket; }

    const supplementDetails: SupplementDetail[] = protocolState?.supplements
      ? protocolState.supplements.map((item: ProtocolItem): SupplementDetail => {
          const dbEntry = SUPPLEMENT_DATABASE.find(
            db => db.name.toLowerCase() === item.name.toLowerCase()
          );
          let doseBucket: DoseBucket | undefined;
          if (!item.personalDose) {
            // No personal override — using DB default, bucket as standard
            doseBucket = 'standard';
          } else if (dbEntry?.defaultDose) {
            const personal = parseFloat(item.personalDose);
            const standard = parseFloat(dbEntry.defaultDose);
            // Guard: only compute ratio when both values are valid numbers (T-22-07 — never emit NaN)
            if (!isNaN(personal) && !isNaN(standard) && standard > 0) {
              const ratio = personal / standard;
              doseBucket = ratio >= 1.25 ? 'high' : ratio <= 0.75 ? 'low' : 'standard';
            }
            // else: non-numeric units (e.g. "as directed") — doseBucket stays undefined → omitted from output
          }
          return {
            name: item.name,
            ...(item.timing ? { timing: item.timing } : {}),
            ...(doseBucket !== undefined ? { doseBucket } : {}),
          };
        })
      : [
          // Legacy fallback: addedSupplements + customSupplements (no dose data available)
          ...(protocolState?.addedSupplements ?? []).map(name => ({ name })),
          ...(protocolState?.customSupplements ?? []).map(s => ({ name: s.name })),
        ];

    // Backward-compat: keep supplements: string[] for any consumer expecting the old shape
    const supplements = Array.from(new Set(supplementDetails.map(s => s.name)));

    // ── Medications — names only (D-09) ───────────────────────────────────
    const medications = userProfile?.medications ?? [];

    // ── Health data (D-12) ────────────────────────────────────────────────
    const isDemoMode = healthData?.isDemoMode === true;
    const healthDataAvailable = !isDemoMode && healthData !== null;

    // ── Exercise frequency (D-08) ─────────────────────────────────────────
    let exerciseFrequency: string | undefined;
    if (exerciseLog && Array.isArray(exerciseLog) && exerciseLog.length > 0) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      const cutoffISO = cutoff.toISOString();
      const recentCount = exerciseLog.filter(
        (entry) => entry.loggedAt >= cutoffISO,
      ).length;
      if (recentCount > 0) {
        exerciseFrequency = `${recentCount}x/week`;
      }
    }

    // ── Assemble context object ───────────────────────────────────────────
    const context: AdvisorContext = {
      ageBand,
      biologicalAge,
      sex: userProfile?.sex ?? '',
      goal: userProfile?.goal ?? '',
      medications,
      supplements,
      supplementDetails,
      biomarkers: biomarkerStatusList,
      healthDataAvailable,
    };

    // Include HealthKit fields only when real data is available (D-12)
    if (healthDataAvailable && healthData !== null) {
      if (healthData.hrv !== null && healthData.hrv !== undefined) {
        context.hrv = healthData.hrv;
      }
      if (healthData.sleepScore !== null && healthData.sleepScore !== undefined) {
        context.sleepScore = healthData.sleepScore;
      }
      if (healthData.recovery !== null && healthData.recovery !== undefined) {
        context.recovery = healthData.recovery;
      }
    }

    // Include exerciseFrequency only when entries exist in the last 7 days (D-08)
    if (exerciseFrequency !== undefined) {
      context.exerciseFrequency = exerciseFrequency;
    }

    return context;
  } catch {
    // Error resilience: never throw — return minimal valid context
    return {
      ageBand: '0–4',
      biologicalAge: null,
      sex: '',
      goal: '',
      medications: [],
      supplements: [],
      supplementDetails: [],
      biomarkers: [],
      healthDataAvailable: false,
    };
  }
}
