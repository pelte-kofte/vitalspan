import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function DumbbellDeclineBenchPress({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Decline bench press — head low left, feet high right, pressing up */}
      <Circle cx={12} cy={62} r={4} fill={c} opacity={0.9} />
      <Circle cx={22} cy={58} r={2} fill={c} opacity={0.7} />
      <Circle cx={32} cy={55} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={50} cy={52} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={68} cy={50} r={2} fill={c} opacity={0.7} />
      <Circle cx={82} cy={48} r={2} fill={c} opacity={0.7} />
      <Circle cx={90} cy={46} r={2} fill={c} opacity={0.6} />
      {/* Arms pressing dumbbells upward */}
      <Circle cx={32} cy={40} r={2} fill={c} opacity={0.7} />
      <Circle cx={50} cy={38} r={2} fill={c} opacity={0.7} />
      <Circle cx={32} cy={28} r={3} fill={c} opacity={0.5} />
      <Circle cx={50} cy={26} r={3} fill={c} opacity={0.5} />
      {/* Bench decline */}
      <Line x1={8} y1={72} x2={94} y2={55} stroke={c} strokeWidth={1} opacity={0.3} />
      {/* Torso */}
      <Line x1={22} y1={58} x2={82} y2={48} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arms pressing */}
      <Line x1={32} y1={55} x2={32} y2={40} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={32} y1={40} x2={32} y2={28} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={50} y1={52} x2={50} y2={38} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={50} y1={38} x2={50} y2={26} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Legs on bench */}
      <Line x1={68} y1={50} x2={90} y2={46} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: upward press */}
      <Line x1={41} y1={36} x2={41} y2={22} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={37} y1={26} x2={41} y2={22} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={45} y1={26} x2={41} y2={22} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
