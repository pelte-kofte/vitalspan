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

interface ConceptProperty {
  rxcui: string;
  name: string;
  synonym: string;
  tty: string;
  language: string;
  suppress: string;
  umlscui: string;
}

interface ConceptGroup {
  tty: string;
  conceptProperties?: ConceptProperty[];
}

interface RxNormResponse {
  drugGroup: {
    name: string;
    conceptGroup?: ConceptGroup[];
  };
}

interface SuggestionsResponse {
  suggestionGroup: {
    name: string;
    suggestionList?: { suggestion: string[] };
  };
}

async function searchRxNorm(query: string): Promise<Medication[]> {
  try {
    const res = await fetch(
      `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(query.trim())}`
    );
    if (!res.ok) return [];
    const data = await res.json() as RxNormResponse;
    const groups = data.drugGroup?.conceptGroup ?? [];

    const seen = new Set<string>();
    const meds: Medication[] = [];
    for (const group of groups) {
      if (group.tty !== 'IN' && group.tty !== 'BN') continue;
      for (const cp of group.conceptProperties ?? []) {
        const key = cp.name.toLowerCase();
        if (!cp.name || seen.has(key)) continue;
        seen.add(key);
        meds.push({ brandName: '', genericName: cp.name, activeIngredient: cp.name });
        if (meds.length >= 8) return meds;
      }
    }
    return meds;
  } catch {
    return [];
  }
}

async function fetchSpellingSuggestions(query: string): Promise<Medication[]> {
  try {
    const res = await fetch(
      `https://rxnav.nlm.nih.gov/REST/spellingsuggestions.json?name=${encodeURIComponent(query.trim())}`
    );
    if (!res.ok) return [];
    const data = await res.json() as SuggestionsResponse;
    const suggestions = data.suggestionGroup?.suggestionList?.suggestion ?? [];
    return suggestions.slice(0, 5).map(s => ({
      brandName: '',
      genericName: s,
      activeIngredient: s,
    }));
  } catch {
    return [];
  }
}

export default function MedicationSearch({ onSelect, placeholder = 'Search medications...' }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Medication[]>([]);
  const [fromSuggestions, setFromSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const handleChange = useCallback((text: string) => {
    setQuery(text);
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!text.trim() || text.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    timerRef.current = setTimeout(async () => {
      const meds = await searchRxNorm(text);
      if (meds.length > 0) {
        setResults(meds);
        setFromSuggestions(false);
      } else {
        const suggestions = await fetchSpellingSuggestions(text);
        setResults(suggestions);
        setFromSuggestions(suggestions.length > 0);
      }
      setShowDropdown(true);
      setLoading(false);
    }, 400);
  }, []);

  function handleSelect(med: Medication) {
    onSelect(med);
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    setFromSuggestions(false);
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
          {fromSuggestions && results.length > 0 && (
            <View style={s.suggestHdr}>
              <Text style={s.suggestHdrTxt}>Did you mean?</Text>
            </View>
          )}
          {results.length === 0 && (
            <View style={s.emptyRow}>
              <Text style={s.emptyTxt}>No results found</Text>
            </View>
          )}
          {results.map((med, i) => (
            <TouchableOpacity
              key={`${med.genericName}-${i}`}
              style={[s.resultRow, s.resultBorder]}
              onPress={() => handleSelect(med)}
            >
              <Text style={s.nameTxt} numberOfLines={1}>{med.genericName}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={s.manualRow}
            onPress={() => handleSelect({
              brandName: '',
              genericName: query.trim(),
              activeIngredient: query.trim(),
            })}
          >
            <Text style={s.manualTxt}>+ Add "{query.trim()}" manually</Text>
          </TouchableOpacity>
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
  suggestHdr: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  suggestHdrTxt: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultRow: { padding: Spacing.md },
  resultBorder: { borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  nameTxt: { fontSize: Typography.sizes.base, fontWeight: '500', color: Colors.textPrimary },
  emptyRow: { padding: Spacing.md, borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  emptyTxt: { fontSize: Typography.sizes.base, color: Colors.textMuted },
  manualRow: {
    padding: Spacing.md,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    backgroundColor: Colors.bgSecondary,
  },
  manualTxt: { fontSize: Typography.sizes.sm, color: Colors.primary, fontWeight: '500' },
});
