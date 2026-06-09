import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, Typography } from '../../theme';

export interface SheetFormField {
  label: string; placeholder: string; secure?: boolean;
  value: string; onChange: (val: string) => void;
}
export interface SheetFormProps {
  fields: SheetFormField[]; onSubmit: () => void; submitLabel: string;
  error: string | null; loading: boolean; footerSlot?: React.ReactNode;
}

export default function SheetForm({ fields, onSubmit, submitLabel, error, loading, footerSlot }: SheetFormProps) {
  return (
    <View>
      {fields.map((f) => {
        const isEmail = f.placeholder.toLowerCase().includes('email');
        return (
          <TextInput
            key={f.placeholder} placeholder={f.placeholder} placeholderTextColor={Colors.textMuted}
            value={f.value} onChangeText={f.onChange} secureTextEntry={f.secure ?? false}
            keyboardType={isEmail ? 'email-address' : 'default'}
            autoCapitalize={isEmail ? 'none' : 'sentences'}
            autoCorrect={false} style={s.input}
          />
        );
      })}
      {error !== null && <Text style={s.errorTxt}>{error}</Text>}
      {footerSlot}
      <TouchableOpacity style={s.btnSubmit} onPress={onSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color={Colors.surface} /> : <Text style={s.btnSubmitTxt}>{submitLabel}</Text>}
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md,
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    color: Colors.textPrimary, fontSize: Typography.sizes.body, marginBottom: Spacing.md,
  },
  errorTxt: { fontSize: Typography.sizes.bodySmall, color: Colors.semantic.danger, marginBottom: Spacing.md },
  btnSubmit: { backgroundColor: Colors.brand, borderRadius: Radius.full, paddingVertical: 16, alignItems: 'center', marginTop: Spacing.sm },
  btnSubmitTxt: { color: Colors.surface, fontSize: Typography.sizes.body, fontWeight: '600' },
});
