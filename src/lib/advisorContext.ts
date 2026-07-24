/**
 * advisorContext.ts — Anonymized health context assembler for the AI Advisor.
 *
 * Privacy boundary (D-09): Converts raw AsyncStorage data into a zero-PII payload
 * that is safe to send to the Supabase Edge Function / Claude API.
 *
 * Security guarantees:
 *   - Chronological age bucketed into 5-year bands; exact age never included.
 *   - Biomarker values mapped only against their reported laboratory range;
 *     raw numeric values never included in the output.
 *   - No user name, no exact birthdate, no Supabase user ID, no device ID.
 *   - HealthKit fields excluded when isDemoMode:true (D-12).
 *   - Exercise frequency calculated as unique workout DAYS in last 7 calendar days (D-08).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { BIOMARKERS } from '../data/biomarkers';
import { ExerciseLogEntry } from '../data/exercises';
import { getClinicalPhenoAgePresentation } from './clinicalPhenoAgePresentation';
import { BIOMARKER_STATUS_LABELS, classifyStoredEntry } from './biomarkerInterpretation';
import type { StoredEntry } from '../types/biomarkerEntry';
import { ProtocolItem } from '../types/protocol';
import { protocolDayKey } from './protocolPersistence';
import { SUPPLEMENT_DATABASE } from '../data/supplementTimings';

// ── Exported types ────────────────────────────────────────────────────────────

export type BiomarkerStatus =
  | 'Within reported laboratory range'
  | 'Outside reported laboratory range'
  | 'Needs context'
  | 'Unable to classify';

export interface AdvisorContext {
  ageBand: string;                   // e.g. "35–39" (D-11)
  biologicalAge: number | null;      // corrected blood phenotypic age; legacy API field name
  phenoAgeInputCount: number;        // how many of 9 PhenoAge biomarkers were available
  sex: string;
  goal: string;
  conditions: string[];              // user-reported medical conditions
  medications: string[];             // names only (D-09)
  supplements: string[];             // names only (D-09) — preserved for backward compat
  /** Phase 22 PROT-05: richer per-supplement data with dose bucketing. */
  supplementDetails?: Array<{
    name: string;
    timing?: string;
    doseBucket?: 'high' | 'standard' | 'low';
  }>;
  biomarkers: Array<{
    name: string;
    status: BiomarkerStatus;
    daysAgo?: number;                // how many days since this entry was logged
    dataPointCount: number;          // real logged entries for this biomarker
    trend?: 'improving' | 'stable' | 'declining';
  }>;
  adherenceRate: string;             // e.g. "72%" or "unknown"
  timingConflicts: Array<{
    item1: string;
    item2: string;
    slot: string;                    // TimeSlot or 'any' for pharmacodynamic conflicts
    note: string;
  }>;
  healthDataAvailable: boolean;      // false when isDemoMode:true (D-12)
  hrv?: number;                      // omit if healthDataAvailable:false
  sleepScore?: number;               // omit if healthDataAvailable:false
  recovery?: number;                 // omit if healthDataAvailable:false
  glucose?: number;                  // mg/dL from HealthKit; omit if not available
  exerciseFrequency?: string;        // e.g. "3x/week" — unique workout days, last 7 days (D-08)
}

// ── Internal types (not exported) ────────────────────────────────────────────

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
  customSupplements?: CustomSupplement[]; // legacy — for backward compat
  medTimes: Record<string, string>;
  taken: string[];
  takenDate: string;
  hiddenMeds?: string[];
}

interface HealthData {
  hrv?: number | null;
  sleepScore?: number | null;
  recovery?: number | null;
  glucose?: number | null;
  isDemoMode?: boolean;
}

// ── Age bucketing (D-11) ─────────────────────────────────────────────────────

