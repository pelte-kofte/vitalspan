import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function PlyoPushUp({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Plyo push-up — explosive, hands leaving floor */}
      <Circle cx={14} cy={36} r={4} fill={c} opacity={0.9} />
      <Circle cx={22} cy={42} r={2} fill={c} opacity={0.7} />
      <Circle cx={32} cy={48} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={50} cy={54} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={68} cy={60} r={2} fill={c} opacity={0.7} />
      <Circle cx={82} cy={68} r={2} fill={c} opacity={0.7} />
      <Circle cx={90} cy={74} r={2} fill={c} opacity={0.6} />
      {/* Hands airborne — slightly above floor */}
      <Circle cx={24} cy={55} r={2} fill={c} opacity={0.7} />
      <Circle cx={38} cy={60} r={2} fill={c} opacity={0.7} />
      {/* Floor line */}
      <Line x1={10} y1={72} x2={94} y2={82} stroke={c} strokeWidth={1} opacity={0.3} />
      {/* Torso */}
      <Line x1={22} y1={42} x2={82} y2={68} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arms extended, hands off floor */}
      <Line x1={32} y1={48} x2={24} y2={55} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={50} y1={54} x2={38} y2={60} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Legs */}
      <Line x1={68} y1={60} x2={90} y2={74} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: explosive upward */}
      <Line x1={28} y1={55} x2={28} y2={40} stroke={c} strokeWidth={2} opacity={0.8} />
      <Line x1={24} y1={44} x2={28} y2={40} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={32} y1={44} x2={28} y2={40} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
