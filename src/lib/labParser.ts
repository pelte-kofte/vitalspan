import * as FileSystem from 'expo-file-system';
import type { SourceLabRange } from '../types/biomarkerKnowledge';

export interface ParsedBiomarker {
  biomarkerId: string;
  name: string;
  value: number;
  unit: string;
  confidence: 'high' | 'medium' | 'low';
  sourceLabRange?: SourceLabRange;
}

interface Pattern {
  id: string;
  name: string;
  aliases: string[];
  unit: string;
  min: number;
  max: number;
}

// Aliases ordered by specificity — first match = high confidence, rest = medium
const PATTERNS: Pattern[] = [
  { id: 'apob',          name: 'ApoB',            unit: 'mg/dL',   min: 20,   max: 250,  aliases: ['ApoB', 'Apolipoprotein B', 'Apo B', 'Apo-B'] },
  { id: 'hscrp',         name: 'hsCRP',           unit: 'mg/L',    min: 0,    max: 50,   aliases: ['hsCRP', 'hs-CRP', 'High Sensitivity CRP', 'C-Reactive Protein', 'CRP', 'Yüksek Duyarlıklı CRP'] },
  { id: 'hba1c',         name: 'HbA1c',           unit: '%',       min: 3,    max: 15,   aliases: ['HbA1c', 'Hemoglobin A1c', 'HgbA1c', 'A1C', 'Glikozillenmiş Hemoglobin', 'Glike Hemoglobin'] },
  { id: 'igf1',          name: 'IGF-1',           unit: 'ng/mL',   min: 50,   max: 500,  aliases: ['IGF-1', 'IGF1', 'Insulin-like Growth Factor 1', 'Somatomedin C'] },
  { id: 'vitd',          name: 'Vitamin D',       unit: 'ng/mL',   min: 5,    max: 200,  aliases: ['25-OH Vitamin D', '25(OH)D', '25-Hydroxyvitamin D', 'Vitamin D3', 'Vitamin D', 'D Vitamini', 'Kolekalsiferol'] },
  { id: 'testosterone',  name: 'Testosterone',    unit: 'ng/dL',   min: 50,   max: 2000, aliases: ['Total Testosterone', 'Testosterone', 'Testosteron', 'Total Testosteron'] },
  { id: 'homocysteine',  name: 'Homocysteine',    unit: 'μmol/L',  min: 2,    max: 100,  aliases: ['Homocysteine', 'Homosistein', 'Homocystein'] },
  { id: 'fastingglucose',name: 'Fasting Glucose', unit: 'mg/dL',   min: 50,   max: 500,  aliases: ['Fasting Glucose', 'Glucose, Fasting', 'Açlık Glukozu', 'Açlık Kan Şekeri', 'Glukoz'] },
  { id: 'ferritin',      name: 'Ferritin',        unit: 'ng/mL',   min: 2,    max: 2000, aliases: ['Ferritin', 'Ferritin Serum', 'Serum Ferritin'] },
  { id: 'dheas',         name: 'DHEA-S',          unit: 'μg/dL',   min: 20,   max: 1000, aliases: ['DHEA-S', 'DHEAS', 'Dehydroepiandrosterone Sulfate', 'DHEA Sülfat'] },
  { id: 'omega3index',   name: 'Omega-3 Index',   unit: '%',       min: 1,    max: 20,   aliases: ['Omega-3 Index', 'Omega 3 Index', 'EPA+DHA'] },
  { id: 'uricacid',      name: 'Uric Acid',       unit: 'mg/dL',   min: 1,    max: 20,   aliases: ['Uric Acid', 'Urate', 'Ürik Asit', 'Ürik Asit Serum'] },
  // Common additional lab panels
  { id: 'ldl',           name: 'LDL Cholesterol', unit: 'mg/dL',   min: 20,   max: 400,  aliases: ['LDL Cholesterol', 'LDL-C', 'LDL', 'LDL Kolesterol'] },
  { id: 'hdl',           name: 'HDL Cholesterol', unit: 'mg/dL',   min: 10,   max: 200,  aliases: ['HDL Cholesterol', 'HDL-C', 'HDL', 'HDL Kolesterol'] },
  { id: 'triglycerides', name: 'Triglycerides',   unit: 'mg/dL',   min: 20,   max: 2000, aliases: ['Triglycerides', 'Triglyceride', 'Trigliserit', 'TG'] },
  { id: 'tsh',           name: 'TSH',             unit: 'mIU/L',   min: 0.01, max: 30,   aliases: ['TSH', 'Thyroid Stimulating Hormone', 'Tiroid Uyarıcı Hormon', 'Tirotropin'] },
  { id: 'freeT4',        name: 'Free T4',         unit: 'ng/dL',   min: 0.3,  max: 10,   aliases: ['Free T4', 'FT4', 'Serbest T4', 'Free Thyroxine', 'Serbest Tiroksin'] },
  { id: 'cortisol',      name: 'Cortisol',        unit: 'μg/dL',   min: 2,    max: 100,  aliases: ['Cortisol', 'Kortizol', 'Serum Cortisol', 'Kortizol Serum'] },
  { id: 'albumin',       name: 'Albumin',         unit: 'g/dL',    min: 1,    max: 10,   aliases: ['Albumin', 'Serum Albumin', 'Albumin Serum'] },
  { id: 'creatinine',    name: 'Creatinine',      unit: 'mg/dL',   min: 0.3,  max: 20,   aliases: ['Creatinine', 'Kreatinin', 'Serum Creatinine', 'Kreatinin Serum'] },
];