function bucketAge(age: number): string {
  const lowerBound = Math.floor(age / 5) * 5;
  return `${lowerBound}–${lowerBound + 4}`;
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

// ── Timing conflict constants ─────────────────────────────────────────────────
//
// Only interactions with strong pharmacokinetic or pharmacodynamic evidence are listed.
// Source basis: standard pharmacy references (Stockley's Drug Interactions,
// clinical pharmacokinetics literature, and pharmacist practice guidelines).

/** Same-slot supplement–supplement absorption conflicts. */
const ABSORPTION_CONFLICT_RULES: Array<{ a: string; b: string; note: string }> = [
  { a: 'calcium', b: 'iron', note: 'Calcium inhibits non-heme iron absorption — separate by 2 hours' },
  { a: 'calcium', b: 'zinc', note: 'Calcium competes with zinc for intestinal absorption — separate by 1–2 hours' },
  { a: 'calcium', b: 'magnesium', note: 'High-dose calcium and magnesium compete for the same transporter — consider splitting doses' },
  { a: 'zinc', b: 'copper', note: 'Zinc induces metallothionein and blocks copper absorption — separate by 2 hours' },
  { a: 'zinc', b: 'iron', note: 'Zinc and non-heme iron compete for divalent metal transporter — separate by 2 hours' },
  { a: 'magnesium', b: 'iron', note: 'Magnesium may reduce iron absorption when co-administered at high doses' },
];

/** Same-slot supplement–medication absorption conflicts. */
const SUPP_MED_ABSORPTION_RULES: Array<{ supp: string; med: string; note: string }> = [
  { supp: 'calcium', med: 'levothyroxine', note: 'Calcium significantly reduces levothyroxine absorption — separate by at least 4 hours' },
  { supp: 'calcium', med: 'synthroid', note: 'Calcium significantly reduces levothyroxine absorption — separate by at least 4 hours' },
  { supp: 'iron', med: 'levothyroxine', note: 'Iron forms an insoluble complex with levothyroxine, reducing absorption — separate by at least 4 hours' },
  { supp: 'iron', med: 'synthroid', note: 'Iron forms an insoluble complex with levothyroxine, reducing absorption — separate by at least 4 hours' },
  { supp: 'magnesium', med: 'levothyroxine', note: 'Magnesium may reduce levothyroxine absorption — separate by 2 hours' },
  { supp: 'calcium', med: 'ciprofloxacin', note: 'Calcium chelates fluoroquinolones, reducing antibiotic absorption — separate by 2 hours' },
  { supp: 'iron', med: 'ciprofloxacin', note: 'Iron chelates fluoroquinolones, reducing antibiotic absorption — separate by 2 hours' },
  { supp: 'magnesium', med: 'ciprofloxacin', note: 'Magnesium chelates fluoroquinolones, reducing antibiotic absorption — separate by 2 hours' },
];

/** Pharmacodynamic conflicts — flagged regardless of time slot (slot: 'any'). */
const CRITICAL_DRUG_CONFLICTS: Array<{ supp: string; medPatterns: string[]; note: string }> = [
  {
    supp: 'vitamin k',
    medPatterns: ['warfarin', 'coumadin', 'rivaroxaban', 'xarelto', 'apixaban', 'eliquis', 'dabigatran', 'pradaxa', 'acenocoumarol'],
    note: 'Vitamin K directly antagonizes anticoagulants — discuss with prescribing doctor immediately',
  },
  {
    supp: 'berberine',
    medPatterns: ['metformin', 'glipizide', 'glyburide', 'glimepiride', 'sitagliptin', 'empagliflozin', 'insulin'],
    note: 'Berberine has additive glucose-lowering effects — risk of hypoglycemia; discuss with prescribing doctor',
  },
  {
    supp: "st. john",
    medPatterns: ['sertraline', 'fluoxetine', 'paroxetine', 'escitalopram', 'citalopram', 'venlafaxine', 'duloxetine', 'bupropion'],
    note: "St. John's Wort induces CYP3A4 — may reduce effectiveness of many medications; discuss with prescribing doctor",
  },
  {
    supp: 'coq10',
    medPatterns: ['warfarin', 'coumadin'],
    note: 'CoQ10 may reduce anticoagulant effectiveness — monitor INR; discuss with prescribing doctor',
  },
  {
    supp: 'fish oil',
    medPatterns: ['warfarin', 'coumadin', 'clopidogrel'],
    note: 'High-dose omega-3 (fish oil) may enhance anticoagulant/antiplatelet effects — discuss with prescribing doctor',
  },
  {
    supp: 'omega',
    medPatterns: ['warfarin', 'coumadin', 'clopidogrel'],
    note: 'High-dose omega-3 may enhance anticoagulant effects — discuss with prescribing doctor',
  },
];

// ── Timing conflict builder ────────────────────────────────────────────────────

function buildTimingConflicts(
  supplements: ProtocolItem[],
  medications: string[],
  medTimes: Record<string, string>,
  hiddenMeds: string[],
): AdvisorContext['timingConflicts'] {
  const conflicts: AdvisorContext['timingConflicts'] = [];
  const seen = new Set<string>();
  const hiddenMedSet = new Set(hiddenMeds.map(m => m.toLowerCase()));
  const visibleMeds = medications.filter(m => !hiddenMedSet.has(m.toLowerCase()));

  function addConflict(item1: string, item2: string, slot: string, note: string): void {
    const key = [item1, item2].map(s => s.toLowerCase()).sort().join('|||');
    if (!seen.has(key)) {
      seen.add(key);
      conflicts.push({ item1, item2, slot, note });
    }
  }

  // ── 1. SUPPLEMENT_DATABASE separateFromMeds (same slot only) ──────────────
  for (const supp of supplements) {
    if (!supp.timing) continue;
    const dbEntry = SUPPLEMENT_DATABASE.find(
      db => db.name.toLowerCase() === supp.name.toLowerCase(),
    );
    if (!dbEntry) continue;
    for (const sep of dbEntry.separateFromMeds) {
      const matchingMed = visibleMeds.find(m => {
        const mNorm = m.toLowerCase();
        const drugNorm = sep.drug.toLowerCase();
        return mNorm.includes(drugNorm) || drugNorm.includes(mNorm.split(' ')[0]);
      });
      if (!matchingMed) continue;
      const medSlot = medTimes[matchingMed];
      if (medSlot === supp.timing) {
        const note = sep.hours > 0
          ? `${supp.name} and ${matchingMed}: ${sep.reason} — separate by ${sep.hours}h`
          : `${supp.name} and ${matchingMed}: ${sep.reason}`;
        addConflict(supp.name, matchingMed, supp.timing, note);
      }
    }
  }

  // ── 2. SUPPLEMENT_DATABASE avoidWith (supplement–supplement, same slot) ───
  for (const supp of supplements) {
    if (!supp.timing) continue;
    const dbEntry = SUPPLEMENT_DATABASE.find(
      db => db.name.toLowerCase() === supp.name.toLowerCase(),
    );
    if (!dbEntry || dbEntry.avoidWith.length === 0) continue;
    for (const avoidName of dbEntry.avoidWith) {
      const other = supplements.find(
        s => s.id !== supp.id &&
             s.timing === supp.timing &&
             s.name.toLowerCase().includes(avoidName.toLowerCase()),
      );
      if (other) {
        addConflict(supp.name, other.name, supp.timing,
          `${supp.name} and ${other.name} should not be taken at the same time — consider separating by 2+ hours`);
      }
    }
  }

  // ── 3. Hardcoded absorption rules (supplement–supplement, same slot) ──────
  const suppsBySlot = new Map<string, ProtocolItem[]>();
  for (const s of supplements) {
    if (!s.timing) continue;
    const arr = suppsBySlot.get(s.timing) ?? [];
    arr.push(s);
    suppsBySlot.set(s.timing, arr);
  }
  for (const [slot, items] of suppsBySlot) {
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const nameA = items[i].name.toLowerCase();
        const nameB = items[j].name.toLowerCase();
        for (const rule of ABSORPTION_CONFLICT_RULES) {
          if ((nameA.includes(rule.a) && nameB.includes(rule.b)) ||
              (nameB.includes(rule.a) && nameA.includes(rule.b))) {
            addConflict(items[i].name, items[j].name, slot, rule.note);
          }
        }
      }
    }
  }

  // ── 4. Supplement–medication absorption conflicts (same slot) ─────────────
  for (const rule of SUPP_MED_ABSORPTION_RULES) {
    const suppMatch = supplements.find(s => s.timing && s.name.toLowerCase().includes(rule.supp));
    if (!suppMatch?.timing) continue;
    const medMatch = visibleMeds.find(m => m.toLowerCase().includes(rule.med));
    if (!medMatch) continue;
    if (medTimes[medMatch] === suppMatch.timing) {
      addConflict(suppMatch.name, medMatch, suppMatch.timing, rule.note);
    }
  }

  // ── 5. Critical pharmacodynamic conflicts (any slot) ─────────────────────
  for (const rule of CRITICAL_DRUG_CONFLICTS) {
    const suppMatch = supplements.find(s => s.name.toLowerCase().includes(rule.supp));
    if (!suppMatch) continue;
    for (const pat of rule.medPatterns) {
      const medMatch = visibleMeds.find(m => m.toLowerCase().includes(pat));
      if (medMatch) {
        addConflict(suppMatch.name, medMatch, 'any', rule.note);
        break;
      }
    }
  }

  return conflicts;
}

