import React, { useState, useCallback } from 'react';
import { Image } from 'expo-image';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { setStatusBarStyle } from 'expo-status-bar';
import { Colors, Spacing, Radius, Typography, Elevation } from '../theme';
import { Exercise } from '../data/exercises';
import { getExercises } from '../lib/exerciseService';
import { RootStackParamList } from '../navigation/AppNavigator';
import MuscleMapView from '../components/MuscleMapView';
import QuickLogModal from '../components/QuickLogModal';
import * as ExerciseIllustrations from '../components/exercise-illustrations';

type RouteProps = RouteProp<RootStackParamList, 'ExerciseDetail'>;

const EQUIPMENT_SHORT: Record<string, string> = {
  'body weight': 'BW', 'dumbbell': 'DB', 'barbell': 'BB',
  'kettlebell': 'KB', 'resistance band': 'Band', 'cable': 'Cable',
};

function equipShort(eq: string): string {
  if (!eq) return '';
  return EQUIPMENT_SHORT[eq] ?? eq.split(' ').filter(Boolean).map(w => w[0].toUpperCase()).join('');
}

export default function ExerciseDetailScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation();
  const { exerciseId } = route.params;
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [photoError, setPhotoError] = useState(false);

  useFocusEffect(useCallback(() => {
    setStatusBarStyle('dark');
    setLoading(true);
    getExercises().then(exs => {
      setExercise(exs.find(e => e.id === exerciseId) ?? null);
      setLoading(false);
    }).catch(() => setLoading(false));
    return () => {};
  }, [exerciseId]));

  if (loading) {
    return (
      <View style={s.centerState}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  if (!exercise) {
    return (
      <View style={s.centerState}>
        <Text style={s.errorTxt}>Exercise not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backBtnTxt}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const IllustrationComponent = exercise.illustrationId
    ? (ExerciseIllustrations as Record<string, React.ComponentType<{ size?: number }>>)[exercise.illustrationId]
    : null;

  const photoUrl = exercise.photoKey && !photoError
    ? `https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/${exercise.photoKey}/0.jpg`
    : null;

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + Spacing.md }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.headerBack} activeOpacity={0.7}>
          <Text style={s.headerBackTxt} numberOfLines={1}>← {exercise.name}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        {/* 1. Illustration — photo banner (if photoKey) or SVG (if illustrationId) or placeholder */}
        {photoUrl ? (
          <View style={s.illustrationCardPhoto}>
            <Image
              source={photoUrl}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={200}
              onError={() => setPhotoError(true)}
            />
          </View>
        ) : (
          <View style={s.illustrationCard}>
            {IllustrationComponent ? (
              <IllustrationComponent size={160} />
            ) : (
              <View style={s.illustrationPlaceholder}>
                <Text style={s.illustrationPlaceholderTxt}>No illustration</Text>
              </View>
            )}
          </View>
        )}

        {/* 2. Muscle Map */}
        <View style={s.sectionCard}>
          <Text style={s.sectionLabel}>MUSCLES</Text>
          <MuscleMapView
            primaryMuscles={[exercise.muscleGroup]}
            secondaryMuscles={exercise.secondaryMuscles}
            interactive={false}
            view={muscleView}
            onViewToggle={() => setMuscleView(v => v === 'front' ? 'back' : 'front')}
          />
        </View>

        {/* 3. Metadata chips */}
        <View style={s.chipsRow}>
          <View style={s.chip}><Text style={s.chipTxt}>{equipShort(exercise.equipment)}</Text></View>
          <View style={s.chip}><Text style={s.chipTxt}>{exercise.category}</Text></View>
        </View>

        {/* 4. Form Cue */}
        {exercise.formCue && (
          <View style={s.sectionCard}>
            <Text style={s.sectionLabel}>FORM CUE</Text>
            <Text style={s.formCueTxt}>{exercise.formCue}</Text>
          </View>
        )}

        {/* 5. Sets & Reps */}
        {exercise.setsReps && (
          <View style={s.sectionCard}>
            <Text style={s.sectionLabel}>LONGEVITY PRESCRIPTION</Text>
            <Text style={s.setsRepsTxt}>{exercise.setsReps}</Text>
          </View>
        )}

        {/* 6. Longevity Note */}
        {exercise.longevityNote && (
          <Text style={s.longevityNoteTxt}>{exercise.longevityNote}</Text>
        )}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      {/* Log CTA */}
      <View style={s.ctaContainer}>
        <TouchableOpacity style={s.ctaBtn} onPress={() => setLogModalOpen(true)} activeOpacity={0.85}>
          <Text style={s.ctaBtnTxt}>Log this exercise</Text>
        </TouchableOpacity>
      </View>

      <QuickLogModal
        exercise={exercise}
        visible={logModalOpen}
        onClose={() => setLogModalOpen(false)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  centerState: { flex: 1, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  errorTxt: { fontSize: Typography.sizes.base, color: Colors.textSecondary },
  backBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm },
  backBtnTxt: { color: Colors.primaryBg, fontWeight: '600', fontSize: Typography.sizes.base },
  header: { backgroundColor: Colors.surfaceElevated, paddingHorizontal: Spacing.base, paddingBottom: Spacing.md, borderBottomWidth: 0.5, borderBottomColor: Colors.borderLight },
  headerBack: { flexDirection: 'row', alignItems: 'center' },
  headerBackTxt: { fontSize: Typography.sizes.base, fontWeight: '600', color: Colors.onSurface, flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.base, gap: Spacing.md },
  illustrationCard: { backgroundColor: Colors.surface, borderRadius: Radius.xl, borderWidth: 0.5, borderColor: Colors.borderLight, alignItems: 'center', paddingVertical: Spacing.xl, ...Elevation.sm },
  illustrationCardPhoto: { backgroundColor: Colors.surfaceElevated, borderRadius: Radius.xl, borderWidth: 0.5, borderColor: Colors.borderLight, height: 220, overflow: 'hidden', ...Elevation.sm },
  illustrationPlaceholder: { width: 160, height: 160, backgroundColor: Colors.surfaceElevated, borderRadius: Radius.lg, justifyContent: 'center', alignItems: 'center' },
  illustrationPlaceholderTxt: { fontSize: Typography.sizes.sm, color: Colors.onSurfaceMuted },
  sectionCard: { backgroundColor: Colors.surface, borderRadius: Radius.xl, borderWidth: 0.5, borderColor: Colors.borderLight, padding: Spacing.base, ...Elevation.sm },
  sectionLabel: { fontSize: Typography.sizes.xs, fontWeight: '600', color: Colors.onSurfaceMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: Spacing.sm },
  chipsRow: { flexDirection: 'row', gap: Spacing.sm },
  chip: { backgroundColor: Colors.surfaceElevated, borderRadius: Radius.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  chipTxt: { fontSize: Typography.sizes.xs, fontWeight: '600', color: Colors.onSurfaceMuted },
  formCueTxt: { fontSize: Typography.sizes.base, color: Colors.textSecondary, lineHeight: 22 },
  setsRepsTxt: { fontSize: Typography.sizes.md, fontWeight: '700', color: Colors.accent },
  longevityNoteTxt: { fontSize: Typography.sizes.sm, color: Colors.onSurfaceMuted, fontStyle: 'italic', paddingHorizontal: Spacing.xs, lineHeight: 20 },
  ctaContainer: { padding: Spacing.base, paddingBottom: Spacing.lg, backgroundColor: Colors.surface, borderTopWidth: 0.5, borderTopColor: Colors.borderLight },
  ctaBtn: { backgroundColor: Colors.primary, borderRadius: Radius.xl, padding: 15, alignItems: 'center', ...Elevation.sm },
  ctaBtnTxt: { fontSize: Typography.sizes.base, fontWeight: '700', color: Colors.primaryBg },
});
