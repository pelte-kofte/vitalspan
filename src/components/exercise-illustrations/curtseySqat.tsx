import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function CurtseySqat({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Curtsey squat — one leg crossed behind, deep bend */}
      <Circle cx={50} cy={10} r={4} fill={c} opacity={0.9} />
      <Circle cx={50} cy={18} r={2} fill={c} opacity={0.7} />
      <Circle cx={36} cy={26} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={64} cy={26} r={2.5} fill={c} opacity={0.8} />
      {/* Torso slight forward lean */}
      <Circle cx={50} cy={46} r={2.5} fill={c} opacity={0.8} />
      {/* Hips */}
      <Circle cx={44} cy={60} r={2} fill={c} opacity={0.7} />
      <Circle cx={58} cy={60} r={2} fill={c} opacity={0.7} />
      {/* Front leg bent — knee forward */}
      <Circle cx={36} cy={76} r={2} fill={c} opacity={0.7} />
      <Circle cx={34} cy={90} r={2} fill={c} opacity={0.6} />
      {/* Back leg crossed behind — low */}
      <Circle cx={68} cy={74} r={2} fill={c} opacity={0.7} />
      <Circle cx={72} cy={88} r={2} fill={c} opacity={0.6} />
      {/* Arms at sides / hands on hips */}
      <Circle cx={28} cy={38} r={2} fill={c} opacity={0.7} />
      <Circle cx={72} cy={38} r={2} fill={c} opacity={0.7} />
      {/* Torso */}
      <Line x1={50} y1={18} x2={50} y2={46} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={36} y1={26} x2={64} y2={26} stroke={c} strokeWidth={1.5} opacity={0.4} />
      <Line x1={36} y1={26} x2={28} y2={38} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={64} y1={26} x2={72} y2={38} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Hips to legs */}
      <Line x1={50} y1={46} x2={44} y2={60} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={50} y1={46} x2={58} y2={60} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Front leg */}
      <Line x1={44} y1={60} x2={36} y2={76} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={36} y1={76} x2={34} y2={90} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Rear crossed leg */}
      <Line x1={58} y1={60} x2={68} y2={74} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={68} y1={74} x2={72} y2={88} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: downward */}
      <Line x1={50} y1={50} x2={50} y2={64} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={46} y1={60} x2={50} y2={64} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={54} y1={60} x2={50} y2={64} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
