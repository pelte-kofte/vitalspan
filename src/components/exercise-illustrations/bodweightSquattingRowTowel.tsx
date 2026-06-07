import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function BodweightSquattingRowTowel({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Squatting row with towel — leaning back, knees bent */}
      <Circle cx={50} cy={12} r={4} fill={c} opacity={0.9} />
      <Circle cx={50} cy={20} r={2} fill={c} opacity={0.7} />
      {/* Torso leaning back */}
      <Circle cx={44} cy={32} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={56} cy={32} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={50} cy={46} r={2.5} fill={c} opacity={0.8} />
      {/* Hips — squat position */}
      <Circle cx={42} cy={58} r={2} fill={c} opacity={0.7} />
      <Circle cx={58} cy={58} r={2} fill={c} opacity={0.7} />
      {/* Knees wide */}
      <Circle cx={32} cy={72} r={2} fill={c} opacity={0.7} />
      <Circle cx={68} cy={72} r={2} fill={c} opacity={0.7} />
      <Circle cx={30} cy={88} r={2} fill={c} opacity={0.6} />
      <Circle cx={70} cy={88} r={2} fill={c} opacity={0.6} />
      {/* Arms reaching forward holding towel */}
      <Circle cx={34} cy={22} r={2} fill={c} opacity={0.7} />
      <Circle cx={66} cy={22} r={2} fill={c} opacity={0.7} />
      {/* Towel anchor */}
      <Line x1={34} y1={22} x2={66} y2={22} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={50} y1={22} x2={50} y2={10} stroke={c} strokeWidth={2} opacity={0.4} />
      {/* Torso */}
      <Line x1={50} y1={20} x2={50} y2={46} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={44} y1={32} x2={56} y2={32} stroke={c} strokeWidth={1.5} opacity={0.4} />
      {/* Arms */}
      <Line x1={44} y1={32} x2={34} y2={22} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={56} y1={32} x2={66} y2={22} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Legs */}
      <Line x1={50} y1={46} x2={42} y2={58} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={50} y1={46} x2={58} y2={58} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={42} y1={58} x2={30} y2={88} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={58} y1={58} x2={70} y2={88} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: pull toward body */}
      <Line x1={50} y1={30} x2={50} y2={18} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={46} y1={22} x2={50} y2={18} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={54} y1={22} x2={50} y2={18} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
