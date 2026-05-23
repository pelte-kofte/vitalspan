import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
} from 'react-native';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { searchMedications, MedicationResult } from '../data/medications';

export interface Medication {
  brandName: string;
  genericName: string;
  activeIngredient: string;
  drugClass?: string;
}

interface Props {
  onSelect: (med: Medication) => void;
  placeholder?: string;
}

export default function MedicationSearch({ onSelect, placeholder = 'Search medications...' }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MedicationResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleChange = useCallback((text: string) => {
    setQuery(text);
    if (!text.trim() || text.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    const found = searchMedications(text, 8);
    setResults(found);
    setShowDropdown(true);
  }, []);

  function handleSelect(result: MedicationResult) {
    onSelect({
      brandName: result.brandName,
      genericName: result.genericName,
      activeIngredient: result.genericName,
      drugClass: result.drugClass,
    });
    setQuery('');
    setResults([]);
    setShowDropdown(false);
  }

  function handleManual() {
    const trimmed = query.trim();
    if (!trimmed) return;
    onSelect({ brandName: '', genericName: trimmed, activeIngredient: trimmed });
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
      </View>

      {showDropdown && (
        <View style={s.dropdown}>
          {results.length === 0 && (
            <View style={s.emptyRow}>
              <Text style={s.emptyTxt}>No results found</Text>
            </View>
          )}
          {results.map((r, i) => (
            <TouchableOpacity
              key={`${r.genericName}-${i}`}
              style={[s.resultRow, i < results.length - 1 && s.resultBorder]}
              onPress={() => handleSelect(r)}
            >
              <Text style={s.nameTxt} numberOfLines={1}>
                {r.brandName ? `${r.brandName} (${r.genericName})` : r.genericName}
              </Text>
              <Text style={s.classTxt} numberOfLines={1}>{r.drugClass}</Text>
            </TouchableOpacity>
          ))}
          {query.trim().length > 0 && (
            <TouchableOpacity style={s.manualRow} onPress={handleManual}>
              <Text style={s.manualTxt}>+ Add "{query.trim()}" manually</Text>
            </TouchableOpacity>
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
  nameTxt: { fontSize: Typography.sizes.base, fontWeight: '500', color: Colors.textPrimary },
  classTxt: { fontSize: Typography.sizes.xs, color: Colors.textMuted, marginTop: 2 },
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
