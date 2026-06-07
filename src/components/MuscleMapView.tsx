import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Circle, Ellipse, Rect } from 'react-native-svg';
import { Colors, Spacing, Radius } from '../theme';

export interface MuscleRegion {
  id: string;
  label: string;
  frontVisible: boolean;
  backVisible: boolean;
  frontPath: { cx: number; cy: number; rx: number; ry: number } | null;
  backPath: { cx: number; cy: number; rx: number; ry: number } | null;
}

export const MUSCLE_REGIONS: MuscleRegion[] = [
  { id: 'chest',      label: 'Chest',      frontVisible: true,  backVisible: false, frontPath: { cx: 60, cy: 68,  rx: 22, ry: 14 }, backPath: null },
  { id: 'shoulders',  label: 'Shoulders',  frontVisible: true,  backVisible: true,  frontPath: { cx: 60, cy: 54,  rx: 30, ry: 10 }, backPath: { cx: 60, cy: 54,  rx: 30, ry: 10 } },
  { id: 'biceps',     label: 'Biceps',     frontVisible: true,  backVisible: false, frontPath: { cx: 60, cy: 80,  rx: 18, ry: 10 }, backPath: null },
  { id: 'forearms',   label: 'Forearms',   frontVisible: true,  backVisible: true,  frontPath: { cx: 60, cy: 100, rx: 14, ry: 8  }, backPath: { cx: 60, cy: 100, rx: 14, ry: 8  } },
  { id: 'core',       label: 'Core',       frontVisible: true,  backVisible: false, frontPath: { cx: 60, cy: 92,  rx: 18, ry: 18 }, backPath: null },
  { id: 'obliques',   label: 'Obliques',   frontVisible: true,  backVisible: true,  frontPath: { cx: 60, cy: 92,  rx: 28, ry: 16 }, backPath: { cx: 60, cy: 92,  rx: 28, ry: 16 } },
  { id: 'quads',      label: 'Quads',      frontVisible: true,  backVisible: false, frontPath: { cx: 60, cy: 140, rx: 22, ry: 20 }, backPath: null },
  { id: 'calves',     label: 'Calves',     frontVisible: true,  backVisible: true,  frontPath: { cx: 60, cy: 170, rx: 14, ry: 16 }, backPath: { cx: 60, cy: 170, rx: 14, ry: 16 } },
  { id: 'upper back', label: 'Upper Back', frontVisible: false, backVisible: true,  frontPath: null, backPath: { cx: 60, cy: 60,  rx: 26, ry: 14 } },
  { id: 'lats',       label: 'Lats',       frontVisible: false, backVisible: true,  frontPath: null, backPath: { cx: 60, cy: 76,  rx: 22, ry: 16 } },
  { id: 'triceps',    label: 'Triceps',    frontVisible: false, backVisible: true,  frontPath: null, backPath: { cx: 60, cy: 80,  rx: 16, ry: 10 } },
  { id: 'glutes',     label: 'Glutes',     frontVisible: false, backVisible: true,  frontPath: null, backPath: { cx: 60, cy: 116, rx: 26, ry: 16 } },
  { id: 'hamstrings', label: 'Hamstrings', frontVisible: false, backVisible: true,  frontPath: null, backPath: { cx: 60, cy: 140, rx: 22, ry: 20 } },
];

const ALIASES: Record<string, string> = {
  'transverse abdominis': 'core',
  'hip flexors': 'core',
  'quadriceps': 'quads',
  'trapezius': 'upper back',
  'traps': 'upper back',
};

export function muscleMatches(exerciseMuscle: string, regionId: string): boolean {
  const m = exerciseMuscle.toLowerCase();
  const r = regionId.toLowerCase();
  const resolved = ALIASES[m] ?? m;
  return resolved.includes(r) || r.includes(resolved);
}

// 6x10 static neural-dot grid
const NEURAL_DOTS = Array.from({ length: 60 }, (_, i) => ({
  cx: 10 + (i % 6) * 20,
  cy: 10 + Math.floor(i / 6) * 20,
}));