function extractTextFromPDF(binary: string): string {
  // Extract text inside PDF parenthesis strings: (visible text here)
  const parenText = (binary.match(/\(([^)]{1,300})\)/g) ?? [])
    .map(m => m.slice(1, -1))
    .join(' ');

  // Also include readable ASCII runs (3+ chars)
  const asciiRuns = binary.replace(/[^\x20-\x7E\n\r\t]/g, ' ');

  return asciiRuns + ' ' + parenText;
}

function matchBiomarkers(text: string): ParsedBiomarker[] {
  const results: ParsedBiomarker[] = [];
  const seen = new Set<string>();

  for (const p of PATTERNS) {
    if (seen.has(p.id)) continue;

    for (let i = 0; i < p.aliases.length; i++) {
      const escaped = p.aliases[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Allow colon, dash, whitespace between label and value; support decimal comma
      const re = new RegExp(`${escaped}\\s*[:\\-]?\\s*(\\d{1,4}(?:[.,]\\d{1,3})?)`, 'i');
      const m = text.match(re);
      if (!m) continue;

      const value = parseFloat(m[1].replace(',', '.'));
      if (!isNaN(value) && value >= p.min && value <= p.max) {
        const matchIndex = m.index ?? 0;
        const afterValue = text.slice(matchIndex + m[0].length, matchIndex + m[0].length + 160);
        const rangeMatch = afterValue.match(
          /(?:reference|ref\.?|range|interval|normal|referans)?\s*[:(]?\s*(\d{1,5}(?:[.,]\d{1,3})?)\s*[-–]\s*(\d{1,5}(?:[.,]\d{1,3})?)/i,
        );
        const lowerBound = rangeMatch ? parseFloat(rangeMatch[1].replace(',', '.')) : undefined;
        const upperBound = rangeMatch ? parseFloat(rangeMatch[2].replace(',', '.')) : undefined;
        const sourceLabRange =
          lowerBound !== undefined && upperBound !== undefined && lowerBound <= upperBound
            ? {
                lowerBound,
                upperBound,
                unit: p.unit,
                reportedText: `${rangeMatch![1]}–${rangeMatch![2]}`,
              }
            : undefined;
        results.push({
          biomarkerId: p.id,
          name: p.name,
          value,
          unit: p.unit,
          confidence: i === 0 ? 'high' : 'medium',
          sourceLabRange,
        });
        seen.add(p.id);
        break;
      }
    }
  }

  return results;
}

export async function parseLabPDF(fileUri: string): Promise<ParsedBiomarker[]> {
  const base64 = await FileSystem.readAsStringAsync(fileUri, { encoding: 'base64' });
  const binary = atob(base64);
  const text = extractTextFromPDF(binary);
  if (!text.trim()) throw new Error('Could not extract text from this PDF');
  return matchBiomarkers(text);
}
