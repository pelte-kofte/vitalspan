import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, TextInput, KeyboardAvoidingView, ActivityIndicator, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Typography, Radius } from '../theme';
import { RootStackParamList } from '../navigation/AppNavigator';
import ScoreSummaryCard from '../components/advisor/ScoreSummaryCard';
import ReportCard, { ReportItem } from '../components/advisor/ReportCard';
import ChatThread from '../components/advisor/ChatThread';
import { assembleAdvisorContext, AdvisorContext } from '../lib/advisorContext';
import { generateReport, sendChatMessage, LongevityReport, ChatMessage } from '../lib/advisorService';
import { captureAuthRequestScope, isAuthRequestScopeCurrent } from '../lib/supabase';
import { usePremiumContext } from '../context/PremiumContext';
import { getAIAdvisorAccessState } from '../lib/premiumAccess';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function AIAdvisorScreen(): React.JSX.Element {
  const nav = useNavigation<Nav>();
  const { isPremium, isPremiumLoading } = usePremiumContext();
  const accessState = getAIAdvisorAccessState(isPremium, isPremiumLoading);
  const [report, setReport] = useState<LongevityReport | null>(null);
  const [advisorCtx, setAdvisorCtx] = useState<AdvisorContext | null>(null);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const reportSummary = useMemo(() => {
    if (!report) return '';
    return report.scoreSummary.headline + ' ' +
      report.priorityFindings.slice(0, 2).map(f => f.finding).join('. ');
  }, [report]);

  useEffect(() => {
    if (accessState === 'paywall') nav.replace('Paywall');
  }, [accessState, nav]);

  if (accessState !== 'allowed') {
    return (
      <SafeAreaView style={s.accessLoading}>
        <ActivityIndicator color={Colors.dark.textMuted} size="small" />
      </SafeAreaView>
    );
  }

  async function handleGenerate() {
    if (isReportLoading) return;
    const scope = captureAuthRequestScope();
    if (!scope) return;
    setIsReportLoading(true); setGenerationError(null);
    const ctx = await assembleAdvisorContext();
    if (!isAuthRequestScopeCurrent(scope)) return;
    setAdvisorCtx(ctx);
    const result = await generateReport(ctx, scope);
    if (!isAuthRequestScopeCurrent(scope)) return;
    if (result.error) { setGenerationError(result.error.message); setIsReportLoading(false); return; }
    setReport(result.data);
    AsyncStorage.setItem('@vitalspan_last_report_ts', new Date().toISOString()).catch(() => null);
    setIsReportLoading(false);
  }

  async function handleSendChat(suggestedPrompt?: string) {
    const content = (suggestedPrompt ?? chatInput).trim();
    if (!content || isChatLoading) return;
    const userMsg: ChatMessage = { role: 'user', content };
    const scope = captureAuthRequestScope();
    if (!scope) return;
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages); setChatInput(''); setIsChatLoading(true);
    const freshCtx = await assembleAdvisorContext();
    if (!isAuthRequestScopeCurrent(scope)) return;
    setAdvisorCtx(freshCtx);
    const result = await sendChatMessage(nextMessages, reportSummary, freshCtx, scope);
    if (!isAuthRequestScopeCurrent(scope)) return;
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
          <Text style={s.screenTitle}>AI Advisor</Text>
          {report || messages.length > 0 ? (
            <TouchableOpacity
              onPress={handleGenerate}
              disabled={isReportLoading}
              style={s.reportLink}
              accessibilityRole="button"
              accessibilityLabel={report ? 'Regenerate health report' : 'Generate my health report'}
            >
              <Text style={s.regenerate}>
                {isReportLoading ? 'Generating…' : report ? 'Regenerate' : 'Health report'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={s.reportLink} />
          )}
        </View>

        <Text style={s.disclaimer}>
          For informational purposes only. Not medical advice. Consult your doctor for medical decisions.
        </Text>

        <KeyboardAvoidingView
          style={s.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={s.flex}
            contentContainerStyle={s.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          >
            {report && (
              <>
                <ScoreSummaryCard scoreSummary={report.scoreSummary} />
                <ReportCard title="PRIORITY FINDINGS" items={findingsItems} />
                <ReportCard title="BIOMARKER ANALYSIS" items={biomarkerItems} />
                <ReportCard title="SUPPLEMENT & MEDICATION REVIEW" items={suppItems} />
                <ReportCard title="RECOMMENDATIONS" items={recItems} />
              </>
            )}

            {isReportLoading && (
              <View style={s.reportStatus}>
                <ActivityIndicator color={Colors.dark.textMuted} size="small" />
                <Text style={s.reportStatusText}>Analyzing your health snapshot…</Text>
              </View>
            )}
            {generationError ? <Text style={s.errorText}>{generationError}</Text> : null}

            <Text style={s.chatHeader}>{report ? 'FOLLOW-UP CHAT' : 'ASK AI ADVISOR'}</Text>
            <ChatThread
              messages={messages}
              isThinking={isChatLoading}
              hasReport={report !== null}
              onSuggestedPrompt={handleSendChat}
              onGenerateReport={report ? undefined : handleGenerate}
              isReportLoading={isReportLoading}
            />
          </ScrollView>

          <View style={s.chatRow}>
            <TextInput
              style={s.input}
              value={chatInput}
              onChangeText={setChatInput}
              placeholder={report ? 'Ask a follow-up question…' : 'Ask about your health…'}
              placeholderTextColor={Colors.dark.textMuted}
              returnKeyType="send"
              onSubmitEditing={() => handleSendChat()}
              editable={!isChatLoading}
              multiline={false}
            />
            <TouchableOpacity
              onPress={() => handleSendChat()}
              disabled={sendDisabled}
              style={[s.sendButton, { opacity: sendDisabled ? 0.4 : 1 }]}
              accessibilityRole="button"
              accessibilityLabel="Send message"
            >
              <Text style={s.sendBtn}>→</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  flex: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.base, paddingVertical: Spacing.md },
  backBtn: { minWidth: 76, minHeight: 44, padding: Spacing.sm, justifyContent: 'center' },
  backArrow: { color: Colors.dark.text, fontSize: 22 },
  screenTitle: { color: Colors.dark.text, fontWeight: '600', letterSpacing: Typography.letterSpacing.widest, fontSize: Typography.sizes.base },
  reportLink: { minWidth: 76, minHeight: 44, alignItems: 'flex-end', justifyContent: 'center' },
  regenerate: { fontSize: Typography.sizes.sm, color: Colors.dark.textMuted },
  errorText: { color: Colors.viz.coral, fontSize: Typography.sizes.sm, textAlign: 'center', marginBottom: Spacing.md },
  scrollContent: { flexGrow: 1, padding: Spacing.base, paddingBottom: Spacing.lg },
  chatHeader: { fontSize: Typography.sizes.xs, fontWeight: '700', letterSpacing: Typography.letterSpacing.widest, color: Colors.dark.textMuted, textTransform: 'uppercase', marginTop: Spacing.md, marginBottom: Spacing.md },
  reportStatus: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    backgroundColor: Colors.dark.cardBg, borderWidth: 0.5, borderColor: Colors.dark.cardBorder,
    borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md,
  },
  reportStatusText: { color: Colors.dark.textMuted, fontSize: Typography.sizes.sm },
  chatRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.dark.border, backgroundColor: '#080D09', padding: Spacing.sm },
  input: { flex: 1, minHeight: 44, color: Colors.dark.text, backgroundColor: Colors.dark.cardBg, borderRadius: Radius.md, paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, marginRight: Spacing.sm, fontSize: Typography.sizes.base },
  sendButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  sendBtn: { color: Colors.dark.text, fontSize: Typography.sizes.xl },
  disclaimer: {
    fontSize: Typography.sizes.xs,
    color: Colors.dark.textMuted,
    textAlign: 'center',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xs,
    opacity: 0.55,
  },
  accessLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.bg,
  },
});