// ── Main assembler ────────────────────────────────────────────────────────────

export async function assembleAdvisorContext(): Promise<AdvisorContext> {
  try {
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

    // ── Entry lists per biomarker (sorted DESC by date) ───────────────────
    // Build full history per biomarker so we can compute trend (latest vs. prior)
    const entryLists = new Map<string, StoredEntry[]>();
    if (storedEntries && Array.isArray(storedEntries)) {
      for (const entry of storedEntries) {
        const arr = entryLists.get(entry.biomarkerId) ?? [];
        arr.push(entry);
        entryLists.set(entry.biomarkerId, arr);
      }
      for (const arr of entryLists.values()) {
        arr.sort((a, b) => b.date.localeCompare(a.date));
      }
    }

    // ── Biomarker status + daysAgo + trend ────────────────────────────────
    const nowMs = Date.now();

    const biomarkerStatusList: AdvisorContext['biomarkers'] = [];
    for (const biomarker of BIOMARKERS) {
      const entries = entryLists.get(biomarker.id);
      if (!entries || entries.length === 0) continue;

      const latest = entries[0];
      const status = BIOMARKER_STATUS_LABELS[classifyStoredEntry(latest)] as BiomarkerStatus;
      const daysAgo = Math.floor((nowMs - new Date(latest.date).getTime()) / 86_400_000);

      // Directionality cannot be inferred safely without a reviewed marker rule.
      // Retain the data-point count, but withhold improving/declining labels.
      const trend: 'improving' | 'stable' | 'declining' | undefined = undefined;

      biomarkerStatusList.push({
        name: biomarker.name,
        status,
        daysAgo,
        dataPointCount: entries.length,
        ...(trend !== undefined ? { trend } : {}),
      });
    }

    // ── PhenoAge calculation ───────────────────────────────────────────────
    const latestEntryMap = new Map<string, StoredEntry>();
    for (const [biomarkerId, biomarkerEntries] of entryLists) {
      if (biomarkerEntries[0]) latestEntryMap.set(biomarkerId, biomarkerEntries[0]);
    }
    const phenoResult = getClinicalPhenoAgePresentation(age, latestEntryMap);
    const biologicalAge = phenoResult.valueYears;
    const phenoAgeInputCount = phenoResult.presentCount;

    // ── Supplement details (new schema + legacy fallback) ─────────────────
    // Raw personalDose string is NEVER placed in the output (pharmacist-liability, D-07/T-22-06).
    type DoseBucket = 'high' | 'standard' | 'low';
    interface SupplementDetail { name: string; timing?: string; doseBucket?: DoseBucket; }

    const supplementList: ProtocolItem[] = protocolState?.supplements ?? [];

    const supplementDetails: SupplementDetail[] = supplementList.length > 0
      ? supplementList.map((item: ProtocolItem): SupplementDetail => {
          const dbEntry = SUPPLEMENT_DATABASE.find(
            db => db.name.toLowerCase() === item.name.toLowerCase(),
          );
          let doseBucket: DoseBucket | undefined;
          if (!item.personalDose) {
            doseBucket = 'standard';
          } else if (dbEntry?.defaultDose) {
            const personal = parseFloat(item.personalDose);
            const standard = parseFloat(dbEntry.defaultDose);
            if (!isNaN(personal) && !isNaN(standard) && standard > 0) {
              const ratio = personal / standard;
              doseBucket = ratio >= 1.25 ? 'high' : ratio <= 0.75 ? 'low' : 'standard';
            }
          }
          return {
            name: item.name,
            ...(item.timing ? { timing: item.timing } : {}),
            ...(doseBucket !== undefined ? { doseBucket } : {}),
          };
        })
      : [
          ...(protocolState?.addedSupplements ?? []).map(name => ({ name })),
          ...(protocolState?.customSupplements ?? []).map(s => ({ name: s.name })),
        ];

    const supplements = Array.from(new Set(supplementDetails.map(s => s.name)));

    // ── Medications (names only, D-09) ────────────────────────────────────
    const medications = userProfile?.medications ?? [];

    // ── Adherence rate ─────────────────────────────────────────────────────
    // Uses today's taken array if takenDate === today. Falls back to "unknown".
    let adherenceRate = 'unknown';
    if (protocolState) {
      const todayStr = protocolDayKey();
      const hiddenMedSet = new Set((protocolState.hiddenMeds ?? []).map(m => m.toLowerCase()));
      const visibleSupps = supplementList.length;
      const visibleMeds = medications.filter(m => !hiddenMedSet.has(m.toLowerCase())).length;
      const totalVisible = visibleSupps + visibleMeds;
      if (totalVisible > 0 && protocolState.takenDate === todayStr) {
        const pct = Math.round((protocolState.taken.length / totalVisible) * 100);
        adherenceRate = `${pct}%`;
      }
    }

    // ── Timing conflicts ───────────────────────────────────────────────────
    const timingConflicts = buildTimingConflicts(
      supplementList,
      medications,
      protocolState?.medTimes ?? {},
      protocolState?.hiddenMeds ?? [],
    );

    // ── Health data (D-12) ────────────────────────────────────────────────
    const isDemoMode = healthData?.isDemoMode === true;
    const healthDataAvailable = !isDemoMode && healthData !== null;

    // ── Exercise frequency — unique workout DAYS in last 7 calendar days ──
    // Fix: count unique dates (workout days), not log entry count (D-08).
    let exerciseFrequency: string | undefined;
    if (exerciseLog && Array.isArray(exerciseLog) && exerciseLog.length > 0) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      const cutoffDateStr = cutoff.toISOString().slice(0, 10);
      const uniqueWorkoutDays = new Set(
        exerciseLog
          .filter(entry => entry.date >= cutoffDateStr)
          .map(entry => entry.date),
      );
      if (uniqueWorkoutDays.size > 0) {
        exerciseFrequency = `${uniqueWorkoutDays.size}x/week`;
      }
    }

    // ── Assemble context object ───────────────────────────────────────────
    const context: AdvisorContext = {
      ageBand,
      biologicalAge,
      phenoAgeInputCount,
      sex: userProfile?.sex ?? '',
      goal: userProfile?.goal ?? '',
      conditions: userProfile?.conditions ?? [],
      medications,
      supplements,
      supplementDetails,
      biomarkers: biomarkerStatusList,
      adherenceRate,
      timingConflicts,
      healthDataAvailable,
    };

    // Include HealthKit fields only when real data is available (D-12)
    if (healthDataAvailable && healthData !== null) {
      if (healthData.hrv != null) context.hrv = healthData.hrv;
      if (healthData.sleepScore != null) context.sleepScore = healthData.sleepScore;
      if (healthData.recovery != null) context.recovery = healthData.recovery;
      if (healthData.glucose != null) context.glucose = healthData.glucose;
    }

    if (exerciseFrequency !== undefined) {
      context.exerciseFrequency = exerciseFrequency;
    }

    return context;
  } catch {
    // Error resilience: never throw — return minimal valid context
    return {
      ageBand: '0–4',
      biologicalAge: null,
      phenoAgeInputCount: 0,
      sex: '',
      goal: '',
      conditions: [],
      medications: [],
      supplements: [],
      supplementDetails: [],
      biomarkers: [],
      adherenceRate: 'unknown',
      timingConflicts: [],
      healthDataAvailable: false,
    };
  }
}
