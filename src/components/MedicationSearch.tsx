import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, StyleSheet,
} from 'react-native';
import { Colors, Spacing, Radius, Typography } from '../theme';

export interface Medication {
  brandName: string;
  genericName: string;
  activeIngredient: string;
}

interface Props {
  onSelect: (med: Medication) => void;
  placeholder?: string;
}

interface FDAResult {
  openfda?: {
    brand_name?: string[];
    generic_name?: string[];
    substance_name?: string[];
  };
}

interface FDAResponse {
  results?: FDAResult[];
}

const BASE_URL = 'https://api.fda.gov/drug/label.json';

async function fetchEndpoint(url: string): Promise<FDAResult[]> {
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json() as FDAResponse;
    return data.results ?? [];
  } catch {
    return [];
  }
}

async function searchMedications(query: string): Promise<Medication[]> {
  const q = encodeURIComponent(query.trim());
  const [brandResults, genericResults] = await Promise.all([
    fetchEndpoint(`${BASE_URL}?search=openfda.brand_name:${q}&limit=10`),
    fetchEndpoint(`${BASE_URL}?search=openfda.generic_name:${q}&limit=10`),
  ]);

  const seen = new Set<string>();
  const meds: Medication[] = [];

  for (const result of [...brandResults, ...genericResults]) {
    const brandName = result.openfda?.brand_name?.[0] ?? '';
    const genericName = result.openfda?.generic_name?.[0] ?? '';
    const activeIngredient = result.openfda?.substance_name?.[0] ?? genericName;
    const key = (brandName || genericName).toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    meds.push({ brandName, genericName, activeIngredient });
  }

  return meds;
}

export default function MedicationSearch({ onSelect, placeholder = 'Search medications...' }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const handleChange = useCallback((text: string) => {
    setQuery(text);
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!text.trim()) {
      setResults([]);
      setShowDropdown(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    timerRef.current = setTimeout(async () => {
      const meds = await searchMedications(text);
      setResults(meds);
      setShowDropdown(true);
      setLoading(false);
    }, 400);
  }, []);

  function handleSelect(med: Medication) {
    onSelect(med);
    setQuery('');
    setResults([]);
    setShowDropdown(false);
  }

  return (
    <View style={s.wrapper}>
      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          value={query}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {loading && (
          <ActivityIndicator size="small" color={Colors.primary} style={s.spinner} />
        )}
      </View>

      {showDropdown && (
        <View style={s.dropdown}>
          {results.length === 0 ? (
            <View style={s.emptyRow}>
              <Text style={s.emptyTxt}>No medications found</Text>
            </View>
          ) : (
            results.map((med, i) => (
              <TouchableOpacity
                key={`${med.brandName}-${med.genericName}-${i}`}
                style={[s.resultRow, i < results.length - 1 && s.resultBorder]}
                onPress={() => handleSelect(med)}
              >
                <Text style={s.brandName} numberOfLines={1}>
                  {med.brandName || med.genericName}
                </Text>
                {med.genericName && med.brandName !== med.genericName && (
                  <Text style={s.genericTxt} numberOfLines={1}>
                    {med.genericName}
                  </Text>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: { zIndex: 100 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    padding: Spacing.md,
    fontSize: Typography.sizes.base,
    color: Colors.textPrimary,
  },
  spinner: { marginRight: Spacing.md },
  dropdown: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    marginTop: Spacing.xs,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  resultRow: { padding: Spacing.md },
  resultBorder: { borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  brandName: { fontSize: Typography.sizes.base, fontWeight: '500', color: Colors.textPrimary },
  genericTxt: { fontSize: Typography.sizes.xs, color: Colors.textMuted, marginTop: 2 },
  emptyRow: { padding: Spacing.md },
  emptyTxt: { fontSize: Typography.sizes.base, color: Colors.textMuted },
});
