import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator, Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Radius, Typography } from '../theme';
import { SearchIcon, SuccessCheckIcon, ClipboardIcon, CameraIcon } from '../components/DesignSystemIcons';
import { parseLabPDF, ParsedBiomarker } from '../lib/labParser';
import { createStoredBiomarkerEntry, type StoredEntry } from '../types/biomarkerEntry';
import { formatSourceLabRange } from '../lib/biomarkerInterpretation';

type Phase = 'idle' | 'analyzing' | 'results' | 'noResults' | 'noMatch' | 'success';

interface ResultItem extends ParsedBiomarker { selected: boolean }

export default function LabUploadScreen() {
  const nav = useNavigation();
  const [phase, setPhase] = useState<Phase>('idle');
  const [fileName, setFileName] = useState('');
  const [items, setItems] = useState<ResultItem[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [savedNames, setSavedNames] = useState<string[]>([]);

  const analyze = useCallback(async (uri: string, name: string) => {
    setFileName(name);
    setPhase('analyzing');
    try {
      const parsed = await parseLabPDF(uri);
      if (parsed.length === 0) {
        setPhase('noMatch');
      } else {
        setItems(parsed.map(p => ({ ...p, selected: true })));
        setPhase('results');
      }
    } catch (e) {
      console.error('[LabUpload] PDF parse failed:', e);
      setPhase('noResults');
    }
  }, []);

  const pickPDF = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });
    if (result.canceled || result.assets.length === 0) return;
    const asset = result.assets[0];
    await analyze(asset.uri, asset.name ?? 'lab_report.pdf');
  }, [analyze]);

  const pickPhoto = useCallback(async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permission required', 'Allow photo library access to upload a lab photo.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.9 });
    if (result.canceled) return;
    // Photo OCR not yet available — guide to manual entry
    Alert.alert(
      'Photo received',
      'Text recognition from photos is coming soon. For now, please log your values manually.',
      [{ text: 'Log manually', onPress: () => nav.goBack() }, { text: 'OK' }],
    );
  }, [nav]);

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(i => i.biomarkerId === id ? { ...i, selected: !i.selected } : i));
  };

  const save = useCallback(async () => {
    const toSave = items.filter(i => i.selected);
    if (toSave.length === 0) { Alert.alert('Select at least one biomarker'); return; }

    const existing: StoredEntry[] = JSON.parse(
      (await AsyncStorage.getItem('@vitalspan_biomarkers')) ?? '[]'
    );

    const today = new Date().toISOString().slice(0, 10);
    const newEntries: StoredEntry[] = toSave.map(item => createStoredBiomarkerEntry({
      id: `lab_${item.biomarkerId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      biomarkerId: item.biomarkerId,
      value: item.value,
      unit: item.unit,
      reportedValue: item.value,
      reportedUnit: item.unit,
      date: today,
      source: 'Lab PDF',
      notes: `Imported from ${fileName}`,
      sourceLabRange: item.sourceLabRange,
    }));

    await AsyncStorage.setItem('@vitalspan_biomarkers', JSON.stringify([...existing, ...newEntries]));
    setSavedCount(toSave.length);
    setSavedNames(toSave.map(i => i.name));
    setPhase('success');
  }, [items, fileName]);

  // ── Idle ─────────────────────────────────────────────────────────────────
  if (phase === 'idle') return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => nav.goBack()}><Text style={s.close}>✕</Text></TouchableOpacity>
        <Text style={s.headerTitle}>Upload Lab Results</Text>
        <View style={{ width: 28 }} />
      </View>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.subtitle}>Import values and reported laboratory ranges</Text>

        <TouchableOpacity style={s.uploadZone} onPress={pickPDF} activeOpacity={0.75}>
          <ClipboardIcon color={Colors.onSurfaceMuted} size={48} />
          <Text style={s.uploadTitle}>Upload your lab PDF</Text>
          <Text style={s.uploadHint}>Tap to browse files on your device</Text>
          <View style={s.uploadBtn}>
            <Text style={s.uploadBtnTxt}>Choose PDF</Text>
          </View>
        </TouchableOpacity>

        <View style={s.dividerRow}>
          <View style={s.dividerLine} />
          <Text style={s.dividerTxt}>or</Text>
          <View style={s.dividerLine} />
        </View>

        <TouchableOpacity style={s.photoBtn} onPress={pickPhoto}>
          <CameraIcon color={Colors.onSurfaceMuted} size={24} />
          <Text style={s.photoBtnTxt}>Take a photo of your lab report</Text>
        </TouchableOpacity>

        <Text style={s.privacyNote}>Your data stays on your device. Never shared.</Text>
      </ScrollView>
    </SafeAreaView>
  );

  // ── Analyzing ────────────────────────────────────────────────────────────
  if (phase === 'analyzing') return (
    <SafeAreaView style={s.safe}>
      <View style={s.centeredContent}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={s.analyzingTitle}>Analyzing your results…</Text>
        <Text style={s.analyzingFile}>{fileName}</Text>
      </View>
    </SafeAreaView>
  );

  // ── No results (parse error / unreadable) ──────────────────────────────────
  if (phase === 'noResults') return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => setPhase('idle')}><Text style={s.close}>←</Text></TouchableOpacity>
        <Text style={s.headerTitle}>Upload Lab Results</Text>
        <View style={{ width: 28 }} />
      </View>
      <View style={s.centeredContent}>
        <SearchIcon color={Colors.brand} size={48} />
        <Text style={s.noResultTitle}>Couldn't read this PDF</Text>
        <Text style={s.noResultSub}>
          This PDF appears to be a scanned image and can't be read as text. Re-export your lab results as a text-based PDF, or log your values manually.
        </Text>
        <TouchableOpacity style={s.primaryBtn} onPress={() => setPhase('idle')}>
          <Text style={s.primaryBtnTxt}>Try another file</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.ghostBtn} onPress={() => nav.goBack()}>
          <Text style={s.ghostBtnTxt}>Log manually instead</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  // ── No match (readable but no biomarkers recognised) ───────────────────────
  if (phase === 'noMatch') return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => setPhase('idle')}><Text style={s.close}>←</Text></TouchableOpacity>
        <Text style={s.headerTitle}>Upload Lab Results</Text>
        <View style={{ width: 28 }} />
      </View>
      <View style={s.centeredContent}>
        <SearchIcon color={Colors.brand} size={48} />
        <Text style={s.noResultTitle}>No biomarkers found</Text>
        <Text style={s.noResultSub}>
          The PDF was read successfully but no recognised lab values were found. Your report may use different terminology — try logging your values manually.
        </Text>
        <TouchableOpacity style={s.primaryBtn} onPress={() => setPhase('idle')}>
          <Text style={s.primaryBtnTxt}>Try another file</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.ghostBtn} onPress={() => nav.goBack()}>
          <Text style={s.ghostBtnTxt}>Log manually instead</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  // ── Success ──────────────────────────────────────────────────────────────
  if (phase === 'success') return (
    <SafeAreaView style={s.safe}>
      <View style={s.centeredContent}>
        <SuccessCheckIcon color={Colors.semantic.success} size={48} />
        <Text style={s.successTitle}>Saved {savedCount} {savedCount === 1 ? 'biomarker' : 'biomarkers'}</Text>
        <Text style={s.successSub}>from your lab report</Text>
        <View style={s.savedNamesList}>
          {savedNames.map(n => (
            <View key={n} style={s.savedNameChip}>
              <Text style={s.savedNameTxt}>{n}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={s.primaryBtn} onPress={() => nav.goBack()}>
          <Text style={s.primaryBtnTxt}>View Health</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  // ── Results ──────────────────────────────────────────────────────────────
  const selectedCount = items.filter(i => i.selected).length;
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => setPhase('idle')}><Text style={s.close}>←</Text></TouchableOpacity>
        <Text style={s.headerTitle}>Review Results</Text>
        <View style={{ width: 28 }} />
      </View>
      <Text style={s.foundBadge}>Found {items.length} biomarkers in "{fileName}"</Text>
      <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={s.card}>
          {items.map((item, i) => (
            <TouchableOpacity
              key={item.biomarkerId}
              style={[s.resultRow, i < items.length - 1 && s.rowBorder]}
              onPress={() => toggleItem(item.biomarkerId)}
            >
              <View style={[s.checkbox, item.selected && s.checkboxOn]}>
                {item.selected && <Text style={s.checkmark}>✓</Text>}
              </View>
              <View style={s.resultInfo}>
                <Text style={s.resultName}>{item.name}</Text>
                <Text style={s.resultUnit}>
                  {item.unit} · Lab range: {formatSourceLabRange(item.sourceLabRange)}
                </Text>
              </View>
              <View style={s.resultRight}>
                <Text style={s.resultValue}>{item.value}</Text>
                <View style={[s.confDot,
                  item.confidence === 'high' ? s.confHigh : s.confMed,
                ]} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={s.confLegend}>● High confidence  ● Medium confidence</Text>
      </ScrollView>
      <View style={s.saveBar}>
        <TouchableOpacity style={s.saveBtn} onPress={save}>
          <Text style={s.saveBtnTxt}>Save {selectedCount} biomarker{selectedCount !== 1 ? 's' : ''}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.base, paddingTop: Spacing.md },
  headerTitle: { fontSize: Typography.sizes.md, fontWeight: '600', color: Colors.textPrimary },
  close: { fontSize: Typography.sizes.lg, color: Colors.textMuted, width: 28, textAlign: 'center' },
  content: { padding: Spacing.base, paddingTop: Spacing.sm },
  subtitle: { fontSize: Typography.sizes.sm, color: Colors.textMuted, textAlign: 'center', marginBottom: Spacing.xl },
  // Upload zone
  uploadZone: { borderWidth: 1.5, borderColor: Colors.border, borderStyle: 'dashed', borderRadius: Radius.xl, padding: Spacing.xxl, alignItems: 'center', backgroundColor: Colors.bgCard, gap: Spacing.sm },
  uploadTitle: { fontSize: Typography.sizes.lg, fontWeight: '600', color: Colors.textPrimary },
  uploadHint: { fontSize: Typography.sizes.sm, color: Colors.textMuted, textAlign: 'center' },
  uploadBtn: { marginTop: Spacing.sm, backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm + 2 },
  uploadBtnTxt: { fontSize: Typography.sizes.base, color: Colors.primaryBg, fontWeight: '600' },
  // Divider
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginVertical: Spacing.lg },
  dividerLine: { flex: 1, height: 0.5, backgroundColor: Colors.border },
  dividerTxt: { fontSize: Typography.sizes.sm, color: Colors.textMuted },
  // Photo
  photoBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.bgCard, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, justifyContent: 'center' },
  photoBtnTxt: { fontSize: Typography.sizes.base, color: Colors.textSecondary, fontWeight: '500' },
  privacyNote: { fontSize: Typography.sizes.xs, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.xl },
  // Analyzing / centered states
  centeredContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.md },
  analyzingTitle: { fontSize: Typography.sizes.lg, fontWeight: '500', color: Colors.textPrimary, marginTop: Spacing.md },
  analyzingFile: { fontSize: Typography.sizes.sm, color: Colors.textMuted },
  // No results
  noResultTitle: { fontSize: Typography.sizes.xl, fontWeight: '600', color: Colors.textPrimary },
  noResultSub: { fontSize: Typography.sizes.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  // Buttons
  primaryBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, marginTop: Spacing.sm },
  primaryBtnTxt: { fontSize: Typography.sizes.base, color: Colors.primaryBg, fontWeight: '600' },
  ghostBtn: { paddingVertical: Spacing.sm },
  ghostBtnTxt: { fontSize: Typography.sizes.base, color: Colors.primaryLight, fontWeight: '500' },
  // Results list
  scroll: { flex: 1 },
  foundBadge: { fontSize: Typography.sizes.sm, color: Colors.textMuted, paddingHorizontal: Spacing.base, marginBottom: Spacing.sm },
  card: { marginHorizontal: Spacing.base, backgroundColor: Colors.bgCard, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md },
  resultRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, gap: Spacing.md },
  rowBorder: { borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkmark: { fontSize: 12, color: Colors.primaryBg, fontWeight: '700' },
  resultInfo: { flex: 1 },
  resultName: { fontSize: Typography.sizes.base, fontWeight: '500', color: Colors.textPrimary },
  resultUnit: { fontSize: Typography.sizes.xs, color: Colors.textMuted, marginTop: 1 },
  resultRight: { alignItems: 'flex-end', gap: 4 },
  resultValue: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary },
  confDot: { width: 7, height: 7, borderRadius: 4 },
  confHigh: { backgroundColor: Colors.primaryLight },
  confMed: { backgroundColor: Colors.warning },
  confLegend: { fontSize: Typography.sizes.xs, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.md },
  // Save bar
  saveBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.base, paddingBottom: Spacing.xl, backgroundColor: Colors.bg, borderTopWidth: 0.5, borderTopColor: Colors.border },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: Spacing.md, alignItems: 'center' },
  saveBtnTxt: { fontSize: Typography.sizes.base, color: Colors.primaryBg, fontWeight: '600' },
  // Success
  successTitle: { fontSize: Typography.sizes.xl, fontWeight: '600', color: Colors.textPrimary },
  successSub: { fontSize: Typography.sizes.base, color: Colors.textMuted },
  savedNamesList: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'center', marginVertical: Spacing.md },
  savedNameChip: { backgroundColor: Colors.primaryBg, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderWidth: 0.5, borderColor: Colors.primaryBorder },
  savedNameTxt: { fontSize: Typography.sizes.xs, color: Colors.primary, fontWeight: '500' },
});
