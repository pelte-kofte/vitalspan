/**
 * articleService.ts — PubMed fetch + Supabase cache + out-of-range ranking.
 * Pure functions only. No React imports. Follows Phase 8 service pattern.
 */
import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BIOMARKERS } from '../data/biomarkers';

// Types -----------------------------------------------------------------------

export interface Article {
  pmid: string;
  title: string;
  journal: string;
  pub_date: string;
  abstract: string | null;
  biomarker_tags: string[];
  fetched_at: string;
}

interface StoredEntry { biomarkerId: string; value: number; date: string; unit: string }

interface NCBIESearchResponse { esearchresult: { idlist: string[] } }
interface NCBISummaryArticle { uid: string; title: string; fulljournalname: string; pubdate: string }
interface NCBISummaryResponse { result: Record<string, NCBISummaryArticle> }

// Constants -------------------------------------------------------------------

const ARTICLES_KEY = '@vitalspan_articles_last_fetched';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const ESEARCH_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
const ESUMMARY_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi';
const EFETCH_BASE  = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi';

/** 12 biomarker queries + 2 global fallbacks = 14 keys */
export const BIOMARKER_QUERIES: Record<string, string> = {
  apob:          'ApoB lipoprotein longevity cardiovascular aging',
  hscrp:         'CRP inflammation aging longevity',
  hba1c:         'HbA1c glycation biological aging longevity',
  igf1:          'IGF-1 longevity cancer mTOR aging',
  vitd:          'vitamin D longevity aging immune function',
  testosterone:  'testosterone aging muscle longevity sarcopenia',
  homocysteine:  'homocysteine cardiovascular aging methylation',
  fastingglucose:'fasting glucose insulin sensitivity longevity',
  ferritin:      'ferritin iron oxidative stress aging',
  dheas:         'DHEA-S aging adrenal longevity',
  omega3index:   'omega-3 EPA DHA longevity cardiovascular',
  uricacid:      'uric acid aging gout metabolic longevity',
  general:       'longevity biological aging healthspan',
  phenoage:      'PhenoAge epigenetic clock biological age',
};

// Internal helpers ------------------------------------------------------------

async function searchPubMed(query: string, retmax = 5): Promise<string[]> {
  try {
    const url = `${ESEARCH_BASE}?db=pubmed&term=${encodeURIComponent(query)}&retmax=${retmax}&retmode=json`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = (await res.json()) as NCBIESearchResponse;
    return json?.esearchresult?.idlist ?? [];
  } catch {
    return [];
  }
}

async function fetchAbstract(pmid: string): Promise<string | null> {
  const url = `${EFETCH_BASE}?db=pubmed&id=${pmid}&rettype=abstract&retmode=xml`;
  const xml = await (await fetch(url)).text();
  const match = xml.match(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/);
  return match ? match[1].replace(/<[^>]+>/g, '').trim() : null;
}

async function fetchAllBiomarkerArticles(): Promise<Article[]> {
  // Phase 1: eSearch — sequential (rate limit protection per Pitfall 5)
  const pmidToKeys = new Map<string, string[]>();
  for (const [key, query] of Object.entries(BIOMARKER_QUERIES)) {
    const pmids = await searchPubMed(query, 5);
    for (const pmid of pmids) {
      const keys = pmidToKeys.get(pmid) ?? [];
      if (!keys.includes(key)) keys.push(key);
      pmidToKeys.set(pmid, keys);
    }
  }
  const allPmids = [...pmidToKeys.keys()];
  if (allPmids.length === 0) return [];

  // Phase 2: one eSummary batch for all unique PMIDs
  let summaryJson: NCBISummaryResponse = { result: {} };
  try {
    const summaryUrl = `${ESUMMARY_BASE}?db=pubmed&id=${allPmids.join(',')}&retmode=json`;
    const summaryRes = await fetch(summaryUrl);
    if (summaryRes.ok) summaryJson = (await summaryRes.json()) as NCBISummaryResponse;
  } catch {
    // eSummary failed — return empty rather than crash
    return [];
  }

  // Phase 3: eFetch abstracts — delay AFTER each call (3 req/sec ceiling)
  const articles: Article[] = [];
  for (const pmid of allPmids) {
    const meta = summaryJson.result[pmid];
    if (!meta) continue;
    const abstract = await fetchAbstract(pmid);
    await new Promise<void>((r) => setTimeout(r, 350)); // delay after fetch, not before
    articles.push({
      pmid,
      title: meta.title,
      journal: meta.fulljournalname,
      pub_date: meta.pubdate,
      abstract,
      biomarker_tags: pmidToKeys.get(pmid) ?? [],
      fetched_at: new Date().toISOString(),
    });
  }
  return articles;
}

function rankByOutOfRange(articles: Article[], entries: StoredEntry[]): Article[] {
  const latestByBiomarker = new Map<string, StoredEntry>();
  for (const e of entries) {
    const prev = latestByBiomarker.get(e.biomarkerId);
    if (!prev || e.date > prev.date) latestByBiomarker.set(e.biomarkerId, e);
  }
  const outOfRange = new Set<string>();
  for (const bm of BIOMARKERS) {
    const entry = latestByBiomarker.get(bm.id);
    if (entry && (entry.value < bm.optMin || entry.value > bm.optMax)) outOfRange.add(bm.id);
  }
  return [...articles].sort((a, b) => {
    const aScore = a.biomarker_tags.filter((t) => outOfRange.has(t)).length;
    const bScore = b.biomarker_tags.filter((t) => outOfRange.has(t)).length;
    return bScore - aScore;
  });
}

async function upsertAndReselect(fresh: Article[], entries: StoredEntry[]): Promise<Article[] | null> {
  if (fresh.length > 0) {
    await supabase.from('articles').upsert(fresh, { onConflict: 'pmid' });
    await AsyncStorage.setItem(ARTICLES_KEY, new Date().toISOString());
  }
  const { data } = await supabase.from('articles').select('*');
  return data ? rankByOutOfRange(data as Article[], entries) : null;
}

// Exported functions ----------------------------------------------------------

/** Load all cached articles from Supabase, ranked by out-of-range biomarkers. */
export async function loadCachedArticles(entries: StoredEntry[]): Promise<Article[]> {
  try {
    const { data, error } = await supabase.from('articles').select('*');
    if (error || !data) return [];
    return rankByOutOfRange(data as Article[], entries);
  } catch (e) {
    console.error('[articleService] loadCachedArticles error', e);
    return [];
  }
}

/** Refresh from NCBI if cache is >24 h old. Returns null if still fresh or on error. */
export async function refreshArticlesIfStale(entries: StoredEntry[]): Promise<Article[] | null> {
  try {
    const ts = await AsyncStorage.getItem(ARTICLES_KEY);
    if (ts && Date.now() - new Date(ts).getTime() < CACHE_TTL_MS) return null;
    return await upsertAndReselect(await fetchAllBiomarkerArticles(), entries);
  } catch (e) {
    console.error('[articleService] refreshArticlesIfStale error', e);
    return null;
  }
}

/** Force a full NCBI refresh regardless of cache age (pull-to-refresh). */
export async function forceRefreshArticles(entries: StoredEntry[]): Promise<Article[] | null> {
  try {
    return await upsertAndReselect(await fetchAllBiomarkerArticles(), entries);
  } catch (e) {
    console.error('[articleService] forceRefreshArticles error', e);
    return null;
  }
}
