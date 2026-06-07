import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function SkaterJump({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Skater jump — lateral bound, one leg, skating posture */}
      <Circle cx={42} cy={12} r={4} fill={c} opacity={0.9} />
      <Circle cx={44} cy={20} r={2} fill={c} opacity={0.7} />
      {/* Shoulders — slight lean */}
      <Circle cx={32} cy={28} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={56} cy={28} r={2.5} fill={c} opacity={0.8} />
      {/* Torso leaning laterally */}
      <Circle cx={46} cy={46} r={2.5} fill={c} opacity={0.8} />
      {/* One leg supporting (slightly bent) */}
      <Circle cx={44} cy={60} r={2} fill={c} opacity={0.7} />
      <Circle cx={40} cy={76} r={2} fill={c} opacity={0.7} />
      <Circle cx={38} cy={90} r={2} fill={c} opacity={0.6} />
      {/* Trail leg crossing behind */}
      <Circle cx={62} cy={62} r={2} fill={c} opacity={0.7} />
      <Circle cx={68} cy={76} r={2} fill={c} opacity={0.6} />
      {/* Arms swinging laterally */}
      <Circle cx={20} cy={40} r={2} fill={c} opacity={0.7} />
      <Circle cx={68} cy={36} r={2} fill={c} opacity={0.7} />
      {/* Torso */}
      <Line x1={44} y1={20} x2={46} y2={46} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={32} y1={28} x2={56} y2={28} stroke={c} strokeWidth={1.5} opacity={0.4} />
      {/* Arms swinging */}
      <Line x1={32} y1={28} x2={20} y2={40} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={56} y1={28} x2={68} y2={36} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Support leg */}
      <Line x1={46} y1={46} x2={44} y2={60} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={44} y1={60} x2={40} y2={76} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={40} y1={76} x2={38} y2={90} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Trail leg */}
      <Line x1={46} y1={46} x2={62} y2={62} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={62} y1={62} x2={68} y2={76} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: lateral bound */}
      <Line x1={30} y1={50} x2={18} y2={50} stroke={c} strokeWidth={2} opacity={0.8} />
      <Line x1={18} y1={46} x2={18} y2={50} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={18} y1={50} x2={18} y2={54} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
