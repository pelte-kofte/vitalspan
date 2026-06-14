import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, TextInput, KeyboardAvoidingView, ActivityIndicator, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography, Radius } from '../theme';
import { RootStackParamList } from '../navigation/AppNavigator';
import NeuralGrid from '../components/NeuralGrid';
import ScoreSummaryCard from '../components/advisor/ScoreSummaryCard';
import ReportCard, { ReportItem } from '../components/advisor/ReportCard';
import ChatThread from '../components/advisor/ChatThread';
import { assembleAdvisorContext } from '../lib/advisorContext';
import { generateReport, sendChatMessage, LongevityReport, ChatMessage } from '../lib/advisorService';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function AIAdvisorScreen(): React.JSX.Element {
  const nav = useNavigation<Nav>();
  const [report, setReport] = useState<LongevityReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const reportSummary = useMemo(() => {
    if (!report) return '';
    return report.scoreSummary.headline + ' ' +
      report.priorityFindings.slice(0, 2).map(f => f.finding).join('. ');
  }, [report]);

  async function handleGenerate() {
    setIsLoading(true); setGenerationError(null);
    const context = await assembleAdvisorContext();
    const result = await generateReport(context);
    if (result.error) { setGenerationError(result.error.message); setIsLoading(false); return; }
    setReport(result.data); setIsLoading(false);
  }

  async function handleSendChat() {
    if (!chatInput.trim() || isChatLoading) return;
    const userMsg: ChatMessage = { role: 'user', content: chatInput.trim() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages); setChatInput(''); setIsChatLoading(true);
    const result = await sendChatMessage(nextMessages, reportSummary);
    const reply = result.error
      ? 'Sorry, something went wrong. Please try again.'
      : result.data!;
    setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    setIsChatLoading(false);
  }

  const findingsItems: ReportItem[] = (report?.priorityFindings ?? [])
    .map(f => ({ kind: 'finding' as const, finding: f.finding, priority: f.priority }));
  const biomarkerItems: ReportItem[] = (report?.biomarkerAnalysis ?? [])
    .map(b => ({ kind: 'biomarker' as const, name: b.name, status: b.status, insight: b.insight }));
  const suppItems: ReportItem[] = (report?.supplementMedicationReview ?? [])
    .map(s => ({ kind: 'supplement' as const, name: s.name, type: s.type, assessment: s.assessment }));
  const recItems: ReportItem[] = (report?.recommendations ?? [])
    .map(r => ({ kind: 'recommendation' as const, action: r.action, category: r.category, timeframe: r.timeframe }));
  const sendDisabled = isChatLoading || chatInput.trim().length === 0;

  return (
    <LinearGradient colors={['#080D09', '#0C1410', '#0F1C14']} style={s.gradient}>
      <SafeAreaView style={s.safe}>
        <View style={s.topBar}>
          <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
            <Text style={s.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={s.screenTitle}>AI ADVISOR</Text>
          {report
            ? <TouchableOpacity onPress={handleGenerate}><Text style={s.regenerate}>Regenerate</Text></TouchableOpacity>
            : <View style={s.spacer} />}
        </View>

        {isLoading && (
          <View style={s.fullScreen}>
            <NeuralGrid intensity="high" tone="vital" animate />
            <View style={s.centered}>
              <Text style={s.loadingText}>Analyzing your health snapshot…</Text>
              <ActivityIndicator color={Colors.dark.text} size="large" />
            </View>
          </View>
        )}

        {!isLoading && !report && (
          <View style={s.fullScreen}>
            <NeuralGrid intensity="low" tone="vital" />
            <View style={s.centered}>
              <Text style={s.heroText}>Your AI Longevity Advisor</Text>
              <Text style={s.heroSub}>Get a personalised report based on your health snapshot</Text>
              <TouchableOpacity style={s.ctaBtn} onPress={handleGenerate}>
                <Text style={s.ctaBtnText}>Generate My Report</Text>
              </TouchableOpacity>
              {generationError ? <Text style={s.errorText}>{generationError}</Text> : null}
            </View>
          </View>
        )}

        {!isLoading && report && (
          <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView style={s.flex} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
              <ScoreSummaryCard scoreSummary={report.scoreSummary} />
              <ReportCard title="PRIORITY FINDINGS" items={findingsItems} />
              <ReportCard title="BIOMARKER ANALYSIS" items={biomarkerItems} />
              <ReportCard title="SUPPLEMENT & MEDICATION REVIEW" items={suppItems} />
              <ReportCard title="RECOMMENDATIONS" items={recItems} />
              <Text style={s.chatHeader}>FOLLOW-UP CHAT</Text>
              <ChatThread messages={messages} isThinking={isChatLoading} />
              <View style={{ height: 20 }} />
            </ScrollView>
            <View style={s.chatRow}>
              <TextInput
                style={s.input}
                value={chatInput}
                onChangeText={setChatInput}
                placeholder="Ask about your report…"
                placeholderTextColor={Colors.dark.textMuted}
                returnKeyType="send"
                onSubmitEditing={handleSendChat}
                multiline={false}
              />
              <TouchableOpacity onPress={handleSendChat} disabled={sendDisabled}
                style={{ opacity: sendDisabled ? 0.4 : 1 }}>
                <Text style={s.sendBtn}>→</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  flex: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.base, paddingVertical: Spacing.md },
  backBtn: { padding: Spacing.sm },
  backArrow: { color: Colors.dark.text, fontSize: 22 },
  screenTitle: { color: Colors.dark.text, fontWeight: '600', letterSpacing: Typography.letterSpacing.widest, fontSize: Typography.sizes.base },
  spacer: { width: 38 },
  regenerate: { fontSize: Typography.sizes.sm, color: Colors.dark.textMuted },
  fullScreen: { flex: 1, position: 'relative' },
  centered: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  loadingText: { color: Colors.dark.text, fontSize: Typography.sizes.md, textAlign: 'center', marginBottom: Spacing.base },
  heroText: { fontSize: Typography.sizes.xxl, fontWeight: '700', color: Colors.dark.text, textAlign: 'center', marginBottom: Spacing.sm },
  heroSub: { fontSize: Typography.sizes.base, color: Colors.dark.textMuted, textAlign: 'center', marginBottom: Spacing.xl },
  ctaBtn: { backgroundColor: Colors.primary, borderRadius: Radius.lg, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, alignSelf: 'center' },
  ctaBtnText: { color: Colors.dark.text, fontSize: Typography.sizes.md, fontWeight: '600' },
  errorText: { color: Colors.viz.coral, fontSize: Typography.sizes.sm, textAlign: 'center', marginTop: Spacing.md },
  scrollContent: { padding: Spacing.base, paddingBottom: 100 },
  chatHeader: { fontSize: Typography.sizes.xs, fontWeight: '700', letterSpacing: Typography.letterSpacing.widest, color: Colors.dark.textMuted, textTransform: 'uppercase', marginTop: Spacing.lg, marginBottom: Spacing.md },
  chatRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.dark.border, backgroundColor: '#080D09', padding: Spacing.sm },
  input: { flex: 1, color: Colors.dark.text, backgroundColor: Colors.dark.cardBg, borderRadius: Radius.md, paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, marginRight: Spacing.sm, fontSize: Typography.sizes.base },
  sendBtn: { color: Colors.dark.text, fontSize: Typography.sizes.xl },
});
