import React from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { ExerciseLogEntry } from '../data/exercises';

function formatLogDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export interface EditLogSheetProps {
  editingLog: ExerciseLogEntry | null;
  editSets: string;
  editRepsPerSet: string;
  editWeightKg: string;
  onChangeSets: (v: string) => void;
  onChangeReps: (v: string) => void;
  onChangeWeight: (v: string) => void;
  onSave: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function EditLogSheet({
  editingLog,
  editSets,
  editRepsPerSet,
  editWeightKg,
  onChangeSets,
  onChangeReps,
  onChangeWeight,
  onSave,
  onDelete,
  onClose,
}: EditLogSheetProps) {
  return (
    <Modal
      visible={editingLog !== null}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose} />
      <KeyboardAvoidingView
        style={s.kavContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <View style={s.sheet}>
        <View style={s.sheetHandle} />
        <Text style={s.sheetTitle}>Edit Log</Text>
        {editingLog ? (
          <Text style={s.sheetSubtitle}>
            {editingLog.exerciseName} · {formatLogDate(editingLog.date)}
          </Text>
        ) : null}

        <View style={s.logFields}>
          <View style={s.fieldRow}>
            <Text style={s.fieldLabel}>Sets</Text>
            <TextInput
              style={s.fieldInput}
              value={editSets}
              onChangeText={onChangeSets}
              keyboardType="numeric"
              selectTextOnFocus
            />
          </View>
          <View style={[s.fieldRow, s.fieldRowBorder]}>
            <Text style={s.fieldLabel}>Reps / set</Text>
            <TextInput
              style={s.fieldInput}
              value={editRepsPerSet}
              onChangeText={onChangeReps}
              keyboardType="decimal-pad"
              selectTextOnFocus
            />
          </View>
          <View style={[s.fieldRow, s.fieldRowBorder]}>
            <Text style={s.fieldLabel}>Weight (kg)</Text>
            <TextInput
              style={s.fieldInput}
              value={editWeightKg}
              onChangeText={onChangeWeight}
              keyboardType="decimal-pad"
              placeholder="optional"
              placeholderTextColor={Colors.onSurfaceMuted}
            />
          </View>
        </View>

        <TouchableOpacity style={s.saveBtn} onPress={onSave}>
          <Text style={s.saveBtnTxt}>Save Changes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.deleteBtn} onPress={onDelete}>
          <Text style={s.deleteBtnTxt}>Delete Entry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
          <Text style={s.cancelBtnTxt}>Cancel</Text>
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  kavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    padding: Spacing.base,
    paddingBottom: 36,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderLight,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  sheetTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.onSurfaceMuted,
    marginBottom: Spacing.base,
  },
  logFields: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    marginBottom: Spacing.base,
    overflow: 'hidden',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  fieldRowBorder: { borderTopWidth: 0.5, borderTopColor: Colors.borderLight },
  fieldLabel: { fontSize: Typography.sizes.base, color: Colors.textSecondary },
  fieldInput: {
    fontSize: Typography.sizes.base,
    fontWeight: '600',
    color: Colors.onSurface,
    textAlign: 'right',
    minWidth: 64,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: 15,
    alignItems: 'center',
    marginBottom: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnTxt: {
    fontSize: Typography.sizes.base,
    fontWeight: '700',
    color: Colors.primaryBg,
  },
  deleteBtn: {
    backgroundColor: Colors.status.criticalBg,
    borderWidth: 1,
    borderColor: Colors.status.criticalBorder,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  deleteBtnTxt: {
    color: Colors.status.criticalText,
    fontWeight: '600',
    fontSize: Typography.sizes.base,
  },
  cancelBtn: { padding: Spacing.sm, alignItems: 'center' },
  cancelBtnTxt: { fontSize: Typography.sizes.base, color: Colors.onSurfaceMuted },
});
