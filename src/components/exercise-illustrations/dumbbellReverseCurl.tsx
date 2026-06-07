import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function DumbbellReverseCurl({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Reverse curl — standing, pronated grip, curling up */}
      <Circle cx={50} cy={10} r={4} fill={c} opacity={0.9} />
      <Circle cx={50} cy={18} r={2} fill={c} opacity={0.7} />
      <Circle cx={36} cy={26} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={64} cy={26} r={2.5} fill={c} opacity={0.8} />
      {/* Torso */}
      <Circle cx={50} cy={44} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={42} cy={58} r={2} fill={c} opacity={0.7} />
      <Circle cx={58} cy={58} r={2} fill={c} opacity={0.7} />
      <Circle cx={42} cy={74} r={2} fill={c} opacity={0.7} />
      <Circle cx={58} cy={74} r={2} fill={c} opacity={0.7} />
      <Circle cx={42} cy={90} r={2} fill={c} opacity={0.6} />
      <Circle cx={58} cy={90} r={2} fill={c} opacity={0.6} />
      {/* Arms curled at 90 deg, dumbbells at shoulder height */}
      <Circle cx={28} cy={34} r={2} fill={c} opacity={0.7} />
      <Circle cx={72} cy={34} r={2} fill={c} opacity={0.7} />
      <Circle cx={22} cy={24} r={3} fill={c} opacity={0.5} />
      <Circle cx={78} cy={24} r={3} fill={c} opacity={0.5} />
      {/* Pronated wrist indicator */}
      <Circle cx={22} cy={24} r={1.5} fill={c} opacity={0.8} />
      <Circle cx={78} cy={24} r={1.5} fill={c} opacity={0.8} />
      {/* Arms curled */}
      <Line x1={36} y1={26} x2={28} y2={34} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={28} y1={34} x2={22} y2={24} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={64} y1={26} x2={72} y2={34} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={72} y1={34} x2={78} y2={24} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Torso */}
      <Line x1={50} y1={18} x2={50} y2={44} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={36} y1={26} x2={64} y2={26} stroke={c} strokeWidth={1.5} opacity={0.4} />
      {/* Legs */}
      <Line x1={50} y1={44} x2={42} y2={58} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={50} y1={44} x2={58} y2={58} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={42} y1={58} x2={42} y2={90} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={58} y1={58} x2={58} y2={90} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: curl up */}
      <Line x1={28} y1={38} x2={24} y2={28} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={20} y1={32} x2={24} y2={28} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={24} y1={32} x2={24} y2={28} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
