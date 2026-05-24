// RxNav NLM API service
// Fetches drug interaction data from NLM's RxNav API (rxnav.nlm.nih.gov)
// Results are cached in AsyncStorage with a 30-day TTL.

import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://rxnav.nlm.nih.gov/REST';
const CACHE_KEY = '@vitalspan_rxnav_cache';
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface RxNavInteraction {
  minConceptItem: {
    rxcui: string;
    name: string;
  };
  interactionConcept: {
    interactionItem: {
      rxcui: string;
      name: string;
    };
    description: string;
    severity: string;
  }[];
}

export interface CachedResult<T> {
  data: T;
  fetchedAt: number;
}

type RxNavCache = Record<string, CachedResult<string | null>>;

// ── Cache helpers ────────────────────────────────────────────────────────────

async function readCache(): Promise<RxNavCache> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function writeCache(cache: RxNavCache): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch { /* storage full, silent */ }
}

function isFresh(entry: CachedResult<unknown>): boolean {
  return Date.now() - entry.fetchedAt < CACHE_TTL_MS;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetch the primary RxCUI for a drug name.
 * Returns null if not found or network error.
 * Caches result keyed by lowercase drug name for 30 days.
 */
export async function fetchRxCUI(drugName: string): Promise<string | null> {
  const key = `rxcui:${drugName.toLowerCase().trim()}`;
  const cache = await readCache();

  if (cache[key] && isFresh(cache[key])) {
    return cache[key].data as string | null;
  }

  try {
    const url = `${BASE_URL}/rxcui.json?name=${encodeURIComponent(drugName)}&search=1`;
    const resp = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const json = await resp.json();
    const rxcui = json?.idGroup?.rxnormId?.[0] ?? null;

    cache[key] = { data: rxcui, fetchedAt: Date.now() };
    await writeCache(cache);
    return rxcui;
  } catch {
    return null;
  }
}

export interface DrugInteractionResult {
  drugA: string;
  drugB: string;
  description: string;
  severity: 'high' | 'moderate' | 'low' | 'unknown';
}

/**
 * Fetch drug-drug interactions for a list of RxCUIs.
 * Returns an array of interaction results.
 * Caches result keyed by sorted RxCUI list for 30 days.
 */
export async function fetchInteractions(
  rxcuis: string[],
): Promise<DrugInteractionResult[]> {
  if (rxcuis.length < 2) return [];

  const sorted = [...rxcuis].sort();
  const key = `interactions:${sorted.join('-')}`;
  const cache = await readCache();

  if (cache[key] && isFresh(cache[key])) {
    const raw = cache[key].data as string;
    return raw ? JSON.parse(raw) : [];
  }

  try {
    const rxcuisParam = sorted.join('+');
    const url = `${BASE_URL}/interaction/list.json?rxcuis=${rxcuisParam}`;
    const resp = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const json = await resp.json();
    const pairInteractions = json?.fullInteractionTypeGroup?.[0]?.fullInteractionType ?? [];

    const results: DrugInteractionResult[] = [];
    for (const pair of pairInteractions) {
      const drugA = pair.minConceptItem?.name ?? 'Unknown';
      const interactions = pair.interactionPair ?? [];
      for (const inter of interactions) {
        const drugB = inter.interactionConcept?.[1]?.minConceptItem?.name ?? 'Unknown';
        const description = inter.description ?? '';
        const severityRaw: string = inter.severity?.toLowerCase() ?? '';
        let severity: DrugInteractionResult['severity'] = 'unknown';
        if (severityRaw.includes('high') || severityRaw.includes('major')) severity = 'high';
        else if (severityRaw.includes('moderate')) severity = 'moderate';
        else if (severityRaw.includes('low') || severityRaw.includes('minor')) severity = 'low';
        results.push({ drugA, drugB, description, severity });
      }
    }

    cache[key] = { data: JSON.stringify(results), fetchedAt: Date.now() };
    await writeCache(cache);
    return results;
  } catch {
    return [];
  }
}

/**
 * High-level convenience: given a list of drug names, resolve RxCUIs and
 * fetch all pairwise interactions. Falls back to empty array on any failure.
 */
export async function checkDrugInteractions(
  drugNames: string[],
): Promise<DrugInteractionResult[]> {
  if (drugNames.length < 2) return [];

  const rxcuiResults = await Promise.all(drugNames.map(name => fetchRxCUI(name)));
  const validPairs = rxcuiResults.flatMap((rxcui, i) =>
    rxcui ? [{ name: drugNames[i], rxcui }] : [],
  );

  if (validPairs.length < 2) return [];
  const rxcuis = validPairs.map(p => p.rxcui);
  return fetchInteractions(rxcuis);
}

/**
 * Clear expired cache entries to prevent unbounded growth.
 * Safe to call on app startup.
 */
export async function pruneExpiredCache(): Promise<void> {
  const cache = await readCache();
  let changed = false;
  for (const key of Object.keys(cache)) {
    if (!isFresh(cache[key])) {
      delete cache[key];
      changed = true;
    }
  }
  if (changed) await writeCache(cache);
}