const SIL = { fill: Colors.Beige.bgShade, stroke: Colors.Beige.border };

export interface MuscleMapViewProps {
  primaryMuscles: string[];
  secondaryMuscles: string[];
  interactive?: boolean;
  onMusclePress?: (muscle: string) => void;
  view?: 'front' | 'back';
  onViewToggle?: () => void;
  style?: ViewStyle;
}

export default function MuscleMapView({
  primaryMuscles, secondaryMuscles,
  interactive = false, onMusclePress,
  view = 'front', onViewToggle, style,
}: MuscleMapViewProps) {
  const visible = MUSCLE_REGIONS.filter(r => view === 'front' ? r.frontVisible : r.backVisible);

  function regionColor(r: MuscleRegion): { fill: string; opacity: number } {
    if (primaryMuscles.some(m => muscleMatches(m, r.id))) return { fill: Colors.accent, opacity: 0.75 };
    if (secondaryMuscles.some(m => muscleMatches(m, r.id))) return { fill: Colors.accent, opacity: 0.35 };
    return { fill: Colors.Beige.bgShade, opacity: 0.6 };
  }

  return (
    <View style={[s.container, style]}>
      <Svg width={120} height={200} viewBox="0 0 120 200">
        {/* Neural-dot grid overlay */}
        {NEURAL_DOTS.map((d, i) => (
          <Circle key={`nd${i}`} cx={d.cx} cy={d.cy} r={2} fill={Colors.accent} fillOpacity={0.15} />
        ))}
        {/* Body silhouette */}
        <Circle cx={60} cy={18} r={12} fill={SIL.fill} stroke={SIL.stroke} strokeWidth={0.5} />
        <Rect x={42} y={30} width={36} height={90} rx={10} fill={SIL.fill} stroke={SIL.stroke} strokeWidth={0.5} />
        <Rect x={24} y={32} width={16} height={68} rx={8} fill={SIL.fill} stroke={SIL.stroke} strokeWidth={0.5} />
        <Rect x={80} y={32} width={16} height={68} rx={8} fill={SIL.fill} stroke={SIL.stroke} strokeWidth={0.5} />
        <Rect x={42} y={120} width={16} height={70} rx={8} fill={SIL.fill} stroke={SIL.stroke} strokeWidth={0.5} />
        <Rect x={62} y={120} width={16} height={70} rx={8} fill={SIL.fill} stroke={SIL.stroke} strokeWidth={0.5} />
        {/* Muscle region ellipses */}
        {visible.map(r => {
          const p = view === 'front' ? r.frontPath : r.backPath;
          if (!p) return null;
          const { fill, opacity } = regionColor(r);
          return <Ellipse key={r.id} cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry} fill={fill} fillOpacity={opacity} stroke={Colors.Beige.border} strokeWidth={0.5} />;
        })}
      </Svg>

      {/* Interactive tap overlays (positioned over SVG) */}
      {interactive && onMusclePress && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {visible.map(r => {
            const p = view === 'front' ? r.frontPath : r.backPath;
            if (!p) return null;
            return (
              <TouchableOpacity
                key={`tap-${r.id}`}
                style={[s.tap, { left: p.cx - p.rx, top: p.cy - p.ry, width: p.rx * 2, height: p.ry * 2, borderRadius: Radius.full }]}
                onPress={() => onMusclePress(r.id)}
                activeOpacity={0.4}
              />
            );
          })}
        </View>
      )}

      {/* Front / Back toggle */}
      {onViewToggle && (
        <TouchableOpacity style={s.toggle} onPress={onViewToggle} activeOpacity={0.7}>
          <Text style={[s.toggleTxt, view === 'front' && s.active]}>Front</Text>
          <Text style={s.sep}> / </Text>
          <Text style={[s.toggleTxt, view === 'back' && s.active]}>Back</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: Spacing.sm },
  tap: { position: 'absolute' },
  toggle: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  toggleTxt: { fontSize: 13, fontWeight: '600', color: Colors.Beige.textMuted },
  active: { color: Colors.accent },
  sep: { color: Colors.Beige.textMuted, fontSize: 13 },
});
