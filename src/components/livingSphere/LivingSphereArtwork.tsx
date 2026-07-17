import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Svg, {
  ClipPath,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import type { LivingSphereResolvedPalette } from './palette';
import type { LivingSphereRenderPlan } from './renderPlan';

const SURFACE_PATHS = [
  'M40 78 C66 58 101 60 125 72 C145 82 156 80 165 69 C153 92 128 96 104 88 C79 80 61 92 46 103 C38 97 36 87 40 78 Z',
  'M37 115 C62 101 88 103 111 116 C134 129 151 128 166 116',
  'M57 146 C82 136 109 137 142 152',
] as const;
const FLOW_PATHS = [
  'M31 103 C62 65 103 58 166 89 C127 76 91 92 65 126 C51 143 36 133 31 103 Z',
  'M42 134 C75 109 111 109 161 128 C128 119 101 128 78 150 C62 164 48 154 42 134 Z',
] as const;
const SPHERE_SHAPE = 'M101 22 C128 22 151 35 168 57 C181 76 181 102 174 124 C166 151 145 171 119 178 C91 185 63 174 44 156 C26 139 20 112 24 87 C28 61 45 39 68 28 C78 23 90 21 101 22 Z';
const CORE_SHAPE = 'M53 83 C59 55 83 41 110 47 C136 52 148 76 139 100 C129 127 97 139 71 125 C51 114 47 99 53 83 Z';
const CORE_DIFFUSION = 'M63 72 C75 56 92 52 106 58 C91 62 80 72 73 86 C66 84 61 79 63 72 Z';
const DEPTH_OCCLUSION = 'M66 131 C92 112 128 109 155 126 C144 151 119 164 89 158 C76 155 68 145 66 131 Z';

interface Props {
  size: number;
  idPrefix: string;
  plan: LivingSphereRenderPlan;
  palette: LivingSphereResolvedPalette;
  flowStyle: StyleProp<ViewStyle>;
}

export const LivingSphereArtwork = React.memo(function LivingSphereArtwork({
  size,
  idPrefix,
  plan,
  palette,
  flowStyle,
}: Props) {
  const sphereGradient = `${idPrefix}-sphere`;
  const coreGradient = `${idPrefix}-core`;
  const flowGradient = `${idPrefix}-flow`;
  const flowClip = `${idPrefix}-clip`;
  const surfaceStrength = plan.surfaceDetail === 'defined' ? 1 : plan.surfaceDetail === 'soft' ? 0.62 : 0.28;

  return (
    <View style={[s.artwork, { width: size, height: size }]} pointerEvents="none">
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Defs>
          <RadialGradient id={sphereGradient} cx="38%" cy="31%" r="72%">
            <Stop offset="0%" stopColor={palette.highlight} stopOpacity={0.42 * plan.evidenceOpacity} />
            <Stop offset="24%" stopColor={palette.highlight} stopOpacity={0.24 * plan.evidenceOpacity} />
            <Stop offset="52%" stopColor={palette.base} stopOpacity={0.94} />
            <Stop offset="78%" stopColor={palette.surface} stopOpacity={0.72} />
            <Stop offset="100%" stopColor={palette.depth} stopOpacity={0.9} />
          </RadialGradient>
          <RadialGradient id={coreGradient} cx="39%" cy="36%" r="64%">
            <Stop offset="0%" stopColor={palette.base} stopOpacity={0.32} />
            <Stop offset="46%" stopColor={palette.primary} stopOpacity={0.3} />
            <Stop offset="100%" stopColor={palette.secondary} stopOpacity={0} />
          </RadialGradient>
        </Defs>

        <Ellipse cx="99" cy="100" rx="89" ry="87" fill={palette.atmosphere}
          transform="rotate(-2 99 100)" opacity={plan.layerOpacity.atmospheric_rhythm * 0.164} />
        <Ellipse cx="101" cy="99" rx="83" ry="81" fill={palette.atmosphere}
          transform="rotate(1.5 101 99)" opacity={plan.layerOpacity.atmospheric_rhythm * 0.23} />
        <Path d={SPHERE_SHAPE} fill={`url(#${sphereGradient})`}
          opacity={0.58 + plan.evidenceOpacity * 0.42} />
        <Path d={CORE_SHAPE} fill={`url(#${coreGradient})`}
          opacity={plan.layerOpacity.core_vitality * plan.coreDepth} />
        <Path d={CORE_DIFFUSION} fill={palette.base}
          opacity={plan.layerOpacity.core_vitality * 0.052} />
        <Path d={DEPTH_OCCLUSION} fill={palette.depth}
          opacity={plan.evidenceOpacity * 0.07} />

        <G opacity={plan.layerOpacity.surface_richness * surfaceStrength}>
          {SURFACE_PATHS.map((path, index) => (
            <Path key={path} d={path} fill={index === 0 ? palette.surface : 'none'}
              fillOpacity={index === 0 ? 0.065 : 0} stroke={palette.contour}
              strokeWidth={index === 0 ? 0.65 : 0.55} strokeLinecap="round"
              opacity={index === 0 ? 0.72 : 0.58} />
          ))}
        </G>

        <Path d={SPHERE_SHAPE} fill="none" stroke={palette.boundary}
          strokeWidth="0.45" opacity={plan.layerOpacity.kinetic_presence * 0.16} />
        <Path d="M31 104 C29 73 43 47 69 32 C87 22 105 21 121 25"
          fill="none" stroke={palette.boundary} strokeWidth="0.55" strokeLinecap="round"
          opacity={plan.layerOpacity.environmental_stability * 0.38} />
        <Path d="M165 73 C179 95 176 126 160 149 C147 167 128 177 107 179"
          fill="none" stroke={palette.boundary} strokeWidth="0.45" strokeLinecap="round"
          opacity={plan.layerOpacity.environmental_stability * 0.24} />
      </Svg>

      <View style={[s.flow, { width: size, height: size }, flowStyle]}>
        <Svg width={size} height={size} viewBox="0 0 200 200">
          <Defs>
            <ClipPath id={flowClip}><Path d={SPHERE_SHAPE} /></ClipPath>
            <LinearGradient id={flowGradient} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor={palette.secondary} stopOpacity="0" />
              <Stop offset="48%" stopColor={palette.secondary} stopOpacity="0.28" />
              <Stop offset="100%" stopColor={palette.highlight} stopOpacity="0.06" />
            </LinearGradient>
          </Defs>
          <G clipPath={`url(#${flowClip})`} opacity={plan.layerOpacity.internal_flow}>
            {FLOW_PATHS.map((path, index) => (
              <Path key={path} d={path} fill={`url(#${flowGradient})`}
                opacity={index === 0 ? 0.74 : 0.48} />
            ))}
          </G>
        </Svg>
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  artwork: {
    position: 'relative',
  },
  flow: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
